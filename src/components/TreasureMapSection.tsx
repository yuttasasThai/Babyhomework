import React, { useState } from 'react';
import { ChoreTask, HeroProfile } from '../types/chore';
import { soundManager } from '../utils/soundEffects';
import { CheckCircle2, Lock, Sparkles, AlertCircle, ChevronRight, Calendar } from 'lucide-react';

interface Props {
  profile: HeroProfile;
  tasks: ChoreTask[];
  onOpenDailyMissions: () => void;
  onSelectTaskToSubmit?: (task: ChoreTask) => void;
}

const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

export const TreasureMapSection: React.FC<Props> = ({
  profile,
  tasks,
  onOpenDailyMissions,
}) => {
  const [lockedNotice, setLockedNotice] = useState<string | null>(null);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const todayDate = now.getDate();
  const thaiMonthName = THAI_MONTHS[currentMonth];
  const buddhistYear = currentYear + 543;

  // Number of days in the current month (e.g. 30 in November)
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Completed chores today
  const completedTodayCount = tasks.filter((t) => t.status === 'completed').length;
  const isTodayCompleted = tasks.length > 0 && completedTodayCount === tasks.length;

  // 30 milestone coordinates mapped smoothly along the winding adventure road
  // Path flows: Village Start (bottom-left) -> Sunny Woods (mid-left) -> Adventure Fort (top-center)
  // -> River Crossing (mid-center) -> Whimsy Town (bottom-right) -> Misty Meadows (mid-right) -> Treasure Castle (top-right)
  const mapCoordinates: Array<{ top: string; left: string }> = [
    { top: '88%', left: '16%' }, // Day 1: Village Start
    { top: '83%', left: '23%' }, // Day 2
    { top: '78%', left: '31%' }, // Day 3
    { top: '69%', left: '34%' }, // Day 4
    { top: '60%', left: '31%' }, // Day 5: Playful Park
    { top: '53%', left: '22%' }, // Day 6
    { top: '44%', left: '18%' }, // Day 7
    { top: '35%', left: '21%' }, // Day 8: Sunny Woods
    { top: '30%', left: '29%' }, // Day 9
    { top: '33%', left: '38%' }, // Day 10
    { top: '40%', left: '44%' }, // Day 11: Adventure Fort
    { top: '48%', left: '49%' }, // Day 12
    { top: '56%', left: '53%' }, // Day 13: River Crossing
    { top: '64%', left: '55%' }, // Day 14
    { top: '74%', left: '52%' }, // Day 15
    { top: '82%', left: '55%' }, // Day 16
    { top: '86%', left: '62%' }, // Day 17
    { top: '81%', left: '70%' }, // Day 18: Whimsy Town
    { top: '72%', left: '75%' }, // Day 19
    { top: '62%', left: '72%' }, // Day 20
    { top: '53%', left: '65%' }, // Day 21
    { top: '44%', left: '63%' }, // Day 22
    { top: '35%', left: '66%' }, // Day 23: Misty Meadows
    { top: '38%', left: '75%' }, // Day 24
    { top: '45%', left: '80%' }, // Day 25
    { top: '54%', left: '84%' }, // Day 26
    { top: '64%', left: '88%' }, // Day 27
    { top: '52%', left: '92%' }, // Day 28
    { top: '40%', left: '89%' }, // Day 29
    { top: '28%', left: '85%' }, // Day 30: Treasure Castle
    { top: '20%', left: '87%' }, // Day 31 (if month has 31 days)
  ];

  const handleDateClick = (dayNum: number) => {
    soundManager.playStarPop();

    if (dayNum === todayDate) {
      // Current day: Open Daily Missions
      setLockedNotice(null);
      onOpenDailyMissions();
    } else if (dayNum < todayDate) {
      // Past day: Cannot do retroactively
      setLockedNotice(
        `วันที่ ${dayNum} ${thaiMonthName} เลยเวลามาแล้วนะคนเก่ง ⏰ ตามกฎแล้วไม่สามารถย้อนไปทำได้ ต้องทำวันปัจจุบัน (วันที่ ${todayDate}) เท่านั้นจ้า!`
      );
    } else {
      // Future day: Cannot do in advance
      setLockedNotice(
        `วันที่ ${dayNum} ${thaiMonthName} ยังมาไม่ถึงนะจ๊ะ ⏳ รอถึงวันก่อนแล้วค่อยมาพิชิตภารกิจไปด้วยกันนะ!`
      );
    }
  };

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="space-y-3">
      {/* Map Container */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-300 bg-amber-100 group">
        {/* Top Adventure Banner */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 px-4 sm:px-6 py-3 text-white flex items-center justify-between shadow-md z-20 relative">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner shrink-0">
              🗺️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black font-display tracking-tight leading-tight">
                  ลายแทงผจญภัยประจำเดือน {thaiMonthName} {buddhistYear}
                </h2>
                <span className="text-[10px] font-bold bg-white/25 px-2 py-0.5 rounded-full border border-white/30 hidden sm:inline">
                  เต็มเดือน {daysInMonth} วัน
                </span>
              </div>
              <p className="text-xs text-amber-100 mt-0.5">
                แตะที่ปุ่ม <strong className="text-yellow-200">"วันที่ {todayDate}"</strong> เพื่อเปิดภารกิจประจำวัน และถ่ายรูปส่งงาน
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              soundManager.playSuccessFanfare();
              onOpenDailyMissions();
            }}
            className="py-2 px-3.5 sm:px-4 bg-white text-slate-900 font-black text-xs sm:text-sm rounded-2xl shadow-md hover:bg-amber-50 transition flex items-center gap-1.5 font-display shrink-0 active:scale-95 border border-amber-200"
          >
            <span>📜 เปิดภารกิจวันนี้ ({completedTodayCount}/{tasks.length})</span>
            <ChevronRight className="w-4 h-4 text-amber-600" />
          </button>
        </div>

        {/* Locked Notice Alert Popup (if clicked on past or future date) */}
        {lockedNotice && (
          <div className="absolute top-16 inset-x-4 sm:inset-x-12 z-30 p-3.5 rounded-2xl bg-slate-950/90 text-white backdrop-blur-md border border-amber-400 shadow-xl flex items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
              <p className="text-xs sm:text-sm font-medium leading-relaxed">
                {lockedNotice}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setLockedNotice(null);
                  onOpenDailyMissions();
                }}
                className="py-1 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow transition"
              >
                ไปทำวันนี้
              </button>
              <button
                type="button"
                onClick={() => setLockedNotice(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Interactive Map Visual Area */}
        <div className="relative w-full aspect-16/9 sm:aspect-21/9 min-h-[340px] sm:min-h-[440px] bg-slate-900 overflow-hidden select-none">
          {/* Treasure Map Artwork */}
          <img
            src="/src/assets/images/chore_treasure_map_1793683845196.jpg"
            alt="Chore Treasure Adventure Map"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-101"
          />

          {/* Soft atmospheric gradient scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/20 pointer-events-none" />

          {/* 30 Day Buttons along the map trail */}
          {daysArray.map((dayNum) => {
            const pos = mapCoordinates[dayNum - 1] || { top: '50%', left: '50%' };
            const isToday = dayNum === todayDate;
            const isPast = dayNum < todayDate;
            const isFuture = dayNum > todayDate;

            // In our demo, past days have completed stars
            const isPastCompleted = isPast;

            return (
              <button
                key={dayNum}
                type="button"
                style={{ top: pos.top, left: pos.left }}
                onClick={() => handleDateClick(dayNum)}
                className={`absolute -translate-x-1/2 -translate-y-1/2 z-10 transition-all duration-300 flex flex-col items-center group/btn focus:outline-none ${
                  isToday
                    ? 'scale-125 z-20'
                    : 'hover:scale-115 hover:z-20'
                }`}
                title={`วันที่ ${dayNum} ${thaiMonthName}`}
              >
                {/* Hero Avatar Pawn standing on Today's date */}
                {isToday && (
                  <div className="absolute -top-11 sm:-top-13 flex flex-col items-center pointer-events-none animate-bounce">
                    <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full border-3 border-amber-400 shadow-2xl overflow-hidden bg-white ring-3 ring-amber-300">
                      <img
                        src={profile.avatarUrl}
                        alt={profile.nickname}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="w-2.5 h-2.5 bg-amber-400 rotate-45 -mt-1 shadow" />
                  </div>
                )}

                {/* Day Button Pin */}
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-black text-xs sm:text-sm shadow-lg border-2 transition ${
                    isToday
                      ? 'bg-amber-400 text-slate-950 border-white ring-4 ring-amber-400/70 shadow-amber-500/50 animate-pulse font-display scale-110'
                      : isPast
                      ? isPastCompleted
                        ? 'bg-emerald-500 text-white border-white/90 shadow-emerald-900/40 ring-1 ring-emerald-300'
                        : 'bg-slate-700/90 text-slate-400 border-slate-500'
                      : 'bg-white/90 text-slate-600 border-amber-300/80 shadow-md'
                  }`}
                >
                  {isToday ? (
                    dayNum
                  ) : isPast ? (
                    <span className="text-[11px] font-bold">
                      {isPastCompleted ? '★' : dayNum}
                    </span>
                  ) : (
                    <span className="text-[11px]">{dayNum}</span>
                  )}
                </div>

                {/* Micro Tooltip on Hover / Focus */}
                <span
                  className={`mt-0.5 px-1.5 py-0.2 rounded-md text-[9px] sm:text-[10px] font-bold shadow-xs whitespace-nowrap border ${
                    isToday
                      ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-md scale-105'
                      : isPast
                      ? 'bg-slate-950/80 text-emerald-300 border-white/10 hidden sm:inline'
                      : 'bg-slate-950/70 text-slate-300 border-white/10 hidden sm:inline'
                  }`}
                >
                  {isToday ? 'วันนี้!' : `${dayNum}`}
                </span>
              </button>
            );
          })}

          {/* Bottom Map Legend Bar */}
          <div className="absolute bottom-3 inset-x-3 sm:inset-x-auto sm:left-4 bg-slate-950/85 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 border border-amber-400/40 text-white flex flex-wrap items-center gap-3 shadow-xl pointer-events-auto">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-400 border border-white animate-ping" />
              <span className="text-xs font-bold text-amber-300">
                วันปัจจุบัน: วันที่ {todayDate} {thaiMonthName}
              </span>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-slate-300 border-l border-slate-700 pl-3">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                <span>วันที่สำเร็จแล้ว (★)</span>
              </span>
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-400" />
                <span>ไม่สามารถย้อนทำได้</span>
              </span>
            </div>

            <button
              type="button"
              onClick={onOpenDailyMissions}
              className="py-1.5 px-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs hover:brightness-110 active:scale-95 transition shadow font-display ml-auto flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>แตะทำภารกิจวันนี้</span>
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Date Scrubber Strip (100% Touch-Friendly for Mobile & Quick Navigation) */}
      <div className="bg-white rounded-2xl p-3 border border-amber-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <Calendar className="w-4 h-4 text-amber-500" />
            <span>ปุ่มเลือกวันที่ประจำเดือน {thaiMonthName} (1 - {daysInMonth})</span>
          </div>
          <span className="text-[11px] font-bold text-amber-600 font-display">
            ★ วันนี้: วันที่ {todayDate}
          </span>
        </div>

        {/* Scrollable date strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none py-1">
          {daysArray.map((dayNum) => {
            const isToday = dayNum === todayDate;
            const isPast = dayNum < todayDate;
            const isFuture = dayNum > todayDate;

            return (
              <button
                key={dayNum}
                type="button"
                onClick={() => handleDateClick(dayNum)}
                className={`flex flex-col items-center justify-center min-w-[42px] h-12 rounded-xl border text-xs transition shrink-0 ${
                  isToday
                    ? 'border-amber-500 bg-amber-400 text-slate-950 font-black ring-2 ring-amber-300 shadow-md font-display'
                    : isPast
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800 font-bold hover:bg-emerald-100'
                    : 'border-slate-200 bg-slate-50 text-slate-400 hover:bg-white'
                }`}
              >
                <span className="text-[10px] leading-tight">
                  {isToday ? 'วันนี้' : isPast ? '★' : 'วันที่'}
                </span>
                <span className="text-sm font-black font-display">{dayNum}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
