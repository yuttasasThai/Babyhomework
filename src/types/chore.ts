export interface HeroProfile {
  id: string;
  nickname: string;
  age: number;
  gender: 'boy' | 'girl' | 'other';
  avatarUrl: string;
  avatarId: string;
  isCustomPhoto?: boolean;
  heroRankLevel: number;
  totalStars: number;
  currentStreak: number;
  lastActiveDate: string;
  dreamReward: string;
  dreamRewardStars: number;
  soundEnabled: boolean;
  dailyTaskTarget: number; // e.g. 3 chores per day -> 90 stars per month
  parentPin?: string; // 4-digit PIN to lock admin settings from kids (default: '1234')
}

export type ChoreCategory =
  | 'kitchen'
  | 'cleaning'
  | 'laundry'
  | 'bedroom'
  | 'pets_plants'
  | 'study'
  | 'custom';

export interface ChoreTask {
  id: string;
  title: string;
  category: ChoreCategory;
  icon: string;
  color: string;
  scheduledTime: string; // e.g. "08:30", "17:00"
  order: number; // queue sequence (1, 2, 3...)
  isDailyRoutine: boolean;
  starsReward: number; // 1 chore = 1 star
  status: 'pending' | 'in_progress' | 'completed';
  completedAt?: string; // ISO date string
  completedTimeFormatted?: string; // e.g. "17:15 น."
  proofPhotoUrl?: string; // base64 canvas image with watermark
  notes?: string;
  createdAt: string;
  alarmAcknowledged?: boolean; // whether child tapped "กดรับภารกิจ"
  lastAlarmTime?: string;
  parentApproved?: boolean;
  parentApprovedAt?: string;
  parentBonusStars?: number;
  parentFeedback?: string;
  shareCode?: string;
  submissionPartStars?: number; // คะแนนส่วนที่ 1 (งานที่ส่ง)
  chatVerifiedPartStars?: number; // คะแนนส่วนที่ 2 (ตรวจงานผ่าน LINE/Messenger)
  chatPlatform?: 'line' | 'messenger';
  isScoreFullyCompleted?: boolean;
}

export interface ChoreLog {
  id: string;
  choreId: string;
  title: string;
  icon: string;
  childName: string;
  timestamp: string; // ISO string
  thaiDateFormatted: string;
  thaiTimeFormatted: string;
  proofPhotoUrl: string;
  starsEarned: number;
  category: ChoreCategory;
  parentApproved?: boolean;
  parentApprovedAt?: string;
  parentBonusStars?: number;
  parentFeedback?: string;
  submissionPartStars?: number;
  chatVerifiedPartStars?: number;
  isScoreFullyCompleted?: boolean;
}

export interface HeroRankInfo {
  level: number;
  title: string;
  badgeEmoji: string;
  minStars: number;
  maxStars: number;
  colorScheme: {
    bg: string;
    border: string;
    text: string;
    progressGradient: string;
  };
  motto: string;
}

export interface WishlistReward {
  id: string;
  title: string;
  requiredStars: number;
  icon: string;
  isClaimed: boolean;
  claimedAt?: string;
}
