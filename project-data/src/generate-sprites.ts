import { parseArgs } from 'jsr:@std/cli/parse-args'

interface Config {
	inputDir: string
	outputSpritesheetDir: string
	tsDir: string
	name: string
	tileWidth: number
	tileHeight: number
	columnAmount: number
	maxImagesPerSheet: number
	generateTs: boolean
}

// Extraction of cli-parameters to global values
// prettier-ignore
const { inputDir, outputSpritesheetDir, tsDir, name, tileWidth, tileHeight, columnAmount, maxImagesPerSheet, generateTs } = parseArguments()

main()

async function main() {
	try {
		const files = await readFiles(inputDir)
		const spriteSheetFileNames = await createSpriteSheets(files)
		if (generateTs) {
			await generateMappingData(spriteSheetFileNames, files)
		}
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
		const outputFile = `${outputSpritesheetDir}/s${name.charAt(0)}${sheetIndex}.png`
		spriteSheetFileNames.push(outputFile)

		console.log(`Generating ${outputFile} with ${batch.length} Images...`)

		const process = new Deno.Command('montage', {
			args: [
				// Creates array of path names combined with sprite names: ['sprite1.png', 'sprite2.png', ...]
				...batch.map((file) => `${inputDir}/${file}`),
				'-geometry',
				`${tileWidth}x${tileHeight}+0+0`,
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

	const tsFileData: Record<string, { sheet: string; pos: { x: number; y: number } }> = {}

	files.forEach((file, index) => {
		const sheetIndex = Math.floor(index / maxImagesPerSheet)
		const column = index % columnAmount
		const row = Math.floor((index % maxImagesPerSheet) / columnAmount)

		const positionX = column * tileWidth * -1
		const positionY = row * tileHeight * -1

		// Vite needs the path without the dir, which is in the root directory.
		const spriteSheetPath = spriteSheetFileNames[sheetIndex].replace('.png', '')

		tsFileData[file.replace('.png', '')] = {
			sheet: spriteSheetPath.split('/')[3], // Saves the corresponding sprite sheet
			pos: { x: positionX, y: positionY }
		}
	})

	// Write TypeScript file
	const tsContent = `// Automatically generated file!
export const ${firstToUpper(name)} = ${convertToProperties(JSON.stringify(tsFileData, null, 2))} as const;

export type ${firstToUpper(name)}Type = keyof typeof ${firstToUpper(name)};
`

	await Deno.writeTextFile(`${tsDir}/${name}-models.ts`, tsContent)
	console.log(`Saved: ${tsDir}/${name}-models.ts`)
}

// CLI-Setup:
function parseArguments(): Config {
	const flags = parseArgs(Deno.args, {
		string: [
			'input-dir',
			'output-dir',
			'ts-dir',
			'name',
			'tile-width',
			'tile-height',
			'column-amount',
			'max-images'
		],
		boolean: ['help', 'no-ts'],
		default: {
			'input-dir': '.',
			'output-dir': '.',
			'ts-dir': '.',
			name: 'dynamic',
			'tile-width': '30',
			'tile-height': '', // leer = wird aus tile-width übernommen
			'column-amount': '8',
			'max-images': '64',
			'no-ts': false
		}
	})

	if (flags.help) {
		showHelp()
	}

	const tileWidth = validateNumber(flags['tile-width'], 'tile-width')
	const tileHeight =
		flags['tile-height'] !== '' ? validateNumber(flags['tile-height'], 'tile-height') : tileWidth

	return {
		inputDir: flags['input-dir'],
		outputSpritesheetDir: flags['output-dir'],
		tsDir: flags['ts-dir'],
		name: flags['name'],
		tileWidth,
		tileHeight,
		columnAmount: validateNumber(flags['column-amount'], 'column-amount'),
		maxImagesPerSheet: validateNumber(flags['max-images'], 'max-images'),
		generateTs: !flags['no-ts']
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
Liest einen Ordner mit .png-Bildern gleicher Größe und erzeugt ein oder mehrere Spritesheets.

Verwendung:
  deno run --allow-read --allow-write --allow-run generate-sprites.ts \\
    --input-dir=./images \\
    --output-dir=. \\
    --name=pokemon \\
    --tile-width=96 \\
    --tile-height=96 \\
    --column-amount=15 \\
    --max-images=300

Optionen:
  --input-dir <Pfad>      Eingabeverzeichnis (Standard: .)
  --output-dir <Pfad>     Ausgabeverzeichnis für das Spritesheet (Standard: .)
  --ts-dir <Pfad>         Ausgabeverzeichnis für die TypeScript Datei (Standard: .)
  --name <Name>           Basename für Dateien und TypeScript-Objekte (Standard: dynamic)
  --tile-width <Zahl>     Breite eines einzelnen Sprites (Standard: 30)
  --tile-height <Zahl>    Höhe eines einzelnen Sprites (Standard: tile-width)
  --column-amount <Zahl>  Anzahl Spalten im Spritesheet (Standard: 8)
  --max-images <Zahl>     Maximale Bilderanzahl pro Sheet (Standard: 64)
  --no-ts                 Deaktiviert die Erstellung der TypeScript-Datei
  --help                  Zeigt diese Hilfe an
`)
	Deno.exit(0)
}

function firstToUpper(word: string) {
	return word.charAt(0).toUpperCase() + word.slice(1)
}

function convertToProperties(inputString: string) {
	let result = inputString

	const replacementTerms = ['"sheet"', '"pos"', '"x"', '"y"']
	const targetTerms = ['sheet', 'pos', 'x', 'y']

	// Ersetze nur die Anführungszeichen für die spezifizierten Terme
	for (let i = 0; i < replacementTerms.length; i++) {
		const regex = new RegExp(`${replacementTerms[i]}\\s*:`, 'g')
		result = result.replace(regex, `${targetTerms[i]}:`)
	}
	// Parse das bereinigte String als JSON
	return result
}
