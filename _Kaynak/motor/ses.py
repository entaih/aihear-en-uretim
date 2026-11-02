"""Seslendirme, zamanlama ve müzik.

Kullanım: python -X utf8 ses.py <video_klasoru>

<video_klasoru>/metin.json  -> _tts/ (cümle başına mp3 + kelime zamanları, önbellekli)
                             -> zamanlama.json (sahne, cümle ve kelime zamanları)
                             -> _ses.wav (seslendirme + fon müziği + açılış sesi, 48 kHz stereo)
"""
import asyncio
import hashlib
import json
import pathlib
import re
import subprocess
import sys

import edge_tts
import imageio_ffmpeg
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

MOTOR = pathlib.Path(__file__).resolve().parent
AKADEMI = MOTOR.parents[1]
MARKA = json.loads((MOTOR / 'marka.json').read_text(encoding='utf-8'))
# başka makinede (GitHub Actions, Linux) Piper yolları ortam değişkeniyle verilir: AKADEMI_PIPER_PYTHON, AKADEMI_PIPER_MODEL_EN
for _dil, _sa in MARKA['ses'].items():
    if isinstance(_sa, dict) and _sa.get('motor') == 'piper':
        import os
        _sa['python'] = os.environ.get('AKADEMI_PIPER_PYTHON', _sa['python'])
        _sa['model'] = os.environ.get('AKADEMI_PIPER_MODEL_' + _dil.upper(), _sa['model'])
SR = 48000
FF = imageio_ffmpeg.get_ffmpeg_exe()
Z = MARKA['zaman']


# ------------------------------------------------------------ metin yardımcıları
def cumle_al(c):
    """Cümle düz metin ya da {"yazi": ekranda, "ses": okunacak} olabilir."""
    if isinstance(c, str):
        return c, None
    return c['yazi'], c.get('ses')


HARF_TR = {'A': 'a', 'B': 'be', 'C': 'ce', 'Ç': 'çe', 'D': 'de', 'E': 'e', 'F': 'fe', 'G': 'ge', 'Ğ': 'yumuşak ge',
           'H': 'he', 'I': 'ı', 'İ': 'i', 'J': 'je', 'K': 'ke', 'L': 'le', 'M': 'me', 'N': 'ne', 'O': 'o', 'Ö': 'ö',
           'P': 'pe', 'Q': 'kü', 'R': 're', 'S': 'se', 'Ş': 'şe', 'T': 'te', 'U': 'u', 'Ü': 'ü', 'V': 've', 'W': 'çift ve',
           'X': 'iks', 'Y': 'ye', 'Z': 'ze'}


ROMA = {'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5, 'VI': 6, 'VII': 7, 'VIII': 8, 'IX': 9, 'X': 10, 'XI': 11, 'XII': 12}
SAYI_TR = ['', 'bir', 'iki', 'üç', 'dört', 'beş', 'altı', 'yedi', 'sekiz', 'dokuz', 'on', 'on bir', 'on iki']
SIRA_TR = ['', 'birinci', 'ikinci', 'üçüncü', 'dördüncü', 'beşinci', 'altıncı', 'yedinci', 'sekizinci', 'dokuzuncu', 'onuncu',
           'on birinci', 'on ikinci']
_R = r'(?:XII|XI|IX|X|VIII|VII|VI|IV|V|III|II|I)'


def roma_rakamlari(metin):
    """Türkçede Romen rakamları yalnız bağlamda sayıya çevrilir: "dalga V" -> "dalga beş", "tip II" -> "tip iki",
    "I-V" -> "bir ile beş", "VIII. kafa siniri" -> "sekizinci kafa siniri". Bağlamsız tek harfe (X kromozomu) dokunmaz."""
    metin = re.sub(r'(?<![\w])(' + _R + r')\.(?=\s+[a-zçğıöşü])', lambda m: SIRA_TR[ROMA[m.group(1)]], metin)
    metin = re.sub(r'(?<![\w])(' + _R + r')\s*-\s*(' + _R + r')(?![\w])',
                   lambda m: SAYI_TR[ROMA[m.group(1)]] + ' ile ' + SAYI_TR[ROMA[m.group(2)]], metin)
    onek = r'(?i:dalga\w*|tip\w*|faz\w*|evre\w*|sınıf\w*|derece\w*|grup\w*|nöron\w*|lif\w*|bölge\w*)'
    zincir = re.compile(r'(?<![\w])(' + onek + r'\s+)(' + _R + r'(?:\s*(?:,|ve|ile|ya da)\s*' + _R + r')*)(?![\w])')
    return zincir.sub(lambda m: m.group(1) + re.sub(r'(?<![\w])' + _R + r'(?![\w])', lambda r: SAYI_TR[ROMA[r.group(0)]], m.group(2)),
                      metin)


HARF_DUYARLI = {'As', 'Ad', 'AIHEAR', 'VEMP', 'vHIT'}
_EN_TERIM = None


def ingilizce_mi(ic):
    """Parantez içi İngilizce mi? Terim listesindeki İngilizce adlar ya da tipik İngilizce işaretler."""
    global _EN_TERIM
    if _EN_TERIM is None:
        try:
            T = json.loads((MOTOR / 'terimler.json').read_text(encoding='utf-8'))['terimler']
            _EN_TERIM = {t['terim'].lower() for t in T if t.get('okunus_dili') == 'en-US'}
        except Exception:
            _EN_TERIM = set()
    k = ic.strip().lower()
    # ünsüz + y + ünlü olmayan (hyperacusis, tonotopy; salyangoz, sosyal değil), ph, ck, ch (Heschl değil), -ic, -ous, -ity
    return k in _EN_TERIM or bool(re.search(r'(th|sh|ee|oo|ou|w|x|q|ing\b|tion\b|ear\b|ory\b|ence\b|ance\b|\bof\b|\band\b|\bthe\b|\bin\b'
                                            r"|(?<=[bcdfghklmnprstvz])y(?![aeıioöuü])|ph|ck|(?<!s)ch|ic\b|ous\b|ity\b|['’]s\b)", k))


_SOZLUK = {}
# Türkçe büyük-küçük harf eşleri: re.IGNORECASE ı ile i'yi aynı sayıyor ("basis" anahtarı "basısı"nı bozuyordu)
_TR_ES = {'i': 'iIİ', 'ı': 'ıI', 'I': 'Iı', 'İ': 'İi'}


def tr_harfsiz(k):
    """Anahtarı Türkçe kurallarla büyük-küçük harf duyarsız bir kalıba çevirir."""
    return ''.join('[' + _TR_ES.get(ch, ch.lower() + ch.upper()) + ']' if ch.isalpha() else re.escape(ch) for ch in k)


def sozluk_kaliplari(dil):
    """Okunuş sözlüğünün derlenmiş kalıpları (uzun anahtar önce). Sözlük yüzlerce anahtar içerdiği için her çağrıda
    yeniden derlemek re önbelleğini taşırıp okunus()'u çok yavaşlatıyordu; bir kez derlenir."""
    if dil not in _SOZLUK:
        kaliplar = []
        for k, v in sorted(MARKA['ses']['okunus'][dil].items(), key=lambda kv: -len(kv[0])):
            if k.startswith('_') or (dil == 'tr' and k in ('As', 'Ad')):
                continue
            son = '' if (dil == 'tr' and len(k) >= 5 and k not in HARF_DUYARLI and not (sum(ch.isupper() for ch in k) >= 2)) else r'(?![\w])'
            kisaltma = sum(ch.isupper() for ch in k) >= 2 or (len(k) > 1 and k[1:].lower() != k[1:])
            duyarli = k in HARF_DUYARLI or kisaltma or dil != 'tr'
            kaliplar.append((re.compile(r'(?<![\w])' + (re.escape(k) if duyarli else tr_harfsiz(k)) + son), v))
        _SOZLUK[dil] = kaliplar
    return _SOZLUK[dil]


def okunus(metin, dil):
    """Ekran metnini seslendirme metnine çevirir.
    Türkçede: parantez içindeki İngilizce okunmaz; sözlük (AIHEAR -> Ey Ay Hi ır, Corti -> Korti) büyük-küçük harf
    duyarsız ve 5+ harfli anahtarlarda ekli hallerle uygulanır; kalan kısaltmalar Türkçe harf adlarıyla okunur."""
    if dil == 'tr':
        # parantez içindeki İngilizce okunmaz (ekranda kalır); Türkçe parantezler okunur
        metin = re.sub(r"\s*\(([A-Za-z0-9 ,.\-/'’]+)\)", lambda m: '' if ingilizce_mi(m.group(1)) else m.group(0), metin)
        # timpanogram tipleri: yalnız tip bağlamında (Ad soyad gibi Türkçe kullanımı bozmaz)
        okn = MARKA['ses']['okunus']['tr']
        metin = re.sub(r'(?<![\w])(As|Ad)(?=\s*(tip|eğri|,|ve\b|ya da|ile\b|\)|\.|$))', lambda m: okn.get(m.group(1), m.group(1)), metin)
        metin = roma_rakamlari(metin)
    for kalip, v in sozluk_kaliplari(dil):
        metin = kalip.sub(v, metin)
    if dil == 'tr':
        # harf grubundan hemen sonra gelen rakam ayrı okunur (KCNQ1 -> "ke ce ne kü 1", "kü1" değil)
        metin = re.sub(r'(?<![\w])[A-ZÇĞİÖŞÜ]{2,6}(?![a-zçğıöşü])',
                       lambda m: ' '.join(HARF_TR.get(h, h) for h in m.group(0)) + (' ' if m.string[m.end():m.end() + 1].isdigit() else ''),
                       metin)
    return metin


def kelimeler(metin):
    return re.findall(r'\S+', metin)


def eslestir(yazi, ses_metni, dil, sinirlar, sure):
    """Ekrandaki kelimelere konuşma zamanlarını dağıtır."""
    ekran = kelimeler(yazi)
    # her ekran kelimesinin kaç konuşma kelimesine karşılık geldiği
    say = [len(kelimeler(okunus(k, dil))) or 1 for k in ekran]
    sonuc = []
    if sinirlar and sum(say) == len(sinirlar):
        i = 0
        for k, n in zip(ekran, say):
            b, s = sinirlar[i][0], sinirlar[i + n - 1][0] + sinirlar[i + n - 1][1]
            sonuc.append({'k': k, 'b': round(b, 3), 's': round(s, 3)})
            i += n
        return sonuc
    # eşleşmezse harf sayısına göre orantılı dağıt
    toplam = sum(len(k) + 1 for k in ekran)
    t = 0.0
    for k in ekran:
        d = sure * (len(k) + 1) / toplam
        sonuc.append({'k': k, 'b': round(t, 3), 's': round(t + d, 3)})
        t += d
    return sonuc


# ------------------------------------------------------------ seslendirme
async def seslendir(metin, ses, hiz, mp3, js):
    for deneme in range(4):
        try:
            c = edge_tts.Communicate(metin, ses, rate=hiz, boundary='WordBoundary')
            veri, sinir = bytearray(), []
            async for parca in c.stream():
                if parca['type'] == 'audio':
                    veri += parca['data']
                elif parca['type'] == 'WordBoundary':
                    sinir.append([parca['offset'] / 1e7, parca['duration'] / 1e7, parca['text']])
            mp3.write_bytes(bytes(veri))
            js.write_text(json.dumps(sinir, ensure_ascii=False), encoding='utf-8')
            return
        except Exception as e:
            print('  tekrar:', e)
            await asyncio.sleep(2 * (deneme + 1))
    raise RuntimeError('seslendirme başarısız: ' + metin)


def oku(yol):
    ham = subprocess.run([FF, '-v', 'error', '-i', str(yol), '-f', 'f32le', '-ac', '1', '-ar', str(SR), '-'],
                         capture_output=True, check=True).stdout
    return np.frombuffer(ham, dtype=np.float32).copy()


def kirp(x):
    """Baş ve sondaki sessizliği kırpar; kırpılan baş süresini de döndürür."""
    esik = 10 ** (-45 / 20)
    idx = np.where(np.abs(x) > esik)[0]
    if not len(idx):
        return x, 0.0
    a = max(0, idx[0] - int(0.02 * SR))
    return x[a: idx[-1] + int(0.08 * SR)], a / SR


# ------------------------------------------------------------ müzik
def ortalama(x, n):
    """Hızlı kayan ortalama (kümülatif toplamla)."""
    c = np.cumsum(np.concatenate([np.zeros(n // 2 + 1), x, np.zeros(n - n // 2)]))
    return (c[n:n + len(x)] - c[:len(x)]) / n


def nota(m):
    return 440 * 2 ** ((m - 69) / 12)


def muzik(n, tempo=84):
    """Aydınlık, sakin fon: yumuşak pad akorları + hafif marimba benzeri notalar."""
    t = np.arange(n) / SR
    akorlar = [[48, 55, 59, 62, 64], [45, 52, 55, 59, 60], [41, 48, 52, 55, 57], [43, 50, 55, 57, 62]]  # Cmaj9 Am9 Fmaj9 G6/9
    olcu = 60 / tempo * 4
    sol = np.zeros(n); sag = np.zeros(n)
    for k in range(int(n / SR / olcu) + 2):
        a = int(k * olcu * SR)
        if a >= n:
            break
        b = min(n, int((k * olcu + olcu + 2.5) * SR))
        tt = t[a:b] - k * olcu
        zarf = (np.clip(tt / 1.8, 0, 1) * np.clip((olcu + 2.5 - tt) / 2.5, 0, 1)) ** 1.6
        for j, m in enumerate(akorlar[k % 4]):
            for det, pan in ((-0.07, .72), (0.07, .28)):
                f = nota(m + 12) * 2 ** (det / 12)
                d = np.sin(2 * np.pi * f * tt + j) + .25 * np.sin(4 * np.pi * f * tt + j)
                sol[a:b] += zarf * d * pan * .028
                sag[a:b] += zarf * d * (1 - pan) * .028
        # ritmik yumuşak notalar (her vuruşta akordan bir nota)
        for v in range(8):
            if v in (3, 7):
                continue
            ba = int((k * olcu + v * olcu / 8) * SR)
            if ba >= n:
                break
            L = min(n - ba, int(1.2 * SR))
            tv = np.arange(L) / SR
            m = akorlar[k % 4][(v * 2) % 5] + 24
            f = nota(m)
            d = (np.sin(2 * np.pi * f * tv) + .3 * np.sin(2 * np.pi * 4 * f * tv) * np.exp(-tv * 30)) * np.exp(-tv * 5.5)
            p = .3 + .4 * ((v % 3) / 2)
            sol[ba:ba + L] += d * .022 * p
            sag[ba:ba + L] += d * .022 * (1 - p)
    sos = butter(2, 5500, 'low', fs=SR, output='sos')
    return np.stack([sosfilt(sos, sol), sosfilt(sos, sag)], 1)


def ton(f, sure, L, a, genlik):
    """Odyometre tonu gibi saf ses: yumuşak açılıp kapanan sinüs."""
    x = np.zeros(L); n = int(sure * SR); tv = np.arange(n) / SR
    zarf = np.clip(tv / .012, 0, 1) * np.clip((sure - tv) / .012, 0, 1)
    x[a:a + n] = np.sin(2 * np.pi * f * tv) * zarf * genlik
    return x


def akor(L, a, notalar, genlik=.07, sonum=1.3):
    x = np.zeros(L); tv = np.arange(L - a) / SR
    for i, m in enumerate(notalar):
        f = nota(m); d = int(i * .045 * SR)
        x[a + d:] += ((np.sin(2 * np.pi * f * tv) + .35 * np.sin(2 * np.pi * 2.01 * f * tv) * np.exp(-tv * 3)) * np.exp(-tv * sonum) * genlik)[:L - a - d]
    return x


def giris_sesi(sure):
    """Ses logosu: 500, 1000, 2000 Hz üç odyometre tonu, ardından sıcak açılan akor."""
    L = int(sure * SR); x = np.zeros(L)
    for b, f in ((.15, 500), (.45, 1000), (.75, 2000)):
        x += ton(f, .16, L, int(b * SR), .16)
    x += akor(L, int(1.05 * SR), [48, 55, 64, 67, 71, 74, 79], .06, 1.1)
    x *= np.clip((L - np.arange(L)) / (.5 * SR), 0, 1)
    return np.stack([x, x * .95], 1)


def bitis_sesi(sure):
    """Bitiş: hafif müzik yatağı + inen üç ton (2000, 1000, 500 Hz) + kapanış akoru."""
    L = int(sure * SR)
    m = muzik(L, 84); m /= np.sqrt(np.mean(m ** 2)) + 1e-9; m *= 10 ** (-25 / 20)
    x = np.zeros(L)
    for b, f in ((.5, 2000), (.8, 1000), (1.1, 500)):
        x += ton(f, .14, L, int(b * SR), .10)
    x += akor(L, int(1.45 * SR), [43, 50, 59, 62, 67, 71], .05, .9)
    y = m + np.stack([x, x * .95], 1)
    zarf = np.clip(np.arange(L) / (.3 * SR), 0, 1) * np.clip((L - np.arange(L)) / (2.0 * SR), 0, 1)
    return y * zarf[:, None]


def onbellek_yolu(sesayar, ses_metni, tts):
    """Cümle başına önbellek dosyaları; ses motoru ya da ses değişince önbellek kendiliğinden yenilenir."""
    motor = sesayar.get('motor', 'edge')
    surum = ''
    if motor == 'piper':   # Ses Modeli betiği ya da sözlükleri değişince önbellek yenilenir
        k = pathlib.Path(sesayar['python']).parents[2]   # Ses Modeli klasörü
        surum = '|'.join(str(int(f.stat().st_mtime)) for f in [k / 'seslendir_piper.py', k / 'diksiyon.py', k / 'telaffuz.txt'] if f.exists())
    h = hashlib.sha1(f"{'' if motor == 'edge' else motor + '|'}{sesayar['ses']}|{sesayar.get('hiz', '')}|{surum}|{ses_metni}".encode('utf-8')).hexdigest()[:12]
    return tts / f"{h}.{'wav' if motor == 'piper' else 'mp3'}", tts / f'{h}.json'


# ------------------------------------------------------------ ana akış
def main(klasor):
    klasor = pathlib.Path(klasor).resolve()
    v = json.loads((klasor / 'metin.json').read_text(encoding='utf-8'))
    dil = v['dil']
    sesayar = dict(MARKA['ses'][dil])
    import os
    if os.environ.get('AKADEMI_SES_' + dil.upper()):  # yalnız önizleme için geçici ses
        sesayar['ses'] = os.environ['AKADEMI_SES_' + dil.upper()]
    tts = klasor / '_tts'; tts.mkdir(exist_ok=True)

    # 1) seslendir (önbellekli)
    isler = []
    for s in v['sahneler']:
        for c in s.get('cumleler', []):
            yazi, ses_metni = cumle_al(c)
            ses_metni = okunus(ses_metni or yazi, dil)
            ses_yolu, js_yolu = onbellek_yolu(sesayar, ses_metni, tts)
            isler.append((yazi, ses_metni, ses_yolu, js_yolu))

    eksik = [i for i in isler if not i[2].exists() or not i[3].exists()]
    if sesayar.get('motor') == 'piper' and eksik:
        # yerel Piper modeli: bütün eksik cümleler tek seferde (model bir kez yüklenir)
        is_dosyasi = tts / '_piper_is.json'
        is_dosyasi.write_text(json.dumps([{'metin': sm, 'wav': str(w)} for _, sm, w, _ in eksik], ensure_ascii=False), encoding='utf-8')
        print(f'yerel model seslendiriyor: {len(eksik)} cümle')
        import os
        ortam = dict(os.environ, AKADEMI_PIPER_MODEL=sesayar['model'], AKADEMI_PIPER_DIKSIYON='1' if sesayar.get('diksiyon', True) else '0')
        subprocess.run([sesayar['python'], '-X', 'utf8', str(MOTOR / 'piper_tts.py'), str(is_dosyasi)], check=True, env=ortam)
        for _, _, _, js in eksik:
            js.write_text('[]', encoding='utf-8')   # Piper kelime zamanı vermez; zamanlar orantılı dağıtılır
    elif eksik:
        async def hepsi():
            for yazi, sm, mp3, js in eksik:
                print('seslendiriliyor:', yazi[:70])
                await seslendir(sm, sesayar['ses'], sesayar['hiz'], mp3, js)
        asyncio.run(hepsi())

    # 2) zamanlama
    zaman = {'sahneler': []}
    parcalar = []  # (başlangıç sn, ses dizisi)
    t = 0.0; k = 0
    for s in v['sahneler']:
        sz = {'id': s.get('id', f's{len(zaman["sahneler"])}'), 'tur': s['tur'], 'bas': round(t, 3), 'cumleler': []}
        cumleler = s.get('cumleler', [])
        if not cumleler:
            sure = s.get('sure', Z.get(s['tur'], 3.0))
        else:
            u = s.get('giris', 3.4 if s['tur'] == 'acilis' else Z['sahne_giris'])  # başlıklı girişte anlatım başlık belirince başlar
            for c in cumleler:
                yazi, sm, mp3, js = isler[k]; k += 1
                x, bas_kirp = kirp(oku(mp3))
                d = len(x) / SR
                sinir = [[a - bas_kirp, b, w] for a, b, w in json.loads(js.read_text(encoding='utf-8'))]
                sz['cumleler'].append({'yazi': yazi, 'b': round(u, 3), 'sure': round(d, 3),
                                       'kelimeler': eslestir(yazi, sm, dil, sinir, d)})
                parcalar.append((t + u, x))
                bekle = c.get('sonra_bekle', 0) if isinstance(c, dict) else 0
                if bekle:
                    sz['cumleler'][-1]['bekle'] = bekle
                u += d + bekle + s.get('ara', Z['cumle_arasi'])
            sure = u - s.get('ara', Z['cumle_arasi']) + s.get('cikis', Z['sahne_cikis'])
            if s['tur'] == 'acilis':
                sure = max(sure, 5.0)
        sz['sure'] = round(sure, 3)
        zaman['sahneler'].append(sz)
        t += sure
    zaman['toplam'] = round(t, 3)
    (klasor / 'zamanlama.json').write_text(json.dumps(zaman, ensure_ascii=False, indent=1), encoding='utf-8')

    # 3) karışım
    n = int((t + 0.5) * SR)
    konusma = np.zeros(n)
    for bas, x in parcalar:
        a = int(bas * SR); konusma[a:a + len(x)] += x[:n - a]
    rms = np.sqrt(np.mean(konusma[np.abs(konusma) > 1e-4] ** 2)) if np.any(np.abs(konusma) > 1e-4) else 1
    konusma *= 10 ** (-19 / 20) / rms
    # müzik: ders gövdesinde YOK (yalnız anlatım); reels'te hafif fon müziği
    karisim = np.repeat(konusma[:, None], 2, 1)
    if v['bicim'] == 'reels' and parcalar:
        aktif = ortalama((np.abs(konusma) > 1e-3).astype(float), int(.4 * SR)) > .02
        hedef = np.where(aktif, 10 ** (Z['muzik_konusmada_db'] / 20), 10 ** (Z['muzik_db'] / 20))
        m = muzik(n, 96)
        m /= np.sqrt(np.mean(m ** 2)) + 1e-9
        m *= ortalama(hedef, int(.5 * SR))[:, None]
        zarf = np.clip(np.arange(n) / (1.0 * SR), 0, 1) * np.clip((n - np.arange(n)) / (2.5 * SR), 0, 1)
        karisim += m * zarf[:, None]
    # jenerik sesleri (yalnız 05_Jenerik şablonları üretilirken)
    for s in zaman['sahneler']:
        if s['tur'] in ('acilis', 'bitis'):
            if s['tur'] == 'acilis':
                secili = AKADEMI / MARKA['jenerik']['giris_sesi']
                cs = wavfile.read(secili)[1].astype(np.float64) / 32768 if secili.exists() else giris_sesi(Z['acilis'])
            else:
                secili = AKADEMI / MARKA['jenerik']['bitis_sesi']
                cs = wavfile.read(secili)[1].astype(np.float64) / 32768 if secili.exists() else bitis_sesi(s['sure'])
            a = int(s['bas'] * SR); L = min(len(cs), n - a)
            karisim[a:a + L] += cs[:L]
    tepe = np.max(np.abs(karisim))
    if tepe > .95:
        karisim *= .95 / tepe
    wavfile.write(klasor / '_ses.wav', SR, (karisim * 32767).astype(np.int16))
    print(f'Toplam süre: {t:.1f} sn, {len(parcalar)} cümle')


if __name__ == '__main__':
    main(sys.argv[1])
