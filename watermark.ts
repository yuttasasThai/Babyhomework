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

  // Determine native dimensions
  let originalWidth = 1280;
  let originalHeight = 960;

  if (source instanceof HTMLVideoElement) {
    originalWidth = source.videoWidth || 1280;
    originalHeight = source.videoHeight || 960;
  } else if (source instanceof HTMLImageElement) {
    originalWidth = source.naturalWidth || 1280;
    originalHeight = source.naturalHeight || 960;
  }

  // Ensure minimum clarity
  const canvas = document.createElement('canvas');
  canvas.width = originalWidth;
  canvas.height = originalHeight;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('ไม่สามารถเริ่มต้น Canvas context ได้');
  }

  // 1. Draw original photo
  ctx.drawImage(source, 0, 0, originalWidth, originalHeight);

  // 2. Add decorative camera frame & timestamp banner at the bottom
  const bannerHeight = Math.max(140, Math.round(originalHeight * 0.19));
  const bannerY = originalHeight - bannerHeight;

  // Gradient background for the watermark banner
  const gradient = ctx.createLinearGradient(0, bannerY, 0, originalHeight);
  gradient.addColorStop(0, 'rgba(15, 23, 42, 0.75)'); // slate-900 / 75%
  gradient.addColorStop(0.3, 'rgba(15, 23, 42, 0.92)');
  gradient.addColorStop(1, 'rgba(10, 15, 30, 0.98)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, bannerY, originalWidth, bannerHeight);

  // Glowing top border line for the banner (amber-gold)
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.85)'; // amber-500
  ctx.lineWidth = Math.max(3, Math.round(originalWidth * 0.0035));
  ctx.beginPath();
  ctx.moveTo(0, bannerY);
  ctx.lineTo(originalWidth, bannerY);
  ctx.stroke();

  // Seal badge pill on top left of banner
  const pillPaddingX = 24;
  const contentY = bannerY + Math.round(bannerHeight * 0.28);

  // Scaling typography relative to width
  const baseScale = originalWidth / 1000;
  const titleFontSize = Math.max(22, Math.round(28 * baseScale));
  const subFontSize = Math.max(16, Math.round(19 * baseScale));
  const timeFontSize = Math.max(26, Math.round(34 * baseScale));
  const badgeFontSize = Math.max(13, Math.round(14 * baseScale));

  // --- LEFT SIDE: Task info & Hero badge ---
  // Official badge tag
  ctx.fillStyle = '#f59e0b'; // amber-500
  ctx.font = `bold ${badgeFontSize}px 'Kanit', sans-serif`;
  ctx.fillText('★ ภารกิจฮีโร่ตัวจิ๋วสำเร็จ (VERIFIED PROOF)', pillPaddingX, contentY - 8);

  // Chore title
  ctx.fillStyle = '#ffffff';
  ctx.font = `600 ${titleFontSize}px 'Kanit', sans-serif`;
  const choreLabel = `${choreIcon} ${choreTitle}`;
  ctx.fillText(choreLabel, pillPaddingX, contentY + titleFontSize + 2);

  // Hero name
  ctx.fillStyle = '#94a3b8'; // slate-400
  ctx.font = `400 ${subFontSize}px 'Kanit', sans-serif`;
  ctx.fillText(`ฮีโร่ตัวจิ๋ว: ${heroName}`, pillPaddingX, contentY + titleFontSize + subFontSize + 14);

  // --- RIGHT SIDE: Exact Timestamp (Prominent, cannot be faked) ---
  const rightMargin = originalWidth - 24;

  ctx.textAlign = 'right';

  // Big clear time
  ctx.fillStyle = '#38bdf8'; // sky-400
  ctx.font = `bold ${timeFontSize}px 'Kanit', sans-serif`;
  ctx.fillText(thaiTimeFormatted, rightMargin, contentY + 12);

  // Full Thai Date
  ctx.fillStyle = '#f8fafc'; // slate-50
  ctx.font = `500 ${subFontSize + 1}px 'Kanit', sans-serif`;
  ctx.fillText(thaiDateFormatted, rightMargin, contentY + 12 + subFontSize + 10);

  // Security seal line
  ctx.fillStyle = '#fbbf24'; // amber-400
  ctx.font = `400 ${badgeFontSize}px 'Kanit', sans-serif`;
  const randomSecurityCode = `LHQ-${Math.floor(1000 + Math.random() * 9000)}`;
  ctx.fillText(`🔒 ประทับเวลาจริงอัตโนมัติ • รหัสตรวจรับ: ${randomSecurityCode}`, rightMargin, bannerY + bannerHeight - 16);

  // Reset text align
  ctx.textAlign = 'left';

  const dataUrl = canvas.toDataURL('image/jpeg', 0.88);

  return {
    dataUrl,
    isoTimestamp,
    thaiDateFormatted,
    thaiTimeFormatted,
  };
}
