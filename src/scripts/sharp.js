const fs = require('fs');
const sharp = require('sharp');

const directory = 'src/assets/img';

console.time('Images converted in');

fs.readdir(directory, (err, files) => {
    if (err) {
        console.error('Error reading directory:', err);
        return;
    }

    const pngFiles = files.filter(file => file.endsWith('.png'));

    pngFiles.forEach(async (file) => {
        try {
            const inputPath = `${directory}/${file}`;
            const outputPath = `${directory}/${file.replace('.png', '.webp')}`;

            if (fs.existsSync(outputPath)) {
                console.log(`${file} already exists in WebP format. Skipping...`);

                fs.unlinkSync(inputPath);
                console.log(`${file} deleted.`);
                return;
            }

            await sharp(inputPath)
                .webp()
                .toFile(outputPath);

            console.log(`${file} converted to WebP successfully.`);

            fs.unlinkSync(inputPath);
            console.log(`${file} deleted.`);
        } catch (error) {
            console.error(`Error converting ${file} to WebP:`, error);
        }
    });

    console.timeEnd('Images converted in');
});
