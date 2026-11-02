"""Sıra dosyasını paketlere böler ve GitHub Actions matrisini yazar.
Kullanım: python3 plan.py <sira_dosyasi> <paket_basina_ders>  ->  matris=[{"no": 1, "dersler": "D001_... D002_..."}, ...]"""
import json
import sys

dersler = [s.strip() for s in open(sys.argv[1], encoding='utf-8') if s.strip()]
n = max(1, int(sys.argv[2]))
paketler = [{'no': i // n + 1, 'dersler': ' '.join(dersler[i:i + n])} for i in range(0, len(dersler), n)]
if len(paketler) > 256:
    raise SystemExit(f'{len(paketler)} paket: GitHub matrisi en fazla 256 iş alır, paket başına ders sayısını artır')
print('matris=' + json.dumps(paketler, ensure_ascii=False))
