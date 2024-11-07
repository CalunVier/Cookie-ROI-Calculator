const fs = require('fs');
const path = require('path');

async function generateLangFile() {
    const modId = 'cookie_roi_calculator';
    const localesDir = path.join(__dirname, '../src/locales');
    const outputFile = path.join(__dirname, '../dist/lang.js');

    // 获取所有语言文件
    const localeFiles = fs.readdirSync(localesDir)
        .filter(file => file.endsWith('.js'));

    let output = '';

    for (const file of localeFiles) {
        const locale = path.basename(file, '.js').toUpperCase();
        const localePath = path.join(localesDir, file);

        // 动态导入语言文件
        const translations = require(localePath).default;

        // 生成ModLanguage调用
        const formattedTranslations = Object.entries(translations)
            .map(([key, value]) => `    '[${modId}]${key}': '${value}'`)
            .join(',\n');

        output += `ModLanguage('${locale}', {\n${formattedTranslations}\n});\n\n`;
    }

    // 写入文件
    fs.writeFileSync(outputFile, output);
    console.log('Generated lang.js successfully!');
}

generateLangFile();

function copyFile1(str) {
    const infoPath = path.join(__dirname, str);
    fs.copyFile(infoPath, path.join(__dirname, '../dist/' + str), (err) => {
        if (err) throw err;
        console.log(`${str} was copied to dist/${str}`);
    })
}

copyFile1("info.txt")
copyFile1("thumbnail.png")
