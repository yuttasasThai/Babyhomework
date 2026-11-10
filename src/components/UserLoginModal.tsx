import React, { useState } from 'react';
import { HeroProfile } from '../types/chore';
import { UserTokenPayload } from '../utils/storage';
import { soundManager } from '../utils/soundEffects';
import { Lock, LogIn, KeyRound, ShieldAlert, Eye, EyeOff } from 'lucide-react';

interface Props {
  isOpen: boolean;
  tokenPayload: UserTokenPayload | null;
  profile: HeroProfile;
  onSuccessLogin: () => void;
}

export const UserLoginModal: React.FC<Props> = ({
  isOpen,
  tokenPayload,
  profile,
  onSuccessLogin,
}) => {
  const [password, setPassword] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  if (!isOpen) return null;

  const expectedPasscode = tokenPayload?.passcode || 'HERO-8821';
  const childName = tokenPayload?.userName || tokenPayload?.heroName || profile.nickname || 'ฮีโร่ตัวจิ๋ว';

  const handleVerify = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanInput = password.trim().toUpperCase();
    const cleanTarget = expectedPasscode.trim().toUpperCase();

    if (cleanInput === cleanTarget) {
      soundManager.playSuccessFanfare();
      setErrorMsg(null);
      onSuccessLogin();
    } else {
      soundManager.playStarPop();
      setErrorMsg('รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบรหัสผ่านของคุณอีกครั้ง');
      setPassword('');
    }
  };

  const handleKeyClick = (val: string) => {
    soundManager.playStarPop();
    setErrorMsg(null);
    setPassword((prev) => prev + val);
  };

  const handleBackspace = () => {
    soundManager.playStarPop();
    setErrorMsg(null);
    setPassword((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    soundManager.playStarPop();
    setErrorMsg(null);
    setPassword('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden border-2 border-amber-300 text-center relative flex flex-col">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-5 text-white relative">
          <div className="w-16 h-16 mx-auto mb-2 rounded-2xl bg-white/20 backdrop-blur-md ring-4 ring-white/30 flex items-center justify-center shadow-lg overflow-hidden">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={childName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl">⭐</span>
            )}
          </div>
          <div className="flex items-center justify-center gap-1 text-amber-200 text-xs font-bold uppercase tracking-wider mb-0.5">
            <Lock className="w-3.5 h-3.5" />
            <span>เข้าสู่ระบบก่อนเริ่มภารกิจ</span>
          </div>
          <h2 className="text-xl font-black font-display tracking-tight">
            สวัสดี, {childName}!
          </h2>
          <p className="text-xs text-amber-100 mt-0.5">
            กรุณาใส่รหัสผ่านเพื่อเข้าใช้งานลิงก์ส่วนตัว
          </p>
        </div>

        {/* Login Form Body */}
        <div className="p-5 space-y-4">
          <form onSubmit={handleVerify} className="space-y-3">
            <div className="text-left">
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                  <span>รหัสผ่านเข้าใช้งาน (Passcode):</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center gap-1"
                >
                  {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{showPassword ? 'ซ่อน' : 'แสดง'}</span>
                </button>
              </label>

              {/* Masked Password Field (Dots/Bullets) */}
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setErrorMsg(null);
                    setPassword(e.target.value.toUpperCase());
                  }}
                  autoFocus
                  placeholder="กรอกรหัสผ่านของคุณ"
                  className="w-full py-3 px-4 rounded-2xl border-2 border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none text-center font-mono font-black text-lg tracking-widest text-slate-800 bg-slate-50 transition"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold flex items-center justify-center gap-1.5 animate-shake">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Quick numeric buttons for touch devices */}
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'ล้าง', '0', '⌫'].map((key) => {
                if (key === 'ล้าง') {
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={handleClear}
                      className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition active:scale-95"
                    >
                      ล้าง
                    </button>
                  );
                }
                if (key === '⌫') {
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={handleBackspace}
                      className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition active:scale-95"
                    >
                      ⌫
                    </button>
                  );
                }
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleKeyClick(key)}
                    className="py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-slate-800 text-base font-bold font-mono border border-amber-200/80 transition active:scale-95"
                  >
                    {key}
                  </button>
                );
              })}
            </div>

            <button
              type="submit"
              disabled={password.trim().length === 0}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 text-white font-black text-sm shadow-md shadow-orange-500/25 transition active:scale-98 flex items-center justify-center gap-2 font-display"
            >
              <LogIn className="w-4 h-4" />
              <span>เข้าสู่ระบบพิชิตภารกิจ</span>
            </button>
          </form>

          {tokenPayload?.validUntilFormatted && (
            <p className="text-[11px] text-slate-400">
              สถานะลิงก์: ใช้งานได้ถึง {tokenPayload.validUntilFormatted}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
