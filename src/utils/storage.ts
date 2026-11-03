import { ChoreLog, ChoreTask, HeroProfile, WishlistReward } from '../types/chore';

export const HERO_AVATARS = [
  {
    id: 'clean_knight',
    name: 'อัศวินฟองสบู่',
    title: 'ผู้พิทักษ์ความสะอาด',
    image: '/src/assets/images/hero_clean_knight_1793681104404.jpg',
    color: 'from-blue-500 to-cyan-400',
  },
  {
    id: 'sparkle_girl',
    name: 'หนูน้อยสตาร์พาวเวอร์',
    title: 'พลังดวงดาววิบวับ',
    image: '/src/assets/images/hero_sparkle_girl_1793681104087.jpg',
    color: 'from-pink-500 to-rose-400',
  },
  {
    id: 'turbo_ranger',
    name: 'ผู้พิทักษ์สี่ขา',
    title: 'หน่วยลาดตระเวนบ้าน',
    image: '/src/assets/images/hero_turbo_ranger_1793681103886.jpg',
    color: 'from-amber-500 to-yellow-400',
  },
  {
    id: 'sprout_helper',
    name: 'ฮีโร่สายฟ้าจิ๋ว',
    title: 'ผู้พิชิตฝุ่นตัวน้อย',
    image: '/src/assets/images/hero_sprout_helper_1793681102630.jpg',
    color: 'from-emerald-500 to-teal-400',
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
};

export function getStoredProfile(): HeroProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (raw) return JSON.parse(raw);
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
    parentPin: '1234',
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
      starsReward: 1, // 1 chore = 1 star
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
      starsReward: 1, // 1 chore = 1 star
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
      starsReward: 1, // 1 chore = 1 star
      status: 'pending',
      notes: 'กรอกให้เต็มขวด 3 ขวด เช็ดปากขวดให้สะอาด',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-4',
      title: 'กวาดบ้านห้องนั่งเล่น',
      category: 'cleaning',
      icon: '🧹',
      color: 'amber',
      scheduledTime: '16:30',
      order: 4,
      isDailyRoutine: true,
      starsReward: 1, // 1 chore = 1 star
      status: 'pending',
      notes: 'กวาดใต้โซฟาและมุมโต๊ะด้วยนะ',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-5',
      title: 'หุงข้าวสำหรับมื้อเย็น',
      category: 'kitchen',
      icon: '🍚',
      color: 'orange',
      scheduledTime: '17:00',
      order: 5,
      isDailyRoutine: true,
      starsReward: 1, // 1 chore = 1 star
      status: 'pending',
      notes: 'ซาวข้าว 2 รอบ ใส่น้ำถึงขีดเลข 2',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'task-6',
      title: 'นำขยะไปทิ้งที่ถังใหญ่',
      category: 'cleaning',
      icon: '🗑️',
      color: 'slate',
      scheduledTime: '18:00',
      order: 6,
      isDailyRoutine: true,
      starsReward: 1, // 1 chore = 1 star
      status: 'pending',
      notes: 'มัดปากถุงให้แน่น ระวังน้ำหยด',
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
    //
  }
}

export function getStoredLogs(): ChoreLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (raw) return JSON.parse(raw);
  } catch {
    //
  }

  // Sample initial log for immediate visual delight in gallery
  const sampleLog: ChoreLog[] = [
    {
      id: 'log-sample-1',
      choreId: 'task-1',
      title: 'เก็บที่นอนให้เรียบร้อย',
      icon: '🛏️',
      childName: 'น้องอาชิ',
      timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
      thaiDateFormatted: 'วันนี้',
      thaiTimeFormatted: '07:35:10 น.',
      proofPhotoUrl: '', // fallback to stylized badge
      starsEarned: 1,
      category: 'bedroom',
    },
  ];

  saveLogs(sampleLog);
  return sampleLog;
}

export function saveLogs(logs: ChoreLog[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  } catch {
    //
  }
}

export function getStoredRewards(): WishlistReward[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REWARDS);
    if (raw) return JSON.parse(raw);
  } catch {
    //
  }

  const initialRewards: WishlistReward[] = [
    {
      id: 'rew-1',
      title: 'กินไอศกรีมรสโปรด 1 ถ้วย 🍨',
      requiredStars: 10,
      icon: '🍨',
      isClaimed: false,
    },
    {
      id: 'rew-2',
      title: 'เล่นเกม/ดูการ์ตูนเพิ่ม 30 นาที 🎮',
      requiredStars: 15,
      icon: '🎮',
      isClaimed: false,
    },
    {
      id: 'rew-3',
      title: 'ไปเที่ยวสวนน้ำ / สวนสนุกสุดสัปดาห์ 🏖️',
      requiredStars: 30,
      icon: '🏖️',
      isClaimed: false,
    },
    {
      id: 'rew-4',
      title: 'ของเล่นชิ้นโปรดที่เลือกเอง 🧸',
      requiredStars: 50,
      icon: '🧸',
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
    //
  }
}
