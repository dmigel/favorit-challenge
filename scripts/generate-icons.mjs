/**
 * Запуск: npm i --no-save sharp && node scripts/generate-icons.mjs. sharp в package.json НЕ
 * добавляется.
 */
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

/**
 * Рендерит SVG в PNG и печатает размер файла в КБ.
 * @param {string} inputRel — путь к SVG относительно корня проекта
 * @param {string} outputRel — путь к PNG относительно корня проекта
 * @param {{ width: number, height: number }} size — целевой размер
 */
async function render(inputRel, outputRel, size) {
  const input = path.join(root, inputRel);
  const output = path.join(root, outputRel);
  await sharp(input, { density: 384 })
    .resize(size.width, size.height)
    .png()
    .toFile(output);
  const kb = (fs.statSync(output).size / 1024).toFixed(1);
  console.log(`${outputRel}: ${kb} KB`);
}

await render('design/og-image.svg', 'public/og-image.png', { width: 1200, height: 630 });
await render('design/apple-touch-icon.svg', 'public/apple-touch-icon.png', {
  width: 180,
  height: 180,
});
await render('public/favicon.svg', 'public/favicon-32.png', { width: 32, height: 32 });
