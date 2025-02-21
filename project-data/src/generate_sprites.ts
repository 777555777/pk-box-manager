import { parseArgs } from 'jsr:@std/cli/parse-args'

const { inputDir, outputSpritesheetDir, outputTsFile, tileSize, columnAmount, maxImagesPerSheet } =
	parseArguments()

// 📸 1️⃣ Sprite Sheets mit ImageMagick erstellen
async function createSpriteSheets(files: string[]): Promise<string[]> {
	console.log('📸 Erstelle Sprite Sheets...')

	const spriteSheetFileNames: string[] = []
	let sheetIndex = 1

	for (let i = 0; i < files.length; i += maxImagesPerSheet) {
		// if maxImagesPerSheet = 10
		// 0 => 10
		// 10 => 20
		// 20 => 30
		const batch = files.slice(i, i + maxImagesPerSheet)
		const outputFile = `${outputSpritesheetDir}/spritesheet_${sheetIndex}.png`
		spriteSheetFileNames.push(outputFile)

		console.log(`🖼️ Generiere ${outputFile} mit ${batch.length} Bildern...`)

		const process = new Deno.Command('montage', {
			args: [
				// Creates array of path names combined with sprite names: ['sprite1.png', 'sprite2.png', ...]
				...batch.map((file) => `${inputDir}/${file}`),
				'-geometry',
				`${tileSize}x${tileSize}+0+0`,
				'-tile',
				`${columnAmount}x`,
				'-background',
				'none',
				outputFile
			]
		})

		const { success } = await process.output()
		if (!success) throw new Error(`❌ Fehler beim Erstellen von ${outputFile}`)

		console.log(`✅ Gespeichert: ${outputFile}`)
		sheetIndex++
	}

	return spriteSheetFileNames
}

// 📝 2️⃣ PNG-Dateien auslesen und Koordinaten berechnen
async function generateMappingData(spriteSheetFileNames: string[], files: string[]) {
	console.log('📝 Generiere TypeScript-Datei...')

	const balls: Record<string, { sheet: string; position: { x: number; y: number } }> = {}

	files.forEach((file, index) => {
		const sheetIndex = Math.floor(index / maxImagesPerSheet) // Bestimmt, in welchem Sheet das Bild liegt
		const positionX = (index % columnAmount) * tileSize * -1
		const positionY = Math.floor((index % maxImagesPerSheet) / columnAmount) * tileSize * -1

		balls[file.replace('.png', '')] = {
			sheet: spriteSheetFileNames[sheetIndex], // Speichert das zugehörige Sprite Sheet
			position: { x: positionX, y: positionY }
		}
	})

	// 📝 3️⃣ TypeScript-Datei schreiben
	const tsContent = `// Automatically generated file!
export const pkBalls = ${JSON.stringify(balls, null, 2)} as const;

export type BallType = keyof typeof pkBalls;
`

	await Deno.writeTextFile(outputTsFile, tsContent)
	console.log(`✅ TypeScript-Datei gespeichert: ${outputTsFile}`)
}

// 🚀 4️⃣ Hauptfunktion ausführen
async function main() {
	const files: string[] = []

	for await (const entry of Deno.readDir(inputDir)) {
		if (entry.isFile && entry.name.endsWith('.png')) {
			files.push(entry.name)
		}
	}

	if (files.length === 0) {
		throw new Error('❌ Keine PNG-Dateien gefunden!')
	}

	files.sort() // Sortierung sicherstellen

	const spriteSheetFiles = await createSpriteSheets(files)
	await generateMappingData(spriteSheetFiles, files)
}

main().catch((err) => console.error('❌ Fehler:', err))

// Commandline Arguments setup:
// ===============================

interface Config {
	inputDir: string
	outputSpritesheetDir: string
	outputTsFile: string
	tileSize: number
	columnAmount: number
	maxImagesPerSheet: number
}

// Validierungsfunktion für numerische Werte
function validateNumber(value: string, name: string): number {
	const num = Number(value)
	if (isNaN(num)) {
		console.error(`Fehler: ${name} muss eine gültige Zahl sein`)
		Deno.exit(1)
	}
	return num
}

function parseArguments(): Config {
	// Command-line Argumente mit der Flags-API parsen
	const flags = parseArgs(Deno.args, {
		string: ['input-dir', 'output-dir', 'output-ts', 'tile-size', 'column-amount', 'max-images'],
		default: {
			'input-dir': '.',
			'output-dir': '.',
			'output-ts': 'dynamic-models.ts',
			'tile-size': '30',
			'column-amount': '8',
			'max-images': '64'
		}
	})

	return {
		inputDir: flags['input-dir'],
		outputSpritesheetDir: flags['output-dir'],
		outputTsFile: flags['output-ts'],
		tileSize: validateNumber(flags['tile-size'], 'tile-size'),
		columnAmount: validateNumber(flags['column-amount'], 'column-amount'),
		maxImagesPerSheet: validateNumber(flags['max-images'], 'max-images')
	}
}
