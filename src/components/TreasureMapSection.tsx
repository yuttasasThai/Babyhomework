import React, { useState } from 'react';
import { ChoreTask, HeroProfile } from '../types/chore';
import { soundManager } from '../utils/soundEffects';
import { CheckCircle2, Lock, Sparkles, AlertCircle, ChevronRight, Calendar } from 'lucide-react';
import mapArtworkUrl from '../assets/images/chore_treasure_map_1793683845196.jpg';

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
  const [mapLoadFailed, setMapLoadFailed] = useState(false);

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
    { top: '72%', left: '73%' }, // Day 19
    { top: '63%', left: '70%' }, // Day 20
    { top: '55%', left: '64%' }, // Day 21
    { top: '46%', left: '62%' }, // Day 22
    { top: '38%', left: '65%' }, // Day 23
    { top: '38%', left: '73%' }, // Day 24
    { top: '44%', left: '78%' }, // Day 25
    { top: '52%', left: '81%' }, // Day 26
    { top: '60%', left: '86%' }, // Day 27
    { top: '52%', left: '89%' }, // Day 28: Misty Meadows
    { top: '42%', left: '86%' }, // Day 29
    { top: '33%', left: '82%' }, // Day 30: Treasure Castle
  ];

  // Generate day numbers array [1, 2, ..., 30]
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Handle clicking a milestone date button
  const handleDateClick = (dayNumber: number) => {
    soundManager.playStarPop();

    if (dayNumber === todayDate) {
      setLockedNotice(null);
      onOpenDailyMissions();
    } else if (dayNumber < todayDate) {
      setLockedNotice(
        `วันที่ ${dayNumber} ${thaiMonthName} ผ่านไปแล้วครับ ไม่สามารถย้อนกลับไปทำได้ ต้องพิชิตภารกิจของ "วันปัจจุบัน (วันที่ ${todayDate})" เท่านั้นนะคนเก่ง! 🛡️`
      );
    } else {
      setLockedNotice(
        `วันที่ ${dayNumber} ยังมาไม่ถึงครับ! ฮีโร่ต้องทำภารกิจของ "วันปัจจุบัน (วันที่ ${todayDate} ${thaiMonthName})" ให้สำเร็จก่อนนะครับ ⭐`
      );
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-3xl p-4 sm:p-6 border-2 border-amber-200/90 shadow-xl shadow-amber-900/5 space-y-4">
      {/* Map Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-xl shadow-md shadow-amber-500/20 shrink-0">
            🗺️
          </div>
          <div>
            <h2 className="text-base sm:text-xl font-black text-slate-900 font-display flex items-center gap-2">
              <span>ลายแทงแผนที่ผจญภัย</span>
              <span className="text-xs bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full border border-amber-300">
                {thaiMonthName} {buddhistYear}
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              กดปุ่ม <span className="font-bold text-amber-700">"วันที่ {todayDate}" (วันปัจจุบัน)</span> เพื่อเปิดภารกิจและถ่ายรูปส่งงาน
            </p>
          </div>
        </div>

        {/* Quick status pill */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold font-display">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>วันนี้เสร็จแล้ว {completedTodayCount}/{tasks.length} งาน</span>
          </div>

          <button
            type="button"
            onClick={onOpenDailyMissions}
            className="py-1.5 px-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs shadow-md shadow-amber-500/20 transition active:scale-95 flex items-center gap-1 font-display"
          >
            <span>📜 เปิดภารกิจวันนี้</span>
          </button>
        </div>
      </div>

      {/* Main Map Board Container */}
      <div className="relative rounded-3xl overflow-hidden border-4 border-amber-300 shadow-2xl group bg-slate-950">
        {/* Map Top Indicator Banner */}
        <div className="absolute top-3 inset-x-3 z-20 flex items-center justify-between pointer-events-none">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3.5 py-1.5 rounded-2xl shadow-lg border-2 border-white/40 flex items-center gap-2 pointer-events-auto">
            <span className="text-lg">🗺️</span>
            <div>
              <div className="text-xs font-black font-display tracking-tight leading-tight">
                ลายแทงผจญภัยประจำเดือน {thaiMonthName} {buddhistYear}
              </div>
              <div className="text-[10px] text-amber-100 font-medium leading-none">
                แตะที่ปุ่ม "วันที่ {todayDate}" เพื่อเปิดภารกิจประจำวัน และถ่ายรูปส่งงาน
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenDailyMissions}
            className="hidden sm:flex items-center gap-1.5 bg-white/95 text-slate-900 px-3 py-1.5 rounded-2xl shadow-lg border border-amber-200 text-xs font-bold hover:bg-amber-50 transition pointer-events-auto font-display"
          >
            <span>📜 เปิดภารกิจวันนี้ ({completedTodayCount}/{tasks.length})</span>
            <ChevronRight className="w-4 h-4 text-amber-600" />
          </button>
        </div>

        {/* Locked Notice Alert Popup */}
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
          {/* Treasure Map Artwork Image */}
          <img
            src={mapArtworkUrl}
            alt="Chore Treasure Adventure Map"
            onError={() => setMapLoadFailed(true)}
            className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-101 ${
              mapLoadFailed ? 'hidden' : 'block'
            }`}
          />

          {/* Fallback Vector SVG Map: Never fails even if JPG image wasn't pushed to GitHub! */}
          {mapLoadFailed && (
            <svg
              className="w-full h-full object-cover absolute inset-0"
              viewBox="0 0 1200 600"
              preserveAspectRatio="xMidYMid slice"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#bae6fd" />
                  <stop offset="60%" stopColor="#fef08a" />
                  <stop offset="100%" stopColor="#fed7aa" />
                </linearGradient>
                <linearGradient id="hillGrad1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#86efac" />
                  <stop offset="100%" stopColor="#22c55e" />
                </linearGradient>
                <linearGradient id="hillGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4ade80" />
                  <stop offset="100%" stopColor="#15803d" />
                </linearGradient>
                <linearGradient id="riverGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#0284c7" />
                </linearGradient>
              </defs>

              {/* Sky */}
              <rect width="1200" height="600" fill="url(#skyGrad)" />

              {/* Distant Mountains */}
              <polygon points="0,320 200,180 400,340" fill="#93c5fd" opacity="0.6" />
              <polygon points="300,340 550,140 800,340" fill="#bfdbfe" opacity="0.5" />
              <polygon points="700,320 950,160 1200,320" fill="#93c5fd" opacity="0.6" />

              {/* Rolling Hills Background */}
              <path d="M0 380 Q300 240 600 360 T1200 320 L1200 600 L0 600 Z" fill="url(#hillGrad1)" />
              <path d="M0 430 Q400 320 800 440 T1200 400 L1200 600 L0 600 Z" fill="url(#hillGrad2)" opacity="0.9" />

              {/* Blue River Flowing Across */}
              <path
                d="M 620 200 Q 580 320 660 420 T 700 600 L 590 600 Q 520 420 540 320 T 580 200 Z"
                fill="url(#riverGrad)"
                opacity="0.85"
              />

              {/* Golden Winding Quest Trail */}
              <path
                d="M 190 530 Q 380 480 370 360 Q 300 220 260 210 Q 420 180 530 240 Q 640 320 620 450 Q 750 540 850 490 Q 980 440 920 300 Q 940 230 1000 200"
                fill="none"
                stroke="#fbbf24"
                strokeWidth="38"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.9"
              />
              <path
                d="M 190 530 Q 380 480 370 360 Q 300 220 260 210 Q 420 180 530 240 Q 640 320 620 450 Q 750 540 850 490 Q 980 440 920 300 Q 940 230 1000 200"
                fill="none"
                stroke="#d97706"
                strokeWidth="4"
                strokeDasharray="14 10"
                opacity="0.95"
              />

              {/* Landmark 1: Starting Village (bottom left) */}
              <g transform="translate(130, 480)">
                <rect x="0" y="10" width="40" height="30" fill="#fef3c7" rx="4" />
                <polygon points="-5,10 20,-10 45,10" fill="#ef4444" />
                <rect x="15" y="24" width="10" height="16" fill="#78350f" />
                <text x="20" y="55" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#78350f">
                  🏡 จุดเริ่มต้น
                </text>
              </g>

              {/* Landmark 2: Sunny Woods (top-mid left) */}
              <g transform="translate(230, 160)">
                <circle cx="20" cy="20" r="28" fill="#15803d" />
                <circle cx="45" cy="25" r="22" fill="#16a34a" />
                <rect x="16" y="40" width="8" height="20" fill="#78350f" />
                <text x="32" y="74" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#14532d">
                  🌲 ป่าแห่งแสงอาทิตย์
                </text>
              </g>

              {/* Landmark 3: Adventure Fort (center) */}
              <g transform="translate(500, 200)">
                <rect x="0" y="0" width="50" height="40" fill="#94a3b8" rx="4" />
                <polygon points="0,0 10,-15 20,0 30,-15 40,0 50,-15 50,0" fill="#64748b" />
                <rect x="18" y="16" width="14" height="24" fill="#1e293b" rx="2" />
                <text x="25" y="56" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#334155">
                  ⚔️ ป้อมปราการ
                </text>
              </g>

              {/* Landmark 4: Treasure Castle (top right) */}
              <g transform="translate(960, 140)">
                <rect x="10" y="20" width="70" height="60" fill="#fde047" rx="6" />
                <polygon points="5,20 20,-15 35,20" fill="#f59e0b" />
                <polygon points="55,20 70,-15 85,20" fill="#f59e0b" />
                <polygon points="30,20 45,-25 60,20" fill="#ea580c" />
                <rect x="35" y="45" width="20" height="35" fill="#78350f" rx="3" />
                <circle cx="45" cy="-28" r="7" fill="#ef4444" />
                <text x="45" y="96" textAnchor="middle" fontSize="14" fontWeight="black" fill="#b45309">
                  🏰 ปราสาทสมบัติ (30 วัน)
                </text>
              </g>
            </svg>
          )}

          {/* Soft atmospheric gradient scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/20 pointer-events-none" />

          {/* 30 Day Buttons along the map trail */}
          {daysArray.map((dayNum) => {
            const pos = mapCoordinates[dayNum - 1] || { top: '50%', left: '50%' };
            const isToday = dayNum === todayDate;
            const isPast = dayNum < todayDate;
            const isFuture = dayNum > todayDate;
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
                    <div className="w-2.5 h-2.5 bg-amber-500 rotate-45 -mt-1 shadow-md" />
                  </div>
                )}

                {/* Day Milestone Button */}
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full font-black text-xs sm:text-sm flex items-center justify-center transition-all duration-300 border-2 shadow-lg font-display ${
                    isToday
                      ? isTodayCompleted
                        ? 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white border-white ring-4 ring-emerald-400/60 shadow-emerald-500/50'
                        : 'bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 text-slate-950 border-white ring-4 ring-amber-400/80 shadow-amber-500/50 animate-pulse'
                      : isPastCompleted
                      ? 'bg-gradient-to-br from-teal-400 to-emerald-600 text-white border-teal-200 shadow-teal-900/30 ring-2 ring-emerald-300/40'
                      : isFuture
                      ? 'bg-slate-100/90 text-slate-700 border-slate-300/90 backdrop-blur-xs opacity-90'
                      : 'bg-white/95 text-slate-800 border-amber-200'
                  }`}
                >
                  {isPastCompleted ? (
                    <span className="text-emerald-100 text-sm">★</span>
                  ) : (
                    <span>{dayNum}</span>
                  )}
                </div>

                {/* Status Tag Pill below Button */}
                {isToday && (
                  <span className="mt-1 px-2 py-0.5 rounded-full text-[10px] font-black tracking-tight font-display bg-amber-400 text-slate-950 border border-white shadow-md uppercase">
                    วันนี้!
                  </span>
                )}
              </button>
            );
          })}

          {/* Map Bottom Legend Ribbon */}
          <div className="absolute bottom-3 inset-x-3 z-10 flex flex-wrap items-center justify-between gap-2 p-2 px-3 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 text-white text-[11px]">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 font-bold">
                <span className="w-3.5 h-3.5 rounded-full bg-amber-400 inline-block ring-2 ring-amber-300/50" />
                <span>วันปัจจุบัน: วันที่ {todayDate} {thaiMonthName}</span>
              </span>
              <span className="flex items-center gap-1.5 text-emerald-300">
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                <span>วันที่สำเร็จแล้ว (★)</span>
              </span>
              <span className="hidden sm:flex items-center gap-1 text-slate-300">
                <Lock className="w-3 h-3" />
                <span>ไม่สามารถย้อนทำได้</span>
              </span>
            </div>

            <button
              type="button"
              onClick={onOpenDailyMissions}
              className="py-1 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 hover:brightness-110 text-slate-950 font-black text-xs shadow transition active:scale-95 flex items-center gap-1 font-display"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-950" />
              <span>แตะทำภารกิจวันนี้</span>
            </button>
          </div>
        </div>
      </div>

      {/* Milestone Buttons Bottom Rail (1-30) */}
      <div className="bg-amber-50/70 rounded-2xl p-3 border border-amber-200 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-amber-900 px-1">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-amber-600" />
            <span>ปุ่มเลือกวันที่ประจำเดือน {thaiMonthName} (1 - {daysInMonth})</span>
          </span>
          <span className="text-amber-700">★ วันนี้: วันที่ {todayDate}</span>
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
          {daysArray.map((dayNum) => {
            const isToday = dayNum === todayDate;
            const isPast = dayNum < todayDate;

            return (
              <button
                key={dayNum}
                type="button"
                onClick={() => handleDateClick(dayNum)}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold shrink-0 transition flex flex-col items-center min-w-[50px] border ${
                  isToday
                    ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-sm ring-2 ring-amber-300'
                    : isPast
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span className="text-[10px] opacity-80">
                  {isToday ? 'วันนี้' : isPast ? '★' : `วันที่`}
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
