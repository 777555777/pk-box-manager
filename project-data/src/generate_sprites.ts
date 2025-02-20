// Deno-Skript für die automatische Generierung eines Sprite Sheets & TypeScript-Daten
const INPUT_DIR = "normal/normal"
const OUTPUT_SPRITESHEET = "."
const OUTPUT_TS_FILE = "src/dynamic-models.ts"
const TILE_SIZE = 96 // 96
const COLUMNS = 10

// 1️⃣ Sprite Sheet mit ImageMagick erstellen
async function createSpriteSheet() {
  console.log("📸 Erstelle Sprite Sheet...")

  const process = new Deno.Command("montage", {
    args: [
      `${INPUT_DIR}/*.png`, // Alle Bilder aus dem Ordner
      "-geometry",
      `${TILE_SIZE}x${TILE_SIZE}+0+0`,
      "-tile",
      `${COLUMNS}x`,
      "-background",
      "none",
      OUTPUT_SPRITESHEET,
    ],
  })

  const { success } = await process.output()
  if (!success) throw new Error("❌ Fehler beim Erstellen des Sprite Sheets!")

  console.log(`✅ Sprite Sheet gespeichert: ${OUTPUT_SPRITESHEET}`)
}

// 2️⃣ PNG-Dateien auslesen und Koordinaten berechnen
async function generateBallData() {
  console.log("📝 Generiere TypeScript-Datei...")

  const files: string[] = []
  for await (const entry of Deno.readDir(INPUT_DIR)) {
    if (entry.isFile && entry.name.endsWith(".png")) {
      files.push(entry.name)
    }
  }

  console.log("files", files)

  files.sort() // Falls die Reihenfolge wichtig ist
  console.log("files", files)

  const balls: Record<string, { position: { x: number; y: number } }> = {}
  files.forEach((file, index) => {
    const name = file.replace(".png", "") // Entferne .png
    const positionX = (index % COLUMNS) * TILE_SIZE * -1
    const positionY = Math.floor(index / COLUMNS) * TILE_SIZE * -1
    balls[name] = { position: { x: positionX, y: positionY } }
  })

  // 📝 3️⃣ TypeScript-Datei schreiben
  const tsContent = `// Automatically generated file!
export const pkBalls = ${JSON.stringify(balls)} as const;

export type BallType = keyof typeof pkBalls;
`

  await Deno.writeTextFile(OUTPUT_TS_FILE, tsContent)
  console.log(`✅ TypeScript-Datei gespeichert: ${OUTPUT_TS_FILE}`)
}

// 🚀 Hauptfunktion ausführen
async function main() {
  await createSpriteSheet()
  await generateBallData()
}

main().catch((err) => console.error("❌ Fehler:", err))
