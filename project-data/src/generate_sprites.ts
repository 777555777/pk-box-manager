import { parseArgs } from 'jsr:@std/cli/parse-args'

interface Config {
	inputDir: string
	outputSpritesheetDir: string
	tsName: string
	tileSize: number
	columnAmount: number
	maxImagesPerSheet: number
}

// Extraction of cli-parameters to global values
// prettier-ignore
const { inputDir, outputSpritesheetDir, tsName, tileSize, columnAmount, maxImagesPerSheet } = parseArguments()

main()

async function main() {
	try {
		const files = await readFiles(inputDir)
		const spriteSheetFileNames = await createSpriteSheets(files)
		await generateMappingData(spriteSheetFileNames, files)
	} catch (error) {
		console.error('Fehler:', error)
	}
}

// 1. Read PNG files
async function readFiles(inputDir: string) {
	const files: string[] = []

	for await (const entry of Deno.readDir(inputDir)) {
		if (entry.isFile && entry.name.endsWith('.png')) {
			files.push(entry.name)
		}
	}

	if (files.length === 0) {
		throw new Error('❌ No PNG files found!')
	}

	return files.sort() // Files need to be sorted
}

// 2. Create sprite sheets with ImageMagick
async function createSpriteSheets(files: string[]): Promise<string[]> {
	console.log('Creating sprite sheets...')

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

		console.log(`Generating ${outputFile} with ${batch.length} Images...`)

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
		if (!success) throw new Error(`❌ Errors during the creation of ${outputFile}`)

		console.log(`Saved: ${outputFile}`)
		sheetIndex++
	}

	return spriteSheetFileNames
}

// 3. Calculate coordinates based on PNG files
async function generateMappingData(spriteSheetFileNames: string[], files: string[]) {
	console.log('Creating TypeScript file...')

	const tsFileData: Record<string, { sheet: string; position: { x: number; y: number } }> = {}

	files.forEach((file, index) => {
		const sheetIndex = Math.floor(index / maxImagesPerSheet) // Determines which sheet the image is in
		const positionX = (index % columnAmount) * tileSize * -1
		const positionY = Math.floor((index % maxImagesPerSheet) / columnAmount) * tileSize * -1

		tsFileData[file.replace('.png', '')] = {
			sheet: spriteSheetFileNames[sheetIndex], // Saves the corresponding sprite sheet
			position: { x: positionX, y: positionY }
		}
	})

	// Write TypeScript file
	const tsContent = `// Automatically generated file!
export const ${firstToUpper(tsName)} = ${JSON.stringify(tsFileData, null, 2)} as const;

export type ${firstToUpper(tsName)}Type = keyof typeof ${firstToUpper(tsName)};
`

	await Deno.writeTextFile(`${tsName}-models.ts`, tsContent)
	console.log(`Saved: ${tsName}-models.ts`)
}

// CLI-Setup:
function parseArguments(): Config {
	const flags = parseArgs(Deno.args, {
		string: ['input-dir', 'output-dir', 'ts-name', 'tile-size', 'column-amount', 'max-images'],
		boolean: ['help'],
		default: {
			'input-dir': '.',
			'output-dir': '.',
			'ts-name': 'dynamic',
			'tile-size': '30',
			'column-amount': '8',
			'max-images': '64'
		}
	})

	if (flags.help) {
		showHelp()
	}

	return {
		inputDir: flags['input-dir'],
		outputSpritesheetDir: flags['output-dir'],
		tsName: flags['ts-name'],
		tileSize: validateNumber(flags['tile-size'], 'tile-size'),
		columnAmount: validateNumber(flags['column-amount'], 'column-amount'),
		maxImagesPerSheet: validateNumber(flags['max-images'], 'max-images')
	}
}

function validateNumber(value: string, name: string): number {
	const num = Number(value)
	if (isNaN(num)) {
		console.error(`Fehler: ${name} muss eine gültige Zahl sein`)
		Deno.exit(1)
	}
	return num
}

function showHelp() {
	console.log(`
Liest einen Ordner mit Bildern (Sprites), die alle die gleiche Größe und das Format .png haben müssen.
Erzeugt daraus eine oder mehrere Spritesheet PNG-Dateien, abhängig von den eingegebenen Parametern.

Verwendung: deno generate_sprites.ts --input-dir=./images --output-dir=. --ts-name=pokemon --tile-size=96 --column-amount=15 --max-images=300"

Optionen:
	--input-dir <Pfad>    Eingabeverzeichnis (Standard: .)
	--output-dir <Pfad>   Ausgabeverzeichnis für das Spritesheet (Standard: .)
	--ts-name <Name>   	  Ausgabe der TypeScript-Datei (Standard: dynamic)
	--tile-size <Zahl>    Größe der einzelnen Kacheln (Standard: 30)
	--columns <Zahl>      Anzahl der Spalten im Spritesheet (Standard: 8)
	--max-images <Zahl>   Maximale Anzahl der Bilder pro Sheet (Standard: 15)
	--help                Zeigt diese Hilfe an
	`)
	Deno.exit(0)
}

function firstToUpper(word: string) {
	return word.charAt(0).toUpperCase() + word.slice(1)
}
