#!/bin/bash
find . -type f -name "*.png" | while read -r file; do
    cwebp -lossless -m 6 -q 100 -z 9 "$file" -o "${file%.png}.webp"
done
