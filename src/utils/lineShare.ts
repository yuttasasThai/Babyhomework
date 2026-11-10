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
🔒 ตราประทับเวลาจริง Canvas เรียบร้อย

⭐ ได้รับคะแนนส่วนที่ 1 แล้ว (+1 ดาว จากการส่งงาน)
⭐ คะแนนส่วนที่ 2: รอคุณพ่อคุณแม่/ผู้ตรวจ กดดูงานเพื่อมอบดาวเพิ่มอีก 1 ส่วน (+1 ดาว)

👉 กดดูรูปและกดยืนยันตรวจงานเพื่อมอบคะแนนส่วนที่ 2 ให้สมบูรณ์ได้ที่นี่:
${verifyUrl}`;

  // LINE Social Share URL Scheme (Opens LINE app directly)
  const lineAppUrl = `https://line.me/R/msg/text/?${encodeURIComponent(messageText)}`;

  return {
    messageText,
    verifyUrl,
    lineAppUrl,
  };
}

export function generateMessengerShareMessage(task: ChoreTask, profile: HeroProfile): {
  messageText: string;
  verifyUrl: string;
  messengerAppUrl: string;
} {
  const verifyUrl = generateVerificationUrl(task);
  const timeFormatted = task.completedTimeFormatted || 'เพิ่งเสร็จสดๆ ร้อนๆ';

  const messageText = `🌟 ฮีโร่ตัวจิ๋วส่งงานบ้านผ่าน Facebook Messenger!
👤 ผู้ส่งงาน: ${profile.nickname}
📋 ภารกิจ: ${task.icon} ${task.title}
⏰ เวลาส่งงาน: ${timeFormatted}
⭐ ได้รับคะแนนส่วนที่ 1 แล้ว (+1 ดาว)
👉 กดดูรูปหลักฐานและกดอนุมัติคะแนนส่วนที่ 2 (+1 ดาว) ได้ที่นี่:
${verifyUrl}`;

  // Messenger share URL
  const messengerAppUrl = `fb-messenger://share/?link=${encodeURIComponent(verifyUrl)}&app_id=291494419107518`;

  return {
    messageText,
    verifyUrl,
    messengerAppUrl,
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
      // Fallback
    }
  }

  window.open(lineAppUrl, '_blank');
  return true;
}

export async function shareToMessenger(task: ChoreTask, profile: HeroProfile): Promise<boolean> {
  const { messageText, verifyUrl, messengerAppUrl } = generateMessengerShareMessage(task, profile);

  // Copy text to clipboard so parent/reviewer has the text ready
  try {
    await navigator.clipboard.writeText(`${messageText}\n${verifyUrl}`);
  } catch {
    // ignore
  }

  if (navigator.share && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    try {
      await navigator.share({
        title: `ภารกิจงานบ้านสำเร็จ: ${task.title}`,
        text: messageText,
        url: verifyUrl,
      });
      return true;
    } catch {
      // Fallback
    }
  }

  // Fallback to Messenger deep link or web share
  const fbWebShare = `https://www.facebook.com/dialog/send?link=${encodeURIComponent(verifyUrl)}&app_id=291494419107518&redirect_uri=${encodeURIComponent(verifyUrl)}`;
  window.open(messengerAppUrl, '_blank');
  setTimeout(() => {
    // If protocol failed to open in 1.2s, fallback to web dialog or Messenger m.me
    window.open(fbWebShare, '_blank');
  }, 1200);

  return true;
}

