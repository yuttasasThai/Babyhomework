import { HeroRankInfo } from '../types/chore';

export const HERO_RANKS: HeroRankInfo[] = [
  {
    level: 1,
    title: 'เด็กขยัน 🌱',
    badgeEmoji: '🌱',
    minStars: 1,
    maxStars: 10,
    colorScheme: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-700',
      progressGradient: 'from-emerald-400 to-teal-500',
    },
    motto: 'ก้าวแรกแห่งความขยัน พร้อมเรียนรู้งานบ้านทุกวัน',
  },
  {
    level: 2,
    title: 'ผู้พิชิตภารกิจ ⚔️',
    badgeEmoji: '⚔️',
    minStars: 11,
    maxStars: 25,
    colorScheme: {
      bg: 'bg-sky-50',
      border: 'border-sky-200',
      text: 'text-sky-700',
      progressGradient: 'from-sky-400 to-blue-500',
    },
    motto: 'สะสมดาวต่อเนื่อง พิชิตงานบ้านตามตารางอย่างเก่งกาจ!',
  },
  {
    level: 3,
    title: 'พ่อบ้านจิ๋วระดับ 1 🧹',
    badgeEmoji: '🧹',
    minStars: 26,
    maxStars: 45,
    colorScheme: {
      bg: 'bg-cyan-50',
      border: 'border-cyan-200',
      text: 'text-cyan-800',
      progressGradient: 'from-cyan-400 to-teal-500',
    },
    motto: 'กวาดถูกวาดเกลี้ยง ปัดฝุ่นสะอาดทั่วห้อง!',
  },
  {
    level: 4,
    title: 'พ่อบ้านจิ๋วระดับ 2 ✨',
    badgeEmoji: '✨',
    minStars: 46,
    maxStars: 65,
    colorScheme: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      text: 'text-purple-700',
      progressGradient: 'from-purple-400 to-indigo-500',
    },
    motto: 'บ้านเปล่งประกายวิบวับ ด้วยฝีมือพ่อบ้านตัวจริง!',
  },
  {
    level: 5,
    title: 'พ่อบ้านจิ๋วระดับ 3 🛡️',
    badgeEmoji: '🛡️',
    minStars: 66,
    maxStars: 85,
    colorScheme: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-800',
      progressGradient: 'from-amber-400 to-orange-500',
    },
    motto: 'ผู้พิทักษ์บ้านแสนสุข มีความรับผิดชอบดีเยี่ยมเกินร้อย!',
  },
  {
    level: 6,
    title: 'แชมป์เปี่ยนพ่อบ้านจิ๋ว 🏆',
    badgeEmoji: '🏆',
    minStars: 86,
    maxStars: 9999,
    colorScheme: {
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      text: 'text-rose-700',
      progressGradient: 'from-rose-500 via-amber-400 to-yellow-400',
    },
    motto: 'สุดยอดแชมเปี้ยนงานบ้านไร้เทียมทาน สะสมครบ 90 ดาวเต็มเดือน!',
  },
];

export function getHeroRank(
  stars: number,
  dailyTaskCount: number = 3,
  daysInMonth: number = 30
): {
  currentRank: HeroRankInfo;
  nextRank: HeroRankInfo | null;
  progressPercent: number;
  starsToNext: number;
  monthlyScore: number;
  monthlyTarget: number;
} {
  const monthlyTarget = Math.max(30, dailyTaskCount * daysInMonth);
  const currentRank = HERO_RANKS.slice().reverse().find((r) => stars >= r.minStars) || HERO_RANKS[0];
  const nextRank = HERO_RANKS.find((r) => r.level === currentRank.level + 1) || null;

  const monthlyScore = stars;
  const progressPercent = Math.min(100, Math.round((monthlyScore / monthlyTarget) * 100));
  const starsToNext = nextRank ? Math.max(0, nextRank.minStars - stars) : 0;

  return {
    currentRank,
    nextRank,
    progressPercent,
    starsToNext,
    monthlyScore,
    monthlyTarget,
  };
}
