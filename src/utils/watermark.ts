export interface WatermarkPayload {
  source: HTMLVideoElement | HTMLImageElement;
  heroName: string;
  choreTitle: string;
  choreIcon: string;
  targetWidth?: number;
  targetHeight?: number;
}

export interface WatermarkResult {
  dataUrl: string;
  isoTimestamp: string;
  thaiDateFormatted: string;
  thaiTimeFormatted: string;
}

const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

const THAI_DAYS = [
  'วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'
];

export function getThaiDateTime(date: Date = new Date()) {
  const dayName = THAI_DAYS[date.getDay()];
  const day = date.getDate();
  const month = THAI_MONTHS[date.getMonth()];
  const buddhistYear = date.getFullYear() + 543;

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return {
    dayName,
    day,
    month,
    year: buddhistYear,
    time: `${hours}:${minutes}:${seconds}`,
    thaiDateFormatted: `${dayName}ที่ ${day} ${month} พ.ศ. ${buddhistYear}`,
    thaiTimeFormatted: `${hours}:${minutes}:${seconds} น.`,
  };
}

export async function generateWatermarkedPhoto(payload: WatermarkPayload): Promise<WatermarkResult> {
  const { source, heroName, choreTitle, choreIcon } = payload;
  const now = new Date();
  const { thaiDateFormatted, thaiTimeFormatted } = getThaiDateTime(now);
  const isoTimestamp = now.toISOString();

  let rawWidth = 1024;
  let rawHeight = 768;

  if (source instanceof HTMLVideoElement) {
    rawWidth = source.videoWidth || 1024;
    rawHeight = source.videoHeight || 768;
  } else if (source instanceof HTMLImageElement) {
    rawWidth = source.naturalWidth || source.width || 1024;
    rawHeight = source.naturalHeight || source.height || 768;
  }

  if (rawWidth <= 0) rawWidth = 1024;
  if (rawHeight <= 0) rawHeight = 768;

  const MAX_DIM = 1200;
  let canvasWidth = rawWidth;
  let canvasHeight = rawHeight;

  if (canvasWidth > MAX_DIM || canvasHeight > MAX_DIM) {
    if (canvasWidth > canvasHeight) {
      canvasHeight = Math.round((canvasHeight * MAX_DIM) / canvasWidth);
      canvasWidth = MAX_DIM;
    } else {
      canvasWidth = Math.round((canvasWidth * MAX_DIM) / canvasHeight);
      canvasHeight = MAX_DIM;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('ไม่สามารถเริ่มต้น Canvas context ได้');
  }

  ctx.drawImage(source, 0, 0, canvasWidth, canvasHeight);

  const bannerHeight = Math.max(120, Math.round(canvasHeight * 0.18));
  const bannerY = canvasHeight - bannerHeight;

  const gradient = ctx.createLinearGradient(0, bannerY, 0, canvasHeight);
  gradient.addColorStop(0, 'rgba(15, 23, 42, 0.75)');
  gradient.addColorStop(0.3, 'rgba(15, 23, 42, 0.92)');
  gradient.addColorStop(1, 'rgba(10, 15, 30, 0.98)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, bannerY, canvasWidth, bannerHeight);

  ctx.strokeStyle = 'rgba(245, 158, 11, 0.85)';
  ctx.lineWidth = Math.max(3, Math.round(canvasWidth * 0.0035));
  ctx.beginPath();
  ctx.moveTo(0, bannerY);
  ctx.lineTo(canvasWidth, bannerY);
  ctx.stroke();

  const pillPaddingX = 20;
  const contentY = bannerY + Math.round(bannerHeight * 0.28);

  const baseScale = canvasWidth / 1000;
  const titleFontSize = Math.max(18, Math.round(26 * baseScale));
  const subFontSize = Math.max(14, Math.round(18 * baseScale));
  const timeFontSize = Math.max(22, Math.round(30 * baseScale));
  const badgeFontSize = Math.max(11, Math.round(13 * baseScale));

  ctx.fillStyle = '#f59e0b';
  ctx.font = `bold ${badgeFontSize}px 'Kanit', sans-serif`;
  ctx.fillText('★ ภารกิจฮีโร่ตัวจิ๋วสำเร็จ (VERIFIED PROOF)', pillPaddingX, contentY - 6);

  ctx.fillStyle = '#ffffff';
  ctx.font = `600 ${titleFontSize}px 'Kanit', sans-serif`;
  const choreLabel = `${choreIcon || '⭐'} ${choreTitle || 'งานบ้านสำเร็จ'}`;
  ctx.fillText(choreLabel, pillPaddingX, contentY + titleFontSize);

  ctx.fillStyle = '#94a3b8';
  ctx.font = `400 ${subFontSize}px 'Kanit', sans-serif`;
  ctx.fillText(`ฮีโร่ตัวจิ๋ว: ${heroName || 'ฮีโร่'}`, pillPaddingX, contentY + titleFontSize + subFontSize + 10);

  const rightMargin = canvasWidth - 20;
  ctx.textAlign = 'right';

  ctx.fillStyle = '#38bdf8';
  ctx.font = `bold ${timeFontSize}px 'Kanit', sans-serif`;
  ctx.fillText(thaiTimeFormatted, rightMargin, contentY + 10);

  ctx.fillStyle = '#f8fafc';
  ctx.font = `500 ${subFontSize}px 'Kanit', sans-serif`;
  ctx.fillText(thaiDateFormatted, rightMargin, contentY + 10 + subFontSize + 8);

  ctx.fillStyle = '#fbbf24';
  ctx.font = `400 ${badgeFontSize}px 'Kanit', sans-serif`;
  const randomSecurityCode = `LHQ-${Math.floor(1000 + Math.random() * 9000)}`;
  ctx.fillText(`🔒 ประทับเวลาจริงอัตโนมัติ • ${randomSecurityCode}`, rightMargin, bannerY + bannerHeight - 14);

  ctx.textAlign = 'left';

  const dataUrl = canvas.toDataURL('image/jpeg', 0.82);

  return {
    dataUrl,
    isoTimestamp,
    thaiDateFormatted,
    thaiTimeFormatted,
  };
}
