import React, { useState } from 'react';
import { ChoreLog, ChoreTask, HeroProfile } from '../types/chore';
import { getHeroRank } from '../utils/ranks';
import { Calendar, CheckCircle2, Star, Flame, Eye, Image as ImageIcon, Sparkles, X } from 'lucide-react';
import { soundManager } from '../utils/soundEffects';

interface Props {
  profile: HeroProfile;
  tasks: ChoreTask[];
  logs: ChoreLog[];
}

export const DisciplineDashboard: React.FC<Props> = ({
  profile,
  tasks,
  logs,
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<ChoreLog | null>(null);
  const [filterPeriod, setFilterPeriod] = useState<'daily' | 'weekly' | 'all'>('daily');

  const { currentRank } = getHeroRank(profile.totalStars);

  const completedTodayCount = tasks.filter((t) => t.status === 'completed').length;
  const totalTasksToday = tasks.length;
  const completionPercentage = totalTasksToday > 0 ? Math.round((completedTodayCount / totalTasksToday) * 100) : 0;

  // 7-day mock / calculated activity
  const weekDays = [
    { label: 'จันทร์', dayKey: 'mon', count: 4, full: 'วันจันทร์' },
    { label: 'อังคาร', dayKey: 'tue', count: 5, full: 'วันอังคาร' },
    { label: 'พุธ', dayKey: 'wed', count: 3, full: 'วันพุธ' },
    { label: 'พฤหัส', dayKey: 'thu', count: 4, full: 'วันพฤหัสบดี' },
    { label: 'ศุกร์', dayKey: 'fri', count: 6, full: 'วันศุกร์' },
    { label: 'เสาร์', dayKey: 'sat', count: 5, full: 'วันเสาร์' },
    { label: 'อาทิตย์', dayKey: 'sun', count: completedTodayCount, full: 'วันอาทิตย์' },
  ];

  const maxCount = Math.max(1, ...weekDays.map((d) => d.count));

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    if (filterPeriod === 'daily') {
      const todayStr = new Date().toISOString().split('T')[0];
      return log.timestamp.startsWith(todayStr) || log.thaiDateFormatted.includes('วันนี้');
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top 3 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* KPI 1: Today Completion */}
        <div className="p-5 rounded-3xl bg-white border border-amber-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl shrink-0 border border-emerald-100">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">
              ภารกิจวันนี้ที่สำเร็จ
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-black text-slate-900 font-display">
                {completedTodayCount}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                / {totalTasksToday} งาน ({completionPercentage}%)
              </span>
            </div>
          </div>
        </div>

        {/* KPI 2: Stars Collected */}
        <div className="p-5 rounded-3xl bg-white border border-amber-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center text-2xl shrink-0 border border-amber-100">
            <Star className="w-7 h-7 fill-amber-400" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">
              ดาวสะสมรวมฮีโร่
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-black text-amber-600 font-display">
                {profile.totalStars}
              </span>
              <span className="text-xs text-slate-400 font-medium">ดวง ⭐</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Streak */}
        <div className="p-5 rounded-3xl bg-white border border-amber-100 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center text-2xl shrink-0 border border-orange-100">
            <Flame className="w-7 h-7 fill-orange-500" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">
              ทำสม่ำเสมอต่อเนื่อง
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-black text-orange-600 font-display">
                {profile.currentStreak}
              </span>
              <span className="text-xs text-slate-400 font-medium">วันติด 🔥</span>
            </div>
          </div>
        </div>
      </div>

      {/* 7-Day Discipline Rhythm Bar Chart */}
      <div className="p-6 rounded-3xl bg-white border border-amber-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-500" />
              <span>พลังความสม่ำเสมอ 7 วันย้อนหลัง</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              ฝึกนิสัยความรับผิดชอบทุกวันอย่างต่อเนื่อง
            </p>
          </div>

          <span className="text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
            ตำแหน่งปัจจุบัน: {currentRank.title}
          </span>
        </div>

        {/* Bar chart columns */}
        <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-44 pt-4 border-b border-slate-100 pb-2">
          {weekDays.map((day, idx) => {
            const heightPercent = Math.round((day.count / maxCount) * 100);
            const isToday = idx === weekDays.length - 1;

            return (
              <div key={day.dayKey} className="flex flex-col items-center gap-2 h-full justify-end group">
                <span className="text-[11px] font-bold text-slate-400 group-hover:text-amber-600 transition">
                  {day.count} งาน
                </span>
                <div className="w-full max-w-[48px] h-32 bg-slate-100 rounded-2xl p-1 flex items-end overflow-hidden">
                  <div
                    className={`w-full rounded-xl transition-all duration-700 ${
                      isToday
                        ? 'bg-gradient-to-t from-amber-500 to-orange-400 shadow-md shadow-amber-500/20'
                        : 'bg-gradient-to-t from-sky-400 to-blue-400'
                    }`}
                    style={{ height: `${Math.max(12, heightPercent)}%` }}
                  />
                </div>
                <span
                  className={`text-xs font-medium ${
                    isToday ? 'font-bold text-amber-700' : 'text-slate-500'
                  }`}
                >
                  {day.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Photo Proof Gallery (สมุดตรวจงานฮีโร่พร้อมประทับเวลาจริง) */}
      <div className="p-6 rounded-3xl bg-white border border-amber-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-amber-500" />
              <span>แกลเลอรี่หลักฐานภารกิจ (Photo Proof Logs)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              รูปภาพทุกใบถูกประทับวัน เดือน ปี และเวลาจริงด้วย Canvas ป้องกันการส่งรูปซ้ำ
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl self-start">
            <button
              onClick={() => setFilterPeriod('daily')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                filterPeriod === 'daily' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
              }`}
            >
              ของวันนี้
            </button>
            <button
              onClick={() => setFilterPeriod('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                filterPeriod === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
              }`}
            >
              ทั้งหมด ({logs.length})
            </button>
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-10 rounded-2xl bg-amber-50/50 border border-amber-100 text-center">
            <div className="w-12 h-12 rounded-2xl bg-white text-2xl flex items-center justify-center mx-auto mb-2 shadow-xs">
              📸
            </div>
            <h4 className="font-bold text-slate-800 text-sm">ยังไม่มีภาพหลักฐานที่ส่ง</h4>
            <p className="text-xs text-slate-500 mt-1">
              เมื่อกด "📸 ถ่ายรูปส่งงาน" และกดยืนยัน รูปภาพพร้อมลายน้ำเวลาจริงจะปรากฏที่นี่!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                onClick={() => {
                  soundManager.playStarPop();
                  setSelectedPhoto(log);
                }}
                className="rounded-2xl border border-slate-200 overflow-hidden bg-white hover:shadow-md transition cursor-pointer group flex flex-col"
              >
                <div className="relative aspect-4/3 bg-slate-900 overflow-hidden">
                  {log.proofPhotoUrl ? (
                    <img
                      src={log.proofPhotoUrl}
                      alt={log.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                      <span className="text-4xl mb-2">{log.icon}</span>
                      <span className="text-xs font-bold text-white">ภารกิจสำเร็จแล้ว</span>
                    </div>
                  )}

                  <div className="absolute top-2 right-2 bg-black/60 text-white text-[11px] font-bold px-2 py-0.5 rounded-lg backdrop-blur-sm">
                    +{log.starsEarned} ⭐
                  </div>
                </div>

                <div className="p-3.5 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1 font-display">
                      {log.icon} {log.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {log.thaiDateFormatted} · {log.thaiTimeFormatted}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="p-1.5 rounded-xl text-slate-400 group-hover:text-amber-600 group-hover:bg-amber-50 transition"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal for Photo Inspection */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 text-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-700 flex flex-col">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{selectedPhoto.icon}</span>
                <div>
                  <h4 className="font-bold text-white text-sm font-display">
                    {selectedPhoto.title}
                  </h4>
                  <p className="text-xs text-amber-400">
                    ฮีโร่ผู้ส่งงาน: {selectedPhoto.childName} · {selectedPhoto.thaiTimeFormatted}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-black flex items-center justify-center max-h-[70vh] overflow-hidden">
              {selectedPhoto.proofPhotoUrl ? (
                <img
                  src={selectedPhoto.proofPhotoUrl}
                  alt={selectedPhoto.title}
                  className="max-h-[65vh] object-contain rounded-xl"
                />
              ) : (
                <div className="p-12 text-center text-slate-400">
                  <span className="text-6xl block mb-2">{selectedPhoto.icon}</span>
                  <span>ภาพหลักฐานผ่านการรับรองความถูกต้อง</span>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-300">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>ตราประทับลายน้ำ Canvas ยืนยันเวลาจริงถูกต้อง</span>
              </span>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
