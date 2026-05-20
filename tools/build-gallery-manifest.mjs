import { readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = new URL('../', import.meta.url);
const photoDir = new URL('../assets/gallery/photos/', import.meta.url);
const output = new URL('../assets/gallery/photos.json', import.meta.url);
const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif']);

function titleFromFilename(filename) {
  return path
    .basename(filename, path.extname(filename))
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const files = await readdir(photoDir);
const photos = files
  .filter((file) => imageExtensions.has(path.extname(file).toLowerCase()))
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
  .map((file) => ({
    src: `assets/gallery/photos/${file}`,
    title: titleFromFilename(file),
  }));

await writeFile(output, `${JSON.stringify(photos, null, 2)}\n`);

console.log(`Added ${photos.length} photos to ${path.relative(new URL('.', root).pathname, output.pathname)}`);
