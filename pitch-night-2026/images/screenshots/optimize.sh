#!/bin/bash
# Optimise un fichier source (PNG/MOV/MP4) en 4 formats pour le registry
# Usage: ./optimize.sh <source> <category> <name>
# Ex:    ./optimize.sh ~/Desktop/agenda.png dashboard agenda-rdv
# Ex:    ./optimize.sh ~/Desktop/agenda.mov dashboard agenda-rdv

set -euo pipefail

SOURCE="$1"
CATEGORY="$2"
NAME="$3"
OUTDIR="$(dirname "$0")/$CATEGORY"
EXT="${SOURCE##*.}"
EXT_LOWER=$(echo "$EXT" | tr '[:upper:]' '[:lower:]')

mkdir -p "$OUTDIR"

echo "Processing: $SOURCE -> $CATEGORY/$NAME"

if [[ "$EXT_LOWER" == "png" || "$EXT_LOWER" == "jpg" || "$EXT_LOWER" == "jpeg" || "$EXT_LOWER" == "webp" ]]; then
  # === IMAGE STATIQUE ===
  echo "  [1/4] PNG (redimensionné max 1400px large)..."
  ffmpeg -y -i "$SOURCE" -vf "scale='min(1400,iw)':-1" "$OUTDIR/$NAME.png" 2>/dev/null

  echo "  [2/4] WebP statique..."
  cwebp -q 82 -resize 1400 0 "$OUTDIR/$NAME.png" -o "$OUTDIR/$NAME.webp" 2>/dev/null

  echo "  [3/4] Poster WebP (identique pour statique)..."
  cp "$OUTDIR/$NAME.webp" "$OUTDIR/$NAME.poster.webp"

  echo "  [4/4] MP4 (image fixe 3s pour compatibilité video tag)..."
  ffmpeg -y -loop 1 -i "$OUTDIR/$NAME.png" -c:v libx264 -t 3 -pix_fmt yuv420p \
    -vf "scale='min(1400,iw)':-2" -preset veryslow -crf 28 "$OUTDIR/$NAME.mp4" 2>/dev/null

elif [[ "$EXT_LOWER" == "mov" || "$EXT_LOWER" == "mp4" || "$EXT_LOWER" == "gif" ]]; then
  # === VIDEO / GIF ===
  echo "  [1/4] MP4 optimisé (H.264, max 1400px, CRF 28)..."
  ffmpeg -y -i "$SOURCE" -c:v libx264 -preset veryslow -crf 28 -pix_fmt yuv420p \
    -vf "scale='min(1400,iw)':-2" -an -movflags +faststart "$OUTDIR/$NAME.mp4" 2>/dev/null

  echo "  [2/4] WebP animé..."
  ffmpeg -y -i "$SOURCE" -vf "scale='min(1400,iw)':-2,fps=15" \
    -vcodec libwebp -lossless 0 -q:v 65 -loop 0 -preset default \
    -an "$OUTDIR/$NAME.webp" 2>/dev/null

  echo "  [3/4] Poster WebP (première frame)..."
  ffmpeg -y -i "$SOURCE" -vframes 1 -vf "scale='min(1400,iw)':-2" "$OUTDIR/${NAME}_tmp_poster.png" 2>/dev/null
  cwebp -q 82 "$OUTDIR/${NAME}_tmp_poster.png" -o "$OUTDIR/$NAME.poster.webp" 2>/dev/null
  rm -f "$OUTDIR/${NAME}_tmp_poster.png"

  echo "  [4/4] PNG (première frame pour fallback)..."
  ffmpeg -y -i "$SOURCE" -vframes 1 -vf "scale='min(1400,iw)':-2" "$OUTDIR/$NAME.png" 2>/dev/null

else
  echo "Format non supporté: $EXT_LOWER (attendu: png, jpg, mov, mp4, gif)"
  exit 1
fi

echo ""
echo "Fichiers générés :"
ls -lh "$OUTDIR/$NAME".{png,mp4,webp,poster.webp} 2>/dev/null | awk '{print "  " $5 "\t" $NF}'
echo ""
echo "OK"
