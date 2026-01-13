import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = join(__dirname, '../dist');

// Move HTML files from dist/src/pages/*/ to dist/
const htmlFiles = [
  { from: 'src/pages/index/index.html', to: 'index.html' },
  { from: 'src/pages/admin/admin.html', to: 'admin.html' },
  { from: 'src/pages/map/map.html', to: 'map.html' },
  { from: 'src/pages/ranks/ranks.html', to: 'ranks.html' },
];

console.log('Moving HTML files to dist root...');

htmlFiles.forEach(({ from, to }) => {
  const fromPath = join(distDir, from);
  const toPath = join(distDir, to);

  try {
    const content = readFileSync(fromPath, 'utf-8');
    writeFileSync(toPath, content);
    console.log(`✓ Moved ${from} -> ${to}`);
  } catch (error) {
    console.error(`✗ Failed to move ${from}:`, error.message);
  }
});

// Clean up the src directory in dist
try {
  rmSync(join(distDir, 'src'), { recursive: true, force: true });
  console.log('✓ Cleaned up dist/src directory');
} catch (error) {
  console.error('✗ Failed to clean up dist/src:', error.message);
}

console.log('Post-build complete!');
