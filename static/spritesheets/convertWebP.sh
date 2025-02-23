#!/bin/bash
for file in *.png; do
    cwebp -lossless -m 6 -q 100 -z 9 "$file" -o "${file%.png}.webp"
done
