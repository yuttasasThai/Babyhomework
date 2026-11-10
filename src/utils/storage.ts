import { ChoreLog, ChoreTask, HeroProfile, WishlistReward } from '../types/chore';

// Embedded SVG Data URIs for Cartoon Avatars: Guaranteed to NEVER fail, NEVER return 404 on Vercel or GitHub!
const svgAvatar1 = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%2338bdf8"/><stop offset="100%" stop-color="%232563eb"/></linearGradient><linearGradient id="helm" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="%23f8fafc"/><stop offset="100%" stop-color="%23cbd5e1"/></linearGradient></defs><rect width="160" height="160" rx="36" fill="url(%23bg)"/><circle cx="80" cy="88" r="48" fill="%23fde047" opacity="0.3"/><circle cx="80" cy="82" r="38" fill="%23fed7aa"/><circle cx="80" cy="62" r="34" fill="url(%23helm)"/><path d="M48 68 Q80 40 112 68 Z" fill="%2394a3b8"/><circle cx="80" cy="38" r="12" fill="%23f59e0b"/><circle cx="80" cy="38" r="7" fill="%23ef4444"/><ellipse cx="68" cy="82" rx="4.5" ry="5.5" fill="%231e293b"/><ellipse cx="92" cy="82" rx="4.5" ry="5.5" fill="%231e293b"/><circle cx="70" cy="80" r="1.5" fill="%23ffffff"/><circle cx="94" cy="80" r="1.5" fill="%23ffffff"/><path d="M72 94 Q80 102 88 94" stroke="%23ea580c" stroke-width="3" stroke-linecap="round" fill="none"/><circle cx="60" cy="90" r="6" fill="%23f43f5e" opacity="0.4"/><circle cx="100" cy="90" r="6" fill="%23f43f5e" opacity="0.4"/><circle cx="120" cy="50" r="10" fill="%23ffffff" opacity="0.7"/><circle cx="123" cy="47" r="3" fill="%23ffffff"/><circle cx="40" cy="110" r="7" fill="%23ffffff" opacity="0.7"/><text x="80" y="146" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="12" fill="%23ffffff">🛡️ อัศวินฟองสบู่</text></svg>`;

const svgAvatar2 = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160"><defs><linearGradient id="bg2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%23f472b6"/><stop offset="100%" stop-color="%23e11d48"/></linearGradient></defs><rect width="160" height="160" rx="36" fill="url(%23bg2)"/><circle cx="80" cy="84" r="46" fill="%23fbcfe8" opacity="0.3"/><circle cx="80" cy="82" r="38" fill="%23fed7aa"/><path d="M42 78 C36 40 124 40 118 78 C124 95 110 112 110 112 L50 112 C50 112 36 95 42 78 Z" fill="%23f59e0b"/><ellipse cx="80" cy="62" rx="32" ry="18" fill="%23d97706"/><polygon points="80,24 84,34 94,35 86,42 88,52 80,46 72,52 74,42 66,35 76,34" fill="%23fde047"/><ellipse cx="68" cy="84" rx="4.5" ry="6" fill="%231e293b"/><ellipse cx="92" cy="84" rx="4.5" ry="6" fill="%231e293b"/><circle cx="70" cy="82" r="1.5" fill="%23ffffff"/><circle cx="94" cy="82" r="1.5" fill="%23ffffff"/><path d="M73 96 Q80 104 87 96" stroke="%23e11d48" stroke-width="3" stroke-linecap="round" fill="none"/><circle cx="58" cy="92" r="7" fill="%23fb7185" opacity="0.5"/><circle cx="102" cy="92" r="7" fill="%23fb7185" opacity="0.5"/><text x="80" y="146" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="12" fill="%23ffffff">✨ หนูน้อยสตาร์พาวเวอร์</text></svg>`;

const svgAvatar3 = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160"><defs><linearGradient id="bg3" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%23f59e0b"/><stop offset="100%" stop-color="%23d97706"/></linearGradient></defs><rect width="160" height="160" rx="36" fill="url(%23bg3)"/><circle cx="80" cy="80" r="44" fill="%23fef3c7" opacity="0.3"/><circle cx="50" cy="54" r="14" fill="%23b45309"/><circle cx="110" cy="54" r="14" fill="%23b45309"/><circle cx="50" cy="54" r="8" fill="%23fde68a"/><circle cx="110" cy="54" r="8" fill="%23fde68a"/><circle cx="80" cy="86" r="38" fill="%23fef08a"/><ellipse cx="80" cy="92" rx="18" ry="12" fill="%23ffffff"/><ellipse cx="80" cy="87" rx="6" ry="4" fill="%2378350f"/><path d="M80 91 L80 97 M74 97 Q80 102 86 97" stroke="%2378350f" stroke-width="2.5" stroke-linecap="round" fill="none"/><ellipse cx="66" cy="78" rx="4.5" ry="5.5" fill="%231e293b"/><ellipse cx="94" cy="78" rx="4.5" ry="5.5" fill="%231e293b"/><circle cx="68" cy="76" r="1.5" fill="%23ffffff"/><circle cx="96" cy="76" r="1.5" fill="%23ffffff"/><circle cx="56" cy="90" r="6" fill="%23f87171" opacity="0.5"/><circle cx="104" cy="90" r="6" fill="%23f87171" opacity="0.5"/><polygon points="80,32 83,40 92,41 85,47 87,55 80,50 73,55 75,47 68,41 77,40" fill="%23ffffff"/><text x="80" y="146" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="12" fill="%23ffffff">⚡ สิงโตนักลาดตระเวน</text></svg>`;

const svgAvatar4 = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160"><defs><linearGradient id="bg4" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%2310b981"/><stop offset="100%" stop-color="%23047857"/></linearGradient></defs><rect width="160" height="160" rx="36" fill="url(%23bg4)"/><rect x="46" y="52" width="68" height="58" rx="18" fill="%23e2e8f0"/><rect x="52" y="58" width="56" height="42" rx="12" fill="%230f172a"/><circle cx="68" cy="79" r="6" fill="%2338bdf8"/><circle cx="92" cy="79" r="6" fill="%2338bdf8"/><path d="M72 88 Q80 94 88 88" stroke="%2338bdf8" stroke-width="2.5" stroke-linecap="round" fill="none"/><rect x="76" y="38" width="8" height="14" fill="%2394a3b8"/><circle cx="80" cy="34" r="6" fill="%23f59e0b"/><path d="M80 34 C72 26 65 30 68 22 C76 22 80 28 80 34 Z" fill="%2322c55e"/><path d="M80 34 C88 26 95 30 92 22 C84 22 80 28 80 34 Z" fill="%234ade80"/><circle cx="38" cy="80" r="7" fill="%23cbd5e1"/><circle cx="122" cy="80" r="7" fill="%23cbd5e1"/><text x="80" y="146" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="12" fill="%23ffffff">🌱 หุ่นยนต์ต้นกล้าจิ๋ว</text></svg>`;

const svgAvatar5 = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160"><defs><linearGradient id="bg5" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%2306b6d4"/><stop offset="100%" stop-color="%230e7490"/></linearGradient></defs><rect width="160" height="160" rx="36" fill="url(%23bg5)"/><path d="M45 105 C45 60 115 60 115 105 Z" fill="%2386efac"/><ellipse cx="80" cy="76" rx="34" ry="30" fill="%234ade80"/><polygon points="76,34 80,44 84,34" fill="%23f59e0b"/><polygon points="66,38 70,47 74,38" fill="%23f59e0b"/><polygon points="86,38 90,47 94,38" fill="%23f59e0b"/><ellipse cx="70" cy="74" rx="4.5" ry="5.5" fill="%23064e3b"/><ellipse cx="90" cy="74" rx="4.5" ry="5.5" fill="%23064e3b"/><circle cx="71" cy="72" r="1.5" fill="%23ffffff"/><circle cx="91" cy="72" r="1.5" fill="%23ffffff"/><path d="M72 88 Q80 96 88 88" stroke="%23064e3b" stroke-width="3" stroke-linecap="round" fill="none"/><circle cx="60" cy="82" r="5" fill="%23f43f5e" opacity="0.4"/><circle cx="100" cy="82" r="5" fill="%23f43f5e" opacity="0.4"/><text x="80" y="146" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="12" fill="%23ffffff">🦖 ไดโนจอมขยัน</text></svg>`;

const svgAvatar6 = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160"><defs><linearGradient id="bg6" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="%238b5cf6"/><stop offset="100%" stop-color="%236d28d9"/></linearGradient></defs><rect width="160" height="160" rx="36" fill="url(%23bg6)"/><polygon points="50,45 65,70 40,70" fill="%23fed7aa"/><polygon points="110,45 95,70 120,70" fill="%23fed7aa"/><circle cx="80" cy="85" r="38" fill="%23ffedd5"/><rect x="52" y="70" width="56" height="16" rx="8" fill="%23f59e0b"/><circle cx="68" cy="78" r="4.5" fill="%23ffffff"/><circle cx="92" cy="78" r="4.5" fill="%23ffffff"/><circle cx="68" cy="78" r="2.5" fill="%231e293b"/><circle cx="92" cy="78" r="2.5" fill="%231e293b"/><polygon points="80,90 76,86 84,86" fill="%23f43f5e"/><path d="M75 92 Q80 96 85 92" stroke="%237c2d12" stroke-width="2" stroke-linecap="round" fill="none"/><text x="80" y="146" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="12" fill="%23ffffff">🐱 กัปตันเหมียวสายตรวจ</text></svg>`;

export const HERO_AVATARS = [
  {
    id: 'clean_knight',
    name: 'อัศวินฟองสบู่',
    title: 'ผู้พิทักษ์ความสะอาด',
    image: svgAvatar1,
    color: 'from-blue-500 to-cyan-400',
  },
  {
    id: 'sparkle_girl',
    name: 'หนูน้อยสตาร์พาวเวอร์',
    title: 'พลังดวงดาววิบวับ',
    image: svgAvatar2,
    color: 'from-pink-500 to-rose-400',
  },
  {
    id: 'turbo_ranger',
    name: 'สิงโตนักลาดตระเวน',
    title: 'ผู้พิทักษ์บ้านแสนสุข',
    image: svgAvatar3,
    color: 'from-amber-500 to-yellow-400',
  },
  {
    id: 'sprout_helper',
    name: 'หุ่นยนต์ต้นกล้าจิ๋ว',
    title: 'ผู้พิชิตฝุ่นตัวน้อย',
    image: svgAvatar4,
    color: 'from-emerald-500 to-teal-400',
  },
  {
    id: 'dino_cleaner',
    name: 'ไดโนจอมขยัน',
    title: 'ยอดนักกวาดมือโปร',
    image: svgAvatar5,
    color: 'from-cyan-500 to-emerald-400',
  },
  {
    id: 'cat_patrol',
    name: 'กัปตันเหมียวสายตรวจ',
    title: 'สายลับกำจัดเชื้อโรค',
    image: svgAvatar6,
    color: 'from-purple-500 to-indigo-400',
  },
];

export const PRESET_CHORES = [
  { title: 'ล้างจาน', icon: '🍽️', category: 'kitchen' as const, defaultTime: '08:30', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { title: 'กวาดบ้าน', icon: '🧹', category: 'cleaning' as const, defaultTime: '10:00', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { title: 'ถูบ้าน', icon: '✨', category: 'cleaning' as const, defaultTime: '11:00', color: 'bg-sky-50 text-sky-700 border-sky-200' },
  { title: 'กรอกน้ำ', icon: '💧', category: 'kitchen' as const, defaultTime: '14:00', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { title: 'ทิ้งขยะ', icon: '🗑️', category: 'cleaning' as const, defaultTime: '18:00', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  { title: 'ซักผ้า', icon: '🧺', category: 'laundry' as const, defaultTime: '09:00', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { title: 'รีดผ้า', icon: '👔', category: 'laundry' as const, defaultTime: '15:00', color: 'bg-violet-50 text-violet-700 border-violet-200' },
  { title: 'หุงข้าว', icon: '🍚', category: 'kitchen' as const, defaultTime: '17:00', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { title: 'เก็บที่นอน', icon: '🛏️', category: 'bedroom' as const, defaultTime: '07:30', color: 'bg-teal-50 text-teal-700 border-teal-200' },
  { title: 'ให้อาหารสัตว์เลี้ยง', icon: '🐾', category: 'pets_plants' as const, defaultTime: '08:00', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  { title: 'รดน้ำต้นไม้', icon: '🌱', category: 'pets_plants' as const, defaultTime: '16:30', color: 'bg-green-50 text-green-700 border-green-200' },
  { title: 'จัดโต๊ะเขียนหนังสือ', icon: '📚', category: 'study' as const, defaultTime: '19:30', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
];

const STORAGE_KEYS = {
  PROFILE: 'chore_hero_profile_v1',
  TASKS: 'chore_hero_tasks_v1',
  LOGS: 'chore_hero_logs_v1',
  REWARDS: 'chore_hero_rewards_v1',
  ACTIVE_USER_TOKENS: 'chore_hero_user_tokens_v1',
};

export interface UserTokenPayload {
  version: number;
  heroName: string;
  userName?: string;
  passcode: string; // password
  password?: string;
  validUntil: number; // epoch ms
  validUntilFormatted: string;
  createdAt: number;
  createdAtFormatted?: string;
  isFreshUser?: boolean;
  profile: HeroProfile;
  tasks: ChoreTask[];
}

export function getStoredProfile(): HeroProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Ensure avatar is not a broken local file path
      if (!parsed.avatarUrl || parsed.avatarUrl.startsWith('/src/assets/')) {
        parsed.avatarUrl = HERO_AVATARS[0].image;
        parsed.avatarId = HERO_AVATARS[0].id;
      }
      // Ensure parent pin default to 099-2252601
      if (!parsed.parentPin || parsed.parentPin === '1234' || parsed.parentPin === '0992256601') {
        parsed.parentPin = '099-2252601';
      }
      return parsed;
    }
  } catch {
    // fallback
  }

  // Default seed profile
  const initialProfile: HeroProfile = {
    id: 'hero_1',
    nickname: 'น้องอาชิ',
    age: 7,
    gender: 'boy',
    avatarUrl: HERO_AVATARS[0].image,
    avatarId: HERO_AVATARS[0].id,
    isCustomPhoto: false,
    heroRankLevel: 2,
    totalStars: 12,
    currentStreak: 3,
    lastActiveDate: new Date().toISOString().split('T')[0],
    dreamReward: 'กินไอศกรีมรสโปรด 🍨',
    dreamRewardStars: 20,
    soundEnabled: true,
    dailyTaskTarget: 3,
    parentPin: '099-2252601',
  };
  saveProfile(initialProfile);
  return initialProfile;
}

export function saveProfile(profile: HeroProfile) {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch {
    // Storage quota or disabled
  }
}

export function getStoredTasks(): ChoreTask[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }

  const initialTasks: ChoreTask[] = [
    {
      id: 'task-1',
      title: 'เก็บที่นอนให้เรียบร้อย',
      category: 'bedroom',
      icon: '🛏️',
      color: 'teal',
      scheduledTime: '07:30',
      order: 1,
      isDailyRoutine: true,
      starsReward: 1,
      status: 'completed',
      completedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      completedTimeFormatted: '07:35 น.',
      notes: 'ดึงผ้าปูให้ตึง จัดหมอนให้ตรง',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-2',
      title: 'ล้างจานชามอาหารเช้า',
      category: 'kitchen',
      icon: '🍽️',
      color: 'emerald',
      scheduledTime: '08:30',
      order: 2,
      isDailyRoutine: true,
      starsReward: 1,
      status: 'pending',
      notes: 'ใช้น้ำยาล้างจาน 2 หยด ล้างให้เกลี้ยง',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-3',
      title: 'กรอกน้ำเย็นใส่ตู้เย็น',
      category: 'kitchen',
      icon: '💧',
      color: 'blue',
      scheduledTime: '13:00',
      order: 3,
      isDailyRoutine: true,
      starsReward: 1,
      status: 'pending',
      notes: 'กรอกให้เต็มขวดและปิดฝาให้แน่น',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-4',
      title: 'กวาดห้องนั่งเล่น',
      category: 'cleaning',
      icon: '🧹',
      color: 'amber',
      scheduledTime: '16:30',
      order: 4,
      isDailyRoutine: true,
      starsReward: 1,
      status: 'pending',
      notes: 'กวาดตามซอกโต๊ะและใต้โซฟา',
      createdAt: new Date().toISOString(),
    },
  ];

  saveTasks(initialTasks);
  return initialTasks;
}

export function saveTasks(tasks: ChoreTask[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  } catch {
    // quota
  }
}

export function getStoredLogs(): ChoreLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }

  const initialLogs: ChoreLog[] = [
    {
      id: 'log-1',
      choreId: 'task-1',
      title: 'เก็บที่นอนให้เรียบร้อย',
      icon: '🛏️',
      childName: 'น้องอาชิ',
      timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
      thaiDateFormatted: 'วันอังคารที่ 4 พฤศจิกายน 2569',
      thaiTimeFormatted: '07:35 น.',
      proofPhotoUrl: '',
      starsEarned: 1,
      category: 'bedroom',
    },
  ];
  saveLogs(initialLogs);
  return initialLogs;
}

export function saveLogs(logs: ChoreLog[]) {
  try {
    // Keep max 50 recent logs to save localStorage quota
    const trimmed = logs.slice(0, 50);
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(trimmed));
  } catch {
    // quota
  }
}

export function getStoredRewards(): WishlistReward[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REWARDS);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }

  const initialRewards: WishlistReward[] = [
    {
      id: 'rew-1',
      title: 'กินไอศกรีมรสโปรด 🍨',
      requiredStars: 10,
      icon: '🍨',
      isClaimed: false,
    },
    {
      id: 'rew-2',
      title: 'เล่นเกม/ดูการ์ตูนเพิ่ม 30 นาที 🎮',
      requiredStars: 20,
      icon: '🎮',
      isClaimed: false,
    },
    {
      id: 'rew-3',
      title: 'ไปเที่ยวสวนสนุกสุดสัปดาห์ 🎡',
      requiredStars: 60,
      icon: '🎡',
      isClaimed: false,
    },
  ];
  saveRewards(initialRewards);
  return initialRewards;
}

export function saveRewards(rewards: WishlistReward[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.REWARDS, JSON.stringify(rewards));
  } catch {
    // quota
  }
}

export function formatThaiDate(date: Date): string {
  const months = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ];
  const buddhistYear = date.getFullYear() + 543;
  return `${date.getDate()} ${months[date.getMonth()]} ${buddhistYear} เวลา ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')} น.`;
}

/**
 * Creates an encoded user token.
 * Requirement 1: เคลียร์ล้างข้อมูลทั้งหมดเพื่อให้ user ที่ใช้งานสร้างข้อมูลของตัวเอง
 */
export function createUserToken(
  profile: HeroProfile,
  tasks: ChoreTask[],
  daysValid: number,
  customPasscode?: string,
  customUserName?: string,
  customPassword?: string,
  clearDataForNewUser: boolean = true
): { token: string; payload: UserTokenPayload } {
  const now = Date.now();
  const validUntilMs = now + daysValid * 24 * 60 * 60 * 1000;
  const passcode = customPassword || customPasscode || `HERO-${Math.floor(1000 + Math.random() * 9000)}`;
  const validDate = new Date(validUntilMs);
  const heroName = (customUserName && customUserName.trim()) || 'ฮีโร่ตัวจิ๋ว';

  // 1) เคลียร์ล้างข้อมูลเพื่อเริ่มใหม่สำหรับ User นี้
  let finalProfile: HeroProfile;
  let finalTasks: ChoreTask[];

  if (clearDataForNewUser) {
    // ข้อมูลโปรไฟล์เริ่มต้นใหม่เอี่ยม: ดาว 0, ระดับขั้น 1, สถิติ 0 วัน, ให้สร้างข้อมูลเอง
    finalProfile = {
      id: `hero_user_${now}`,
      nickname: heroName,
      age: 7,
      gender: 'boy',
      avatarUrl: HERO_AVATARS[0].image,
      avatarId: HERO_AVATARS[0].id,
      isCustomPhoto: false,
      heroRankLevel: 1, // ระดับขั้นที่ 1
      totalStars: 0, // 0 ดาว สะสมใหม่ด้วยตัวเอง
      currentStreak: 0, // เริ่มสถิติใหม่ 0 วัน
      lastActiveDate: new Date().toISOString().split('T')[0],
      dreamReward: '', // ให้ผู้ใช้ตั้งของรางวัลความฝันของตนเอง
      dreamRewardStars: 20,
      soundEnabled: true,
      dailyTaskTarget: 3,
      parentPin: undefined, // ล็อกโหมดแอดมิน
    };

    // ภารกิจตั้งต้นที่ยังไม่ได้ทำ (สถานะ pending ทั้งหมด ไม่มีรูปส่งงานค้าง)
    finalTasks = [
      {
        id: `task-new-1`,
        title: 'เก็บที่นอนให้เรียบร้อย',
        category: 'bedroom',
        icon: '🛏️',
        color: 'teal',
        scheduledTime: '07:30',
        order: 1,
        isDailyRoutine: true,
        starsReward: 1,
        status: 'pending',
        notes: 'ดึงผ้าปูให้ตึง จัดหมอนให้ตรง',
        createdAt: new Date().toISOString(),
      },
      {
        id: `task-new-2`,
        title: 'ล้างจานชามอาหารเช้า',
        category: 'kitchen',
        icon: '🍽️',
        color: 'emerald',
        scheduledTime: '08:30',
        order: 2,
        isDailyRoutine: true,
        starsReward: 1,
        status: 'pending',
        notes: 'ใช้น้ำยาล้างจาน ล้างให้สะอาด',
        createdAt: new Date().toISOString(),
      },
      {
        id: `task-new-3`,
        title: 'กรอกน้ำเย็นใส่ตู้เย็น',
        category: 'kitchen',
        icon: '💧',
        color: 'blue',
        scheduledTime: '13:00',
        order: 3,
        isDailyRoutine: true,
        starsReward: 1,
        status: 'pending',
        notes: 'กรอกน้ำให้เต็มขวดและปิดฝาให้สนิท',
        createdAt: new Date().toISOString(),
      },
      {
        id: `task-new-4`,
        title: 'กวาดห้องนั่งเล่น',
        category: 'cleaning',
        icon: '🧹',
        color: 'amber',
        scheduledTime: '16:30',
        order: 4,
        isDailyRoutine: true,
        starsReward: 1,
        status: 'pending',
        notes: 'กวาดตามซอกโต๊ะและใต้โซฟา',
        createdAt: new Date().toISOString(),
      },
    ];
  } else {
    finalProfile = {
      ...profile,
      nickname: heroName,
      parentPin: undefined,
    };
    finalTasks = tasks;
  }

  const payload: UserTokenPayload = {
    version: 2,
    heroName,
    userName: heroName,
    passcode,
    password: passcode,
    validUntil: validUntilMs,
    validUntilFormatted: formatThaiDate(validDate),
    createdAt: now,
    createdAtFormatted: formatThaiDate(new Date(now)),
    isFreshUser: clearDataForNewUser,
    profile: finalProfile,
    tasks: finalTasks,
  };

  const jsonStr = JSON.stringify(payload);
  const token = btoa(encodeURIComponent(jsonStr));

  // บันทึกลงตารางรายการ User Tokens ใน Admin Storage
  saveActiveUserToken(payload);

  return { token, payload };
}

/**
 * Decodes and validates a user token
 */
export function decodeUserToken(token: string): {
  payload: UserTokenPayload | null;
  isExpired: boolean;
  timeLeftMs: number;
} {
  try {
    const jsonStr = decodeURIComponent(atob(token));
    const payload: UserTokenPayload = JSON.parse(jsonStr);
    const now = Date.now();
    const isExpired = now > payload.validUntil;
    const timeLeftMs = Math.max(0, payload.validUntil - now);

    return { payload, isExpired, timeLeftMs };
  } catch (err) {
    console.error('Failed to parse user token:', err);
    return { payload: null, isExpired: true, timeLeftMs: 0 };
  }
}

/**
 * Manage list of created tokens in Admin localStorage
 */
export function getActiveUserTokens(): UserTokenPayload[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER_TOKENS);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return [];
}

export function saveActiveUserToken(payload: UserTokenPayload) {
  try {
    const tokens = getActiveUserTokens().filter((t) => t.passcode !== payload.passcode);
    tokens.unshift(payload);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_TOKENS, JSON.stringify(tokens.slice(0, 30)));
  } catch {
    // ignore
  }
}

export function deleteUserToken(passcode: string): void {
  try {
    const tokens = getActiveUserTokens().filter((t) => t.passcode !== passcode);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_TOKENS, JSON.stringify(tokens));
  } catch {
    // ignore
  }
}

/**
 * Renews an existing token by adding additional days
 */
export function renewUserToken(
  passcode: string,
  additionalDays: number
): UserTokenPayload | null {
  const tokens = getActiveUserTokens();
  const target = tokens.find((t) => t.passcode.toLowerCase() === passcode.toLowerCase());
  if (!target) return null;

  const currentExpiry = Math.max(Date.now(), target.validUntil);
  const newExpiryMs = currentExpiry + additionalDays * 24 * 60 * 60 * 1000;
  target.validUntil = newExpiryMs;
  target.validUntilFormatted = formatThaiDate(new Date(newExpiryMs));

  localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_TOKENS, JSON.stringify(tokens));
  return target;
}

