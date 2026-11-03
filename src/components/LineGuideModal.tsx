import React, { useState } from 'react';
import { X, MessageCircle, CheckCircle2, AlertTriangle, ArrowRight, Sparkles, Send } from 'lucide-react';
import { soundManager } from '../utils/soundEffects';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const LineGuideModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'easy' | 'messaging_api'>('easy');
  const [channelToken, setChannelToken] = useState<string>('');
  const [isSaved, setIsSaved] = useState<boolean>(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 flex flex-col my-auto max-h-[95vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#06C755] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shadow-inner">
              <MessageCircle className="w-6 h-6 fill-white" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-display leading-tight">
                แนวทางเชื่อมต่อ LINE & ตอบรับอนุมัติดาว
              </h3>
              <p className="text-xs text-white/90 mt-0.5">
                แทนที่ LINE Notify ที่ปิดตัวลงอย่างเป็นทางการ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/20 transition min-h-[40px] min-w-[40px] flex items-center justify-center text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-100 bg-slate-50/80 px-4 pt-3 gap-2">
          <button
            onClick={() => {
              soundManager.playStarPop();
              setActiveTab('easy');
            }}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition ${
              activeTab === 'easy'
                ? 'border-[#06C755] text-[#06C755]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            วิธีที่ 1: 1-Tap LINE Share (แนะนำ ง่ายและเร็ว)
          </button>
          <button
            onClick={() => {
              soundManager.playStarPop();
              setActiveTab('messaging_api');
            }}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition ${
              activeTab === 'messaging_api'
                ? 'border-[#06C755] text-[#06C755]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            วิธีที่ 2: LINE Messaging API (บอททางการ)
          </button>
        </div>

        {/* Body content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 text-slate-700">
          {/* Notify sunset banner */}
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <strong>ข้อมูลสำคัญ:</strong> LINE Notify ได้ปิดให้บริการถาวรแล้ว (Terminated) ทาง LINE แนะนำให้ใช้ <strong>LINE Messaging API</strong> หรือระบบแชร์ลิงก์ตรง (LINE Social Share) แทน
            </div>
          </div>

          {activeTab === 'easy' ? (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-sm font-display flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>ขั้นตอนการส่งภาพตรวจงาน & อนุมัติดาว (ไม่ต้องสมัครบอท):</span>
              </h4>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#06C755] text-white flex items-center justify-center font-bold shrink-0">
                    1
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900">ลูกถ่ายรูปส่งงาน</h5>
                    <p className="text-slate-500 mt-0.5">
                      ระบบ Canvas ประทับตราวันเวลาจริงลงบนภาพอัตโนมัติ พร้อมรหัสความปลอดภัย
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#06C755] text-white flex items-center justify-center font-bold shrink-0">
                    2
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900">กดปุ่ม "📲 ส่งเข้า LINE พ่อแม่"</h5>
                    <p className="text-slate-500 mt-0.5">
                      แอปจะเปิดแชท LINE พร้อมพิมพ์ข้อความและแนบลิงก์ตรวจงานให้อัตโนมัติในคลิกเดียว
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#06C755] text-white flex items-center justify-center font-bold shrink-0">
                    3
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900">พ่อแม่แตะดูรูป & กดอนุมัติดาว</h5>
                    <p className="text-slate-500 mt-0.5">
                      เมื่อคุณพ่อคุณแม่เปิดดูรูปประทับเวลา จะมีปุ่ม <strong>"⭐ ตรวจผ่าน & อนุมัติดาวพิเศษ"</strong> เมื่อกดแล้ว ลูกจะได้ยินเสียงพลุและรับดาวโบนัสทันที!
                    </p>
                  </div>
                </div>
              </div>

              {/* Flex Message Preview Mock */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200">
                <span className="text-[11px] font-bold text-emerald-800 block mb-2">
                  ตัวอย่างข้อความที่ส่งเข้า LINE พ่อแม่:
                </span>
                <div className="p-3 rounded-xl bg-white border border-emerald-200 shadow-xs text-xs space-y-1 font-mono">
                  <p className="text-emerald-900 font-bold">🌟 ฮีโร่ตัวจิ๋วส่งงานบ้านแล้วจ้า!</p>
                  <p>👤 ผู้ส่งงาน: น้องอาชิ</p>
                  <p>📋 ภารกิจ: 🍽️ ล้างจานชามอาหารเช้า</p>
                  <p>⏰ เวลาส่งงาน: 08:35 น. (มีตราประทับลายน้ำ Canvas จริง)</p>
                  <p className="text-[#06C755] font-bold">👉 คุณพ่อคุณแม่แตะลิงก์เพื่อตรวจงาน & ให้ดาวโบนัส</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              <h4 className="font-bold text-slate-900 text-sm font-display">
                การตั้งค่า LINE Messaging API (Webhook & Flex Message)
              </h4>
              <p className="text-slate-600 leading-relaxed">
                หากต้องการส่งข้อความผ่าน LINE Official Account (LINE OA) โดยตรง:
              </p>

              <ol className="list-decimal list-inside space-y-2 text-slate-600 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <li>เข้าไปที่ <strong>developers.line.biz</strong> แล้วล็อกอินด้วยบัญชี LINE</li>
                <li>สร้าง Provider และ Channel ประเภท <strong>Messaging API</strong> (ฟรี)</li>
                <li>ไปที่แท็บ Messaging API คัดลอก <strong>Channel Access Token (long-lived)</strong></li>
                <li>นำมาใส่ในช่องด้านล่างเพื่อเปิดการแจ้งเตือนอัตโนมัติ</li>
              </ol>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  LINE Channel Access Token (ไม่บังคับ):
                </label>
                <input
                  type="text"
                  value={channelToken}
                  onChange={(e) => setChannelToken(e.target.value)}
                  placeholder="วาง Channel Access Token ที่ได้จาก LINE Developers"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs outline-none focus:border-[#06C755]"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsSaved(true);
                  soundManager.playStarPop();
                  setTimeout(() => setIsSaved(false), 3000);
                }}
                className="py-2.5 px-4 rounded-xl bg-[#06C755] text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#05b34c] transition"
              >
                <Send className="w-4 h-4" />
                <span>{isSaved ? '✓ บันทึกโทเคนเรียบร้อย' : 'บันทึกการตั้งค่า LINE'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="py-2.5 px-5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition"
          >
            เข้าใจแล้ว ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
