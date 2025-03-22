#!/bin/bash

max_size=96
output_dir="centered_pokemon"
tolerance=2  # Toleranz in Pixeln - Sprites, die nur um diesen Wert abweichen, werden als zentriert betrachtet

# Zähler initialisieren
processed_count=0
skipped_count=0

mkdir -p "$output_dir"

for file in *.png; do
    # Get the bounds of the non-transparent area
    bounds=$(convert "$file" -format "%@" info:)
    
    # Extract width, height and offset values
    width=$(echo $bounds | cut -d'+' -f1 | cut -dx -f1)
    height=$(echo $bounds | cut -d'+' -f1 | cut -dx -f2)
    offset_x=$(echo $bounds | cut -d'+' -f2)
    offset_y=$(echo $bounds | cut -d'+' -f3)

    # Calculate the current center of the sprite
    current_center_x=$((offset_x + width / 2))
    current_center_y=$((offset_y + height / 2))

    # Calculate the target center
    target_center=$((max_size / 2))
    
    # Calculate the translation needed to center the sprite
    translate_x=$((target_center - current_center_x))
    translate_y=$((target_center - current_center_y))
    
    # Check if the sprite is already centered within tolerance
    if [ "${translate_x#-}" -le "$tolerance" ] && [ "${translate_y#-}" -le "$tolerance" ]; then
        echo "Skipping $file - Already centered (offset only ${translate_x}, ${translate_y} pixels)"
        cp "$file" "$output_dir/$file"
        skipped_count=$((skipped_count + 1))
        continue
    fi
    
    # Apply the translation and ensure we have a 96x96 canvas
    convert "$file" -background none -page +${translate_x}+${translate_y} -flatten \
        -extent ${max_size}x${max_size} "$output_dir/$file"
    
    echo "Processed $file - Moved by (${translate_x}, ${translate_y}) pixels to center"
    processed_count=$((processed_count + 1))
done

# Zusammenfassung ausgeben
total_count=$((processed_count + skipped_count))
echo ""
echo "=== Zusammenfassung ==="
echo "Insgesamt bearbeitete Dateien: $total_count"
echo "Zentrierte Sprites: $processed_count"
echo "Übersprungene Sprites (bereits zentriert): $skipped_count"