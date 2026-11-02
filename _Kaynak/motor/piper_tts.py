"""Piper (yerel) seslendirme işçisi. Ses Modeli klasöründeki sanal ortamda çalışır.

Kullanım: <Ses Modeli>\\_egitim\\Scripts\\python.exe -X utf8 piper_tts.py is.json
is.json: [{"metin": "...", "wav": "çıkış yolu"}, ...]
Modeli bir kez yükler; telaffuz sözlüğünü (telaffuz.txt) ve yumuşatma filtresini seslendir_piper.py'den kullanır.
"""
import io
import json
import os
import pathlib
import shutil
import sys
import wave

import soundfile as sf

SES_MODELI = os.environ.get('AKADEMI_PIPER_KLASOR', r'C:\Users\sebah\OneDrive\Masaüstü\Claude\Ses Modeli')
sys.path.insert(0, SES_MODELI)
from piper import PiperVoice, SynthesisConfig  # noqa: E402
from piper.phonemize_espeak import ESPEAK_DATA_DIR  # noqa: E402
try:
    import seslendir_piper as sp  # noqa: E402
except ImportError:
    # Ses Modeli klasörü olmayan makine (GitHub Actions): yalnız diksiyonsuz İngilizce; ayar seslendir_piper.py'deki ile aynı
    class sp:
        MODEL = None
        AYAR = SynthesisConfig(length_scale=1.05, noise_scale=0.55, noise_w_scale=0.8)


def espeak_klasoru():
    """espeak-ng, Türkçe harfli yolları (Masaüstü) açamıyor; veri klasörü gerekirse ASCII bir yola kopyalanır."""
    if str(ESPEAK_DATA_DIR).isascii():
        return ESPEAK_DATA_DIR
    hedef = pathlib.Path.home() / '.aihear_akademi' / 'espeak-ng-data'
    if not (hedef / 'phontab').exists():
        shutil.copytree(ESPEAK_DATA_DIR, hedef, dirs_exist_ok=True)
    return hedef


def main(is_dosyasi):
    isler = json.load(open(is_dosyasi, encoding='utf-8'))
    model = os.environ.get('AKADEMI_PIPER_MODEL', sp.MODEL)
    ses = PiperVoice.load(model, espeak_data_dir=espeak_klasoru())
    for i, j in enumerate(isler, 1):
        if os.environ.get('AKADEMI_PIPER_DIKSIYON', '1') == '0':
            # İngilizce: Türkçe diksiyon katmanı ve yumuşatma uygulanmaz
            with wave.open(j['wav'], 'wb') as wf:
                ses.synthesize_wav(j['metin'], wf, syn_config=sp.AYAR)
        elif hasattr(sp, 'seslendir'):
            # Ses Modeli'nin güncel yolu: diksiyon katmanı (TDK telaffuzu, vurgu, telaffuz.txt) + yumuşatma
            sp.seslendir(ses, j['metin'], j['wav'])
        else:
            b = io.BytesIO()
            with wave.open(b, 'wb') as wf:
                ses.synthesize_wav(sp.sozlugu_uygula(j['metin'], ses), wf, syn_config=sp.AYAR)
            b.seek(0)
            x, sr = sf.read(b, dtype='float32')
            sf.write(j['wav'], sp.yumusat(x, sr), sr, subtype='PCM_16')
        if i % 20 == 0:
            print(f'{i}/{len(isler)}', flush=True)
    print(f'tamam: {len(isler)} cümle')


if __name__ == '__main__':
    main(sys.argv[1])
