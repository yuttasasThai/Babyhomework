import React, { useState } from 'react';
import { HeroProfile, WishlistReward } from '../types/chore';
import { Gift, Star, CheckCircle, Plus, Sparkles, RotateCcw, ShieldCheck } from 'lucide-react';
import { soundManager } from '../utils/soundEffects';
import { fireHeroConfetti } from '../utils/confetti';

interface Props {
  profile: HeroProfile;
  rewards: WishlistReward[];
  onClaimReward: (reward: WishlistReward) => void;
  onAddReward?: (newReward: Omit<WishlistReward, 'id' | 'isClaimed'>) => void;
  onResetDailyChores?: () => void;
  isParentMode: boolean;
}

export const ParentRewardsModal: React.FC<Props> = ({
  profile,
  rewards,
  onClaimReward,
  onAddReward,
  onResetDailyChores,
  isParentMode,
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [newStars, setNewStars] = useState(15);
  const [newIcon, setNewIcon] = useState('🎁');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleClaim = (reward: WishlistReward) => {
    if (profile.totalStars < reward.requiredStars) {
      alert(`ยังขาดอีก ${reward.requiredStars - profile.totalStars} ดาวนะคนเก่ง! ลุยทำงานบ้านต่อเพื่อรับรางวัลนี้กันเถอะ ⭐`);
      return;
    }

    const confirm = window.confirm(`คุณต้องการใช้ ${reward.requiredStars} ดาว เพื่อแลก "${reward.title}" ใช่หรือไม่?`);
    if (confirm) {
      fireHeroConfetti();
      soundManager.playLevelUp();
      onClaimReward(reward);
    }
  };

  const handleAddNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !onAddReward) return;

    onAddReward({
      title: newTitle.trim(),
      requiredStars: Number(newStars) || 10,
      icon: newIcon || '🎁',
    });

    setNewTitle('');
    setShowAddForm(false);
    soundManager.playSuccessFanfare();
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-rose-400 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1 text-pink-100 text-xs font-bold uppercase tracking-wider">
              <Gift className="w-4 h-4" />
              <span>ร้านของขวัญและรางวัลฮีโร่</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-display">
              สะสมดาว แลกรางวัลในฝัน!
            </h2>
            <p className="text-pink-100 text-xs sm:text-sm mt-1">
              ทำงานบ้านอย่างตั้งใจ สะสมดาวครบเมื่อไหร่ กดแลกรางวัลกับคุณพ่อคุณแม่ได้เลย
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-center shrink-0">
            <span className="text-xs text-white/90 block font-medium">ดาวพร้อมใช้ของคุณ</span>
            <div className="flex items-center justify-center gap-1.5 text-3xl font-black font-display mt-0.5">
              <span>⭐</span>
              <span>{profile.totalStars}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Parent Mode Actions Bar */}
      {isParentMode && (
        <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-indigo-900 text-xs font-bold">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <span>เมนูผู้ปกครอง (Parent Controls): ปรับแต่งรางวัล หรือรีเซ็ตงานประจำวัน</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มของรางวัลใหม่</span>
            </button>

            {onResetDailyChores && (
              <button
                onClick={() => {
                  if (window.confirm('ต้องการรีเซ็ตสถานะภารกิจประจำวันให้เป็น "รอดำเนินการ" สำหรับวันใหม่ใช่หรือไม่? (ดาวสะสมจะไม่หาย)')) {
                    onResetDailyChores();
                    soundManager.playStarPop();
                  }
                }}
                className="py-2 px-3 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition border border-slate-200 flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4 text-slate-500" />
                <span>รีเซ็ตงานสำหรับวันใหม่</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Add Reward Form for Parents */}
      {showAddForm && (
        <form onSubmit={handleAddNew} className="p-5 rounded-3xl bg-white border-2 border-indigo-200 shadow-md space-y-4 animate-fade-in">
          <h4 className="font-bold text-slate-900 text-sm font-display flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>ตั้งของรางวัลใหม่เพื่อเป็นกำลังใจให้ลูก</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ไอคอนรางวัล</label>
              <input
                type="text"
                value={newIcon}
                onChange={(e) => setNewIcon(e.target.value)}
                maxLength={4}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-center text-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ชื่อของรางวัล</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="เช่น ไปสวนสัตว์, กินบุฟเฟ่ต์"
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">จำนวนดาวที่ต้องใช้</label>
              <input
                type="number"
                min={1}
                max={200}
                value={newStars}
                onChange={(e) => setNewStars(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="py-2 px-4 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="py-2 px-5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition"
            >
              บันทึกรางวัล
            </button>
          </div>
        </form>
      )}

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rewards.map((reward) => {
          const canAfford = profile.totalStars >= reward.requiredStars;

          return (
            <div
              key={reward.id}
              className={`rounded-3xl p-5 border-2 transition relative flex flex-col justify-between ${
                reward.isClaimed
                  ? 'bg-slate-50/80 border-slate-200 opacity-60'
                  : canAfford
                  ? 'bg-white border-amber-300 shadow-md hover:shadow-lg'
                  : 'bg-white border-slate-200/80'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span className="text-4xl">{reward.icon}</span>
                  <div className="flex items-center gap-1 font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200 text-sm font-display">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                    <span>{reward.requiredStars} ดาว</span>
                  </div>
                </div>

                <h3 className="font-bold text-slate-900 text-base font-display mb-1">
                  {reward.title}
                </h3>
                <p className="text-xs text-slate-500">
                  {reward.isClaimed
                    ? 'แลกรับรางวัลนี้ไปแล้ว'
                    : canAfford
                    ? '★ ดาวครบแล้ว! กดแลกรางวัลได้เลย'
                    : `ขาดอีก ${reward.requiredStars - profile.totalStars} ดาว`}
                </p>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100">
                {reward.isClaimed ? (
                  <div className="w-full py-2.5 px-4 rounded-xl bg-slate-100 text-slate-500 font-bold text-xs flex items-center justify-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span>แลกแล้วเรียบร้อย</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleClaim(reward)}
                    disabled={!canAfford}
                    className={`w-full py-3 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition min-h-[44px] font-display ${
                      canAfford
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/25 hover:from-amber-600 hover:to-orange-600 active:scale-98'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <span>🎁 กดแลกรางวัลนี้</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
