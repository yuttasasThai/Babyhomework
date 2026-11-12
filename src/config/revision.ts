export const APP_REVISION = {
  version: '1.8.0',
  revision: 'rev-20261112-01-boot-screen-and-clean-passcode-gate',
  releaseDate: '2026-11-12',
  sourceName: 'little-hero-chore-quest-v1.8.0-boot-screen-clean-passcode',
  buildTag: 'v1.8.0-boot-screen-clean-passcode-verified',
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
