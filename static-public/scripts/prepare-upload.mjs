import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const sourceDir = path.resolve('out');
const uploadDir = path.resolve('out-upload');
const oldAssetDir = path.join(uploadDir, '_next');
const newAssetDir = path.join(uploadDir, 'assets');
const publicImagesDir = path.resolve('../public/images');
const uploadImagesDir = path.join(uploadDir, 'images');

const textExtensions = new Set([
  '.css',
  '.html',
  '.js',
  '.json',
  '.map',
  '.txt',
  '.xml',
]);

function walk(dir, visitor) {
  for (const entry of readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) {
      walk(fullPath, visitor);
      continue;
    }

    visitor(fullPath);
  }
}

if (!existsSync(sourceDir)) {
  throw new Error(`Missing export folder: ${sourceDir}`);
}

rmSync(uploadDir, { force: true, recursive: true });
mkdirSync(uploadDir, { recursive: true });
cpSync(sourceDir, uploadDir, { recursive: true });

if (existsSync(oldAssetDir)) {
  renameSync(oldAssetDir, newAssetDir);
}

if (existsSync(publicImagesDir)) {
  cpSync(publicImagesDir, uploadImagesDir, { recursive: true });
}

walk(uploadDir, (filePath) => {
  const extension = path.extname(filePath).toLowerCase();
  if (!textExtensions.has(extension)) {
    return;
  }

  const original = readFileSync(filePath, 'utf8');
  const updated = original
    .replaceAll('/_next/', '/assets/')
    .replaceAll('\/_next\/', '\/assets\/');

  if (updated !== original) {
    writeFileSync(filePath, updated, 'utf8');
  }
});

console.log(`Prepared upload folder at ${uploadDir}`);
