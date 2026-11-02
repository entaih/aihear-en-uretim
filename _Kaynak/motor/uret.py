"""AIHEAR Akademi video üretimi.

Kullanım (önce: python -X utf8 ses.py <klasor>):
  python -X utf8 uret.py <klasor> --kontrol      -> her sahneden kareler: <klasor>/_onizleme/
  python -X utf8 uret.py <klasor> --kapak        -> kapak.png
  python -X utf8 uret.py <klasor> --youtube      -> youtube.txt (başlık, açıklama, bölümler, etiketler)
  python -X utf8 uret.py <klasor>                -> video + kapak + youtube.txt
"""
import argparse
import json
import os
import pathlib
import subprocess
import time

import imageio_ffmpeg
from playwright.sync_api import sync_playwright

MOTOR = pathlib.Path(__file__).resolve().parent
MARKA = json.loads((MOTOR / 'marka.json').read_text(encoding='utf-8'))
FPS = MARKA['zaman']['fps']


def yukle(klasor):
    v = json.loads((klasor / 'metin.json').read_text(encoding='utf-8'))
    zy = klasor / 'zamanlama.json'
    z = json.loads(zy.read_text(encoding='utf-8')) if zy.exists() else {'sahneler': [], 'toplam': 0}
    return v, z


def sayfa_ac(p, klasor, bicim=None):
    v, z = yukle(klasor)
    b = bicim or v['bicim']
    olcu = MARKA['bicim'][b]
    tarayici = p.chromium.launch(channel=os.environ.get('AKADEMI_TARAYICI', 'msedge'), args=['--force-color-profile=srgb', '--disable-lcd-text', '--allow-file-access-from-files'])
    sayfa = tarayici.new_page(viewport={'width': olcu['genislik'], 'height': olcu['yukseklik']}, device_scale_factor=1)
    hatalar = []
    sayfa.on('pageerror', lambda e: hatalar.append(str(e)))
    sayfa.add_init_script(f'window.VIDEO = {json.dumps(v, ensure_ascii=False)}; window.ZAMAN = {json.dumps(z)}; '
                          f'window.MARKA = {json.dumps(MARKA, ensure_ascii=False)}; window.BICIM = {json.dumps(b)};')
    sayfa.goto((MOTOR / 'sahne.html').as_uri())
    try:
        sayfa.wait_for_function('window.__ready === true', timeout=60000)
    except Exception:
        print('HATA:', hatalar)
        raise
    return tarayici, sayfa, hatalar


def kontrol(klasor):
    v, z = yukle(klasor)
    cikti = klasor / '_onizleme'; cikti.mkdir(exist_ok=True)
    with sync_playwright() as p:
        tarayici, sayfa, hatalar = sayfa_ac(p, klasor)
        for s in z['sahneler']:
            # her sahneden en az 2 kare; sonuncusu son hal (çıkış solmasından hemen önce)
            anlar = [s['bas'] + s['sure'] * .5, s['bas'] + s['sure'] - .45] if s['tur'] != 'acilis' else [s['bas'] + 2.4, s['bas'] + min(4.6, s['sure'] - .4)]
            cs = s.get('cumleler', [])
            if s['tur'] == 'test' and cs:  # geri sayım sırasında + cevaptan sonra + son hal
                c0 = cs[0]
                anlar = [c0['b'] + c0['sure'] + max(c0.get('bekle', 0), .8) * .5]
                if len(cs) > 1:
                    anlar.append(cs[1]['b'] + 1.3)
                anlar = [s['bas'] + a for a in anlar] + [s['bas'] + s['sure'] - .45]
            for j, an in enumerate(anlar):
                sayfa.evaluate(f'renderAt({an})')
                yol = cikti / f"{s['id']}_{j + 1}.png"
                sayfa.screenshot(path=str(yol))
                print(yol.name)
        if hatalar:
            print('SAYFA HATALARI:', hatalar)
        tarayici.close()


def kapak(klasor):
    with sync_playwright() as p:
        # reels kapağı dikey (Instagram/TikTok/Shorts); ders kapağı yatay YouTube küçük resmi
        tarayici, sayfa, _ = sayfa_ac(p, klasor, 'kapak_reels' if yukle(klasor)[0]['bicim'] == 'reels' else 'kapak')
        sayfa.screenshot(path=str(klasor / 'kapak.png'))
        tarayici.close()
    print('kapak.png')


def sure_yaz(sn):
    sn = int(round(sn)); return f'{sn // 60}:{sn % 60:02d}'


def youtube(klasor):
    v, z = yukle(klasor)
    y = v.get('youtube', {}); en = v['dil'] == 'en'
    # metin.json'larda paragraf sonu çoğu zaman düz "\n" yazısı olarak duruyor; gerçek satır sonuna çevrilir
    satirlar = ['BAŞLIK', y.get('baslik', ''), '', 'AÇIKLAMA', y.get('aciklama', '').replace('\\n', '\n').strip(), '']
    if v['bicim'] == 'ders':
        bolumler, onceki = [], None
        for s, sz in zip(v['sahneler'], z['sahneler']):
            ad = s.get('bolum_ad') or s.get('bolum')
            if s['tur'] in ('ozet', 'test') and not s.get('bolum_ad'):
                ad = 'Summary and quiz' if en else 'Özet ve test'
            if s['tur'] in ('baslik', 'acilis'):
                ad = 'Intro' if en else 'Giriş'
            if s['tur'] == 'kapanis':
                ad = 'Summary' if en else 'Kapanış'
            if ad and ad != onceki:
                bolumler.append([sz['bas'], ad]); onceki = ad
        kay = 0
        bolumler = [[b + kay, a] for b, a in bolumler]
        if bolumler:
            bolumler[0][0] = 0
            satirlar += ['Chapters:' if en else 'Bölümler:'] + [f'{sure_yaz(b)} {a}' for b, a in bolumler] + ['']
    satirlar += [y.get('kapanis_metni', MARKA['ad']['en' if en else 'tr']), '']
    if y.get('hashtag'):
        satirlar += [' '.join('#' + h for h in y['hashtag']), '']
    satirlar += ['ETİKETLER', ', '.join(y.get('etiketler', [])), '', f'Süre: {sure_yaz(z["toplam"] + (MARKA["zaman"]["bitis"] if v["bicim"] == "ders" else 0))}']
    (klasor / 'youtube.txt').write_text('\n'.join(satirlar), encoding='utf-8')
    print('youtube.txt')


AKADEMI = MOTOR.parents[1]
JENERIK = AKADEMI / MARKA['jenerik']['klasor']


def jenerik_yollari(dil):
    d = dil.upper()
    return (JENERIK / MARKA['jenerik']['giris'].replace('{DIL}', d), JENERIK / MARKA['jenerik']['bitis'].replace('{DIL}', d))


def birlestir(parcalar, hedef):
    """Aynı ayarlarla üretilmiş parçaları yeniden kodlamadan uç uca ekler."""
    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    liste = hedef.with_suffix('.liste.txt')
    liste.write_text(''.join(f"file '{p.as_posix()}'" + chr(10) for p in parcalar), encoding='utf-8')
    subprocess.run([ffmpeg, '-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', str(liste),
                    '-c', 'copy', '-movflags', '+faststart', str(hedef)], check=True)
    liste.unlink()


def video(klasor, hedef=None):
    v, z = yukle(klasor)
    son = hedef or klasor / (v.get('dosya', klasor.name) + '.mp4')
    jenerikli = v['bicim'] == 'ders' and not v.get('jenerik')
    if jenerikli:
        _, bitis = jenerik_yollari(v['dil'])
        if not bitis.exists():
            raise SystemExit(f'Bitiş şablonu yok: {bitis.name}. Önce: python -X utf8 jenerik_uret.py')
    hedef = klasor / '_govde.mp4' if jenerikli else son
    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    with sync_playwright() as p:
        tarayici, sayfa, _ = sayfa_ac(p, klasor)
        n = int(round(z['toplam'] * FPS))
        komut = [ffmpeg, '-y', '-loglevel', 'error', '-f', 'image2pipe', '-c:v', 'mjpeg', '-framerate', str(FPS), '-i', '-',
                 '-i', str(klasor / '_ses.wav'),
                 '-vf', 'scale=in_range=pc:out_range=tv:in_color_matrix=bt601:out_color_matrix=bt709,format=yuv420p,'
                 'setparams=range=tv:colorspace=bt709:color_primaries=bt709:color_trc=bt709',
                 '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv',
                 '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-r', str(FPS),
                 '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', str(hedef)]
        proc = subprocess.Popen(komut, stdin=subprocess.PIPE)
        bas = time.time()
        for i in range(n):
            sayfa.evaluate(f'renderAt({i / FPS})')
            proc.stdin.write(sayfa.screenshot(type='jpeg', quality=93))
            if i % 300 == 0:
                g = time.time() - bas
                print(f'{i}/{n} kare ({g:.0f} sn, kalan ~{g / max(i, 1) * (n - i):.0f} sn)', flush=True)
        proc.stdin.close(); proc.wait()
        tarayici.close()
    if jenerikli:
        birlestir([hedef, bitis], son)
        hedef.unlink()
    print('Tamam:', son)


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('klasor')
    ap.add_argument('--kontrol', action='store_true')
    ap.add_argument('--kapak', action='store_true')
    ap.add_argument('--youtube', action='store_true')
    a = ap.parse_args()
    k = pathlib.Path(a.klasor).resolve()
    if a.kontrol:
        kontrol(k)
    elif a.kapak:
        kapak(k)
    elif a.youtube:
        youtube(k)
    else:
        kapak(k); youtube(k); video(k)
