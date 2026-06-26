import fs from 'fs';
import path from 'path';

const brainDir = 'C:\\Users\\AJIT ASHWATH R\\.gemini\\antigravity-ide\\brain\\c6bb8e3e-3368-4a7a-af5c-c170055b726f';
const destDir = path.resolve('assignment/screenshots');

fs.mkdirSync(destDir, { recursive: true });

if (fs.existsSync(brainDir)) {
  const files = fs.readdirSync(brainDir);
  console.log('Files in brain directory:', files);

  // Find screenshots
  const landingPageFile = files.find(f => f.startsWith('landing_page') && f.endsWith('.png'));
  const authPageFile = files.find(f => f.startsWith('auth_page') && f.endsWith('.png'));
  const progressPageFile = files.find(f => f.startsWith('analysis_progress_1') && f.endsWith('.png'));

  if (landingPageFile) {
    fs.copyFileSync(path.join(brainDir, landingPageFile), path.join(destDir, '01_landing_page.png'));
    console.log(`Copied landing page to 01_landing_page.png`);
  }
  if (authPageFile) {
    fs.copyFileSync(path.join(brainDir, authPageFile), path.join(destDir, '02_auth_page.png'));
    console.log(`Copied auth page to 02_auth_page.png`);
  }
  if (progressPageFile) {
    fs.copyFileSync(path.join(brainDir, progressPageFile), path.join(destDir, '03_analysis_progress.png'));
    console.log(`Copied analysis progress to 03_analysis_progress.png`);
  }
} else {
  console.error(`Brain directory does not exist: ${brainDir}`);
}
