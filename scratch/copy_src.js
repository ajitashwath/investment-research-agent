import fs from 'fs';
import path from 'path';

const srcDir = path.resolve('assignment/src');
fs.mkdirSync(srcDir, { recursive: true });

const itemsToCopy = [
  'app',
  'components',
  'langgraph',
  'services',
  'utils',
  'prompts',
  'supabase',
  'package.json',
  'package-lock.json',
  'next.config.js',
  'tailwind.config.ts',
  'postcss.config.mjs',
  'tsconfig.json',
  'next-env.d.ts',
  '.gitignore'
];

console.log('Copying project files to assignment/src...');

for (const item of itemsToCopy) {
  const sourcePath = path.resolve(item);
  const destPath = path.join(srcDir, item);

  if (fs.existsSync(sourcePath)) {
    console.log(`Copying ${item}...`);
    fs.cpSync(sourcePath, destPath, { recursive: true });
  } else {
    console.warn(`Warning: ${item} does not exist in workspace, skipping.`);
  }
}

console.log('Copying completed successfully!');
