import JSZip from 'jszip';
import { APP_REVISION } from '../config/revision';

import packageJsonRaw from '../../package.json?raw';
import viteConfigRaw from '../../vite.config.ts?raw';
import tsconfigRaw from '../../tsconfig.json?raw';
import vercelJsonRaw from '../../vercel.json?raw';
import indexHtmlRaw from '../../index.html?raw';
import metadataJsonRaw from '../../metadata.json?raw';
import envExampleRaw from '../../.env.example?raw';
import gitignoreRaw from '../../.gitignore?raw';
import npmrcRaw from '../../.npmrc?raw';
import readmeRaw from '../../README.md?raw';

const srcTextFiles = import.meta.glob<string>(
  [
    '../*.{ts,tsx,css}',
    '../**/*.{ts,tsx,css,json}',
  ],
  { query: '?raw', import: 'default', eager: true }
);

const srcImageFiles = import.meta.glob<string>(
  '../assets/images/*.{jpg,jpeg,png,webp,svg}',
  { query: '?url', import: 'default', eager: true }
);

export interface SourceFileInfo {
  path: string;
  category: 'config' | 'source' | 'asset' | 'docs';
  content?: string;
  sizeBytes?: number;
}

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
    const cleanPath = key.replace(/^\.\.\//, 'src/');
    files.push({
      path: cleanPath,
      category: 'source',
      content,
      sizeBytes: content.length,
    });
  }

  for (const key of Object.keys(srcImageFiles)) {
    const cleanPath = key.replace(/^\.\.\//, 'src/');
    files.push({
      path: cleanPath,
      category: 'asset',
    });
  }

  return files.sort((a, b) => a.path.localeCompare(b.path));
}

export async function generateFullSourceZip(onProgress?: (percent: number, currentFile: string) => void): Promise<Blob> {
  const zip = new JSZip();

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

  for (const [key, content] of Object.entries(srcTextFiles)) {
    const cleanPath = key.replace(/^\.\.\//, 'src/');
    zip.file(cleanPath, content);
    processed++;
    if (onProgress) {
      onProgress(Math.round((processed / totalSrcFiles) * 80), cleanPath);
    }
  }

  for (const [key, url] of Object.entries(srcImageFiles)) {
    const cleanPath = key.replace(/^\.\.\//, 'src/');
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      zip.file(cleanPath, arrayBuffer, { binary: true });
    } catch {
      // Continue if asset fetch fails
    }
    processed++;
    if (onProgress) {
      onProgress(Math.round((processed / totalSrcFiles) * 80), cleanPath);
    }
  }

  if (onProgress) {
    onProgress(90, 'กำลังบีบอัดไฟล์ ZIP...');
  }

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

export async function downloadUtilsOnlyZip(): Promise<string> {
  const zip = new JSZip();
  const utilsFolder = zip.folder('src/utils');

  for (const [key, content] of Object.entries(srcTextFiles)) {
    const cleanPath = key.replace(/^\.\.\//, 'src/');
    if (cleanPath.startsWith('src/utils/')) {
      const filename = cleanPath.replace('src/utils/', '');
      if (utilsFolder) {
        utilsFolder.file(filename, content);
      }
      zip.file(filename, content);
    }
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
