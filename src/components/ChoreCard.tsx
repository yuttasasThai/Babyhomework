import React, { useState } from 'react';
import { ChoreTask } from '../types/chore';
import { Clock, CheckCircle, Camera, Eye, Trash2, AlertCircle } from 'lucide-react';
import { soundManager } from '../utils/soundEffects';

interface Props {
  task: ChoreTask;
  onOpenSubmit: (task: ChoreTask) => void;
  onViewProof: (task: ChoreTask) => void;
  onOpenParentApproval?: (task: ChoreTask) => void;
  onDelete?: (taskId: string) => void;
  isParentMode: boolean;
}

export const ChoreCard: React.FC<Props> = ({
  task,
  onOpenSubmit,
  onViewProof,
  onOpenParentApproval,
  onDelete,
  isParentMode,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const isCompleted = task.status === 'completed';
  const isParentApproved = Boolean(task.parentApproved);

  // Compute time status relative to current time
  const getTimeStatus = () => {
    if (isCompleted) {
      if (isParentApproved) {
        return {
          text: `🏅 พ่อแม่ตรวจแล้ว (+${task.parentBonusStars || 1} ดาว)`,
          color: 'text-emerald-800 bg-emerald-100/80 border-emerald-300 font-bold',
          badge: '✓',
        };
      }
      return {
        text: `เสร็จแล้ว (รอพ่อแม่ตรวจ ⭐)`,
        color: 'text-amber-800 bg-amber-50 border-amber-200',
        badge: '⏳',
      };
    }

    if (!task.scheduledTime) {
      return {
        text: 'ทำได้ตลอดทั้งวัน',
        color: 'text-slate-600 bg-slate-100 border-slate-200',
        badge: '⏰',
      };
    }

    const now = new Date();
    const [hours, minutes] = task.scheduledTime.split(':').map(Number);
    const taskDate = new Date();
    taskDate.setHours(hours, minutes, 0, 0);

    const diffMinutes = Math.round((taskDate.getTime() - now.getTime()) / 60000);

    if (diffMinutes <= 0 && diffMinutes >= -180) {
      return {
        text: 'ถึงเวลาลงมือทำแล้ว! 🚀',
        color: 'text-amber-800 bg-amber-100 border-amber-300 font-bold animate-pulse',
        badge: '⚡',
      };
    } else if (diffMinutes > 0 && diffMinutes <= 60) {
      return {
        text: `ใกล้ถึงเวลา (อีก ${diffMinutes} นาที)`,
        color: 'text-sky-700 bg-sky-50 border-sky-200',
        badge: '⏳',
      };
    } else if (diffMinutes > 60) {
      return {
        text: `นัดเวลา ${task.scheduledTime} น.`,
        color: 'text-slate-600 bg-slate-50 border-slate-200',
        badge: '⏰',
      };
    } else {
      return {
        text: `กำหนดเวลา ${task.scheduledTime} น.`,
        color: 'text-orange-700 bg-orange-50 border-orange-200',
        badge: '⏰',
      };
    }
  };

  const status = getTimeStatus();

  return (
    <div
      className={`rounded-3xl p-5 border-2 transition-all relative overflow-hidden group ${
        isCompleted
          ? 'bg-white/80 border-emerald-200 shadow-xs'
          : 'bg-white border-amber-100/90 shadow-md shadow-amber-900/5 hover:border-amber-300 hover:shadow-lg hover:shadow-amber-900/10'
      }`}
    >
      {/* Top ribbon: Status badge + stars badge + delete */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <span
          className={`text-xs px-2.5 py-1 rounded-xl border flex items-center gap-1.5 transition ${status.color}`}
        >
          <span>{status.badge}</span>
          <span>{status.text}</span>
        </span>

        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-lg flex items-center gap-1 font-display">
            <span>+{task.starsReward}</span>
            <span>⭐</span>
          </span>

          {onDelete && (
            <button
              onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
              className={`p-1.5 rounded-lg transition ${
                showDeleteConfirm
                  ? 'bg-rose-600 text-white'
                  : 'text-slate-400 hover:text-rose-500 hover:bg-rose-50'
              }`}
              title="ลบภารกิจนี้ (หากมากเกินไป)"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Delete confirmation strip */}
      {showDeleteConfirm && onDelete && (
        <div className="mb-3 p-2.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between gap-2 animate-fade-in">
          <span className="text-xs font-bold text-rose-800 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>ลบภารกิจนี้?</span>
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(false)}
              className="px-2 py-1 rounded-lg text-xs font-semibold bg-white text-slate-700 border border-slate-200"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={() => {
                onDelete(task.id);
                setShowDeleteConfirm(false);
              }}
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-600 text-white shadow-xs hover:bg-rose-700"
            >
              ยืนยันลบ
            </button>
          </div>
        </div>
      )}

      {/* Main chore info */}
      <div className="flex items-start gap-3.5 mb-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-3xl shadow-xs shrink-0 group-hover:scale-105 transition-transform">
          {task.icon}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug line-clamp-1 font-display">
            {task.title}
          </h3>
          {task.notes && (
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
              {task.notes}
            </p>
          )}

          <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
            <span className="flex items-center gap-1 font-medium">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>{task.scheduledTime ? `${task.scheduledTime} น.` : 'ไม่ระบุเวลา'}</span>
            </span>
            <span aria-hidden="true">·</span>
            <span>{task.isDailyRoutine ? 'ภารกิจประจำวัน 🔄' : 'ภารกิจพิเศษ ⭐'}</span>
          </div>
        </div>
      </div>

      {/* Action CTA */}
      <div className="pt-2 border-t border-slate-100">
        {isCompleted ? (
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <button
              type="button"
              onClick={() => {
                soundManager.playStarPop();
                onViewProof(task);
              }}
              className="w-full sm:flex-1 py-2.5 px-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition border border-slate-200 min-h-[42px]"
            >
              <Eye className="w-4 h-4 text-slate-500" />
              <span>ดูภาพหลักฐาน</span>
            </button>

            {onOpenParentApproval && (
              <button
                type="button"
                onClick={() => {
                  soundManager.playStarPop();
                  onOpenParentApproval(task);
                }}
                className={`w-full sm:flex-1 py-2.5 px-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition min-h-[42px] ${
                  isParentApproved
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-[#06C755] hover:bg-[#05b34c] text-white shadow-xs'
                }`}
              >
                <span>{isParentApproved ? '🏅 ดูการตรวจ' : '📲 LINE / ตรวจงาน'}</span>
              </button>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              soundManager.playStarPop();
              onOpenSubmit(task);
            }}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 hover:brightness-105 active:scale-98 transition min-h-[46px] font-display"
          >
            <Camera className="w-4 h-4 text-slate-950" />
            <span>📸 ถ่ายรูปส่งงาน</span>
          </button>
        )}
      </div>
    </div>
  );
};
