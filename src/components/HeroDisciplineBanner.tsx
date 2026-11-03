import React, { useState } from 'react';
import { HeroProfile } from '../types/chore';
import { getHeroRank, HERO_RANKS } from '../utils/ranks';
import { Flame, Award, ChevronRight, Sparkles, X } from 'lucide-react';
import { soundManager } from '../utils/soundEffects';

interface Props {
  profile: HeroProfile;
}

export const HeroDisciplineBanner: React.FC<Props> = ({ profile }) => {
  const [showRanksModal, setShowRanksModal] = useState(false);
  const { currentRank, nextRank, progressPercent, starsToNext } = getHeroRank(profile.totalStars);

  return (
    <>
      <div className="bg-gradient-to-br from-white via-amber-50/50 to-orange-50/40 rounded-3xl p-5 sm:p-6 border border-amber-200/80 shadow-md shadow-amber-900/5 relative overflow-hidden">
        {/* Background playful star sparkles */}
        <div className="absolute -right-8 -top-8 w-36 h-36 bg-amber-200/30 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          {/* Left: Avatar + Current Level & Motto */}
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shadow-md ring-3 ring-amber-400 bg-white">
                <img
                  src={profile.avatarUrl}
                  alt={profile.nickname}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-amber-500 text-white text-xs font-black px-2 py-0.5 rounded-full shadow border-2 border-white flex items-center gap-1 font-display">
                <span>Lv.{currentRank.level}</span>
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
                  {profile.nickname}
                </h1>
                <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-amber-100 text-amber-900 border border-amber-300/60 inline-flex items-center gap-1">
                  <span>{currentRank.badgeEmoji}</span>
                  <span>{currentRank.title}</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                "{currentRank.motto}"
              </p>
            </div>
          </div>

          {/* Right: Discipline Progress Bar & Streak */}
          <div className="flex-1 max-w-xl flex flex-col gap-3">
            {/* Streak & Rank button row */}
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <div className="flex items-center gap-1.5 font-bold text-orange-600 bg-orange-100/80 px-3 py-1 rounded-xl">
                <Flame className="w-4 h-4 fill-orange-500 text-orange-500 animate-bounce" />
                <span>ทำภารกิจต่อเนื่อง {profile.currentStreak} วันติด!</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  soundManager.playStarPop();
                  setShowRanksModal(true);
                }}
                className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1 hover:underline"
              >
                <span>ดูระดับฮีโร่ทั้งหมด</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Discipline Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-baseline text-xs font-bold">
                <span className="text-slate-700 flex items-center gap-1 font-display">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  แถบวัดพลังความสม่ำเสมอ (Discipline Bar)
                </span>
                <span className="text-amber-800">
                  {nextRank
                    ? `ขาดอีก ${starsToNext} ดาวเพื่อเป็น ${nextRank.title}`
                    : 'สุดยอดฮีโร่ระดับสูงสุดแล้ว! 🎉'}
                </span>
              </div>

              {/* Bar track */}
              <div className="w-full h-4 sm:h-5 bg-slate-100 rounded-full p-0.5 border border-amber-200/80 shadow-inner relative overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${currentRank.colorScheme.progressGradient} transition-all duration-700 shadow-sm relative`}
                  style={{ width: `${progressPercent}%` }}
                >
                  {/* Subtle gloss line */}
                  <div className="absolute inset-x-0 top-0 h-1/2 bg-white/30 rounded-t-full" />
                </div>
              </div>

              <div className="flex justify-between items-center text-[11px] text-slate-500 font-medium">
                <span>{currentRank.title} ({currentRank.minStars}★)</span>
                <span className="font-bold text-amber-700">{progressPercent}%</span>
                <span>{nextRank ? `${nextRank.title} (${nextRank.minStars}★)` : 'สูงสุด 🏆'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ranks Modal */}
      {showRanksModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-amber-100 flex flex-col">
            <div className="p-5 bg-gradient-to-r from-amber-400 to-orange-400 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-6 h-6 text-yellow-100" />
                <h3 className="text-lg font-bold font-display">ระดับขั้นฮีโร่งานบ้าน</h3>
              </div>
              <button
                onClick={() => setShowRanksModal(false)}
                className="p-1.5 rounded-xl hover:bg-white/20 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3 overflow-y-auto max-h-[70vh]">
              {HERO_RANKS.map((rank) => {
                const isCurrent = currentRank.level === rank.level;
                const isUnlocked = profile.totalStars >= rank.minStars;

                return (
                  <div
                    key={rank.level}
                    className={`p-3.5 rounded-2xl border-2 transition ${
                      isCurrent
                        ? 'border-amber-500 bg-amber-50/80 shadow-sm'
                        : isUnlocked
                        ? 'border-emerald-200 bg-emerald-50/40'
                        : 'border-slate-100 bg-slate-50/50 opacity-70'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{rank.badgeEmoji}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800 text-sm">
                              ระดับ {rank.level}: {rank.title}
                            </span>
                            {isCurrent && (
                              <span className="text-[10px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full">
                                ระดับปัจจุบัน
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5">
                            {rank.motto}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded-lg">
                          {rank.minStars}+ ดาว
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
                เข้าใจแล้ว พร้อมเก็บดาวเพิ่ม!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
