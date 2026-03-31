import { readdir, writeFile, access } from 'node:fs/promises'
import { execFile as execFileCb } from 'node:child_process'
import { promisify } from 'node:util'
import { parseArgs } from 'node:util'

const execFile = promisify(execFileCb)

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
	const entries = await readdir(inputDir, { withFileTypes: true })
	const files = entries
		.filter((entry) => entry.isFile() && entry.name.endsWith('.png'))
		.map((entry) => entry.name)

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

		try {
			await execFile('montage', [
				// Creates array of path names combined with sprite names: ['sprite1.png', 'sprite2.png', ...]
				...batch.map((file) => `${inputDir}/${file}`),
				'-geometry',
				`${tileWidth}x${tileHeight}+0+0`,
				'-tile',
				`${columnAmount}x`,
				'-background',
				'none',
				outputFile
			])
		} catch (err: unknown) {
			// montage (ImageMagick) sometimes exits with code 1 even on success (e.g. warnings).
			// Only throw if the output file was actually not created.
			try {
				await access(outputFile)
			} catch {
				const details =
					err && typeof err === 'object' && 'stderr' in err
						? String((err as { stderr: unknown }).stderr)
						: String(err)
				throw new Error(`❌ Errors during the creation of ${outputFile}:\n${details}`)
			}
		}

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

	await writeFile(`${tsDir}/${name}-models.ts`, tsContent)
	console.log(`Saved: ${tsDir}/${name}-models.ts`)
}

// CLI-Setup:
function parseArguments(): Config {
	const { values: flags } = parseArgs({
		args: process.argv.slice(2),
		options: {
			'input-dir': { type: 'string', default: '.' },
			'output-dir': { type: 'string', default: '.' },
			'ts-dir': { type: 'string', default: '.' },
			name: { type: 'string', default: 'dynamic' },
			'tile-width': { type: 'string', default: '30' },
			'tile-height': { type: 'string', default: '' },
			'column-amount': { type: 'string', default: '8' },
			'max-images': { type: 'string', default: '64' },
			'no-ts': { type: 'boolean', default: false },
			help: { type: 'boolean', default: false }
		}
	})

	if (flags.help) {
		showHelp()
	}

	const tileWidth = validateNumber(flags['tile-width']!, 'tile-width')
	const tileHeight =
		flags['tile-height'] !== '' ? validateNumber(flags['tile-height']!, 'tile-height') : tileWidth

	return {
		inputDir: flags['input-dir']!,
		outputSpritesheetDir: flags['output-dir']!,
		tsDir: flags['ts-dir']!,
		name: flags['name']!,
		tileWidth,
		tileHeight,
		columnAmount: validateNumber(flags['column-amount']!, 'column-amount'),
		maxImagesPerSheet: validateNumber(flags['max-images']!, 'max-images'),
		generateTs: !flags['no-ts']
	}
}

function validateNumber(value: string, name: string): number {
	const num = Number(value)
	if (isNaN(num)) {
		console.error(`Fehler: ${name} muss eine gültige Zahl sein`)
		process.exit(1)
	}
	return num
}

function showHelp() {
	console.log(`
Liest einen Ordner mit .png-Bildern gleicher Größe und erzeugt ein oder mehrere Spritesheets.

Verwendung:
  npx tsx generate-sprites.ts \\
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
	process.exit(0)
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
