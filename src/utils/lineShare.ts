import { ChoreTask, HeroProfile } from '../types/chore';

export function generateVerificationUrl(task: ChoreTask): string {
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '';
  const shareCode = task.shareCode || Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${currentOrigin}?verifyTask=${task.id}&code=${shareCode}`;
}

export function generateLineShareMessage(task: ChoreTask, profile: HeroProfile): {
  messageText: string;
  verifyUrl: string;
  lineAppUrl: string;
} {
  const verifyUrl = generateVerificationUrl(task);
  const timeFormatted = task.completedTimeFormatted || 'เพิ่งเสร็จสดๆ ร้อนๆ';

  const messageText = `🌟 ฮีโร่ตัวจิ๋วส่งงานบ้านแล้วจ้า!
👤 ผู้ส่งงาน: ${profile.nickname}
📋 ภารกิจ: ${task.icon} ${task.title}
⏰ เวลาส่งงาน: ${timeFormatted}
🔒 ตรวจสอบตราประทับเวลาจริงบนภาพเรียบร้อย

👉 คุณพ่อคุณแม่กดดูรูปหลักฐานและกดอนุมัติดาวโบนัสพิเศษให้น้องได้ที่นี่เลย:
${verifyUrl}

(กดดูรูปและกดตรวจผ่าน เพื่อมอบดาวพิเศษเป็นกำลังใจให้ลูกกันเถอะ ⭐)`;

  const lineAppUrl = `https://line.me/R/msg/text/?${encodeURIComponent(messageText)}`;

  return {
    messageText,
    verifyUrl,
    lineAppUrl,
  };
}

export async function shareToLine(task: ChoreTask, profile: HeroProfile): Promise<boolean> {
  const { messageText, verifyUrl, lineAppUrl } = generateLineShareMessage(task, profile);

  if (navigator.share && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    try {
      await navigator.share({
        title: `ภารกิจงานบ้านสำเร็จ: ${task.title}`,
        text: messageText,
        url: verifyUrl,
      });
      return true;
    } catch {
      // Fallback to direct LINE URL
    }
  }

  window.open(lineAppUrl, '_blank');
  return true;
}
