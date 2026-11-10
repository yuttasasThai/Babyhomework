import React, { useState } from 'react';
import { ChoreTask, HeroProfile } from '../types/chore';
import { shareToLine, shareToMessenger, generateVerificationUrl } from '../utils/lineShare';
import { soundManager } from '../utils/soundEffects';
import { fireHeroConfetti } from '../utils/confetti';
import {
  ShieldCheck,
  Star,
  CheckCircle2,
  Share2,
  Copy,
  Check,
  X,
  MessageCircle,
  Heart,
  Send,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  task: ChoreTask;
  profile: HeroProfile;
  onApproveTask: (taskId: string, bonusStars: number, feedback: string) => void;
}

export const ParentApprovalModal: React.FC<Props> = ({
  isOpen,
  onClose,
  task,
  profile,
  onApproveTask,
}) => {
  const [bonusStars, setBonusStars] = useState<number>(1);
  const [feedback, setFeedback] = useState<string>('เก่งมากเลยลูก สะอาดเรียบร้อยมาก! ❤️');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const isAlreadyApproved = Boolean(task.parentApproved);
  const verifyUrl = generateVerificationUrl(task);

  const handleApprove = () => {
    fireHeroConfetti();
    soundManager.playLevelUp();
    onApproveTask(task.id, bonusStars, feedback);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verifyUrl);
    setCopied(true);
    soundManager.playStarPop();
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendToLine = () => {
    soundManager.playStarPop();
    shareToLine(task, profile);
  };

  const handleSendToMessenger = () => {
    soundManager.playStarPop();
    shareToMessenger(task, profile);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border-2 border-emerald-300 flex flex-col my-auto max-h-[95vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shadow-inner">
              <ShieldCheck className="w-6 h-6 text-emerald-100" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-display leading-tight">
                บัตรตรวจงานสำหรับคุณพ่อคุณแม่
              </h3>
              <p className="text-xs text-emerald-100 mt-0.5">
                ตรวจหลักฐานรูปถ่าย & ให้ดาวโบนัสพิเศษกับลูก
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/20 transition min-h-[40px] min-w-[40px] flex items-center justify-center text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Stamped photo proof */}
          <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 shadow-sm relative">
            {task.proofPhotoUrl ? (
              <img
                src={task.proofPhotoUrl}
                alt={task.title}
                className="w-full max-h-64 object-contain"
              />
            ) : (
              <div className="p-10 text-center text-slate-400">
                <span className="text-5xl block mb-2">{task.icon}</span>
                <span className="text-sm font-medium text-white">
                  {task.title} (สถานะ: เสร็จสิ้นแล้ว)
                </span>
              </div>
            )}

            <div className="absolute top-2.5 left-2.5 bg-slate-900/80 backdrop-blur-md text-amber-300 text-[11px] font-bold px-2.5 py-1 rounded-xl flex items-center gap-1.5 border border-amber-500/30">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>ภาพประทับตราวันเวลาจริง</span>
            </div>
          </div>

          {/* Chore & Child Info */}
          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{task.icon}</span>
              <div>
                <h4 className="font-bold text-slate-900 text-sm font-display">
                  {task.title}
                </h4>
                <p className="text-xs text-slate-600">
                  ฮีโร่ผู้ส่ง: <strong className="text-slate-800">{profile.nickname}</strong> · ส่งเวลา {task.completedTimeFormatted || 'เวลานี้'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-amber-700 bg-white px-2.5 py-1 rounded-xl border border-amber-200 shadow-xs inline-block">
                ดาวพื้นฐาน +{task.starsReward} ⭐
              </span>
            </div>
          </div>

          {/* Two-part scoring badge */}
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-left space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-900 font-display">
                ระบบคิดคะแนน 2 ส่วนสมบูรณ์
              </span>
              <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                ส่วนที่ 1 + ส่วนที่ 2
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-xl bg-white border border-emerald-300 text-emerald-800">
                <span className="font-bold text-[11px] block">✓ ส่วนที่ 1: งานที่ส่ง</span>
                <span className="font-bold text-xs text-emerald-600">+1 ดาว (สำเร็จแล้ว)</span>
              </div>
              <div className="p-2 rounded-xl bg-white border border-amber-300 text-amber-800">
                <span className="font-bold text-[11px] block">⭐ ส่วนที่ 2: ตรวจงาน</span>
                <span className="font-bold text-xs text-amber-600">
                  {isAlreadyApproved ? '+1 ดาว (ตรวจแล้ว ✓)' : '+1 ดาว (รอกดรับรอง)'}
                </span>
              </div>
            </div>
          </div>

          {/* Verification Status Card */}
          {isAlreadyApproved ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-center space-y-2 animate-fade-in">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500 text-white shadow-sm">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <h4 className="font-bold text-emerald-900 text-base font-display">
                ตรวจรับงานและมอบคะแนนสมบูรณ์ครบ 2 ส่วนแล้ว! 🏅
              </h4>
              <p className="text-xs text-emerald-700">
                ได้รับคะแนนส่งงาน (+1 ดาว) และคะแนนตรวจงาน <strong className="font-bold">+{task.parentBonusStars || 1} ดาว</strong> รวมเป็นคะแนนเต็ม! ⭐⭐
              </p>
              {task.parentFeedback && (
                <div className="p-2.5 rounded-xl bg-white/80 border border-emerald-200 text-xs text-emerald-800 italic mt-1">
                  "{task.parentFeedback}"
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                  <span>มอบคะแนนส่วนที่ 2 ให้ลูก (+1 ดาวสมบูรณ์):</span>
                </label>
              </div>

              {/* Praise message input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                  <span>คำชมจากคุณพ่อคุณแม่ / ผู้ตรวจงาน:</span>
                </label>
                <input
                  type="text"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="พิมพ์คำชมเชยเพื่อสร้างกำลังใจให้ลูก"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs outline-none focus:border-emerald-500 bg-white"
                />
              </div>

              {/* Main Approve Button */}
              <button
                type="button"
                onClick={handleApprove}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white font-black text-sm shadow-lg shadow-emerald-600/25 hover:brightness-105 active:scale-98 transition flex items-center justify-center gap-2 font-display min-h-[48px]"
              >
                <span>⭐ ตอบรับตรวจงาน & มอบคะแนนส่วนที่ 2 (+1 ดาว)</span>
              </button>
            </div>
          )}

          {/* Social Sharing Section (Facebook Messenger & LINE) */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Share2 className="w-4 h-4 text-indigo-600" />
                <span>แชร์ส่งต่อให้ผู้รับตรวจงาน</span>
              </span>
              <span className="text-[10px] text-slate-500">Facebook Messenger หรือ LINE</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleSendToMessenger}
                className="py-2.5 px-3 rounded-xl bg-[#0084FF] hover:bg-[#0074e0] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>แชร์ Messenger</span>
              </button>

              <button
                type="button"
                onClick={handleSendToLine}
                className="py-2.5 px-3 rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>แชร์ LINE</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleCopyLink}
              className="w-full py-2 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 flex items-center justify-center gap-1.5 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'คัดลอกลิงก์ตรวจงานแล้ว!' : 'คัดลอกลิงก์ตรวจงาน'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-6 rounded-xl text-slate-600 hover:text-slate-900 font-bold text-xs"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
