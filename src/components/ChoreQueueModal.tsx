import React, { useState } from 'react';
import { ChoreTask } from '../types/chore';
import { alarmManager } from '../utils/alarmAudio';
import { soundManager } from '../utils/soundEffects';
import { Clock, ArrowUp, ArrowDown, Volume2, Plus, Check, X, Trash2, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  tasks: ChoreTask[];
  childName: string;
  onUpdateTasks: (updated: ChoreTask[]) => void;
  onOpenAddChore: () => void;
}

export const ChoreQueueModal: React.FC<Props> = ({
  isOpen,
  onClose,
  tasks,
  childName,
  onUpdateTasks,
  onOpenAddChore,
}) => {
  const [taskList, setTaskList] = useState<ChoreTask[]>(tasks);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Move task up in queue
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...taskList];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    const ordered = updated.map((t, idx) => ({ ...t, order: idx + 1 }));
    setTaskList(ordered);
    onUpdateTasks(ordered);
    soundManager.playStarPop();
  };

  // Move task down in queue
  const handleMoveDown = (index: number) => {
    if (index === taskList.length - 1) return;
    const updated = [...taskList];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    const ordered = updated.map((t, idx) => ({ ...t, order: idx + 1 }));
    setTaskList(ordered);
    onUpdateTasks(ordered);
    soundManager.playStarPop();
  };

  // Update time for a task
  const handleUpdateTime = (taskId: string, newTime: string) => {
    const updated = taskList.map((t) => (t.id === taskId ? { ...t, scheduledTime: newTime } : t));
    setTaskList(updated);
    onUpdateTasks(updated);
  };

  // Test speaking alarm voice for a task
  const handleTestAlarm = (task: ChoreTask) => {
    soundManager.playStarPop();
    alarmManager.speakTaskAlarm(task.title, childName);
  };

  // In-app reliable delete with zero reliance on window.confirm
  const handleConfirmDelete = (taskId: string) => {
    const updated = taskList
      .filter((t) => t.id !== taskId)
      .map((t, idx) => ({ ...t, order: idx + 1 }));
    setTaskList(updated);
    onUpdateTasks(updated);
    setConfirmDeleteId(null);
    soundManager.playStarPop();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden border border-amber-200 flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shadow-inner">
              ⏰
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black font-display leading-tight">
                ตั้งค่าจัดลำดับคิว & ลบภารกิจ
              </h3>
              <p className="text-xs text-amber-100">
                จัดคิวเวลาทำภารกิจ และกดปุ่มถังขยะสีแดงเพื่อลบภารกิจได้ทันที ({taskList.length} งาน)
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

        {/* Task List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1 bg-amber-50/40">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-1">
            <span>ลำดับคิว & ภารกิจ</span>
            <span>เวลานัดหมาย / ลบภารกิจ</span>
          </div>

          {taskList.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-amber-300">
              <p className="text-xs text-slate-500 mb-3">ยังไม่มีภารกิจในรายการ</p>
            </div>
          ) : (
            taskList.map((task, index) => (
              <div
                key={task.id}
                className="p-3.5 rounded-2xl bg-white border border-amber-200/80 shadow-xs flex flex-col gap-2 transition hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-2.5">
                  {/* Queue number badge & move buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="w-7 h-7 rounded-xl bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center font-display shadow-xs">
                      #{index + 1}
                    </span>

                    <div className="flex flex-col gap-0.5">
                      <button
                        type="button"
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        className="p-1 rounded-md text-slate-400 hover:text-amber-600 hover:bg-amber-50 disabled:opacity-20 transition"
                        title="เลื่อนคิวขึ้น"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveDown(index)}
                        disabled={index === taskList.length - 1}
                        className="p-1 rounded-md text-slate-400 hover:text-amber-600 hover:bg-amber-50 disabled:opacity-20 transition"
                        title="เลื่อนคิวลง"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Chore Info */}
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-2xl shrink-0">{task.icon}</span>
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate font-display">
                        {task.title}
                      </h4>
                      <span className="text-[10px] sm:text-[11px] text-amber-700 font-semibold block">
                        +1 ดาว ⭐
                      </span>
                    </div>
                  </div>

                  {/* Time Picker, Speech Test & Delete Button */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="flex items-center gap-1 bg-slate-50 px-2 py-1.5 rounded-xl border border-slate-200">
                      <Clock className="w-3 h-3 text-amber-500 shrink-0" />
                      <input
                        type="time"
                        value={task.scheduledTime}
                        onChange={(e) => handleUpdateTime(task.id, e.target.value)}
                        className="font-bold text-xs bg-transparent outline-none w-14 sm:w-16"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleTestAlarm(task)}
                      className="p-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 transition flex items-center gap-1 text-xs font-bold"
                      title="ทดสอบฟังเสียงพูดเตือนภารกิจ"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-amber-700" />
                    </button>

                    {/* Delete Task Button */}
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(confirmDeleteId === task.id ? null : task.id)}
                      className={`p-2 rounded-xl transition flex items-center justify-center ${
                        confirmDeleteId === task.id
                          ? 'bg-rose-600 text-white ring-2 ring-rose-300'
                          : 'bg-rose-50 hover:bg-rose-100 text-rose-600'
                      }`}
                      title="ลบภารกิจนี้ (หากมากเกินไป)"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* In-app Inline Delete Confirmation */}
                {confirmDeleteId === task.id && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between gap-2 animate-fade-in">
                    <span className="text-xs font-bold text-rose-800 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                      <span>ยืนยันลบภารกิจ "{task.title}" ?</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                      >
                        ยกเลิก
                      </button>
                      <button
                        type="button"
                        onClick={() => handleConfirmDelete(task.id)}
                        className="px-3 py-1 rounded-lg text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 shadow-xs"
                      >
                        ลบทันที
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}

          {/* Add chore in queue button */}
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenAddChore();
            }}
            className="w-full py-3 px-4 rounded-2xl border-2 border-dashed border-amber-300 hover:border-amber-400 bg-white/80 hover:bg-white text-amber-800 font-bold text-xs flex items-center justify-center gap-2 transition"
          >
            <Plus className="w-4 h-4" />
            <span>+ เพิ่มภารกิจใหม่เข้าสู่คิว</span>
          </button>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500">
            ระบบจะส่งเสียงเตือนพูดชื่อภารกิจเมื่อถึงเวลา และสามารถลบภารกิจได้ตลอดเวลา
          </span>
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow transition"
          >
            เสร็จสิ้น
          </button>
        </div>
      </div>
    </div>
  );
};
