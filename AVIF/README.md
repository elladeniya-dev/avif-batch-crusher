# Pro AVIF Batch Converter 🚀

An enterprise-grade, local batch image converter powered by `sharp` and `libavif`. 

I built this tool to bypass the limitations of browser-based canvas encoding. By tapping directly into the CPU via WebAssembly/C++ bindings, this script aggressively compresses images (like bulky WhatsApp downloads) by up to 70% with zero visible quality loss, mimicking the exact techniques used by enterprise platforms like Cloudinary.

## Features
* **Massive File Size Reduction:** Uses Chroma Subsampling (4:2:0) and high CPU effort.
* **Batch Processing:** Converts entire folders of JPGs, PNGs, and WebPs in seconds.
* **100% Local:** No uploading your private photos to random websites.

## How to Use
1. Clone this repository.
2. Run `npm install` to grab the dependencies.
3. Drop your images into the `input` folder.
4. Run `node pro_converter.js`.
5. Check the `output` folder for your ultra-compressed AVIFs!