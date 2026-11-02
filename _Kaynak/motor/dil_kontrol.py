"""Seslendirme dil kontrolü: her cümlenin gerçekten videonun dilinde okunup okunmadığını
konuşma tanıma ile denetler (faster-whisper, bilgisayarda çalışır).

Kullanım: python -X utf8 dil_kontrol.py <video_klasoru>
Çıktı: her cümle için algılanan dil ve olasılık; şüpheli cümleler "SORUN" ile işaretlenir.
"""
import hashlib
import json
import pathlib
import sys

from faster_whisper import WhisperModel
from faster_whisper.utils import download_model

MOTOR = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(MOTOR))
from ses import MARKA, FF, cumle_al, okunus, onbellek_yolu  # noqa: E402
import subprocess
import numpy as np

ESIK = 0.80


def main(klasor):
    klasor = pathlib.Path(klasor).resolve()
    v = json.loads((klasor / 'metin.json').read_text(encoding='utf-8'))
    dil = v['dil']; sa = MARKA['ses'][dil]
    yer = pathlib.Path.home() / '.aihear_akademi' / 'whisper-small'
    if not (yer / 'model.bin').exists():
        download_model('small', output_dir=str(yer))
    model = WhisperModel(str(yer), device='cpu', compute_type='int8')
    sorunlu = 0
    for s in v['sahneler']:
        for c in s.get('cumleler', []):
            yazi, sm = cumle_al(c)
            sm = okunus(sm or yazi, dil)
            mp3, _ = onbellek_yolu(sa, sm, klasor / '_tts')
            if not mp3.exists():
                # denetlenemeyen cümle geçmiş sayılmaz (ör. önbellek anahtarı seslendirmeden sonra değiştiyse)
                sorunlu += 1
                print('SORUN YOK  ', yazi[:60]); continue
            ham = subprocess.run([FF, '-v', 'error', '-i', str(mp3), '-f', 'f32le', '-ac', '1', '-ar', '16000', '-'], capture_output=True, check=True).stdout
            ses_dizisi = np.frombuffer(ham, dtype=np.float32)
            # yalnız dil tespiti (kodlayıcı); tam yazıya dökme yalnız şüpheli cümlede, ne duyulduğunu göstermek için
            dil_bulunan, olasilik, _ = model.detect_language(ses_dizisi)
            iyi = dil_bulunan == dil and olasilik >= ESIK
            sorunlu += not iyi
            print(f"{'tamam' if iyi else 'SORUN'}  {dil_bulunan} {olasilik:.2f}  {yazi[:58]}")
            if not iyi:
                parcalar, _ = model.transcribe(ses_dizisi, beam_size=1, language=None)
                print('        duyulan:', ' '.join(p.text.strip() for p in parcalar)[:110])
    print(f'\n{sorunlu} şüpheli cümle')
    return sorunlu


if __name__ == '__main__':
    sys.exit(1 if main(sys.argv[1]) else 0)
