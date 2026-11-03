import React from 'react';
import { ChoreTask, HeroProfile } from '../types/chore';
import { WatermarkResult } from '../utils/watermark';
import { soundManager } from '../utils/soundEffects';
import { Sparkles, Star, Award, CheckCircle2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  task: ChoreTask;
  profile: HeroProfile;
  watermarkResult: WatermarkResult | null;
  onOpenParentApproval?: (task: ChoreTask) => void;
}

export const VictoryModal: React.FC<Props> = ({
  isOpen,
  onClose,
  task,
  profile,
  watermarkResult,
  onOpenParentApproval,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border-2 border-amber-300 text-center relative flex flex-col max-h-[90vh]">
        {/* Confetti star flare header */}
        <div className="bg-gradient-to-b from-amber-400 via-orange-400 to-rose-400 p-6 text-white relative overflow-hidden shrink-0">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl mb-3 text-4xl shadow-lg ring-4 ring-white/30 animate-pop-star">
            ⭐
          </div>
          <div className="flex items-center justify-center gap-1.5 text-yellow-200 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>ภารกิจสำเร็จเรียบร้อย!</span>
            <Sparkles className="w-4 h-4" />
          </div>
          <h2 className="text-2xl font-black tracking-tight font-display">
            สุดยอดมาก {profile.nickname}!
          </h2>
          <p className="text-amber-100 text-xs mt-1">
            ได้รับ +{task.starsReward} ดาวสะสมเข้าคลังฮีโร่ทันที!
          </p>
        </div>

        {/* Stamped Photo Proof Card */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {watermarkResult && (
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-slate-900">
              <img
                src={watermarkResult.dataUrl}
                alt="Stamped Chore Proof"
                className="w-full max-h-56 object-contain"
              />
              <div className="absolute top-2 left-2 bg-emerald-500/90 text-white text-[11px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 backdrop-blur-sm">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>ประทับตราเวลาจริงเรียบร้อย</span>
              </div>
            </div>
          )}

          {/* Chore details banner */}
          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-left">
              <span className="text-3xl">{task.icon}</span>
              <div>
                <h4 className="font-bold text-slate-800 text-sm font-display">
                  {task.title}
                </h4>
                <p className="text-xs text-slate-500">
                  เวลาส่งงาน: {watermarkResult?.thaiTimeFormatted || 'เวลานี้'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 font-black text-amber-600 bg-white px-2.5 py-1.5 rounded-xl border border-amber-200 shadow-xs font-display">
              <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
              <span>+{task.starsReward}</span>
            </div>
          </div>

          {/* Current total */}
          <div className="text-xs text-slate-600 flex items-center justify-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            <span>
              ขณะนี้มีดาวสะสมรวม <strong className="text-amber-600 text-sm">{profile.totalStars}</strong> ดวงแล้ว!
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 shrink-0 space-y-2">
          {onOpenParentApproval && (
            <button
              type="button"
              onClick={() => {
                soundManager.playStarPop();
                onOpenParentApproval(task);
              }}
              className="w-full py-3 px-4 rounded-2xl bg-[#06C755] hover:bg-[#05b34c] text-white font-black text-sm flex items-center justify-center gap-2 shadow-md shadow-[#06C755]/25 transition font-display"
            >
              <span>📲 ส่งเข้า LINE พ่อแม่เพื่อตรวจงาน & รับดาวเพิ่ม ⭐</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              soundManager.playStarPop();
              onClose();
            }}
            className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-sm shadow-md shadow-amber-500/25 hover:from-amber-600 hover:to-orange-600 active:scale-98 transition font-display"
          >
            รับดาวสะสม แล้วลุยงานต่อไป! 🚀
          </button>
        </div>
      </div>
    </div>
  );
};
