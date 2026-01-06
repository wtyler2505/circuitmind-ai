# Visual Analysis & UI Audit Tools Reference

> CLI tools for enhanced AI visual analysis, UI auditing, accessibility testing, and image processing.

## Quick Reference

| Tool | Category | Primary Use |
|------|----------|-------------|
| `tesseract` | OCR | Extract text from screenshots |
| `exiftool` | Metadata | Image metadata/integrity |
| `ffmpeg/ffprobe` | Video | GIF/video frame analysis |
| `pngcheck` | Validation | PNG integrity check |
| `oxipng` | Optimization | Lossless PNG compression |
| `pngquant` | Compression | Lossy PNG optimization |
| `resvg` | SVG | SVG→PNG rendering |
| `pixelmatch` | Diffing | Pixel-level comparison |
| `odiff` | Diffing | Perceptual diff |
| `lighthouse` | Audit | Performance/best practices |
| `pa11y` | A11y | WCAG violations |
| `axe` | A11y | Detailed accessibility |
| `opencv` | Python | Computer vision |
| `scikit-image` | Python | Scientific image analysis |
| `imagehash` | Python | Perceptual hashing |

---

## 1. Tesseract OCR (5.3.4)

Extract text from screenshots for label audits and copy verification.

```bash
# Basic extraction
tesseract screenshot.png stdout

# UI-optimized (uniform text block)
tesseract screenshot.png stdout --psm 6

# Single line
tesseract screenshot.png stdout --psm 7
```

**PSM Modes**: 3=auto, 6=text block, 7=line, 8=word, 11=sparse

**Use for**: Button text, label verification, typo detection

---

## 2. ExifTool (12.76)

Metadata extraction for image integrity and provenance.

```bash
# All metadata
exiftool image.png

# Specific fields
exiftool -ImageWidth -ImageHeight -FileSize image.png

# JSON output
exiftool -json image.png | jq '.[] | {width: .ImageWidth, height: .ImageHeight}'

# File type verification (detect renamed files)
exiftool -FileType -MIMEType image.png
```

**Use for**: Dimension verification, format authenticity, corruption detection

---

## 3. FFmpeg/FFprobe (6.1.1)

Video and GIF analysis, frame extraction.

```bash
# Get video/GIF info
ffprobe -v quiet -print_format json -show_format -show_streams video.mp4

# Extract single frame
ffmpeg -i video.mp4 -ss 00:00:05 -frames:v 1 frame.png

# GIF to frames
ffmpeg -i animation.gif frame_%04d.png

# Frame count
ffprobe -v error -count_frames -select_streams v:0 \
  -show_entries stream=nb_read_frames -of default=nokey=1:noprint_wrappers=1 animation.gif

# Get dimensions
ffprobe -v error -select_streams v:0 \
  -show_entries stream=width,height -of csv=p=0 video.mp4
```

**Use for**: GIF analysis, frame extraction, animation verification

---

## 4. PNG Tools

### pngcheck (3.0.3) - Integrity
```bash
pngcheck image.png          # Basic check
pngcheck -v image.png       # Verbose
pngcheck -cvt image.png     # Chunk info
```

### oxipng (10.0.0) - Lossless Optimization
```bash
oxipng image.png            # Optimize
oxipng -o max image.png     # Maximum compression
oxipng --pretend image.png  # Dry run (show savings)
```

### pngquant (2.18.0) - Lossy Compression
```bash
pngquant --quality=65-80 image.png
pngquant --verbose image.png       # Show stats
```

**Use for**: Pre-analysis validation, optimization analysis

---

## 5. resvg (0.45.1)

Normalize SVG rendering for consistent comparison.

```bash
resvg input.svg output.png              # Basic convert
resvg input.svg output.png -w 800 -h 600  # Specific size
resvg input.svg output.png --zoom 2     # Scale factor
resvg input.svg output.png --dpi 300    # Custom DPI
```

**Use for**: SVG→PNG for pixel comparison, icon normalization

---

## 6. Visual Diffing

### pixelmatch (npx) - Pixel-Level
```bash
npx pixelmatch baseline.png current.png diff.png
npx pixelmatch baseline.png current.png diff.png 0.1  # threshold
```

### odiff - Perceptual
```bash
odiff baseline.png current.png diff.png
odiff --threshold 0.05 baseline.png current.png diff.png
odiff --fail-on-layout baseline.png current.png  # Strict
```

**Exit codes**: 0=match, 1=diff found, 2=layout shift

**Thresholds**: 0.01=exact, 0.05=minor tolerance, 0.1=default, 0.2=significant

---

## 7. Lighthouse (12.8.2)

Performance and best practices audit. **Requires running app.**

```bash
# Full audit
npx lighthouse http://localhost:3000 --output html --output-path report.html

# Headless (CI-friendly)
npx lighthouse http://localhost:3000 --chrome-flags="--headless" --output json

# Specific categories
npx lighthouse http://localhost:3000 --only-categories=performance,accessibility

# Desktop mode
npx lighthouse http://localhost:3000 --preset=desktop

# Extract scores
npx lighthouse http://localhost:3000 --chrome-flags="--headless" --output json --quiet | \
  jq '{perf: .categories.performance.score, a11y: .categories.accessibility.score}'
```

**Categories**: performance, accessibility, best-practices, seo, pwa

---

## 8. Accessibility (pa11y 9.0.1, axe 4.11.0)

### pa11y - Quick Scan
```bash
npx pa11y http://localhost:3000
npx pa11y http://localhost:3000 --standard WCAG2AA
npx pa11y http://localhost:3000 --reporter json | jq
```

### axe - Detailed Audit
```bash
npx @axe-core/cli http://localhost:3000
npx @axe-core/cli http://localhost:3000 --rules color-contrast,label
npx @axe-core/cli http://localhost:3000 --save results.json
```

**Standards**: WCAG2A (minimum), WCAG2AA (standard), WCAG2AAA (strict)

---

## 9. Python Computer Vision

### OpenCV (4.6.0)
```python
import cv2

img = cv2.imread('screenshot.png')
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# Edge detection
edges = cv2.Canny(gray, 100, 200)
cv2.imwrite('edges.png', edges)

# Contour detection (find UI elements)
contours, _ = cv2.findContours(edges, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)

# Template matching
template = cv2.imread('button.png')
result = cv2.matchTemplate(img, template, cv2.TM_CCOEFF_NORMED)
_, max_val, _, max_loc = cv2.minMaxLoc(result)
```

### scikit-image (0.22.0)
```python
from skimage import io, color, filters
from skimage.metrics import structural_similarity as ssim

img = io.imread('screenshot.png')
gray = color.rgb2gray(img)

# Contrast measurement
contrast = gray.std()

# SSIM comparison
score = ssim(img1, img2, channel_axis=2)
```

### imagehash (4.3.2)
```python
import imagehash
from PIL import Image

img = Image.open('screenshot.png')
hash1 = imagehash.phash(img)  # Perceptual hash

# Compare
hash2 = imagehash.phash(Image.open('other.png'))
diff = hash1 - hash2  # 0=identical, >10=very different
```

---

## Decision Matrix

| Need | Tool |
|------|------|
| Text from image | `tesseract --psm 6` |
| PNG valid? | `pngcheck` |
| File metadata | `exiftool -json \| jq` |
| Exact pixel diff | `pixelmatch` |
| Perceptual diff | `odiff` |
| Layout change | `odiff --fail-on-layout` |
| GIF frames | `ffmpeg -i gif frame_%04d.png` |
| SVG→PNG | `resvg` |
| Quick a11y | `pa11y --standard WCAG2AA` |
| Full audit | `lighthouse` |
| Similar images | `imagehash` |
| Edge detection | `opencv cv2.Canny` |

---

## Pipeline Examples

### Visual Regression
```bash
pngcheck baseline.png current.png
odiff baseline.png current.png diff.png --threshold 0.05
[ $? -ne 0 ] && npx pixelmatch baseline.png current.png detailed.png 0.01
```

### Screenshot Analysis
```bash
exiftool -ImageWidth -ImageHeight -FileSize $IMG
pngcheck $IMG
tesseract $IMG stdout --psm 6 2>/dev/null
oxipng --pretend $IMG 2>&1 | tail -1
```

### A11y Pipeline
```bash
npx pa11y $URL --standard WCAG2AA --reporter json | jq length
npx @axe-core/cli $URL --save results.json
npx lighthouse $URL --chrome-flags="--headless" --only-categories=accessibility --output json --quiet | jq '.categories.accessibility.score'
```

---

## Version Reference

| Tool | Version | Install |
|------|---------|---------|
| tesseract | 5.3.4 | `apt install tesseract-ocr` |
| exiftool | 12.76 | `apt install libimage-exiftool-perl` |
| ffmpeg | 6.1.1 | `apt install ffmpeg` |
| pngcheck | 3.0.3 | `apt install pngcheck` |
| oxipng | 10.0.0 | `cargo install oxipng` |
| pngquant | 2.18.0 | `apt install pngquant` |
| resvg | 0.45.1 | `cargo install resvg` |
| pixelmatch | 7.1.0 | `npx pixelmatch` |
| odiff | latest | `npm i -g odiff-bin` |
| lighthouse | 12.8.2 | `npx lighthouse` |
| pa11y | 9.0.1 | `npx pa11y` |
| axe | 4.11.0 | `npm i -g @axe-core/cli` |
| opencv | 4.6.0 | system python |
| scikit-image | 0.22.0 | system python |
| imagehash | 4.3.2 | `pip3 install imagehash` |
