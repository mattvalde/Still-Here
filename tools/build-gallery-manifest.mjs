import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = new URL('../', import.meta.url);
const photoDir = new URL('../assets/gallery/photos/', import.meta.url);
const output = new URL('../assets/gallery/photos.json', import.meta.url);
const captionsFile = new URL('../assets/gallery/captions.json', import.meta.url);
const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif']);

function titleFromFilename(filename) {
  return path
    .basename(filename, path.extname(filename))
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function dayFromPath(file) {
  const match = file.match(/(?:^|\/)day[-_\s]?([1-7])(?:\/|$)/i);
  return match ? match[1] : null;
}

async function readCaptions() {
  try {
    return JSON.parse(await readFile(captionsFile, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {};
    }

    throw error;
  }
}

async function listImages(directory, prefix = '') {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name.startsWith('.')) {
      continue;
    }

    const relativePath = path.posix.join(prefix, entry.name);
    const absolutePath = new URL(entry.name, directory);

    if (entry.isDirectory()) {
      files.push(...await listImages(new URL(`${entry.name}/`, directory), relativePath));
      continue;
    }

    if (entry.isFile() && imageExtensions.has(path.extname(entry.name).toLowerCase())) {
      files.push(relativePath);
    }
  }

  return files;
}

const captions = await readCaptions();
const files = await listImages(photoDir);
const photos = files
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
  .map((file, index) => {
    const src = `assets/gallery/photos/${file}`;
    const saved = captions[src] || captions[file] || {};
    const day = saved.day || dayFromPath(file) || String(Math.min(7, Math.floor((index / Math.max(files.length, 1)) * 7) + 1));
    const title = saved.title || titleFromFilename(file);
    const caption = saved.caption || '';

    return {
      src,
      day: String(day),
      title,
      caption,
    };
  });

const captionTemplate = Object.fromEntries(photos.map((photo) => [
  photo.src,
  {
    day: photo.day,
    caption: captions[photo.src]?.caption || '',
  },
]));

await writeFile(output, `${JSON.stringify(photos, null, 2)}\n`);
await mkdir(new URL('../assets/gallery/', import.meta.url), { recursive: true });
await writeFile(captionsFile, `${JSON.stringify(captionTemplate, null, 2)}\n`);

console.log(`Added ${photos.length} photos to ${path.relative(new URL('.', root).pathname, output.pathname)}`);
console.log(`Updated caption helper at ${path.relative(new URL('.', root).pathname, captionsFile.pathname)}`);
