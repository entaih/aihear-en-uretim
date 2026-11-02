#!/usr/bin/env bash
# GitHub Actions işi: verilen dersleri üretir (ses -> dil kontrolü -> kapak + youtube.txt + video).
# Sonuçlar cikti/<ders>/ altına; durum satırları cikti/durum.txt'ye. yayin.py yerelde, indirildikten sonra çalışır.
# Kullanım: bash uret.sh <ders_klasoru> [<ders_klasoru> ...]   (klasörler Videolar/EN/ altında)
cd "$(dirname "$0")"
export PYTHONUNBUFFERED=1
mkdir -p cikti
for ders in "$@"; do
  k="Videolar/EN/$ders"; c="cikti/$ders"; mkdir -p "$c"
  bas=$(date +%s)
  echo "::group::$ders"
  durum=TAMAM
  if ! python -X utf8 _Kaynak/motor/ses.py "$k" > "$k/_ses_log.txt" 2>&1; then
    durum="SES HATASI"
  else
    python -X utf8 _Kaynak/motor/dil_kontrol.py "$k" > "$k/_dil_kontrol.txt" 2>&1
    if ! grep -q "^0 şüpheli" "$k/_dil_kontrol.txt"; then
      durum="DIL SORUNU"
    elif ! python -X utf8 _Kaynak/motor/uret.py "$k" > "$k/_uret_log.txt" 2>&1; then
      durum="URETIM HATASI"
    fi
  fi
  for f in "$k"/*.mp4 "$k/kapak.png" "$k/youtube.txt" "$k/zamanlama.json" "$k/_ses_log.txt" "$k/_dil_kontrol.txt" "$k/_uret_log.txt"; do
    [ -f "$f" ] && cp "$f" "$c/"
  done
  echo "$durum $ders $(( ($(date +%s) - bas) / 60 )) dk" | tee -a cikti/durum.txt
  echo "::endgroup::"
done
