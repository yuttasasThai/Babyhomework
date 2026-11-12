import React, { useState, useEffect, useRef } from 'react';
import { HeroProfile } from '../types/chore';
import { soundManager } from '../utils/soundEffects';
import { fireHeroConfetti } from '../utils/confetti';
import { Sparkles, ShieldCheck, Zap, MapPin, Camera, CheckCircle2, Rocket } from 'lucide-react';
import { APP_REVISION } from '../config/revision';

interface Props {
  isOpen: boolean;
  profile: HeroProfile;
  onBootComplete: () => void;
}

const BOOT_STEPS = [
  { percent: 15, text: '⚡ กำลังเชื่อมต่อศูนย์บัญชาการฮีโร่ตัวจิ๋ว...', icon: Zap },
  { percent: 40, text: '🛡️ ตรวจสอบระดับพลังและดาวสะสมของฮีโร่...', icon: ShieldCheck },
  { percent: 68, text: '🗺️ กำลังโหลดลายแทงแผนที่ผจญภัย & จัดคิวภารกิจ...', icon: MapPin },
  { percent: 88, text: '📸 เตรียมความพร้อมระบบกล้องประทับเวลา & ตรวจงาน...', icon: Camera },
  { percent: 100, text: '🚀 ระบบพร้อมสมบูรณ์! ยินดีต้อนรับเข้าสู่ภารกิจ...', icon: Rocket },
];

export const HeroBootScreen: React.FC<Props> = ({
  isOpen,
  profile,
  onBootComplete,
}) => {
  const [progress, setProgress] = useState<number>(0);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  // Refs prevent re-render cleanup from cancelling the completion timeout!
  const hasTriggeredCompleteRef = useRef<boolean>(false);
  const onBootCompleteRef = useRef(onBootComplete);
  onBootCompleteRef.current = onBootComplete;

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      setCurrentStepIndex(0);
      hasTriggeredCompleteRef.current = false;
      return;
    }

    hasTriggeredCompleteRef.current = false;
    setProgress(0);
    setCurrentStepIndex(0);
    soundManager.playStarPop();

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return Math.min(100, prev + Math.floor(Math.random() * 10) + 8);
      });
    }, 65);

    // Safety hard-fallback timer: guarantee boot screen NEVER hangs longer than 2.8s
    const safetyTimer = setTimeout(() => {
      if (!hasTriggeredCompleteRef.current) {
        hasTriggeredCompleteRef.current = true;
        onBootCompleteRef.current();
      }
    }, 2800);

    return () => {
      clearInterval(interval);
      clearTimeout(safetyTimer);
    };
  }, [isOpen]);

  // Update step text & trigger completion safely when progress hits 100%
  useEffect(() => {
    if (!isOpen) return;

    if (progress < 25) {
      setCurrentStepIndex(0);
    } else if (progress < 50) {
      setCurrentStepIndex(1);
    } else if (progress < 75) {
      setCurrentStepIndex(2);
    } else if (progress < 95) {
      setCurrentStepIndex(3);
    } else {
      setCurrentStepIndex(4);
    }

    if (progress >= 100 && !hasTriggeredCompleteRef.current) {
      hasTriggeredCompleteRef.current = true;
      soundManager.playSuccessFanfare();
      try {
        fireHeroConfetti();
      } catch {
        // ignore confetti error in restricted webviews
      }
      setTimeout(() => {
        onBootCompleteRef.current();
      }, 450);
    }
  }, [isOpen, progress]);

  if (!isOpen) return null;

  const currentStep = BOOT_STEPS[currentStepIndex];
  const StepIcon = currentStep.icon;
  const childName = profile.nickname || 'ฮีโร่ตัวจิ๋ว';

  return (
    <div className="fixed inset-0 w-full h-full z-50 flex items-center justify-center p-4 bg-slate-950 text-white overflow-hidden select-none">
      {/* Dynamic Background Glows */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-80 h-80 bg-amber-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.08)_0%,transparent_70%)]" />

      {/* Main Boot Terminal Card - strictly centered with mx-auto */}
      <div className="relative mx-auto max-w-sm sm:max-w-md w-full bg-slate-900/95 border-2 border-amber-400/40 rounded-3xl p-5 sm:p-8 shadow-2xl backdrop-blur-xl text-center space-y-5">
        {/* Top Header Tag */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-xs">
          <div className="flex items-center gap-2 text-amber-400 font-mono font-bold tracking-wider">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span>HERO OS BOOTING...</span>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 font-mono text-[11px] border border-slate-700">
            v{APP_REVISION.version}
          </span>
        </div>

        {/* Hero Avatar with Pulse Ring */}
        <div className="relative mx-auto w-24 h-24 sm:w-28 sm:h-28">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-amber-400 to-orange-500 blur-md opacity-70 animate-pulse" />
          <div className="relative w-full h-full rounded-3xl overflow-hidden ring-4 ring-amber-300 shadow-2xl bg-slate-800 flex items-center justify-center">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={childName}
                className="w-full h-full object-cover scale-105"
              />
            ) : (
              <span className="text-5xl">🦸‍♂️</span>
            )}
          </div>
          <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-xl shadow-lg ring-2 ring-slate-900">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        {/* Hero Welcome Greetings */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/30 text-amber-300 text-xs font-bold font-display">
            <Sparkles className="w-3.5 h-3.5" />
            <span>เข้าสู่ระบบถูกต้อง</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white">
            ยินดีต้อนรับ, <span className="text-amber-400">{childName}</span>!
          </h2>
          <p className="text-xs text-slate-400">
            กำลังเตรียมความพร้อมศูนย์บัญชาการภารกิจประจำวัน
          </p>
        </div>

        {/* Progress Bar & Percentage */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 flex items-center gap-1">
              <StepIcon className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <span>กำลังบูตระบบ...</span>
            </span>
            <span className="font-bold text-amber-400 text-sm">
              {progress}%
            </span>
          </div>

          {/* Bar track */}
          <div className="w-full h-3.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
            <div
              className="h-full bg-gradient-to-r from-amber-400 via-orange-400 to-emerald-400 rounded-full transition-all duration-150 ease-out shadow-lg shadow-amber-500/50"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Dynamic Boot Step Message Box */}
        <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-xs text-amber-200/90 font-medium flex items-center justify-center gap-2 min-h-[44px]">
          <StepIcon className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="line-clamp-1">{currentStep.text}</span>
        </div>

        {/* Quick Skip button */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => {
              if (!hasTriggeredCompleteRef.current) {
                hasTriggeredCompleteRef.current = true;
              }
              soundManager.playSuccessFanfare();
              onBootCompleteRef.current();
            }}
            className="text-xs text-slate-400 hover:text-white transition underline underline-offset-4 cursor-pointer"
          >
            กดข้ามเพื่อเริ่มทันที ➔
          </button>
        </div>
      </div>
    </div>
  );
};
