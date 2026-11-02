#!/usr/bin/env bash
# Piper İngilizce modelini indirir ve yerelde kullanılanla aynı olduğunu doğrular (model depoya konmaz: 100 MB sınırı).
set -euo pipefail
d="$HOME/.aihear_akademi/piper"; mkdir -p "$d"
u="https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/ljspeech/high"
for f in en_US-ljspeech-high.onnx en_US-ljspeech-high.onnx.json; do
  [ -f "$d/$f" ] || curl -sSfL --retry 5 -o "$d/$f" "$u/$f"
done
cd "$d"
sha256sum -c - <<'EOF'
5d4f08ba6a2a48c44592eed3ce56bf85e9de3dd4e20df90541ae68a8310c029a  en_US-ljspeech-high.onnx
7e1f4634af596d83cca997fb7a931ba80b70f8a316a2655ee69c55365e0ace14  en_US-ljspeech-high.onnx.json
EOF
