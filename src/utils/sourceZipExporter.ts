import JSZip from 'jszip';
import { APP_REVISION } from '../config/revision';
import sourceZipExporterRaw from './sourceZipExporter.ts?raw';

// Embedded root configuration files (inlined so build never fails if root dotfiles like .gitignore or .env are omitted on GitHub)
const packageJsonRaw = `{
  "name": "react-example",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite --port=3000 --host=0.0.0.0",
    "build": "vite build",
    "preview": "vite preview",
    "clean": "rm -rf dist server.js",
    "lint": "tsc --noEmit"
  },
  "dependencies": {
    "@google/genai": "^2.4.0",
    "@tailwindcss/vite": "^4.3.3",
    "@types/canvas-confetti": "^1.9.0",
    "@vitejs/plugin-react": "^6.1.1",
    "canvas-confetti": "^1.9.4",
    "dotenv": "^17.2.3",
    "express": "^4.21.2",
    "jszip": "^3.10.2",
    "lucide-react": "^0.546.0",
    "motion": "^12.23.24",
    "react": "^19.0.1",
    "react-dom": "^19.0.1",
    "vite": "^8.3.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/jszip": "^3.4.0",
    "@types/node": "^22.14.0",
    "@types/react": "^19.3.0",
    "@types/react-dom": "^19.3.0",
    "autoprefixer": "^10.4.21",
    "tailwindcss": "^4.3.3",
    "tsx": "^4.21.0",
    "typescript": "^7.0.2"
  }
}`;

const viteConfigRaw = `import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import {fileURLToPath} from 'url';
import path from 'path';
import {defineConfig} from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
`;

const tsconfigRaw = `{
  "compilerOptions": {
    "target": "ES2022",
    "experimentalDecorators": true,
    "useDefineForClassFields": false,
    "module": "ESNext",
    "types": ["vite/client"],
    "lib": [
      "ES2022",
      "DOM",
      "DOM.Iterable"
    ],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "isolatedModules": true,
    "moduleDetection": "force",
    "allowJs": true,
    "jsx": "react-jsx",
    "paths": {
      "@/*": [
        "./*"
      ]
    },
    "allowImportingTsExtensions": true,
    "noEmit": true
  },
  "exclude": ["dist"]
}`;

const vercelJsonRaw = `{
  "framework": "vite",
  "installCommand": "npm install --legacy-peer-deps",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}`;

const indexHtmlRaw = `<!doctype html>
<html lang="th">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Little Hero Chore Quest - ฮีโร่ตัวจิ๋วพิชิตงานบ้าน</title>
    <meta name="description" content="เว็บแอปพลิเคชันสำหรับเด็กทำงานบ้าน มีเลือกภารกิจ กำหนดเวลา ถ่ายรูปประทับเวลาอัตโนมัติ และสะสมดาว" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Kanit:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet">
  </head>
  <body class="bg-amber-50/40 text-slate-800 antialiased min-h-screen selection:bg-amber-200">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;

const metadataJsonRaw = `{
  "name": "Little Hero Chore Quest",
  "description": "Chore quest adventure app for kids with photo proof watermarking and star ranking"
}`;

const envExampleRaw = `# VITE_API_BASE=
# GEMINI_API_KEY=`;

const gitignoreRaw = `node_modules
dist
.env
.env.local
.DS_Store`;

const npmrcRaw = `legacy-peer-deps=true`;

const readmeRaw = `# Little Hero Chore Quest
เว็บแอปพลิเคชันฮีโร่ตัวจิ๋วพิชิตงานบ้าน`;

// Glob all source files in src directory (using root-relative /src/**/* so src/utils is never missed)
const srcTextFiles = import.meta.glob<string>(
  '/src/**/*.{ts,tsx,css,json}',
  { query: '?raw', import: 'default', eager: true }
);

// Glob all image assets in src/assets/images
const srcImageFiles = import.meta.glob<string>(
  '/src/assets/**/*.{jpg,jpeg,png,webp,svg}',
  { query: '?url', import: 'default', eager: true }
);

export interface SourceFileInfo {
  path: string;
  category: 'config' | 'source' | 'asset' | 'docs';
  content?: string;
  sizeBytes?: number;
}

/**
 * Get a flat list of all project files for in-app viewing and copying
 */
export function getSourceFileList(): SourceFileInfo[] {
  const files: SourceFileInfo[] = [
    { path: 'package.json', category: 'config', content: packageJsonRaw, sizeBytes: packageJsonRaw.length },
    { path: 'vercel.json', category: 'config', content: vercelJsonRaw, sizeBytes: vercelJsonRaw.length },
    { path: 'vite.config.ts', category: 'config', content: viteConfigRaw, sizeBytes: viteConfigRaw.length },
    { path: 'tsconfig.json', category: 'config', content: tsconfigRaw, sizeBytes: tsconfigRaw.length },
    { path: 'index.html', category: 'config', content: indexHtmlRaw, sizeBytes: indexHtmlRaw.length },
    { path: 'metadata.json', category: 'config', content: metadataJsonRaw, sizeBytes: metadataJsonRaw.length },
    { path: '.env.example', category: 'config', content: envExampleRaw, sizeBytes: envExampleRaw.length },
    { path: '.gitignore', category: 'config', content: gitignoreRaw, sizeBytes: gitignoreRaw.length },
    { path: '.npmrc', category: 'config', content: npmrcRaw, sizeBytes: npmrcRaw.length },
    { path: 'README.md', category: 'docs', content: readmeRaw, sizeBytes: readmeRaw.length },
  ];

  for (const [key, content] of Object.entries(srcTextFiles)) {
    // Normalise path from '/src/...' to 'src/...'
    const cleanPath = key.replace(/^\//, '');
    files.push({
      path: cleanPath,
      category: 'source',
      content,
      sizeBytes: content.length,
    });
  }

  // Ensure file #8 sourceZipExporter.ts is always included
  if (!files.some((f) => f.path === 'src/utils/sourceZipExporter.ts')) {
    files.push({
      path: 'src/utils/sourceZipExporter.ts',
      category: 'source',
      content: sourceZipExporterRaw,
      sizeBytes: sourceZipExporterRaw.length,
    });
  }

  for (const key of Object.keys(srcImageFiles)) {
    const cleanPath = key.replace(/^\//, '');
    files.push({
      path: cleanPath,
      category: 'asset',
    });
  }

  return files.sort((a, b) => a.path.localeCompare(b.path));
}

/**
 * Packages all project files into a complete, standalone .ZIP archive
 */
export async function generateFullSourceZip(onProgress?: (percent: number, currentFile: string) => void): Promise<Blob> {
  const zip = new JSZip();

  // Explicitly create all directory entries so Android/iOS/Windows extractors always create folders
  zip.folder('src');
  zip.folder('src/utils');
  zip.folder('src/components');
  zip.folder('src/config');
  zip.folder('src/types');
  zip.folder('src/assets');
  zip.folder('src/assets/images');

  // 1. Add Root Configuration & Docs
  zip.file('package.json', packageJsonRaw);
  zip.file('vercel.json', vercelJsonRaw);
  zip.file('vite.config.ts', viteConfigRaw);
  zip.file('tsconfig.json', tsconfigRaw);
  zip.file('index.html', indexHtmlRaw);
  zip.file('metadata.json', metadataJsonRaw);
  zip.file('.env.example', envExampleRaw);
  zip.file('.gitignore', gitignoreRaw);
  zip.file('.npmrc', npmrcRaw);
  zip.file('README.md', readmeRaw);

  const totalSrcFiles = Object.keys(srcTextFiles).length + Object.keys(srcImageFiles).length + 10;
  let processed = 10;

  // 2. Add all src text files (.ts, .tsx, .css, .json)
  for (const [key, content] of Object.entries(srcTextFiles)) {
    const cleanPath = key.replace(/^\//, '');
    zip.file(cleanPath, content);
    processed++;
    if (onProgress) {
      onProgress(Math.round((processed / totalSrcFiles) * 80), cleanPath);
    }
  }

  // Ensure file #8 sourceZipExporter.ts is added to zip
  zip.file('src/utils/sourceZipExporter.ts', sourceZipExporterRaw);

  // 3. Fetch and add binary images
  for (const [key, url] of Object.entries(srcImageFiles)) {
    const cleanPath = key.replace(/^\//, '');
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      zip.file(cleanPath, arrayBuffer, { binary: true });
    } catch {
      // Fallback: continue if an image fails to fetch
    }
    processed++;
    if (onProgress) {
      onProgress(Math.round((processed / totalSrcFiles) * 80), cleanPath);
    }
  }

  if (onProgress) {
    onProgress(90, 'กำลังบีบอัดไฟล์ ZIP...');
  }

  // 4. Generate ZIP blob
  const zipBlob = await zip.generateAsync(
    {
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 9 },
    },
    (metadata) => {
      if (onProgress) {
        onProgress(Math.round(80 + (metadata.percent * 0.2)), 'กำลังสร้างไฟล์ ZIP...');
      }
    }
  );

  return zipBlob;
}

/**
 * Triggers a direct download of the full source code ZIP in the user's browser
 */
export async function downloadFullSourceZip(onProgress?: (percent: number, currentFile: string) => void): Promise<string> {
  const blob = await generateFullSourceZip(onProgress);
  const zipFileName = `${APP_REVISION.sourceName}-full-source.zip`;

  const downloadUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = downloadUrl;
  anchor.download = zipFileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(downloadUrl);

  return zipFileName;
}

/**
 * Triggers a direct download of only the src/utils folder as a ZIP
 */
export async function downloadUtilsOnlyZip(): Promise<string> {
  const zip = new JSZip();
  // Create explicit folder "utils" and "src/utils"
  const utilsFolder = zip.folder('utils');
  const srcUtilsFolder = zip.folder('src/utils');

  for (const [key, content] of Object.entries(srcTextFiles)) {
    const cleanPath = key.replace(/^\//, '');
    if (cleanPath.startsWith('src/utils/')) {
      const filename = cleanPath.replace('src/utils/', '');
      if (utilsFolder) {
        utilsFolder.file(filename, content);
      }
      if (srcUtilsFolder) {
        srcUtilsFolder.file(filename, content);
      }
    }
  }

  // Ensure file #8 sourceZipExporter.ts is added to utils zip
  if (utilsFolder) {
    utilsFolder.file('sourceZipExporter.ts', sourceZipExporterRaw);
  }
  if (srcUtilsFolder) {
    srcUtilsFolder.file('sourceZipExporter.ts', sourceZipExporterRaw);
  }

  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });

  const zipFileName = 'little-hero-src-utils-bundle.zip';
  const downloadUrl = URL.createObjectURL(zipBlob);
  const anchor = document.createElement('a');
  anchor.href = downloadUrl;
  anchor.download = zipFileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(downloadUrl);

  return zipFileName;
}

/**
 * Directly downloads a single text file (e.g. storage.ts) into the user's browser/phone
 */
export function downloadSingleTextFile(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/typescript;charset=utf-8' });
  const downloadUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = downloadUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(downloadUrl);
}
