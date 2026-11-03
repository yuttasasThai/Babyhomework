import React, { useState } from 'react';
import { Lock, ShieldCheck, X, Check, Delete } from 'lucide-react';
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
  title = 'ล็อกความปลอดภัยโหมดผู้ปกครอง',
  description = 'ใส่รหัส PIN 4 หลักเพื่อเข้าถึงการตั้งค่าและการจัดการงานบ้าน (รหัสเริ่มต้น: 1234)',
}) => {
  const [pin, setPin] = useState<string>('');
  const [isError, setIsError] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleKeyPress = (digit: string) => {
    if (pin.length >= 4) return;
    const nextPin = pin + digit;
    setPin(nextPin);
    soundManager.playStarPop();
    setIsError(false);

    if (nextPin.length === 4) {
      if (nextPin === (correctPin || '1234')) {
        soundManager.playSuccessFanfare();
        onSuccess();
        onClose();
        setPin('');
      } else {
        setIsError(true);
        setTimeout(() => setPin(''), 600);
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setIsError(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200 flex flex-col my-auto text-center">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-indigo-600 to-slate-900 text-white flex items-center justify-between">
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
        <div className="p-6 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-xs">
            <ShieldCheck className="w-7 h-7" />
          </div>

          <div>
            <h4 className="text-base font-bold text-slate-900 font-display">
              ยืนยันสิทธิ์คุณพ่อคุณแม่
            </h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {description}
            </p>
          </div>

          {/* 4-dot indicator */}
          <div className="flex justify-center items-center gap-3 py-2">
            {[0, 1, 2, 3].map((idx) => {
              const isFilled = pin.length > idx;
              return (
                <div
                  key={idx}
                  className={`w-4 h-4 rounded-full border-2 transition-all ${
                    isError
                      ? 'border-rose-500 bg-rose-500 animate-shake'
                      : isFilled
                      ? 'border-indigo-600 bg-indigo-600 scale-110 shadow-xs'
                      : 'border-slate-300 bg-slate-100'
                  }`}
                />
              );
            })}
          </div>

          {isError && (
            <p className="text-xs text-rose-500 font-bold animate-shake">
              รหัส PIN ไม่ถูกต้อง (รหัสเริ่มต้นคือ 1234)
            </p>
          )}

          {/* Numeric keypad */}
          <div className="grid grid-cols-3 gap-2.5 pt-2 max-w-[240px] mx-auto">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleKeyPress(digit)}
                className="w-16 h-14 rounded-2xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-800 font-black text-xl flex items-center justify-center shadow-xs active:scale-95 transition font-display mx-auto"
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              onClick={onClose}
              className="w-16 h-14 rounded-2xl text-slate-400 font-bold text-xs flex items-center justify-center mx-auto"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={() => handleKeyPress('0')}
              className="w-16 h-14 rounded-2xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-800 font-black text-xl flex items-center justify-center shadow-xs active:scale-95 transition font-display mx-auto"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="w-16 h-14 rounded-2xl text-slate-600 hover:bg-slate-100 flex items-center justify-center mx-auto transition"
              title="ลบ"
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
