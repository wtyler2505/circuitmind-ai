#!/bin/bash
# Converts PNG assets to optimized WebP format using ImageMagick
# Part of PERF-001 remediation

set -e

ASSET_DIR="public/assets/ui"
BACKUP_DIR="public/assets/ui-png-backup"

# Navigate to project root
cd "$(dirname "$0")/.."

# Check for convert (ImageMagick)
if ! command -v convert &> /dev/null; then
    echo "ERROR: ImageMagick 'convert' command not found"
    exit 1
fi

echo "Using ImageMagick: $(convert --version | head -1)"
echo ""

# Backup originals
echo "Backing up original PNGs..."
mkdir -p "$BACKUP_DIR"
cp "$ASSET_DIR"/*.png "$BACKUP_DIR/"

# Get initial size
INITIAL_SIZE=$(du -sh "$ASSET_DIR" | cut -f1)
echo "Initial directory size: $INITIAL_SIZE"
echo ""

echo "Converting PNGs to WebP (quality 85)..."
for f in "$ASSET_DIR"/*.png; do
    filename=$(basename "$f" .png)
    convert "$f" -quality 85 "$ASSET_DIR/$filename.webp"
    
    # Show individual file comparison
    png_size=$(du -h "$f" | cut -f1)
    webp_size=$(du -h "$ASSET_DIR/$filename.webp" | cut -f1)
    echo "  $filename: $png_size -> $webp_size"
done

echo ""
echo "============================================"
echo "Size comparison:"
echo "============================================"
PNG_TOTAL=$(du -ch "$BACKUP_DIR"/*.png 2>/dev/null | tail -1 | cut -f1)
WEBP_TOTAL=$(du -ch "$ASSET_DIR"/*.webp 2>/dev/null | tail -1 | cut -f1)
echo "Original PNGs total: $PNG_TOTAL"
echo "New WebP total: $WEBP_TOTAL"

echo ""
echo "Done! Original PNGs backed up to: $BACKUP_DIR"
