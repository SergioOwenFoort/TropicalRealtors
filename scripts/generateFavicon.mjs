import fs from 'fs';
import path from 'path';

// Try to use sharp first (more robust), fallback to Jimp if needed
let sharp;
try {
  const sharpModule = await import('sharp');
  sharp = sharpModule.default || sharpModule;
} catch (e) {
  sharp = null;
}

// Support various Jimp export styles across versions
const jimpModule = await import('jimp');
const Jimp = jimpModule.default || jimpModule.Jimp || jimpModule;

// png-to-ico is CJS; grab default export in ESM context
const pngToIcoModule = await import('png-to-ico');
const pngToIco = pngToIcoModule.default || pngToIcoModule;

const publicDir = path.resolve('public');
const primarySrc = path.join(publicDir, 'tropical-favicon.png');
const fallbackPng = path.join(publicDir, 'logo.png');
const fallbackJpg = path.join(publicDir, 'logo.jpg');
const outIco = path.join(publicDir, 'favicon.ico');

async function toPngBufferWithSharp(filePath, size) {
  return await sharp(filePath)
    .resize(size, size, { fit: 'cover' })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

async function toPngBufferWithJimp(filePath, size) {
  const image = await Jimp.read(filePath);
  if (image.resize) {
    image.resize(size, size);
  } else if (image.scaleToFit) {
    image.scaleToFit(size, size);
  }
  const mime = Jimp.MIME_PNG || 'image/png';
  return await image.getBufferAsync(mime);
}

async function toPngBuffer(filePath, size) {
  if (sharp) {
    return toPngBufferWithSharp(filePath, size);
  }
  return toPngBufferWithJimp(filePath, size);
}

async function makeIcoFrom(sourcePngPath) {
  const sizes = [16, 32, 48];
  const pngBuffers = [];
  for (const s of sizes) {
    const buf = await toPngBuffer(sourcePngPath, s);
    pngBuffers.push(buf);
  }
  const icoBuffer = await pngToIco(pngBuffers);
  fs.writeFileSync(outIco, icoBuffer);
  console.log(`Generated ${outIco} from ${path.basename(sourcePngPath)} with sizes ${sizes.join(',')}`);
}

async function writeNormalizedPng(targetPath, sourcePath, size = 512) {
  try {
    if (sharp) {
      const buf = await sharp(sourcePath).resize(size, size, { fit: 'cover' }).png({ compressionLevel: 9 }).toBuffer();
      fs.writeFileSync(targetPath, buf);
    } else {
      const image = await Jimp.read(sourcePath);
      image.resize(size, size);
      const mime = Jimp.MIME_PNG || 'image/png';
      const buf = await image.getBufferAsync(mime);
      fs.writeFileSync(targetPath, buf);
    }
    console.log(`Wrote normalized PNG ${path.basename(targetPath)} from ${path.basename(sourcePath)} (${size}x${size})`);
  } catch (e) {
    console.warn('Failed to write normalized PNG:', e?.message || e);
  }
}

async function run() {
  try {
    let usedSource = null;
    if (fs.existsSync(primarySrc)) {
      try {
        await makeIcoFrom(primarySrc);
        usedSource = primarySrc;
        return;
      } catch (e) {
        console.warn('Primary PNG failed to convert, will try fallback (logo.png):', e?.message || e);
      }
    } else {
      console.warn('Primary PNG not found:', primarySrc);
    }

    if (fs.existsSync(fallbackPng)) {
      try {
        await makeIcoFrom(fallbackPng);
        usedSource = fallbackPng;
        // Also repair/normalize tropical-favicon.png so other links use a valid image
        await writeNormalizedPng(primarySrc, fallbackPng, 512);
        return;
      } catch (e2) {
        console.warn('Fallback logo.png failed, will try logo.jpg:', e2?.message || e2);
      }
    }

    if (fs.existsSync(fallbackJpg)) {
      await makeIcoFrom(fallbackJpg);
      // Also repair/normalize tropical-favicon.png so other links use a valid image
      await writeNormalizedPng(primarySrc, fallbackJpg, 512);
      return;
    }

    throw new Error('No suitable source image found. Expected tropical-favicon.png, logo.png or logo.jpg in /public');
  } catch (err) {
    console.error('Failed to generate favicon.ico:', err);
    process.exit(1);
  }
}

run();
