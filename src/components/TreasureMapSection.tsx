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

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const completedTodayCount = tasks.filter((t) => t.status === 'completed').length;
  const isTodayCompleted = tasks.length > 0 && completedTodayCount === tasks.length;

  const mapCoordinates: Array<{ top: string; left: string }> = [
    { top: '88%', left: '16%' }, { top: '83%', left: '23%' }, { top: '78%', left: '31%' },
    { top: '69%', left: '34%' }, { top: '60%', left: '31%' }, { top: '53%', left: '22%' },
    { top: '44%', left: '18%' }, { top: '35%', left: '21%' }, { top: '30%', left: '29%' },
    { top: '33%', left: '38%' }, { top: '40%', left: '44%' }, { top: '48%', left: '49%' },
    { top: '56%', left: '53%' }, { top: '64%', left: '55%' }, { top: '74%', left: '52%' },
    { top: '82%', left: '55%' }, { top: '86%', left: '62%' }, { top: '81%', left: '70%' },
    { top: '72%', left: '73%' }, { top: '63%', left: '70%' }, { top: '55%', left: '64%' },
    { top: '46%', left: '62%' }, { top: '38%', left: '65%' }, { top: '38%', left: '73%' },
    { top: '44%', left: '78%' }, { top: '52%', left: '81%' }, { top: '60%', left: '86%' },
    { top: '52%', left: '89%' }, { top: '42%', left: '86%' }, { top: '33%', left: '82%' },
  ];

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handleDateClick = (dayNumber: number) => {
    soundManager.playStarPop();
    if (dayNumber === todayDate) {
      setLockedNotice(null);
      onOpenDailyMissions();
    } else if (dayNumber < todayDate) {
      setLockedNotice(`วันที่ ${dayNumber} ${thaiMonthName} ผ่านไปแล้วครับ ไม่สามารถย้อนกลับไปทำได้ ต้องทำของ "วันปัจจุบัน (วันที่ ${todayDate})" เท่านั้นนะคนเก่ง! 🛡️`);
    } else {
      setLockedNotice(`วันที่ ${dayNumber} ยังมาไม่ถึงครับ! ฮีโร่ต้องทำภารกิจของ "วันปัจจุบัน (วันที่ ${todayDate} ${thaiMonthName})" ก่อนนะครับ ⭐`);
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-3xl p-4 sm:p-6 border-2 border-amber-200/90 shadow-xl shadow-amber-900/5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-xl shadow-md shrink-0">
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
              กดปุ่ม <span className="font-bold text-amber-700">"วันที่ {todayDate}"</span> เพื่อเปิดภารกิจและถ่ายรูปส่งงาน
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold font-display">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>วันนี้เสร็จแล้ว {completedTodayCount}/{tasks.length} งาน</span>
          </div>

          <button
            type="button"
            onClick={onOpenDailyMissions}
            className="py-1.5 px-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs shadow-md transition active:scale-95 flex items-center gap-1 font-display"
          >
            <span>📜 เปิดภารกิจวันนี้</span>
          </button>
        </div>
      </div>

      <div className="relative rounded-3xl overflow-hidden border-4 border-amber-300 shadow-2xl group bg-slate-950">
        <div className="absolute top-3 inset-x-3 z-20 flex items-center justify-between pointer-events-none">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3.5 py-1.5 rounded-2xl shadow-lg border-2 border-white/40 flex items-center gap-2 pointer-events-auto">
            <span className="text-lg">🗺️</span>
            <div>
              <div className="text-xs font-black font-display leading-tight">
                ลายแทงผจญภัยประจำเดือน {thaiMonthName} {buddhistYear}
              </div>
              <div className="text-[10px] text-amber-100 font-medium">
                แตะที่ปุ่ม "วันที่ {todayDate}" เพื่อเปิดภารกิจและถ่ายรูปส่งงาน
              </div>
            </div>
          </div>
        </div>

        {lockedNotice && (
          <div className="absolute top-16 inset-x-4 z-30 p-3.5 rounded-2xl bg-slate-950/90 text-white backdrop-blur-md border border-amber-400 shadow-xl flex items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
              <p className="text-xs sm:text-sm font-medium">{lockedNotice}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setLockedNotice(null);
                onOpenDailyMissions();
              }}
              className="py-1 px-3 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow shrink-0"
            >
              ไปทำวันนี้
            </button>
          </div>
        )}

        <div className="relative w-full aspect-16/9 sm:aspect-21/9 min-h-[340px] sm:min-h-[440px] bg-slate-900 overflow-hidden select-none">
          <img
            src={mapArtworkUrl}
            alt="Chore Treasure Adventure Map"
            onError={() => setMapLoadFailed(true)}
            className={`w-full h-full object-cover transition-transform duration-700 ${mapLoadFailed ? 'hidden' : 'block'}`}
          />

          {mapLoadFailed && (
            <svg className="w-full h-full object-cover absolute inset-0" viewBox="0 0 1200 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#bae6fd" />
                  <stop offset="100%" stopColor="#fef08a" />
                </linearGradient>
                <linearGradient id="hillGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#86efac" />
                  <stop offset="100%" stopColor="#15803d" />
                </linearGradient>
              </defs>
              <rect width="1200" height="600" fill="url(#skyGrad)" />
              <path d="M0 380 Q300 240 600 360 T1200 320 L1200 600 L0 600 Z" fill="url(#hillGrad)" />
              <path d="M 190 530 Q 380 480 370 360 Q 300 220 260 210 Q 420 180 530 240 Q 640 320 620 450 Q 750 540 850 490 Q 980 440 920 300 Q 940 230 1000 200" fill="none" stroke="#fbbf24" strokeWidth="36" strokeLinecap="round" />
              <path d="M 190 530 Q 380 480 370 360 Q 300 220 260 210 Q 420 180 530 240 Q 640 320 620 450 Q 750 540 850 490 Q 980 440 920 300 Q 940 230 1000 200" fill="none" stroke="#d97706" strokeWidth="4" strokeDasharray="14 10" />
              <text x="130" y="520" fontSize="16" fontWeight="bold" fill="#78350f">🏡 จุดเริ่มต้น</text>
              <text x="240" y="210" fontSize="16" fontWeight="bold" fill="#14532d">🌲 ป่าแห่งแสง</text>
              <text x="510" y="230" fontSize="16" fontWeight="bold" fill="#334155">⚔️ ป้อมปราการ</text>
              <text x="960" y="200" fontSize="18" fontWeight="black" fill="#b45309">🏰 ปราสาทสมบัติ (30 วัน)</text>
            </svg>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/20 pointer-events-none" />

          {daysArray.map((dayNum) => {
            const pos = mapCoordinates[dayNum - 1] || { top: '50%', left: '50%' };
            const isToday = dayNum === todayDate;
            const isPast = dayNum < todayDate;

            return (
              <button
                key={dayNum}
                type="button"
                style={{ top: pos.top, left: pos.left }}
                onClick={() => handleDateClick(dayNum)}
                className={`absolute -translate-x-1/2 -translate-y-1/2 z-10 transition-all flex flex-col items-center ${isToday ? 'scale-125 z-20' : 'hover:scale-115'}`}
              >
                {isToday && (
                  <div className="absolute -top-11 flex flex-col items-center pointer-events-none animate-bounce">
                    <div className="w-9 h-9 rounded-full border-3 border-amber-400 shadow-2xl overflow-hidden bg-white ring-3 ring-amber-300">
                      <img src={profile.avatarUrl} alt={profile.nickname} className="w-full h-full object-cover" />
                    </div>
                    <div className="w-2.5 h-2.5 bg-amber-500 rotate-45 -mt-1 shadow-md" />
                  </div>
                )}

                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full font-black text-xs sm:text-sm flex items-center justify-center border-2 shadow-lg font-display ${
                    isToday
                      ? 'bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 text-slate-950 border-white ring-4 ring-amber-400/80 animate-pulse'
                      : isPast
                      ? 'bg-gradient-to-br from-teal-400 to-emerald-600 text-white border-teal-200'
                      : 'bg-white/95 text-slate-800 border-amber-200'
                  }`}
                >
                  {isPast ? <span>★</span> : <span>{dayNum}</span>}
                </div>

                {isToday && (
                  <span className="mt-1 px-2 py-0.5 rounded-full text-[10px] font-black font-display bg-amber-400 text-slate-950 border border-white shadow-md">
                    วันนี้!
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
