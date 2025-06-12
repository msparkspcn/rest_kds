
import { existsSync } from 'fs';
import { resolve } from 'path';

const requiredFiles = [
  resolve('app/dist/main/main.js'),
  resolve('app/dist/renderer/index.html'),
];

let allExist = true;

for (const file of requiredFiles) {
  if (!existsSync(file)) {
    console.error(`Missing required file: ${file}`);
    allExist = false;
  }
}

if (!allExist) {
  console.error('\nBuild files are missing. Please run `npm run build` before packaging.');
  process.exit(1);
} else {
  console.log('✅ All required build files exist. Proceeding with packaging.');
}
