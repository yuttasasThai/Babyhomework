import React from 'react';
import { ChoreTask } from '../types/chore';
import { alarmManager } from '../utils/alarmAudio';
import { soundManager } from '../utils/soundEffects';
import { Bell, Camera, CheckCircle, Volume2, Sparkles, X } from 'lucide-react';

interface Props {
  activeAlarmTask: ChoreTask | null;
  childName: string;
  onAcknowledgeTask: (task: ChoreTask) => void;
  onDismiss: () => void;
}

export const ChoreAlarmBanner: React.FC<Props> = ({
  activeAlarmTask,
  childName,
  onAcknowledgeTask,
  onDismiss,
}) => {
  if (!activeAlarmTask) return null;

  const handleAcceptChore = () => {
    alarmManager.stopAlarm();
    soundManager.playSuccessFanfare();
    onAcknowledgeTask(activeAlarmTask);
  };

  const handleSnoozeOrDismiss = () => {
    alarmManager.stopAlarm();
    onDismiss();
  };

  return (
    <div className="fixed inset-x-3 top-3 sm:top-5 z-50 max-w-xl mx-auto animate-bounce-once">
      <div className="rounded-3xl p-4 sm:p-5 bg-gradient-to-r from-rose-500 via-amber-500 to-orange-500 text-white shadow-2xl border-4 border-white ring-8 ring-amber-400/40 relative overflow-hidden">
        {/* Playful background glows */}
        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/20 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-start justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3">
            {/* Animated ringing alarm icon */}
            <div className="w-12 h-12 rounded-2xl bg-white text-slate-950 flex items-center justify-center text-2xl shadow-lg ring-4 ring-white/30 shrink-0 animate-bounce">
              ⏰
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-yellow-200 text-xs font-bold uppercase tracking-wider">
                <Volume2 className="w-4 h-4 animate-pulse" />
                <span>ถึงเวลานัดหมายทำภารกิจแล้ว!</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black font-display leading-tight text-white mt-0.5">
                {activeAlarmTask.icon} {activeAlarmTask.title}
              </h3>
              <p className="text-xs text-amber-100 mt-0.5">
                น้อง{childName} เสียงเตือนจะดังซ้ำทุก 2 นาที จนกว่าจะกดรับภารกิจนะจ๊ะ!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSnoozeOrDismiss}
            className="p-1 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition shrink-0"
            title="ปิดเสียงชั่วคราว"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Button: กดรับภารกิจ */}
        <div className="mt-4 pt-3 border-t border-white/20 flex flex-col sm:flex-row items-center gap-2 relative z-10">
          <button
            type="button"
            onClick={handleAcceptChore}
            className="w-full sm:flex-1 py-3 px-4 rounded-2xl bg-white hover:bg-amber-50 text-slate-950 font-black text-sm sm:text-base shadow-lg active:scale-98 transition flex items-center justify-center gap-2 font-display"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>✋ กดรับภารกิจ / ถ่ายรูปส่งงานทันที (+1 ⭐)</span>
          </button>

          <button
            type="button"
            onClick={handleSnoozeOrDismiss}
            className="w-full sm:w-auto py-2.5 px-4 rounded-2xl bg-black/25 hover:bg-black/35 text-white font-bold text-xs transition"
          >
            เตือนอีก 2 นาที
          </button>
        </div>
      </div>
    </div>
  );
};
