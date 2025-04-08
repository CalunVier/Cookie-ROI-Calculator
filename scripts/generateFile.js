import { MOD_ID } from '../src/config.js';

import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateLangFile() {
    const localesDir = path.join(__dirname, '../src/locales');
    const outputFile = path.join(__dirname, '../dist/lang.js');

    const localeFiles = fs.readdirSync(localesDir)
        .filter(file => file.endsWith('.js'));

    let output = '';

    for (const file of localeFiles) {
        const locale = path.basename(file, '.js').toUpperCase();
        const localePath = path.join(localesDir, file);

        const module = await import(pathToFileURL(localePath).href);
        const translations = module.default;

        const formattedTranslations = Object.entries(translations)
            .map(([key, value]) => `    '[${MOD_ID}]${key}': '${value}'`)
            .join(',\n');

        output += `ModLanguage('${locale}', {\n${formattedTranslations}\n});\n\n`;
    }

    fs.writeFileSync(outputFile, output);
    console.log('Generated lang.js successfully!');
}

async function copyFile1(str) {
    const infoPath = path.join(__dirname, str);
    const dest = path.join(__dirname, '../dist/', str);
    
    try {
        await fs.promises.copyFile(infoPath, dest);
        console.log(`${str} was copied to dist/${str}`);
    } catch (err) {
        console.error(`Error copying ${str}:`, err);
    }
}

async function main() {
    try {
        await generateLangFile();
        await copyFile1("info.txt");
        await copyFile1("thumbnail.png");
    } catch (err) {
        console.error('Error during execution:', err);
        process.exit(1);
    }
}

main();