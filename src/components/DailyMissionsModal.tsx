import React, { useState } from 'react';
import { ChoreTask, HeroProfile } from '../types/chore';
import { ChoreCard } from './ChoreCard';
import { soundManager } from '../utils/soundEffects';
import { X, Plus, Sparkles, Filter, CheckCircle2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  tasks: ChoreTask[];
  profile: HeroProfile;
  onOpenSubmit: (task: ChoreTask) => void;
  onViewProof: (task: ChoreTask) => void;
  onOpenParentApproval?: (task: ChoreTask) => void;
  onDelete?: (taskId: string) => void;
  onOpenAddChore: () => void;
  onOpenQueueSettings?: () => void;
  isParentMode: boolean;
}

export const DailyMissionsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  tasks,
  profile,
  onOpenSubmit,
  onViewProof,
  onOpenParentApproval,
  onDelete,
  onOpenAddChore,
  onOpenQueueSettings,
  isParentMode,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  if (!isOpen) return null;

  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const pendingCount = tasks.filter((t) => t.status === 'pending').length;

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'pending') return t.status === 'pending';
    if (filter === 'completed') return t.status === 'completed';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-amber-50/90 rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden border-2 border-amber-300 flex flex-col my-auto max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner">
              📜
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black font-display leading-tight">
                ภารกิจงานบ้านประจำวัน (Daily Chore Quests)
              </h3>
              <p className="text-xs text-amber-100">
                ฮีโร่ {profile.nickname} · สำเร็จแล้ว {completedCount}/{tasks.length} งาน
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/20 transition min-h-[40px] min-w-[40px] flex items-center justify-center text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Bar & Add Button */}
        <div className="px-4 py-3 bg-white border-b border-amber-200/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => {
                soundManager.playStarPop();
                setFilter('all');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                filter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              ทั้งหมด ({tasks.length})
            </button>
            <button
              onClick={() => {
                soundManager.playStarPop();
                setFilter('pending');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                filter === 'pending' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              รอทำ ({pendingCount})
            </button>
            <button
              onClick={() => {
                soundManager.playStarPop();
                setFilter('completed');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                filter === 'completed' ? 'bg-emerald-500 text-white shadow-xs' : 'text-slate-600'
              }`}
            >
              สำเร็จแล้ว ({completedCount})
            </button>
          </div>

          <div className="flex items-center gap-2">
            {onOpenQueueSettings && (
              <button
                type="button"
                onClick={() => {
                  soundManager.playStarPop();
                  onOpenQueueSettings();
                }}
                className="py-1.5 px-3 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
                title="ตั้งเวลาเตือนและจัดคิว"
              >
                <span>⏰ จัดคิว & เตือน</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                soundManager.playStarPop();
                onOpenAddChore();
              }}
              className="py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>+ เพิ่มภารกิจ</span>
            </button>
          </div>
        </div>

        {/* Task Cards Grid */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {filteredTasks.length === 0 ? (
            <div className="p-10 text-center bg-white rounded-3xl border border-amber-200 shadow-xs max-w-sm mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-2xl flex items-center justify-center mx-auto mb-2 shadow-xs">
                ✨
              </div>
              <h4 className="font-bold text-slate-800 text-sm font-display">
                ไม่มีรายการภารกิจในหมวดนี้
              </h4>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                คุณสามารถเพิ่มงานบ้านใหม่ให้ฮีโร่ตัวจิ๋วได้ตลอดเวลา
              </p>
              <button
                onClick={onOpenAddChore}
                className="py-2 px-4 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow transition"
              >
                + เพิ่มภารกิจใหม่
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTasks.map((task) => (
                <ChoreCard
                  key={task.id}
                  task={task}
                  onOpenSubmit={(targetTask) => {
                    onClose();
                    onOpenSubmit(targetTask);
                  }}
                  onViewProof={(targetTask) => {
                    onClose();
                    onViewProof(targetTask);
                  }}
                  onOpenParentApproval={(targetTask) => {
                    onClose();
                    if (onOpenParentApproval) onOpenParentApproval(targetTask);
                  }}
                  onDelete={onDelete}
                  isParentMode={isParentMode}
                />
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-white border-t border-amber-200/80 flex items-center justify-between shrink-0 text-xs text-slate-500">
          <span>📸 ถ่ายรูปส่งงานเพื่อประทับเวลาจริงบน Canvas</span>
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
