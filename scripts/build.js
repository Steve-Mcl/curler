const fs = require('fs')
const fsp = fs.promises
const path = require('path')
const outputDir = 'dist'
const outputFile = 'dist/curl-to-flow.html'
const htmlTemplate = 'pluginFiles/curl-to-flow.html'
const jsFilePath = 'temp/index.js'

build()

async function build () {
    await cleanUp(outputDir)

    // ensure output directory exists
    if (!fs.existsSync(outputDir)) {
        await fsp.mkdir(outputDir, { recursive: true })
    }

    await copyFile('pluginFiles/readme.md', 'dist/readme.md')
    await copyFile('pluginFiles/package.json', 'dist/package.json')

    const templateData = await fsp.readFile(htmlTemplate, 'utf8')
    const startMarker = '// <!-- start:js -->'
    const endMarker = '// <!-- end:js -->'
    const fileData = await injectData(templateData, startMarker, endMarker, jsFilePath)
    await fs.writeFileSync(outputFile, fileData, 'utf8')
    console.log('Done')
}

async function cleanUp (dir) {
    if (fs.existsSync(dir)) {
        await fs.promises.rm(dir, { recursive: true })
    }
}

async function injectData(templateData, startMarker, endMarker, injectFile) {
    const fileData = await fsp.readFile(injectFile, 'utf8')
    return inline(templateData, fileData, startMarker, endMarker)
}

function inline (html, code, startMarker, endMarker) {   
    let startIdx = 0
    let endIdx = 0
    if (startMarker !== null) {
        startIdx = html.indexOf(startMarker)
    }
    if (endMarker !== null) {
        endIdx = html.indexOf(endMarker)
    }
    if (startIdx === -1 || endIdx === -1) {
        throw new Error('Could not find start or end marker')
    } else if (startIdx > endIdx) {
        throw new Error('Start marker occurs after end marker')
    }
    const start = html.slice(0, startIdx)
    const end = html.slice(endIdx + (endMarker?.length || 0))
    const inlined = `${start}\n${code}\n${end}`
    return inlined
}

async function copyFile (sourceFilename, targetFilename) {
    if (!fs.existsSync(sourceFilename)) {
        console.error(`File ${sourceFilename} does not exist.`)
        return false
    }
    // if target directory does not exist, create it
    const targetDir = path.dirname(targetFilename)
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true })
    }
    fs.copyFileSync(sourceFilename, targetFilename)
    return true
}
