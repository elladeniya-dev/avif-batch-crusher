const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputFolder = './input';
const outputFolder = './output';

async function runBatch() {
    console.log('🛡️ Initializing Bulletproof AVIF Converter...\n');

    // SCENARIO 1: Folders are missing or locked by Windows/macOS permissions
    try {
        if (!fs.existsSync(inputFolder)) fs.mkdirSync(inputFolder, { recursive: true });
        if (!fs.existsSync(outputFolder)) fs.mkdirSync(outputFolder, { recursive: true });
    } catch (err) {
        console.error('🚨 CRITICAL FATAL: Cannot create input/output folders. Check administrator permissions.');
        console.error(`Reason: ${err.message}`);
        process.exit(1); // Force quit
    }

    // SCENARIO 2: Cannot read the input folder (corrupted hard drive or permissions)
    let files;
    try {
        files = fs.readdirSync(inputFolder);
    } catch (err) {
        console.error('🚨 CRITICAL FATAL: Cannot read the input folder.');
        console.error(`Reason: ${err.message}`);
        process.exit(1);
    }

    // Filter for common image types
    const imageFiles = files.filter(file => file.match(/\.(jpg|jpeg|png|webp|gif|tiff)$/i));

    if (imageFiles.length === 0) {
        console.log('⚠️ No images found in the "input" folder. Drop some in and run again!');
        return;
    }

    console.log(`🚀 Found ${imageFiles.length} images. Starting sequential processing to protect RAM...\n`);

    let successCount = 0;
    let failCount = 0;

    // SCENARIO 3: Processing massive batches sequentially so we don't crash the RAM
    for (const file of imageFiles) {
        const inputPath = path.join(inputFolder, file);
        const fileNameWithoutExt = path.parse(file).name;
        const outputPath = path.join(outputFolder, `${fileNameWithoutExt}.avif`);

        try {
            // SCENARIO 4: Check if the file is completely empty/corrupted before trying to convert
            const stats = fs.statSync(inputPath);
            if (stats.size === 0) {
                throw new Error("File is exactly 0 bytes (corrupted or empty).");
            }

            // The actual conversion
            const info = await sharp(inputPath)
                .avif({ 
                    quality: 40,
                    effort: 6,
                    chromaSubsampling: '4:2:0'
                })
                .toFile(outputPath);

            console.log(`✅ SUCCESS: [${file}] -> [${fileNameWithoutExt}.avif] (Size: ${(info.size / 1024).toFixed(2)} KB)`);
            successCount++;

        } catch (err) {
            // SCENARIO 5: Handling exact, specific errors so the user knows what went wrong
            console.log(`❌ FAILED:  [${file}]`);
            
            if (err.message.includes('Input buffer contains unsupported image format')) {
                console.log(`   ↳ Reason: File extension says it's an image, but the actual file data is unreadable or fake.`);
            } else if (err.code === 'EACCES' || err.code === 'EPERM') {
                console.log(`   ↳ Reason: Permission denied. Your OS is blocking access to this file.`);
            } else if (err.code === 'ENOSPC') {
                console.log(`   ↳ Reason: Your hard drive is completely full!`);
                console.log(`🚨 ABORTING BATCH TO PROTECT SYSTEM...`);
                failCount++;
                break; // Break the loop and stop everything if the drive is full
            } else {
                // Catch-all for weird errors
                console.log(`   ↳ Reason: ${err.message}`);
            }
            
            failCount++;
        }
    }

    // SCENARIO 6: Final clean reporting
    console.log('\n==================================================');
    console.log('📊 BATCH CONVERSION SUMMARY');
    console.log('==================================================');
    console.log(`Total Found  : ${imageFiles.length}`);
    console.log(`✅ Successes : ${successCount}`);
    console.log(`❌ Failures  : ${failCount}`);
    
    if (failCount === 0) {
        console.log('\n🏆 FLAWLESS VICTORY! All files converted perfectly.');
    } else {
        console.log('\n⚠️ Finished, but encountered some errors. See logs above.');
    }
}

// Start the app
runBatch();