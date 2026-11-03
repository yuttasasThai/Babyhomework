import React, { useState } from 'react';
import { ChoreTask } from '../types/chore';
import { PRESET_CHORES } from '../utils/storage';
import { soundManager } from '../utils/soundEffects';
import { PlusCircle, Clock, Sparkles, X, Check } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAddChore: (newChore: Omit<ChoreTask, 'id' | 'createdAt' | 'status'>) => void;
}

export const AddChoreModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onAddChore,
}) => {
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number | null>(0);
  const [title, setTitle] = useState(PRESET_CHORES[0].title);
  const [icon, setIcon] = useState(PRESET_CHORES[0].icon);
  const [scheduledTime, setScheduledTime] = useState(PRESET_CHORES[0].defaultTime);
  const [starsReward, setStarsReward] = useState<number>(1);
  const [isDailyRoutine, setIsDailyRoutine] = useState<boolean>(true);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSelectPreset = (preset: (typeof PRESET_CHORES)[0], index: number) => {
    setSelectedPresetIndex(index);
    setTitle(preset.title);
    setIcon(preset.icon);
    setScheduledTime(preset.defaultTime);
    soundManager.playStarPop();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddChore({
      title: title.trim(),
      category: 'custom',
      icon: icon || '⭐',
      color: 'amber',
      scheduledTime: scheduledTime || '12:00',
      order: 99,
      isDailyRoutine,
      starsReward: 1, // 1 chore = 1 star
      notes: notes.trim() || undefined,
    });

    soundManager.playSuccessFanfare();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-amber-100 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-xl">
              ✨
            </div>
            <div>
              <h3 className="text-lg font-bold font-display">เพิ่มภารกิจงานบ้านใหม่</h3>
              <p className="text-xs text-amber-50">เลือกจากไอคอนการ์ตูน หรือพิมพ์งานพิเศษได้เลย</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/20 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Quick preset chore grid */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              เลือกจากหมวดหมู่น่ารักยอดฮิต
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {PRESET_CHORES.map((preset, idx) => {
                const isSelected = selectedPresetIndex === idx && title === preset.title;
                return (
                  <button
                    key={preset.title}
                    type="button"
                    onClick={() => handleSelectPreset(preset, idx)}
                    className={`p-2 rounded-2xl border-2 flex flex-col items-center justify-center transition text-center min-h-[64px] ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50 shadow-xs ring-2 ring-amber-300'
                        : 'border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-200'
                    }`}
                  >
                    <span className="text-2xl mb-0.5">{preset.icon}</span>
                    <span className="text-xs font-bold text-slate-800 line-clamp-1">
                      {preset.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chore Name & Custom Emoji */}
          <div className="grid grid-cols-4 gap-3">
            <div className="col-span-1">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ไอคอน
              </label>
              <input
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                maxLength={4}
                className="w-full py-2.5 px-3 rounded-2xl border-2 border-slate-200 text-center text-xl outline-none focus:border-amber-400"
              />
            </div>
            <div className="col-span-3">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ชื่องานบ้าน / ภารกิจ <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setSelectedPresetIndex(null);
                }}
                placeholder="เช่น ล้างจาน, กวาดบ้าน, ให้อาหารแมว"
                required
                className="w-full py-2.5 px-4 rounded-2xl border-2 border-slate-200 outline-none focus:border-amber-400 font-medium text-sm"
              />
            </div>
          </div>

          {/* Scheduler Time Picker */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>กำหนดเวลาลงมือทำ (Scheduler)</span>
              </label>
              <span className="text-[11px] text-slate-500">ฝึกตรงต่อเวลา</span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="px-4 py-2.5 rounded-2xl border-2 border-slate-200 text-base font-bold text-slate-800 outline-none focus:border-amber-400"
              />
              <div className="flex flex-wrap gap-1.5">
                {['08:30', '12:00', '16:30', '17:00', '18:30'].map((timePreset) => (
                  <button
                    key={timePreset}
                    type="button"
                    onClick={() => {
                      setScheduledTime(timePreset);
                      soundManager.playStarPop();
                    }}
                    className={`px-2.5 py-1 rounded-xl text-xs font-medium border transition ${
                      scheduledTime === timePreset
                        ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {timePreset} น.
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Stars & Routine */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                รางวัลดาวที่ได้รับ ⭐
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStarsReward(s)}
                    className={`flex-1 py-2 rounded-xl border-2 font-bold text-xs flex items-center justify-center gap-1 transition ${
                      starsReward === s
                        ? 'border-amber-500 bg-amber-50 text-amber-900 shadow-xs ring-2 ring-amber-300'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>+{s}</span>
                    <span>⭐</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                ประเภทภารกิจ
              </label>
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsDailyRoutine(true)}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition ${
                    isDailyRoutine ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  ทุกวัน 🔄
                </button>
                <button
                  type="button"
                  onClick={() => setIsDailyRoutine(false)}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition ${
                    !isDailyRoutine ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  ครั้งเดียว 🎯
                </button>
              </div>
            </div>
          </div>

          {/* Notes for kids */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              คำแนะนำเพิ่มเติม (ให้เด็กๆ อ่าน)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="เช่น เก็บจานให้ระวังแตก, ซาวข้าว 2 ครั้ง"
              className="w-full py-2.5 px-4 rounded-2xl border-2 border-slate-200 text-xs outline-none focus:border-amber-400 font-medium"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-2xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-sm shadow-lg shadow-amber-500/25 hover:from-amber-600 hover:to-orange-600 transition flex items-center justify-center gap-2 font-display"
            >
              <PlusCircle className="w-4 h-4" />
              <span>บันทึกภารกิจ</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
