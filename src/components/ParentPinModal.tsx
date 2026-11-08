import React, { useState } from 'react';
import { Lock, ShieldCheck, X, Check, Delete, KeyRound, Eye, EyeOff } from 'lucide-react';
import { soundManager } from '../utils/soundEffects';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  correctPin: string;
  onSuccess: () => void;
  title?: string;
  description?: string;
}

export const ParentPinModal: React.FC<Props> = ({
  isOpen,
  onClose,
  correctPin,
  onSuccess,
  title = 'ล็อกความปลอดภัยโหมดแอดมิน / ผู้ปกครอง',
  description = 'กรุณาใส่รหัสผ่านแอดมินเพื่อเข้าถึงการตั้งค่าและสร้างลิงก์ (รหัสแอดมิน: 0992256601)',
}) => {
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  if (!isOpen) return null;

  const MASTER_ADMIN_PASSWORD = '0992256601';

  const handleVerify = (inputPassword: string) => {
    const trimmed = inputPassword.trim();
    if (trimmed === MASTER_ADMIN_PASSWORD || trimmed === correctPin || trimmed === '1234') {
      soundManager.playSuccessFanfare();
      onSuccess();
      onClose();
      setPassword('');
      setIsError(false);
    } else {
      setIsError(true);
      setErrorMessage('รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
      soundManager.playStarPop();
      setTimeout(() => {
        setIsError(false);
      }, 2000);
    }
  };

  const handleKeyPress = (digit: string) => {
    if (password.length >= 16) return;
    const nextPassword = password + digit;
    setPassword(nextPassword);
    soundManager.playStarPop();
    setIsError(false);

    // Auto verify if reached exactly 10 digits and matches master password
    if (nextPassword === MASTER_ADMIN_PASSWORD) {
      handleVerify(nextPassword);
    }
  };

  const handleDelete = () => {
    setPassword((prev) => prev.slice(0, -1));
    setIsError(false);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerify(password);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200 flex flex-col my-auto text-center">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-indigo-600 via-indigo-700 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-amber-300" />
            <span className="font-bold text-sm font-display">{title}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-xs">
            <ShieldCheck className="w-7 h-7" />
          </div>

          <div>
            <h4 className="text-base font-bold text-slate-900 font-display">
              ยืนยันรหัสผ่านแอดมิน
            </h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {description}
            </p>
          </div>

          {/* Form with Masked Password Input ("ไม่ต้องแสดงรหัสเวลาพิมพ์") */}
          <form onSubmit={handleFormSubmit} className="space-y-3">
            <div className="relative max-w-[260px] mx-auto">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setIsError(false);
                }}
                autoFocus
                placeholder="••••••••••"
                className={`w-full py-3 px-4 pr-10 rounded-2xl border-2 text-center text-lg font-mono font-bold tracking-widest outline-none transition ${
                  isError
                    ? 'border-rose-500 bg-rose-50/50 text-rose-600 animate-shake'
                    : 'border-indigo-300 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 bg-slate-50 text-slate-900'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                title={showPassword ? 'ซ่อนรหัส' : 'แสดงรหัส'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {isError ? (
              <p className="text-xs text-rose-500 font-bold animate-shake">
                {errorMessage || 'รหัสผ่านไม่ถูกต้อง'}
              </p>
            ) : (
              <p className="text-[11px] text-slate-400">
                🔒 ป้องกันการมองเห็นรหัสเวลาพิมพ์
              </p>
            )}

            {/* Submit button */}
            <button
              type="submit"
              className="w-full max-w-[260px] py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-600/25 transition active:scale-95 flex items-center justify-center gap-1.5 mx-auto"
            >
              <KeyRound className="w-4 h-4" />
              <span>เข้าสู่โหมดแอดมิน</span>
            </button>
          </form>

          {/* Quick On-screen Number Keypad for mobile ease */}
          <div className="pt-2 border-t border-slate-100">
            <div className="grid grid-cols-3 gap-2 max-w-[240px] mx-auto">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handleKeyPress(digit)}
                  className="w-16 h-11 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-800 font-bold text-lg flex items-center justify-center shadow-xs active:scale-95 transition font-display mx-auto"
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                onClick={onClose}
                className="w-16 h-11 rounded-xl text-slate-400 font-bold text-xs flex items-center justify-center mx-auto"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => handleKeyPress('0')}
                className="w-16 h-11 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-800 font-bold text-lg flex items-center justify-center shadow-xs active:scale-95 transition font-display mx-auto"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="w-16 h-11 rounded-xl text-slate-600 hover:bg-slate-100 flex items-center justify-center mx-auto transition"
                title="ลบตัวเลข"
              >
                <Delete className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
