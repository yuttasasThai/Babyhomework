import React from 'react';
import { HeroProfile } from '../types/chore';
import { Volume2, VolumeX, ShieldCheck, UserCheck, Share2, Lock, Download, KeyRound } from 'lucide-react';
import { soundManager } from '../utils/soundEffects';

interface Props {
  profile: HeroProfile;
  currentView: 'tasks' | 'stats' | 'gallery' | 'rewards';
  onSelectView: (view: 'tasks' | 'stats' | 'gallery' | 'rewards') => void;
  onOpenProfile: () => void;
  onToggleSound: () => void;
  isParentMode: boolean;
  onToggleParentMode: () => void;
  onOpenLineGuide?: () => void;
  onOpenShareLink?: () => void;
  isPlayerOnlyMode?: boolean;
}

export const HeaderHeroBar: React.FC<Props> = ({
  profile,
  currentView,
  onSelectView,
  onOpenProfile,
  onToggleSound,
  isParentMode,
  onToggleParentMode,
  onOpenLineGuide,
  onOpenShareLink,
  isPlayerOnlyMode,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 md:gap-8 h-18">
          {/* Zone 1: Brand title, single line */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onSelectView('tasks')}
              className="flex items-center gap-2.5 text-left group transition focus:outline-none"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-xl shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
                ⭐
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg md:text-xl font-bold tracking-tight text-slate-900 font-display whitespace-nowrap block">
                    ฮีโร่ตัวจิ๋วพิชิตงานบ้าน
                  </span>
                  {isPlayerOnlyMode && (
                    <span className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                      <Lock className="w-2.5 h-2.5" /> โหมดเด็ก
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-amber-700/80 font-medium tracking-wide uppercase hidden sm:block">
                  Little Chore Hero Quest
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation links, single line */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              onClick={() => {
                soundManager.playStarPop();
                onSelectView('tasks');
              }}
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition ${
                currentView === 'tasks'
                  ? 'bg-amber-100 text-amber-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              📋 ภารกิจวันนี้
            </button>
            <button
              onClick={() => {
                soundManager.playStarPop();
                onSelectView('stats');
              }}
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition ${
                currentView === 'stats'
                  ? 'bg-amber-100 text-amber-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              📊 วัดพลังความสม่ำเสมอ
            </button>
            <button
              onClick={() => {
                soundManager.playStarPop();
                onSelectView('gallery');
              }}
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition ${
                currentView === 'gallery'
                  ? 'bg-amber-100 text-amber-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              📸 ภาพหลักฐานประทับเวลา
            </button>
            <button
              onClick={() => {
                soundManager.playStarPop();
                onSelectView('rewards');
              }}
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition ${
                currentView === 'rewards'
                  ? 'bg-amber-100 text-amber-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              🎁 ร้านของรางวัล
            </button>
          </nav>

          {/* Zone 3: Profile & Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Download Full Source ZIP & Share Button */}
            {/* Admin Hub: User Link Generator & Source - Only visible in Admin Mode, NEVER in User/Player Mode */}
            {onOpenShareLink && !isPlayerOnlyMode && (
              <button
                type="button"
                onClick={() => {
                  soundManager.playStarPop();
                  onOpenShareLink();
                }}
                title="สร้างลิงก์ User กำหนดวันหมดอายุ & โหลด Source Code"
                className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition flex items-center gap-1.5 shadow-sm shadow-indigo-600/20 active:scale-95"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">สร้างลิงก์ User / แอดมิน</span>
                <span className="sm:hidden">แอดมิน</span>
              </button>
            )}

            {/* LINE Guide / Connect button */}
            {onOpenLineGuide && (
              <button
                type="button"
                onClick={() => {
                  soundManager.playStarPop();
                  onOpenLineGuide();
                }}
                title="ตั้งค่า LINE & วิธีตรวจงานรับดาวเพิ่ม"
                className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-[#06C755]/15 text-[#06C755] hover:bg-[#06C755]/25 transition flex items-center gap-1 border border-[#06C755]/30"
              >
                <span className="font-bold">LINE</span>
                <span className="hidden sm:inline">ตรวจงาน</span>
              </button>
            )}

            {/* Sound Toggle */}
            <button
              type="button"
              onClick={onToggleSound}
              title={profile.soundEnabled ? 'ปิดเสียงเอฟเฟกต์' : 'เปิดเสียงเอฟเฟกต์'}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition min-w-[38px] min-h-[38px] flex items-center justify-center"
            >
              {profile.soundEnabled ? (
                <Volume2 className="w-5 h-5 text-amber-600" />
              ) : (
                <VolumeX className="w-5 h-5 text-slate-400" />
              )}
            </button>

            {/* Parent Mode Toggle with Lock indication in player-only mode */}
            <button
              type="button"
              onClick={onToggleParentMode}
              title={
                isPlayerOnlyMode
                  ? 'ล็อกสิทธิ์แอดมิน (กดเพื่อใส่รหัส PIN ผู้ปกครอง)'
                  : isParentMode
                  ? 'โหมดผู้ปกครอง (เปิดอยู่)'
                  : 'สลับโหมดผู้ปกครอง'
              }
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                isParentMode
                  ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-200'
                  : isPlayerOnlyMode
                  ? 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              {isPlayerOnlyMode && !isParentMode ? (
                <Lock className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ShieldCheck className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">
                {isParentMode ? 'โหมดพ่อแม่' : isPlayerOnlyMode ? 'พ่อแม่ (PIN)' : 'ผู้ปกครอง'}
              </span>
            </button>

            {/* Child Profile Button */}
            <button
              type="button"
              onClick={() => {
                soundManager.playStarPop();
                onOpenProfile();
              }}
              className="flex items-center gap-2 py-1 px-2 pr-3 rounded-2xl bg-amber-50 hover:bg-amber-100/80 border border-amber-200/80 transition shadow-xs group"
            >
              <div className="w-8 h-8 rounded-xl overflow-hidden ring-2 ring-amber-400 bg-slate-200 shrink-0">
                <img
                  src={profile.avatarUrl}
                  alt={profile.nickname}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-slate-800 line-clamp-1 max-w-[90px] sm:max-w-[120px]">
                    {profile.nickname}
                  </span>
                  <UserCheck className="w-3 h-3 text-amber-500" />
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 font-display">
                  <span>★</span>
                  <span>{profile.totalStars} ดาว</span>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile secondary tab strip */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-amber-100/80 text-xs font-medium">
          <button
            onClick={() => onSelectView('tasks')}
            className={`py-1 px-2.5 rounded-lg whitespace-nowrap ${
              currentView === 'tasks' ? 'font-bold text-amber-700 bg-amber-100/80' : 'text-slate-600'
            }`}
          >
            📋 งานวันนี้
          </button>
          <button
            onClick={() => onSelectView('stats')}
            className={`py-1 px-2.5 rounded-lg whitespace-nowrap ${
              currentView === 'stats' ? 'font-bold text-amber-700 bg-amber-100/80' : 'text-slate-600'
            }`}
          >
            📊 สถิติพลัง
          </button>
          <button
            onClick={() => onSelectView('gallery')}
            className={`py-1 px-2.5 rounded-lg whitespace-nowrap ${
              currentView === 'gallery' ? 'font-bold text-amber-700 bg-amber-100/80' : 'text-slate-600'
            }`}
          >
            📸 รูปหลักฐาน
          </button>
          <button
            onClick={() => onSelectView('rewards')}
            className={`py-1 px-2.5 rounded-lg whitespace-nowrap ${
              currentView === 'rewards' ? 'font-bold text-amber-700 bg-amber-100/80' : 'text-slate-600'
            }`}
          >
            🎁 รางวัล ({profile.totalStars}★)
          </button>
        </div>
      </div>
    </header>
  );
};
