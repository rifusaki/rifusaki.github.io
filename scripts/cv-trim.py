#!/usr/bin/env python3
"""Trim white margins off a single-page PDF by setting its CropBox.

Usage: cv-trim.py <in.pdf> <out.pdf> <x0> <y0> <x1> <y1> [padding]

Coordinates are in PDF user space (points, bottom-left origin) and describe
the content bounding box. A small padding is added inward.
"""
import sys
import pikepdf

def main():
    if len(sys.argv) < 7:
        print("usage: cv-trim.py in.pdf out.pdf x0 y0 x1 y1 [pad]")
        return 1
    src, dst = sys.argv[1], sys.argv[2]
    x0, y0, x1, y1 = (float(v) for v in sys.argv[3:7])
    pad = float(sys.argv[7]) if len(sys.argv) > 7 else 4
    with pikepdf.open(src) as pdf:
        page = pdf.pages[0]
        mb = page.MediaBox
        w = float(mb[2]) - float(mb[0])
        h = float(mb[3]) - float(mb[1])
        x0 = max(0, x0 - pad)
        x1 = min(w, x1 + pad)
        y0 = max(0, y0 - pad)
        y1 = min(h, y1 + pad)
        page.CropBox = [x0, y0, x1, y1]
        pdf.save(dst)
    print("cropped to", round(x1 - x0), "x", round(y1 - y0), "pt")
    return 0

if __name__ == "__main__":
    sys.exit(main())
