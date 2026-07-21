import sharp from 'sharp';
import pngToIco from 'png-to-ico';
import fs from 'fs';
import path from 'path';

const src = 'public/logo.png';
const buildDir = 'build';
fs.mkdirSync(buildDir, { recursive: true });

const cleaned = await sharp(src)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { data, info } = cleaned;
for (let i = 0; i < data.length; i += 4) {
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  if (r < 18 && g < 18 && b < 18) data[i + 3] = 0;
}

await sharp(data, {
  raw: { width: info.width, height: info.height, channels: 4 },
})
  .png()
  .toFile('public/logo.png');

const sizes = [16, 24, 32, 48, 64, 128, 256];
const pngBuffers = [];
for (const size of sizes) {
  const buf = await sharp('public/logo.png')
    .resize(size, size, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();
  pngBuffers.push(buf);
}

const ico = await pngToIco(pngBuffers);
fs.writeFileSync(path.join(buildDir, 'icon.ico'), ico);
fs.copyFileSync('public/logo.png', path.join(buildDir, 'icon.png'));
fs.copyFileSync('public/logo.png', 'assets/logo.png');
console.log('OK: public/logo.png + build/icon.ico');
