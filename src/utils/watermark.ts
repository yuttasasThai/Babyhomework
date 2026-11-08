export interface WatermarkPayload {
  source: HTMLVideoElement | HTMLImageElement | ImageBitmap | HTMLCanvasElement;
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

/**
 * Super-fast image file to watermark processor using hardware-accelerated createImageBitmap
 * or downscaled Image. Prevents phone browser crashes and long spin times on Android.
 */
export async function processImageFileToWatermark(
  file: File | Blob,
  heroName: string,
  choreTitle: string,
  choreIcon: string
): Promise<WatermarkResult> {
  // Try hardware accelerated createImageBitmap with resizeWidth first (modern Android Chrome)
  if (typeof window !== 'undefined' && 'createImageBitmap' in window) {
    try {
      const bitmap = await createImageBitmap(file, {
        resizeWidth: 960,
        resizeQuality: 'medium',
      });
      const result = await generateWatermarkedPhoto({
        source: bitmap,
        heroName,
        choreTitle,
        choreIcon,
      });
      bitmap.close();
      return result;
    } catch (bitmapErr) {
      console.warn('createImageBitmap with resize failed, falling back to standard Image:', bitmapErr);
    }
  }

  // Fallback to Image element with URL.createObjectURL
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    // Timeout safety: if processing takes more than 4 seconds, reject cleanly
    const timer = setTimeout(() => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('การประมวลผลรูปภาพใช้เวลานานเกินไป กรุณาลองใหม่อีกครั้ง'));
    }, 4500);

    img.onload = async () => {
      clearTimeout(timer);
      try {
        const result = await generateWatermarkedPhoto({
          source: img,
          heroName,
          choreTitle,
          choreIcon,
        });
        resolve(result);
      } catch (err) {
        reject(err);
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    };

    img.onerror = () => {
      clearTimeout(timer);
      URL.revokeObjectURL(objectUrl);
      reject(new Error('ไม่สามารถอ่านไฟล์ภาพจากกล้องได้'));
    };

    img.src = objectUrl;
  });
}

export async function generateWatermarkedPhoto(payload: WatermarkPayload): Promise<WatermarkResult> {
  const { source, heroName, choreTitle, choreIcon } = payload;
  const now = new Date();
  const { thaiDateFormatted, thaiTimeFormatted } = getThaiDateTime(now);
  const isoTimestamp = now.toISOString();

  // Determine native dimensions safely
  let rawWidth = 960;
  let rawHeight = 720;

  if (source instanceof HTMLVideoElement) {
    rawWidth = source.videoWidth || 960;
    rawHeight = source.videoHeight || 720;
  } else if (source instanceof HTMLImageElement) {
    rawWidth = source.naturalWidth || source.width || 960;
    rawHeight = source.naturalHeight || source.height || 720;
  } else if (typeof ImageBitmap !== 'undefined' && source instanceof ImageBitmap) {
    rawWidth = source.width || 960;
    rawHeight = source.height || 720;
  } else if (source instanceof HTMLCanvasElement) {
    rawWidth = source.width || 960;
    rawHeight = source.height || 720;
  }

  if (rawWidth <= 0) rawWidth = 960;
  if (rawHeight <= 0) rawHeight = 720;

  // Scale down to safe max dimensions (960px max) for ultra-fast mobile rendering & low RAM
  const MAX_DIM = 960;
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

  // 1. Draw original photo scaled to safe size
  ctx.drawImage(source as CanvasImageSource, 0, 0, canvasWidth, canvasHeight);

  // 2. Add decorative camera frame & timestamp banner at the bottom
  const bannerHeight = Math.max(105, Math.round(canvasHeight * 0.19));
  const bannerY = canvasHeight - bannerHeight;

  // Gradient background for the watermark banner
  const gradient = ctx.createLinearGradient(0, bannerY, 0, canvasHeight);
  gradient.addColorStop(0, 'rgba(15, 23, 42, 0.78)');
  gradient.addColorStop(0.3, 'rgba(15, 23, 42, 0.94)');
  gradient.addColorStop(1, 'rgba(10, 15, 30, 0.98)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, bannerY, canvasWidth, bannerHeight);

  // Glowing top border line for the banner (amber-gold)
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.9)';
  ctx.lineWidth = Math.max(3, Math.round(canvasWidth * 0.0035));
  ctx.beginPath();
  ctx.moveTo(0, bannerY);
  ctx.lineTo(canvasWidth, bannerY);
  ctx.stroke();

  // Content positioning
  const pillPaddingX = 18;
  const contentY = bannerY + Math.round(bannerHeight * 0.28);

  // Scaling typography relative to width
  const baseScale = canvasWidth / 960;
  const titleFontSize = Math.max(16, Math.round(24 * baseScale));
  const subFontSize = Math.max(12, Math.round(16 * baseScale));
  const timeFontSize = Math.max(20, Math.round(28 * baseScale));
  const badgeFontSize = Math.max(10, Math.round(12 * baseScale));

  // --- LEFT SIDE: Task info & Hero badge ---
  ctx.fillStyle = '#f59e0b';
  ctx.font = `bold ${badgeFontSize}px 'Kanit', sans-serif`;
  ctx.fillText('★ ภารกิจฮีโร่ตัวจิ๋วสำเร็จ (VERIFIED PROOF)', pillPaddingX, contentY - 4);

  ctx.fillStyle = '#ffffff';
  ctx.font = `600 ${titleFontSize}px 'Kanit', sans-serif`;
  const choreLabel = `${choreIcon || '⭐'} ${choreTitle || 'งานบ้านสำเร็จ'}`;
  ctx.fillText(choreLabel, pillPaddingX, contentY + titleFontSize);

  ctx.fillStyle = '#94a3b8';
  ctx.font = `400 ${subFontSize}px 'Kanit', sans-serif`;
  ctx.fillText(`ฮีโร่ตัวจิ๋ว: ${heroName || 'ฮีโร่'}`, pillPaddingX, contentY + titleFontSize + subFontSize + 8);

  // --- RIGHT SIDE: Exact Timestamp ---
  const rightMargin = canvasWidth - 18;
  ctx.textAlign = 'right';

  ctx.fillStyle = '#38bdf8';
  ctx.font = `bold ${timeFontSize}px 'Kanit', sans-serif`;
  ctx.fillText(thaiTimeFormatted, rightMargin, contentY + 8);

  ctx.fillStyle = '#f8fafc';
  ctx.font = `500 ${subFontSize}px 'Kanit', sans-serif`;
  ctx.fillText(thaiDateFormatted, rightMargin, contentY + 8 + subFontSize + 6);

  ctx.fillStyle = '#fbbf24';
  ctx.font = `400 ${badgeFontSize}px 'Kanit', sans-serif`;
  const randomSecurityCode = `LHQ-${Math.floor(1000 + Math.random() * 9000)}`;
  ctx.fillText(`🔒 ประทับเวลาจริงอัตโนมัติ • ${randomSecurityCode}`, rightMargin, bannerY + bannerHeight - 12);

  ctx.textAlign = 'left';

  // Export compact JPEG with 0.80 quality (<80KB) for fast loading and no storage quota crash
  const dataUrl = canvas.toDataURL('image/jpeg', 0.80);

  return {
    dataUrl,
    isoTimestamp,
    thaiDateFormatted,
    thaiTimeFormatted,
  };
}
