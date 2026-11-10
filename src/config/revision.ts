export const APP_REVISION = {
  version: '1.4.0',
  revision: 'rev-20261109-01-user-table-and-expiry-alert',
  releaseDate: '2026-11-09',
  sourceName: 'little-hero-chore-quest-v1.4.0-user-token-table-and-admin-expiry-alert',
  buildTag: 'user-token-table-and-expiry-alert-verified',
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
