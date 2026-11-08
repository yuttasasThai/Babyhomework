export const APP_REVISION = {
  version: '1.3.2',
  revision: 'rev-20261108-02-complete-8-utils-files-fix',
  releaseDate: '2026-11-08',
  sourceName: 'little-hero-chore-quest-v1.3.2-complete-8-utils-files',
  buildTag: 'complete-8-utils-files-verified',
};

export function exportSourceBackupData(allData: Record<string, unknown>) {
  const exportPayload = {
    metadata: {
      appName: 'Little Hero Chore Quest - ฮีโร่ตัวจิ๋วพิชิตงานบ้าน',
      version: APP_REVISION.version,
      revision: APP_REVISION.revision,
      exportedAt: new Date().toISOString(),
    },
    data: allData,
  };

  const jsonString = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${APP_REVISION.sourceName}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
