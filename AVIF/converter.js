const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Folders for your images
const inputFolder = './input';
const outputFolder = './output';

// Create folders if they don't exist
if (!fs.existsSync(inputFolder)) fs.mkdirSync(inputFolder);
if (!fs.existsSync(outputFolder)) fs.mkdirSync(outputFolder);

// Read all files in the input folder
fs.readdir(inputFolder, (err, files) => {
    if (err) return console.log('❌ Error reading input folder.');

    const imageFiles = files.filter(file => file.match(/\.(jpg|jpeg|png|webp)$/i));

    if (imageFiles.length === 0) {
        console.log('⚠️ No images found in the "input" folder. Please add some and run again.');
        return;
    }

    console.log(`🚀 Starting Pro AVIF Conversion for ${imageFiles.length} files...`);

    imageFiles.forEach(file => {
        const inputPath = path.join(inputFolder, file);
        const fileNameWithoutExt = path.parse(file).name;
        const outputPath = path.join(outputFolder, `${fileNameWithoutExt}.avif`);

        // THIS IS THE PRO TECHNIQUE: Using Sharp (libavif)
        sharp(inputPath)
            .avif({ 
                quality: 40,      // Match our 40% from before
                effort: 6,        // THE SECRET SAUCE: (0-9) Higher = smaller file, but takes longer CPU time
                chromaSubsampling: '4:2:0' // Cloudinary technique: crushes invisible color data
            })
            .toFile(outputPath)
            .then(info => {
                console.log(`✅ Success: ${file} -> Converted! (New Size: ${(info.size / 1024).toFixed(2)} KB)`);
            })
            .catch(err => {
                console.log(`❌ Error converting ${file}:`, err);
            });
    });
});