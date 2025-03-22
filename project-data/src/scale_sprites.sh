#!/bin/bash

max_size=96
target_size=77  # ~80% von 96 für den Rand
min_scale_threshold=70  # Minimale Größe in Prozent, ab der nicht mehr skaliert wird
output_dir="scaled_pokemon"  # Neues Ausgabeverzeichnis

# Erstelle das Ausgabeverzeichnis, falls es nicht existiert
mkdir -p "$output_dir"

for file in *.png; do
    # Ermittle die Grenzen des nicht-transparenten Bereichs
    bounds=$(convert "$file" -format "%@" info:)
    
    # Extrahiere Breite und Höhe des genutzten Bereichs
    width=$(echo $bounds | cut -d'+' -f1 | cut -dx -f1)
    height=$(echo $bounds | cut -d'+' -f1 | cut -dx -f2)
    
    # Berechne den prozentualen Anteil, den das Pokémon bereits einnimmt
    if [ $width -gt $height ]; then
        current_usage=$((width * 100 / max_size))
    else
        current_usage=$((height * 100 / max_size))
    fi
    
    # Prüfe ob das Pokémon bereits groß genug ist
    if [ $current_usage -ge $min_scale_threshold ]; then
        echo "Skipping $file - Already optimal size (${width}x${height})"
        cp "$file" "$output_dir/$file"
        continue
    fi
    
    # Berechne den Skalierungsfaktor für zu kleine Pokémon
    if [ $width -gt $height ]; then
        scale=$((target_size * 100 / width))
    else
        scale=$((target_size * 100 / height))
    fi
    
    # Skaliere das Bild und zentriere es in einem 96x96 Canvas
    convert "$file" \
        -filter point \
        -resize "$scale%" \
        -background none \
        -gravity center \
        -extent ${max_size}x${max_size} \
        "$output_dir/$file"
    
    echo "Processed $file - Original size: ${width}x${height}, Scaled by: $scale%"
done
