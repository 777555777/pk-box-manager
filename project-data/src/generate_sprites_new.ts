const INPUT_DIR = "normal/normal"
const OUTPUT_SPRITESHEET_DIR = "." // Speichert die Sprite Sheets hier
const OUTPUT_TS_FILE = "dynamic-models.ts"
const TILE_SIZE = 96
const COLUMNS = 18
const MAX_IMAGES_PER_SHEET = 300 // Maximale Anzahl an Bildern pro Sheet

// 📸 1️⃣ Sprite Sheets mit ImageMagick erstellen
async function createSpriteSheets(files: string[]): Promise<string[]> {
  console.log("📸 Erstelle Sprite Sheets...")

  const spriteSheetFiles: string[] = []
  let sheetIndex = 1

  for (let i = 0; i < files.length; i += MAX_IMAGES_PER_SHEET) {
    const batch = files.slice(i, i + MAX_IMAGES_PER_SHEET)
    const outputFile = `${OUTPUT_SPRITESHEET_DIR}/spritesheet_${sheetIndex}.png`
    spriteSheetFiles.push(outputFile)

    console.log(`🖼️ Generiere ${outputFile} mit ${batch.length} Bildern...`)

    const process = new Deno.Command("montage", {
      args: [
        ...batch.map((file) => `${INPUT_DIR}/${file}`),
        "-geometry",
        `${TILE_SIZE}x${TILE_SIZE}+0+0`,
        "-tile",
        `${COLUMNS}x`,
        "-background",
        "none",
        outputFile,
      ],
    })

    const { success } = await process.output()
    if (!success) throw new Error(`❌ Fehler beim Erstellen von ${outputFile}`)

    console.log(`✅ Gespeichert: ${outputFile}`)
    sheetIndex++
  }

  return spriteSheetFiles
}

// 📝 2️⃣ PNG-Dateien auslesen und Koordinaten berechnen
async function generateBallData(spriteSheetFiles: string[], files: string[]) {
  console.log("📝 Generiere TypeScript-Datei...")

  const balls: Record<
    string,
    { sheet: string; position: { x: number; y: number } }
  > = {}

  files.forEach((file, index) => {
    const sheetIndex = Math.floor(index / MAX_IMAGES_PER_SHEET) // Bestimmt, in welchem Sheet das Bild liegt
    const positionX = (index % COLUMNS) * TILE_SIZE * -1
    const positionY =
      Math.floor((index % MAX_IMAGES_PER_SHEET) / COLUMNS) * TILE_SIZE * -1

    balls[file.replace(".png", "")] = {
      sheet: spriteSheetFiles[sheetIndex], // Speichert das zugehörige Sprite Sheet
      position: { x: positionX, y: positionY },
    }
  })

  // 📝 3️⃣ TypeScript-Datei schreiben
  const tsContent = `// Automatically generated file!
export const pkBalls = ${JSON.stringify(balls, null, 2)} as const;

export type BallType = keyof typeof pkBalls;
`

  await Deno.writeTextFile(OUTPUT_TS_FILE, tsContent)
  console.log(`✅ TypeScript-Datei gespeichert: ${OUTPUT_TS_FILE}`)
}

// 🚀 4️⃣ Hauptfunktion ausführen
async function main() {
  const files: string[] = []

  for await (const entry of Deno.readDir(INPUT_DIR)) {
    if (entry.isFile && entry.name.endsWith(".png")) {
      files.push(entry.name)
    }
  }

  if (files.length === 0) {
    console.log("❌ Keine PNG-Dateien gefunden!")
    return
  }

  files.sort() // Sortierung sicherstellen

  const spriteSheetFiles = await createSpriteSheets(files)
  await generateBallData(spriteSheetFiles, files)
}

main().catch((err) => console.error("❌ Fehler:", err))
