import React, { useState } from 'react';
import { HeroProfile, ChoreTask, ChoreLog, WishlistReward } from '../types/chore';
import { APP_REVISION, exportSourceBackupData } from '../config/revision';
import { downloadFullSourceZip, getSourceFileList, SourceFileInfo } from '../utils/sourceZipExporter';
import { soundManager } from '../utils/soundEffects';
import {
  Link2,
  Copy,
  Check,
  Share2,
  Lock,
  Download,
  Github,
  Globe,
  Sparkles,
  X,
  Smartphone,
  ShieldCheck,
  FolderArchive,
  FileCode,
  Layers,
  FileText,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  profile: HeroProfile;
  tasks: ChoreTask[];
  logs: ChoreLog[];
  rewards: WishlistReward[];
}

export const SharePlayerLinkModal: React.FC<Props> = ({
  isOpen,
  onClose,
  profile,
  tasks,
  logs,
  rewards,
}) => {
  const [activeTab, setActiveTab] = useState<'download' | 'viewer' | 'link' | 'deploy'>('download');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedFile, setCopiedFile] = useState(false);

  // ZIP download state
  const [isZipping, setIsZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);
  const [zipStatusText, setZipStatusText] = useState('');
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // File viewer state
  const fileList = getSourceFileList();
  const [selectedFilePath, setSelectedFilePath] = useState<string>('package.json');

  if (!isOpen) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '';
  const playerLink = `${currentOrigin}?mode=player`;

  const selectedFile = fileList.find((f) => f.path === selectedFilePath) || fileList[0];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(playerLink);
    setCopiedLink(true);
    soundManager.playStarPop();
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopySelectedFile = () => {
    if (selectedFile?.content) {
      navigator.clipboard.writeText(selectedFile.content);
      setCopiedFile(true);
      soundManager.playStarPop();
      setTimeout(() => setCopiedFile(false), 2500);
    }
  };

  const handleShareToLine = () => {
    const message = `🌟 ลิงก์ผจญภัยงานบ้านสำหรับฮีโร่ตัวจิ๋ว: ${profile.nickname}
🗺️ เข้าสู่แผนที่ลายแทงและทำภารกิจประจำวันได้ที่นี่:
${playerLink}

(ระบบล็อกสิทธิ์แอดมิน เพื่อความปลอดภัยเรียบร้อยแล้ว ⭐)`;

    const lineUrl = `https://line.me/R/msg/text/?${encodeURIComponent(message)}`;
    window.open(lineUrl, '_blank');
  };

  const handleDownloadFullZip = async () => {
    try {
      setIsZipping(true);
      setZipProgress(5);
      setZipStatusText('กำลังเตรียมรวบรวมไฟล์ทั้งหมด...');
      soundManager.playStarPop();

      const fileName = await downloadFullSourceZip((percent, current) => {
        setZipProgress(percent);
        setZipStatusText(current);
      });

      setDownloadSuccess(fileName);
      soundManager.playSuccessFanfare();
      setTimeout(() => {
        setIsZipping(false);
      }, 800);
    } catch (err) {
      console.error('Failed to generate zip:', err);
      setIsZipping(false);
      alert('เกิดข้อผิดพลาดในการสร้างไฟล์ ZIP กรุณาลองใหม่อีกครั้ง');
    }
  };

  const handleExportDataBackup = () => {
    soundManager.playSuccessFanfare();
    exportSourceBackupData({
      profile,
      tasks,
      logs,
      rewards,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shadow-inner">
              📦
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-display leading-tight flex items-center gap-2">
                <span>ดาวน์โหลด Source Code เต็ม & ลิงก์ส่งให้เด็ก</span>
              </h3>
              <p className="text-xs text-indigo-100 mt-0.5">
                Revision: {APP_REVISION.revision} (เวอร์ชัน {APP_REVISION.version}) • พร้อมขึ้น Vercel / GitHub
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

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50/90 px-3 sm:px-4 pt-2.5 gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => {
              setActiveTab('download');
              soundManager.playStarPop();
            }}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'download'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FolderArchive className="w-4 h-4" />
            <span>โหลด Source Code (.ZIP)</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('viewer');
              soundManager.playStarPop();
            }}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'viewer'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>ดู & คัดลอกโค้ด ({fileList.length} ไฟล์)</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('link');
              soundManager.playStarPop();
            }}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'link'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>ลิงก์เฉพาะเด็ก</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('deploy');
              soundManager.playStarPop();
            }}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'deploy'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>คู่มือขึ้น Vercel</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 text-slate-700">
          {/* TAB 1: DOWNLOAD COMPLETE ZIP */}
          {activeTab === 'download' && (
            <div className="space-y-4">
              {/* Highlight Hero Download Card */}
              <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-2 border-indigo-200/80 shadow-sm space-y-4 text-center">
                <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-indigo-600/30">
                  <FolderArchive className="w-8 h-8" />
                </div>

                <div>
                  <h4 className="text-lg sm:text-xl font-bold text-slate-900 font-display">
                    ดาวน์โหลด Source Code ครบทุกไฟล์ (.ZIP)
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mt-1 leading-relaxed">
                    รวมโค้ดทั้งหมดครบ 100% ทั้ง <strong>Vite, React 19, TypeScript, Tailwind, vercel.json, package.json, รูปภาพ และ components</strong> ทั้งหมด พร้อมอัปขึ้น GitHub และ deploy บน Vercel ได้ทันที
                  </p>
                </div>

                {/* Progress Bar when Zipping */}
                {isZipping ? (
                  <div className="p-4 bg-white rounded-2xl border border-indigo-100 shadow-xs space-y-2 max-w-md mx-auto">
                    <div className="flex items-center justify-between text-xs font-bold text-indigo-700">
                      <span className="flex items-center gap-1.5">
                        <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                        <span>กำลังบีบอัดไฟล์ Source Code...</span>
                      </span>
                      <span>{zipProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2.5 rounded-full transition-all duration-200"
                        style={{ width: `${zipProgress}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 font-mono truncate text-left">
                      {zipStatusText}
                    </p>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleDownloadFullZip}
                    className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-sm sm:text-base flex items-center justify-center gap-3 shadow-lg shadow-indigo-600/25 transition active:scale-95 mx-auto"
                  >
                    <Download className="w-5 h-5" />
                    <span>📥 กดเพื่อดาวน์โหลด Source Code เต็ม (.ZIP)</span>
                  </button>
                )}

                {downloadSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-medium flex items-center justify-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>ดาวน์โหลดไฟล์ <strong>{downloadSuccess}</strong> สำเร็จแล้ว! ตรวจสอบในโฟลเดอร์ Downloads บนมือถือได้เลย</span>
                  </div>
                )}
              </div>

              {/* What is included breakdown */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <span className="font-bold text-slate-900 block font-display">
                  📋 รายการที่รวมอยู่ในไฟล์ ZIP ชุดนี้:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span><strong>vercel.json</strong> (ตั้งค่า SPA Rewrite)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span><strong>package.json</strong> (Dependencies ครบ)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span><strong>vite.config.ts & tsconfig.json</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span><strong>index.html & README.md</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span><strong>src/App.tsx, components, utils</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span><strong>ภาพแผนที่ & อวตารฮีโร่ทั้งหมด</strong></span>
                  </div>
                </div>
              </div>

              {/* Secondary Option: Backup Data JSON only */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-amber-950 block font-display">
                    สำรองเฉพาะข้อมูลภารกิจ & ประวัติงาน (.JSON):
                  </span>
                  <span className="text-[11px] text-amber-800">
                    สำหรับสำรองคะแนนสะสมและรายชื่องานบ้านไว้กู้คืน
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleExportDataBackup}
                  className="py-2 px-3.5 rounded-xl bg-white hover:bg-amber-100 text-amber-900 font-bold text-xs flex items-center gap-1.5 border border-amber-300 transition shrink-0 shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>โหลด Data (.JSON)</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: IN-APP FILE CODE VIEWER & COPY */}
          {activeTab === 'viewer' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>เลือกไฟล์เพื่อดูและคัดลอกโค้ดไปวางใน GitHub ได้ทันที:</span>
                <span className="font-mono text-slate-400">
                  {selectedFile.sizeBytes ? `${Math.round(selectedFile.sizeBytes / 1024 * 10) / 10} KB` : ''}
                </span>
              </div>

              {/* File selector bar */}
              <div className="flex items-center gap-2">
                <select
                  value={selectedFilePath}
                  onChange={(e) => setSelectedFilePath(e.target.value)}
                  className="flex-1 px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-mono font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                >
                  <optgroup label="⚙️ การตั้งค่าหลัก (Root Config)">
                    {fileList
                      .filter((f) => f.category === 'config' || f.category === 'docs')
                      .map((f) => (
                        <option key={f.path} value={f.path}>
                          {f.path}
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="💻 โค้ดโปรเจกต์ (Source Code)">
                    {fileList
                      .filter((f) => f.category === 'source')
                      .map((f) => (
                        <option key={f.path} value={f.path}>
                          {f.path}
                        </option>
                      ))}
                  </optgroup>
                </select>

                {selectedFile.content && (
                  <button
                    type="button"
                    onClick={handleCopySelectedFile}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs shrink-0"
                  >
                    {copiedFile ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedFile ? 'คัดลอกแล้ว!' : 'คัดลอกทั้งไฟล์'}</span>
                  </button>
                )}
              </div>

              {/* Code viewer box */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950 text-slate-200 p-4 font-mono text-xs overflow-x-auto max-h-[40vh] select-text">
                {selectedFile.content ? (
                  <pre className="whitespace-pre">{selectedFile.content}</pre>
                ) : (
                  <div className="py-8 text-center text-slate-400">
                    <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <span>ไฟล์นี้เป็นรูปภาพหรือ Binary Asset ถูกรวมอยู่ในไฟล์ ZIP ให้เรียบร้อยแล้ว</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: PLAYER LINK */}
          {activeTab === 'link' && (
            <div className="space-y-4">
              {/* Security feature box */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>ระบบล็อกสิทธิ์แอดมินอัตโนมัติ (Player Only Mode)</span>
                </div>
                <ul className="space-y-1 list-disc list-inside text-emerald-800 pl-1 leading-relaxed">
                  <li>เด็กสามารถดูแผนที่ลายแทง และแตะทำภารกิจประจำวันได้ตามปกติ</li>
                  <li>สามารถเปิดกล้องถ่ายรูปส่งงานและสะสมดาวได้</li>
                  <li><strong>🔒 ซ่อนและล็อกสิทธิ์แอดมิน:</strong> ไม่สามารถลบงานบ้าน, ไม่สามารถแก้ดาว, และไม่สามารถเข้าเมนูผู้ปกครองได้ (ต้องใส่รหัส PIN 4 หลัก ค่าเริ่มต้น: 1234)</li>
                </ul>
              </div>

              {/* Link Input & Copy */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  ลิงก์เข้าใช้งานสำหรับเด็ก (คัดลอกส่งต่อได้ทันที):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={playerLink}
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-mono text-slate-800 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs shrink-0"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedLink ? 'คัดลอกแล้ว!' : 'คัดลอกลิงก์'}</span>
                  </button>
                </div>
              </div>

              {/* LINE Share Action */}
              <button
                type="button"
                onClick={handleShareToLine}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#06C755] hover:bg-[#05b34c] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition"
              >
                <Share2 className="w-4 h-4" />
                <span>📲 ส่งลิงก์เข้าแชท LINE ให้ลูกหรือส่งให้คนในบ้าน</span>
              </button>
            </div>
          )}

          {/* TAB 4: DEPLOY GUIDE */}
          {activeTab === 'deploy' && (
            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 leading-relaxed">
                <div className="flex items-center gap-1.5 font-bold mb-1">
                  <Smartphone className="w-4 h-4 text-amber-700" />
                  <span>ทำบนโทรศัพท์แอนดรอยด์ได้ 100% โดยไม่ต้องใช้คอมพิวเตอร์!</span>
                </div>
                ระบบเตรียมไฟล์ <strong>vercel.json</strong> และปรับโครงสร้าง Vite Build ให้พร้อมแล้ว สามารถอัปขึ้น Vercel ได้โดยไม่มี Error
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <h5 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <Github className="w-4 h-4" />
                    <span>ขั้นตอนที่ 1: นำโค้ดขึ้น GitHub (บนมือถือ)</span>
                  </h5>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-600 pl-1 leading-relaxed">
                    <li>ดาวน์โหลดไฟล์ Source Code <strong>.ZIP</strong> จากแท็บแรกของหน้านี้</li>
                    <li>ใช้แอปจัดการไฟล์ในมือถือ (Files / ZArchiver) แตกไฟล์ ZIP ออกมา</li>
                    <li>เปิด Chrome บนมือถือ เข้าเว็บ <strong>github.com</strong> แล้วล็อกอิน</li>
                    <li>กดปุ่มเครื่องหมายบวก <strong>"+" ➔ "New repository"</strong></li>
                    <li>ตั้งชื่อ Repository เช่น <code className="bg-slate-200 px-1 rounded">little-hero-chore-quest</code> แล้วกด Create</li>
                    <li>กดปุ่ม <strong>"uploading an existing file"</strong> ลากหรือเลือกไฟล์ทั้งหมดที่แตกออกมาอัปโหลดขึ้นไป แล้วกด <strong>Commit changes</strong></li>
                  </ol>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                  <h5 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-indigo-600" />
                    <span>ขั้นตอนที่ 2: ผูกเข้ากับ Vercel (ฟรี & อัตโนมัติ)</span>
                  </h5>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-600 pl-1 leading-relaxed">
                    <li>เข้าเว็บ <strong>vercel.com</strong> บนมือถือ และล็อกอินด้วยบัญชี GitHub</li>
                    <li>กดปุ่ม <strong>"Add New..." ➔ "Project"</strong></li>
                    <li>เลือก Repository <code className="bg-slate-200 px-1 rounded">little-hero-chore-quest</code> ที่เพิ่งสร้าง แล้วกด <strong>Import</strong></li>
                    <li>
                      ระบบจะตรวจจับ Framework เป็น <strong>Vite</strong> อัตโนมัติ (มีไฟล์ <code className="bg-slate-200 px-1 rounded">vercel.json</code> รองรับแล้ว)
                    </li>
                    <li>กดปุ่ม <strong>"Deploy"</strong> รอประมาณ 30 วินาที จะได้โดเมน <code className="bg-emerald-100 text-emerald-800 px-1 rounded font-bold">.vercel.app</code> ที่ใช้งานได้ทั่วโลกทันที!</li>
                  </ol>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500 font-mono">
            {APP_REVISION.sourceName}
          </span>
          <button
            onClick={onClose}
            className="py-2 px-5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
