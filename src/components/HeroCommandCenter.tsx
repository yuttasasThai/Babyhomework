import React, { useState } from 'react';
import { ChoreTask, HeroProfile } from '../types/chore';
import { getHeroRank, HERO_RANKS } from '../utils/ranks';
import { Award, PlusCircle, Settings, ChevronRight, Sparkles, UserCheck, Flame, X, Star } from 'lucide-react';
import { soundManager } from '../utils/soundEffects';

interface Props {
  profile: HeroProfile;
  tasks: ChoreTask[];
  onOpenProfile: () => void;
  onOpenManageChores: () => void;
  onOpenDailyMissions: () => void;
  onOpenQueueSettings?: () => void;
}

export const HeroCommandCenter: React.FC<Props> = ({
  profile,
  tasks,
  onOpenProfile,
  onOpenManageChores,
  onOpenDailyMissions,
  onOpenQueueSettings,
}) => {
  const [showRanksModal, setShowRanksModal] = useState(false);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate(); // e.g. 30

  // Calculate Rank and Monthly Progress based on 30-day monthly stars
  const { currentRank, nextRank, progressPercent, starsToNext, monthlyScore, monthlyTarget } = getHeroRank(
    profile.totalStars,
    daysInMonth
  );

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-6 border-2 border-amber-200/90 shadow-lg shadow-amber-900/5 space-y-5">
      {/* Top Banner Title */}
      <div className="flex items-center justify-between border-b border-amber-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{currentRank.badgeEmoji}</span>
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 font-display leading-tight">
              ศูนย์บัญชาการฮีโร่ตัวจิ๋ว (Hero Command Center)
            </h3>
            <p className="text-xs text-slate-500">
              ระบบคะแนนดาวสะสมประจำเดือน (เป้าหมายเต็ม {monthlyTarget} ดาว)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-orange-600 bg-orange-100/80 px-2.5 py-1 rounded-xl">
          <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
          <span>ทำต่อเนื่อง {profile.currentStreak} วัน!</span>
        </div>
      </div>

      {/* Grid Layout containing Profile and Monthly Rank Level */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* =========================================
            ELEMENT 1: รูปโปรไฟล์ (Profile Avatar & Nickname)
            ========================================= */}
        <div className="lg:col-span-4 bg-gradient-to-br from-amber-50 to-orange-50/60 rounded-2xl p-4 border border-amber-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {/* Avatar image with level badge */}
            <div className="relative shrink-0">
              <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden ring-4 ring-amber-400 bg-white shadow-md">
                <img
                  src={profile.avatarUrl}
                  alt={profile.nickname}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-1.5 -right-1.5 bg-amber-500 text-white text-[11px] font-black px-2 py-0.5 rounded-full shadow border-2 border-white font-display">
                Lv.{currentRank.level}
              </div>
            </div>

            {/* Child Nickname & Details */}
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-lg font-black text-slate-900 font-display line-clamp-1">
                  {profile.nickname}
                </h4>
                <UserCheck className="w-4 h-4 text-amber-500 shrink-0" />
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-base">{currentRank.badgeEmoji}</span>
                <span className="text-xs font-bold text-amber-800 line-clamp-1">
                  {currentRank.title}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs font-black text-amber-600 font-display mt-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                <span>{profile.totalStars} / {monthlyTarget} ดาวประจำเดือน</span>
              </div>
            </div>
          </div>

          {/* Edit Profile Button */}
          <button
            type="button"
            onClick={() => {
              soundManager.playStarPop();
              onOpenProfile();
            }}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white hover:bg-amber-100 text-slate-700 font-bold text-xs border border-amber-200 shadow-xs transition flex items-center gap-1 shrink-0"
            title="เปลี่ยนรูปหรือชื่อโปรไฟล์"
          >
            <Settings className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">แก้ไข</span>
          </button>
        </div>

        {/* =========================================
            ELEMENT 2: แถบบอกระดับคะแนนดาวสะสม (Hero Rank Bar)
            คิดจากดาวสะสมเต็ม 30 วันใน 1 เดือน
            ========================================= */}
        <div className="lg:col-span-8 bg-gradient-to-br from-amber-50/80 via-white to-orange-50/60 rounded-2xl p-4 border border-amber-200 flex flex-col justify-between gap-3">
          {/* Header of rank bar */}
          <div className="flex items-center justify-between text-xs font-bold">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-amber-100 text-lg leading-none">
                {currentRank.badgeEmoji}
              </span>
              <div>
                <span className="text-slate-500 text-[11px] block">ระดับคะแนนสะสมปัจจุบัน:</span>
                <span className="text-slate-900 font-black text-sm font-display">
                  {currentRank.title} (ขั้นที่ {currentRank.level}/6)
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                soundManager.playStarPop();
                setShowRanksModal(true);
              }}
              className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 hover:underline bg-white px-2.5 py-1 rounded-xl border border-amber-200 shadow-xs"
            >
              <span>ดูตารางระดับ 30 ดาว</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Monthly 30-Day Star Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-baseline text-xs font-bold">
              <span className="text-slate-700 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>ความคืบหน้าระดับเดือนนี้ ({profile.totalStars} จาก {monthlyTarget} ดาว)</span>
              </span>
              <span className="text-amber-800 font-black font-display text-sm">
                {progressPercent}%
              </span>
            </div>

            {/* Bar Track */}
            <div className="w-full h-5 bg-amber-100/90 rounded-full p-0.5 border border-amber-300 shadow-inner relative overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${currentRank.colorScheme.progressGradient} transition-all duration-700 shadow-sm relative`}
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute inset-x-0 top-0 h-1/2 bg-white/40 rounded-t-full" />
              </div>
            </div>

            {/* Scale Labels */}
            <div className="flex justify-between items-center text-[11px] text-slate-600 font-medium">
              <span>เด็กขยัน (1★)</span>
              <span>ผู้พิชิต (7★)</span>
              <span>พ่อบ้าน 1 (11★)</span>
              <span>พ่อบ้าน 2 (16★)</span>
              <span>พ่อบ้าน 3 (23★)</span>
              <span className="font-bold text-amber-700">แชมเปี้ยน 🏆 (30★)</span>
            </div>
          </div>

          {/* Motto / Next goal caption */}
          <div className="flex items-center justify-between text-xs pt-1 border-t border-amber-100">
            <span className="text-slate-500 italic">
              "{currentRank.motto}"
            </span>
            <span className="font-bold text-amber-700 shrink-0">
              {nextRank
                ? `ขาดอีก ${starsToNext} ดาว เพื่อเลื่อนขั้นสู่ "${nextRank.title}"`
                : 'ยินดีด้วย! คุณคือแชมป์เปี่ยนพ่อบ้านจิ๋วสูงสุดแล้ว! 🏆'}
            </span>
          </div>
        </div>
      </div>

      {/* =========================================
          ELEMENT 3: ปุ่ม ปรับ/เพิ่มภารกิจ & จัดคิวเตือน
          ========================================= */}
      <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
        {/* Main Requested Button: ปรับ/เพิ่มภารกิจ */}
        <button
          type="button"
          onClick={() => {
            soundManager.playStarPop();
            onOpenManageChores();
          }}
          className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 font-display active:scale-98 min-h-[48px]"
        >
          <PlusCircle className="w-4 h-4 text-amber-400" />
          <span>⚙️ ปรับ / + เพิ่มภารกิจ</span>
        </button>

        {/* Queue & Alarm Button */}
        {onOpenQueueSettings && (
          <button
            type="button"
            onClick={() => {
              soundManager.playStarPop();
              onOpenQueueSettings();
            }}
            className="w-full sm:w-auto py-3 px-4 rounded-2xl bg-white hover:bg-amber-50 text-slate-800 font-bold text-xs sm:text-sm border-2 border-amber-300 shadow-xs transition flex items-center justify-center gap-2 font-display active:scale-98 min-h-[48px]"
          >
            <span>⏰ จัดคิว & เวลาเตือน</span>
          </button>
        )}

        {/* Action: เปิดหน้าต่างภารกิจประจำวัน */}
        <button
          type="button"
          onClick={() => {
            soundManager.playSuccessFanfare();
            onOpenDailyMissions();
          }}
          className="w-full sm:w-auto py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-slate-950 font-black text-xs sm:text-sm shadow-md shadow-amber-500/25 hover:brightness-110 active:scale-98 transition flex items-center justify-center gap-2 font-display min-h-[48px] shrink-0"
        >
          <Sparkles className="w-4 h-4 text-slate-950" />
          <span>📜 ตรวจดู & ถ่ายรูปส่งงาน ({completedTasks}/{totalTasks})</span>
        </button>
      </div>

      {/* Monthly Ranks Modal (บันได 6 ขั้นสู่แชมป์เปี่ยน 30 ดาว) */}
      {showRanksModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-amber-100 flex flex-col">
            <div className="p-5 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Award className="w-6 h-6 text-yellow-100" />
                <div>
                  <h3 className="text-lg font-bold font-display leading-tight">
                    ระดับขั้นฮีโร่คะแนนเต็ม {monthlyTarget} ดาว
                  </h3>
                  <p className="text-xs text-amber-100">
                    สะสมดาวทุกวันใน 1 เดือน เพื่อพิชิตตำแหน่งสูงสุด
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowRanksModal(false)}
                className="p-1.5 rounded-xl hover:bg-white/20 transition text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-2.5 overflow-y-auto max-h-[70vh]">
              {HERO_RANKS.map((rank) => {
                const isCurrent = currentRank.level === rank.level;
                const isUnlocked = profile.totalStars >= rank.minStars;

                return (
                  <div
                    key={rank.level}
                    className={`p-3 rounded-2xl border-2 transition ${
                      isCurrent
                        ? 'border-amber-500 bg-amber-50/80 shadow-md ring-2 ring-amber-300'
                        : isUnlocked
                        ? 'border-emerald-200 bg-emerald-50/40'
                        : 'border-slate-100 bg-slate-50/50 opacity-70'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{rank.badgeEmoji}</span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-800 text-xs sm:text-sm">
                              {rank.title}
                            </span>
                            {isCurrent && (
                              <span className="text-[10px] font-bold bg-amber-500 text-white px-2 py-0.2 rounded-full">
                                ระดับปัจจุบัน
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5">
                            {rank.motto}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-black text-amber-700 bg-amber-100 px-2.5 py-1 rounded-xl border border-amber-200">
                          {rank.minStars}{rank.maxStars < 9999 ? ` - ${rank.maxStars}` : '+'} ดาว ⭐
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
              <button
                onClick={() => setShowRanksModal(false)}
                className="w-full py-2.5 px-4 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition"
              >
                เข้าใจแล้ว พร้อมพิชิต 30 ดาว!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
