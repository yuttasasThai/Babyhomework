import React from 'react';
import { ChoreTask, HeroProfile } from '../types/chore';
import { WatermarkResult } from '../utils/watermark';
import { soundManager } from '../utils/soundEffects';
import { Sparkles, Star, Award, CheckCircle2, MessageSquare, Send } from 'lucide-react';
import { shareToLine, shareToMessenger } from '../utils/lineShare';

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

  const handleShareLine = () => {
    soundManager.playStarPop();
    shareToLine(task, profile);
  };

  const handleShareMessenger = () => {
    soundManager.playStarPop();
    shareToMessenger(task, profile);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border-2 border-amber-300 text-center relative flex flex-col max-h-[92vh]">
        {/* Confetti star flare header */}
        <div className="bg-gradient-to-b from-amber-400 via-orange-400 to-rose-400 p-5 text-white relative overflow-hidden shrink-0">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl mb-2 text-3xl shadow-lg ring-4 ring-white/30 animate-pop-star">
            ⭐
          </div>
          <div className="flex items-center justify-center gap-1.5 text-yellow-200 text-xs font-bold uppercase tracking-wider mb-0.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ส่งงานเรียบร้อยแล้ว!</span>
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <h2 className="text-xl font-black tracking-tight font-display">
            สุดยอดมาก {profile.nickname}!
          </h2>
          <p className="text-amber-100 text-xs mt-0.5">
            ได้รับคะแนนส่วนที่ 1 (+1 ดาว) เข้าคลังฮีโร่ทันที!
          </p>
        </div>

        {/* Stamped Photo Proof Card */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 flex-1">
          {watermarkResult && (
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-slate-900">
              <img
                src={watermarkResult.dataUrl}
                alt="Stamped Chore Proof"
                className="w-full max-h-48 object-contain"
              />
              <div className="absolute top-2 left-2 bg-emerald-500/90 text-white text-[11px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 backdrop-blur-sm">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>ประทับตราเวลาจริงเรียบร้อย</span>
              </div>
            </div>
          )}

          {/* 2-Part Scoring Card (Requirement 4) */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-300 text-left space-y-2">
            <div className="flex items-center justify-between border-b border-amber-200/80 pb-1.5">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider font-display">
                ระบบคิดคะแนน 2 ส่วนสมบูรณ์
              </span>
              <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                เต็ม 2 ส่วน
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-white border border-emerald-300 text-emerald-800 shadow-xs">
                <div className="flex items-center gap-1 font-bold text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>ส่วนที่ 1 (งานที่ส่ง)</span>
                </div>
                <p className="font-black text-sm text-emerald-700 mt-1">+1 ดาว (ได้รับแล้ว ✓)</p>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-amber-300 text-amber-800 shadow-xs">
                <div className="flex items-center gap-1 font-bold text-[11px]">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                  <span>ส่วนที่ 2 (ตรวจงาน)</span>
                </div>
                <p className="font-black text-sm text-amber-600 mt-1">+1 ดาว (แชร์ส่งตรวจ)</p>
              </div>
            </div>

            <p className="text-[11px] text-slate-600">
              💡 ส่งงานผ่าน Facebook Messenger หรือ LINE ให้ผู้รับกดดูงาน เพื่อรับคะแนนส่วนที่ 2 อีก 1 ดาวสมบูรณ์
            </p>
          </div>

          {/* Current total */}
          <div className="text-xs text-slate-600 flex items-center justify-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            <span>
              ขณะนี้มีดาวสะสมรวม <strong className="text-amber-600 text-sm">{profile.totalStars}</strong> ดวงแล้ว!
            </span>
          </div>
        </div>

        {/* Footer: Facebook Messenger & LINE Buttons */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 shrink-0 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleShareMessenger}
              className="py-2.5 px-3 rounded-2xl bg-[#0084FF] hover:bg-[#0074e0] text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#0084FF]/25 transition active:scale-95 font-display"
            >
              <Send className="w-3.5 h-3.5" />
              <span>แชร์ Messenger (+1⭐)</span>
            </button>

            <button
              type="button"
              onClick={handleShareLine}
              className="py-2.5 px-3 rounded-2xl bg-[#06C755] hover:bg-[#05b34c] text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-[#06C755]/25 transition active:scale-95 font-display"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>แชร์ LINE (+1⭐)</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              soundManager.playStarPop();
              onClose();
            }}
            className="w-full py-2.5 px-4 rounded-2xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-900 active:scale-98 transition font-display"
          >
            ปิดหน้าต่าง แล้วลุยงานต่อไป 🚀
          </button>
        </div>
      </div>
    </div>
  );
};
