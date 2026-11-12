import React, { useState, useEffect } from 'react';
import { HeroProfile, ChoreTask, ChoreLog, WishlistReward } from '../types/chore';
import { APP_REVISION, exportSourceBackupData } from '../config/revision';
import {
  downloadFullSourceZip,
  downloadUtilsOnlyZip,
  downloadSingleTextFile,
  getSourceFileList,
} from '../utils/sourceZipExporter';
import {
  createUserToken,
  getActiveUserTokens,
  renewUserToken,
  deleteUserToken,
  formatThaiDate,
  UserTokenPayload,
} from '../utils/storage';
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
  FileText,
  Loader2,
  Boxes,
  KeyRound,
  Calendar,
  Clock,
  RefreshCw,
  Trash2,
  User,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  profile: HeroProfile;
  tasks: ChoreTask[];
  logs: ChoreLog[];
  rewards: WishlistReward[];
  isPlayerOnlyMode?: boolean;
}

export const SharePlayerLinkModal: React.FC<Props> = ({
  isOpen,
  onClose,
  profile,
  tasks,
  logs,
  rewards,
  isPlayerOnlyMode = false,
}) => {
  const [activeTab, setActiveTab] = useState<'user_link' | 'download' | 'utils' | 'viewer' | 'deploy'>('user_link');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedPasscode, setCopiedPasscode] = useState(false);
  const [copiedFile, setCopiedFile] = useState(false);

  // User link & Expiry generator state
  const [userNameInput, setUserNameInput] = useState<string>(profile.nickname || 'น้องอาชิ');
  const [userPasswordInput, setUserPasswordInput] = useState<string>(() => `HERO-${Math.floor(1000 + Math.random() * 9000)}`);
  const [expiryDays, setExpiryDays] = useState<number>(30);
  const [activeTokens, setActiveTokens] = useState<UserTokenPayload[]>([]);
  const [lastGeneratedPayload, setLastGeneratedPayload] = useState<UserTokenPayload | null>(null);
  const [lastGeneratedLink, setLastGeneratedLink] = useState<string | null>(null);

  // Acknowledged expired tokens state (Requirement 4)
  const [acknowledgedExpiredPasscodes, setAcknowledgedExpiredPasscodes] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('chore_hero_ack_expired_tokens');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Full ZIP download state
  const [isZipping, setIsZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);
  const [zipStatusText, setZipStatusText] = useState('');
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // Utils only ZIP state
  const [isUtilsZipping, setIsUtilsZipping] = useState(false);
  const [utilsZipSuccess, setUtilsZipSuccess] = useState<string | null>(null);

  // File viewer state
  const fileList = getSourceFileList();
  const [selectedFilePath, setSelectedFilePath] = useState<string>('package.json');

  // Load existing tokens on open
  useEffect(() => {
    if (isOpen) {
      const tokens = getActiveUserTokens();
      setActiveTokens(tokens);
      if (!userNameInput) {
        setUserNameInput(profile.nickname || 'น้องอาชิ');
      }
    }
  }, [isOpen, profile.nickname]);

  // Requirement 4: Unacknowledged expired tokens
  const unacknowledgedExpiredTokens = activeTokens.filter(
    (t) => Date.now() > t.validUntil && !acknowledgedExpiredPasscodes.includes(t.passcode)
  );

  // Voice warning trigger when expired token is detected for admin
  useEffect(() => {
    if (isOpen && unacknowledgedExpiredTokens.length > 0) {
      const names = unacknowledgedExpiredTokens.map((t) => t.userName || t.heroName).join(' และ ');
      soundManager.playExpiredUserVoiceAlert(names);
    }
  }, [isOpen, unacknowledgedExpiredTokens.length]);

  if (!isOpen) return null;

  // If in user mode, do NOT allow opening this modal!
  if (isPlayerOnlyMode) {
    return null;
  }

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '';
  const selectedFile = fileList.find((f) => f.path === selectedFilePath) || fileList[0];

  // Acknowledge expired alert popup
  const handleAcknowledgeExpired = () => {
    soundManager.playStarPop();
    const updated = [...acknowledgedExpiredPasscodes, ...unacknowledgedExpiredTokens.map((t) => t.passcode)];
    setAcknowledgedExpiredPasscodes(updated);
    try {
      localStorage.setItem('chore_hero_ack_expired_tokens', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Generate User Link with token and expiration (Requirement 1: เคลียร์ล้างข้อมูลทั้งหมด)
  const handleGenerateUserTokenLink = () => {
    soundManager.playSuccessFanfare();
    const finalUserName = userNameInput.trim() || profile.nickname || 'น้องอาชิ';
    const finalPassword = userPasswordInput.trim() || `HERO-${Math.floor(1000 + Math.random() * 9000)}`;

    const { token, payload } = createUserToken(
      profile,
      tasks,
      expiryDays,
      finalPassword,
      finalUserName,
      finalPassword,
      true // เคลียร์ล้างข้อมูลทั้งหมดเพื่อให้ user ที่ใช้งานสร้างข้อมูลของตัวเอง
    );

    // รีเซ็ตสถานะ onboarding เพื่อให้ user ที่ได้รับลิงก์สร้างชื่อและเลือกโปรไฟล์ในครั้งแรก
    localStorage.removeItem(`chore_hero_onboarding_completed_${payload.passcode}`);

    const fullLink = `${currentOrigin}?playerToken=${token}`;
    setLastGeneratedLink(fullLink);
    setLastGeneratedPayload(payload);
    setActiveTokens(getActiveUserTokens());
  };

  // Renew an existing token
  const handleRenewToken = (passcode: string, days: number) => {
    const updated = renewUserToken(passcode, days);
    if (updated) {
      soundManager.playStarPop();
      setActiveTokens(getActiveUserTokens());
      if (lastGeneratedPayload?.passcode === passcode) {
        setLastGeneratedPayload(updated);
      }
    }
  };

  // Delete/Revoke a token
  const handleDeleteToken = (passcode: string) => {
    deleteUserToken(passcode);
    soundManager.playStarPop();
    setActiveTokens(getActiveUserTokens());
    if (lastGeneratedPayload?.passcode === passcode) {
      setLastGeneratedPayload(null);
      setLastGeneratedLink(null);
    }
  };

  const handleCopyLink = (linkToCopy?: string) => {
    const link = linkToCopy || lastGeneratedLink || `${currentOrigin}?mode=player`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    soundManager.playStarPop();
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyPasscode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedPasscode(true);
    soundManager.playStarPop();
    setTimeout(() => setCopiedPasscode(false), 2000);
  };

  const handleShareTokenToLine = (link: string, payload: UserTokenPayload) => {
    const message = `🌟 ลิงก์ผจญภัยงานบ้านสำหรับฮีโร่ตัวจิ๋ว: ${payload.heroName}
🗺️ เข้าสู่แผนที่ภารกิจและทำภารกิจสะสมดาวได้ที่นี่:
${link}

👤 ชื่อผู้ใช้ (User): ${payload.userName || payload.heroName}
🔑 รหัสผ่าน (Password): ${payload.passcode}
⏰ วันหมดอายุ: ${payload.validUntilFormatted}
🛡️ สิทธิ์ผู้ใช้: ล็อกโหมดแอดมิน ปลอดภัย และไม่สามารถดาวน์โหลดซอร์สโค้ดได้ ⭐`;

    const lineUrl = `https://line.me/R/msg/text/?${encodeURIComponent(message)}`;
    window.open(lineUrl, '_blank');
  };

  const handleCopySelectedFile = () => {
    if (selectedFile?.content) {
      navigator.clipboard.writeText(selectedFile.content);
      setCopiedFile(true);
      soundManager.playStarPop();
      setTimeout(() => setCopiedFile(false), 2500);
    }
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
    }
  };

  const handleDownloadUtilsZip = async () => {
    try {
      setIsUtilsZipping(true);
      soundManager.playStarPop();
      const fileName = await downloadUtilsOnlyZip();
      setUtilsZipSuccess(fileName);
      soundManager.playSuccessFanfare();
      setTimeout(() => {
        setIsUtilsZipping(false);
      }, 800);
    } catch (err) {
      console.error('Failed to generate utils zip:', err);
      setIsUtilsZipping(false);
    }
  };

  const UTILS_FILES_META = [
    {
      path: 'src/utils/watermark.ts',
      name: 'watermark.ts',
      title: 'ประทับเวลาจริง Canvas บนรูป (ฉบับเสถียร ไม่หมุนค้าง)',
      desc: 'ประทับวันเวลาจริงและรหัสตรวจรับบนภาพ ความเร็วสูง รองรับมือถือ Android',
      critical: true,
    },
    {
      path: 'src/utils/storage.ts',
      name: 'storage.ts',
      title: 'ระบบจัดเก็บข้อมูลและงานบ้าน & User Link',
      desc: 'รหัสแอดมิน 0992256601, สร้าง User Token, วันหมดอายุ, ต่ออายุ',
      critical: true,
    },
    {
      path: 'src/utils/ranks.ts',
      name: 'ranks.ts',
      title: 'คำนวณระดับดาว 6 ขั้น',
      desc: 'ระดับดาวสะสม (เด็กขยัน, ผู้พิชิต, พ่อบ้านจิ๋ว 1-3, แชมเปี้ยน)',
      critical: true,
    },
    {
      path: 'src/utils/soundEffects.ts',
      name: 'soundEffects.ts',
      title: 'ระบบเสียงเอฟเฟกต์',
      desc: 'เสียงปุ่มกด, เสียงดาวป๊อป, เสียงสำเร็จภารกิจ (Web Audio API)',
      critical: true,
    },
    {
      path: 'src/utils/alarmAudio.ts',
      name: 'alarmAudio.ts',
      title: 'เสียงพูดเตือนภารกิจตามเวลา',
      desc: 'พูดเตือนชื่อภารกิจตามคิวเวลาและพูดซ้ำเป็นช่วงๆ (Speech Synthesis)',
      critical: true,
    },
    {
      path: 'src/utils/lineShare.ts',
      name: 'lineShare.ts',
      title: 'ระบบแชร์ส่งงานเข้า LINE',
      desc: 'สร้างลิงก์และข้อความส่งงานให้คุณพ่อคุณแม่ตรวจให้คะแนน',
      critical: false,
    },
    {
      path: 'src/utils/confetti.ts',
      name: 'confetti.ts',
      title: 'พลุกระดาษฉลองชัย',
      desc: 'ยิงพลุกระดาษสีทองเวลาเด็กทำภารกิจสำเร็จ',
      critical: false,
    },
    {
      path: 'src/utils/sourceZipExporter.ts',
      name: 'sourceZipExporter.ts',
      title: 'ตัวส่งออก Source Code',
      desc: 'รวบรวมไฟล์ทั้งหมดในโปรเจกต์เป็น .ZIP สำหรับแบ็กอัปและแอดมิน',
      critical: true,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden border border-amber-200 flex flex-col my-auto max-h-[94vh]">
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shadow-inner">
              👑
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black font-display leading-tight flex items-center gap-1.5">
                <span>ศูนย์ควบคุมแอดมิน & ลิงก์ User</span>
                <span className="text-[10px] bg-slate-900/60 px-2 py-0.5 rounded-full font-mono font-normal">
                  {APP_REVISION.version} ({APP_REVISION.buildTag})
                </span>
              </h3>
              <p className="text-xs text-amber-100">
                สร้างลิงก์สำหรับผู้ใช้/ลูก กำหนด username, password, วันหมดอายุ, ต่ออายุ
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/20 transition min-h-[40px] min-w-[40px] flex items-center justify-center text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="px-3 pt-2 bg-slate-50 border-b border-slate-200 flex gap-1 overflow-x-auto shrink-0 scrollbar-none">
          <button
            onClick={() => {
              soundManager.playStarPop();
              setActiveTab('user_link');
            }}
            className={`py-2 px-3.5 rounded-t-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'user_link'
                ? 'bg-white text-indigo-700 border-t-2 border-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5 text-indigo-500" />
            <span>🔑 สร้างลิงก์ & รหัส User</span>
          </button>

          <button
            onClick={() => {
              soundManager.playStarPop();
              setActiveTab('download');
            }}
            className={`py-2 px-3.5 rounded-t-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'download'
                ? 'bg-white text-amber-900 border-t-2 border-amber-500 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FolderArchive className="w-3.5 h-3.5 text-amber-500" />
            <span>📦 โหลด Source เต็ม (ZIP)</span>
          </button>

          <button
            onClick={() => {
              soundManager.playStarPop();
              setActiveTab('utils');
            }}
            className={`py-2 px-3.5 rounded-t-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'utils'
                ? 'bg-white text-emerald-800 border-t-2 border-emerald-500 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Boxes className="w-3.5 h-3.5 text-emerald-500" />
            <span>📁 src/utils (8 ไฟล์)</span>
          </button>

          <button
            onClick={() => {
              soundManager.playStarPop();
              setActiveTab('viewer');
            }}
            className={`py-2 px-3.5 rounded-t-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'viewer'
                ? 'bg-white text-amber-900 border-t-2 border-amber-500 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileCode className="w-3.5 h-3.5 text-amber-500" />
            <span>📄 ดูโค้ดทีละไฟล์</span>
          </button>

          <button
            onClick={() => {
              soundManager.playStarPop();
              setActiveTab('deploy');
            }}
            className={`py-2 px-3.5 rounded-t-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'deploy'
                ? 'bg-white text-amber-900 border-t-2 border-amber-500 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-sky-500" />
            <span>🚀 แนะนำวิธีอัปเดตไฟล์ GitHub</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* ========================================================
              TAB 1: สร้างลิงก์ User พร้อมกำหนด username, password, วันหมดอายุ, ต่ออายุ
              ======================================================== */}
          {activeTab === 'user_link' && (
            <div className="space-y-6">
              {/* Creator Box */}
              <div className="bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/50 rounded-2xl p-4 sm:p-5 border-2 border-indigo-200 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-black text-slate-900 font-display">
                      กำหนด User Name, Password, และ วันหมดอายุ
                    </h4>
                    <p className="text-xs text-slate-600">
                      เมื่อส่งลิงก์นี้ไปให้ลูกหรือเปิดบนโทรศัพท์เครื่องอื่น จะเข้าสู่โหมดฮีโร่ตัวจิ๋วทันที และไม่สามารถดาวน์โหลด Source Code ได้
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  {/* User Name input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-indigo-600" />
                      <span>User Name (ชื่อผู้ใช้)</span>
                    </label>
                    <input
                      type="text"
                      value={userNameInput}
                      onChange={(e) => setUserNameInput(e.target.value)}
                      placeholder="เช่น น้องอาชิ, น้องมะลิ"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold bg-white outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Password / Passcode input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Password (รหัสผ่าน)</span>
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={userPasswordInput}
                        onChange={(e) => setUserPasswordInput(e.target.value)}
                        placeholder="เช่น 1234 หรือ รหัสผ่าน"
                        className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold bg-white outline-none focus:border-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setUserPasswordInput(`HERO-${Math.floor(1000 + Math.random() * 9000)}`);
                          soundManager.playStarPop();
                        }}
                        className="px-2 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                        title="สุ่มรหัสผ่านใหม่"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Expiry Duration Selection with Custom Days Input */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-indigo-600" />
                        <span>กำหนดวันหมดอายุ</span>
                      </span>
                      <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                        {expiryDays} วัน
                      </span>
                    </label>

                    {/* Quick Preset Buttons (7 วัน, 15 วัน, 30 วัน / 1 เดือน, 90 วัน, 365 วัน / 1 ปี) */}
                    <div className="grid grid-cols-5 gap-1">
                      {[
                        { label: '7 วัน', days: 7 },
                        { label: '15 วัน', days: 15 },
                        { label: '30 วัน (1ด)', days: 30 },
                        { label: '90 วัน', days: 90 },
                        { label: '1 ปี', days: 365 },
                      ].map((item) => (
                        <button
                          key={item.days}
                          type="button"
                          onClick={() => {
                            setExpiryDays(item.days);
                            soundManager.playStarPop();
                          }}
                          className={`py-1.5 rounded-xl text-[11px] font-bold border transition ${
                            expiryDays === item.days
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>

                    {/* ช่องกำหนดจำนวนวันเองได้ (Custom Days Input) */}
                    <div className="p-2 rounded-xl bg-white border-2 border-indigo-200 flex items-center justify-between gap-2 shadow-xs">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-[11px] font-bold text-slate-700 whitespace-nowrap">✏️ กำหนดวันเอง:</span>
                        <input
                          type="number"
                          min="1"
                          max="3650"
                          value={expiryDays}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            setExpiryDays(isNaN(val) || val < 1 ? 1 : Math.min(val, 3650));
                          }}
                          className="w-16 px-2 py-1 rounded-lg border border-indigo-300 text-center font-mono font-bold text-xs bg-indigo-50/50 outline-none focus:border-indigo-600 focus:bg-white text-indigo-900"
                        />
                        <span className="text-xs font-bold text-slate-600">วัน</span>
                      </div>

                      {/* Quick Stepper buttons */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => setExpiryDays((prev) => Math.max(1, prev - 1))}
                          className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center transition active:scale-95"
                          title="ลด 1 วัน"
                        >
                          -1
                        </button>
                        <button
                          type="button"
                          onClick={() => setExpiryDays((prev) => Math.min(3650, prev + 1))}
                          className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center transition active:scale-95"
                          title="เพิ่ม 1 วัน"
                        >
                          +1
                        </button>
                        <button
                          type="button"
                          onClick={() => setExpiryDays((prev) => Math.min(3650, prev + 10))}
                          className="px-1.5 h-6 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center transition border border-indigo-200"
                          title="เพิ่ม 10 วัน"
                        >
                          +10
                        </button>
                        <button
                          type="button"
                          onClick={() => setExpiryDays((prev) => Math.min(3650, prev + 30))}
                          className="px-1.5 h-6 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] flex items-center justify-center transition shadow-xs"
                          title="เพิ่ม 30 วัน"
                        >
                          +30
                        </button>
                      </div>
                    </div>

                    {/* Expiration date live preview */}
                    <p className="text-[11px] text-indigo-800 font-medium">
                      📅 หมดอายุ: {formatThaiDate(new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000))}
                    </p>
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  type="button"
                  onClick={handleGenerateUserTokenLink}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-sm shadow-md shadow-indigo-500/20 transition active:scale-98 flex items-center justify-center gap-2 font-display"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>⚡ สร้างลิงก์ User: {userNameInput || 'น้องอาชิ'} (กำหนดใช้งาน {expiryDays} วัน)</span>
                </button>
              </div>

              {/* Generated Result Box */}
              {lastGeneratedLink && lastGeneratedPayload && (
                <div className="bg-emerald-50 rounded-2xl p-4 sm:p-5 border-2 border-emerald-300 space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                      <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                      <span>สร้างลิงก์สำเร็จแล้ว พร้อมใช้งานบนโทรศัพท์เครื่องอื่น</span>
                    </span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      หมดอายุ: {lastGeneratedPayload.validUntilFormatted}
                    </span>
                  </div>

                  {/* Link Box */}
                  <div className="flex items-center gap-2 bg-white rounded-xl p-2 border border-emerald-200">
                    <input
                      type="text"
                      readOnly
                      value={lastGeneratedLink}
                      className="flex-1 bg-transparent border-none text-xs font-mono text-slate-700 truncate outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopyLink(lastGeneratedLink)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1 shrink-0"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? 'คัดลอกแล้ว!' : 'คัดลอกลิงก์'}</span>
                    </button>
                  </div>

                  {/* Passcode display & LINE share */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <div className="flex items-center gap-3">
                      <div className="text-xs">
                        <span className="text-slate-500">User: </span>
                        <strong className="text-slate-900">{lastGeneratedPayload.userName || lastGeneratedPayload.heroName}</strong>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-slate-500">Password: </span>
                        <span className="font-mono font-black text-xs bg-white px-2 py-0.5 rounded-lg border border-emerald-300 text-indigo-900">
                          {lastGeneratedPayload.passcode}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyPasscode(lastGeneratedPayload.passcode)}
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-bold underline"
                        >
                          {copiedPasscode ? 'คัดลอกแล้ว' : 'คัดลอก'}
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleShareTokenToLine(lastGeneratedLink, lastGeneratedPayload)}
                      className="py-2 px-4 rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>📲 ส่งให้ลูก/เครื่องอื่นผ่าน LINE</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Requirement 4: บันทึกลงตาราง (User Links Table) */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <span>📊 ตารางบันทึกรายชื่อ User Links ทั้งหมด ({activeTokens.length})</span>
                      {activeTokens.some((t) => Date.now() > t.validUntil) && (
                        <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-2 py-0.5 rounded-full animate-pulse">
                          ⚠️ มีลิงก์หมดอายุ
                        </span>
                      )}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      บันทึกประวัติการสร้าง User, รหัสผ่าน, วันหมดอายุ และปุ่มต่ออายุ
                    </p>
                  </div>
                </div>

                {activeTokens.length === 0 ? (
                  <div className="text-xs text-slate-500 p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-center space-y-1">
                    <p className="font-bold text-slate-700">ยังไม่มีประวัติการสร้างลิงก์ User ในตาราง</p>
                    <p className="text-[11px]">เมื่อกดปุ่ม "สร้างลิงก์ User" ด้านบน ระบบจะบันทึกข้อมูลลงตารางนี้อัตโนมัติ</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-xs bg-white">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                          <th className="py-2.5 px-3 text-center w-10">#</th>
                          <th className="py-2.5 px-3">ชื่อผู้ใช้ (User Name)</th>
                          <th className="py-2.5 px-3">รหัสผ่าน (Password)</th>
                          <th className="py-2.5 px-3">วันที่สร้าง</th>
                          <th className="py-2.5 px-3">วันหมดอายุ</th>
                          <th className="py-2.5 px-3 text-center">สถานะ</th>
                          <th className="py-2.5 px-3 text-center">ต่ออายุ</th>
                          <th className="py-2.5 px-3 text-center">จัดการ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {activeTokens.map((tok, index) => {
                          const isExpired = Date.now() > tok.validUntil;
                          const daysLeft = Math.ceil((tok.validUntil - Date.now()) / (1000 * 60 * 60 * 24));
                          const tokLink = `${currentOrigin}?playerToken=${btoa(encodeURIComponent(JSON.stringify(tok)))}`;

                          return (
                            <tr
                              key={tok.passcode}
                              className={`transition hover:bg-slate-50/80 ${
                                isExpired ? 'bg-rose-50/50' : ''
                              }`}
                            >
                              <td className="py-3 px-3 text-center font-bold text-slate-400">
                                {index + 1}
                              </td>

                              <td className="py-3 px-3">
                                <span className="font-bold text-indigo-900 flex items-center gap-1">
                                  👤 {tok.userName || tok.heroName}
                                </span>
                              </td>

                              <td className="py-3 px-3">
                                <div className="flex items-center gap-1 font-mono font-bold text-slate-800">
                                  <span>{tok.passcode}</span>
                                  <button
                                    type="button"
                                    onClick={() => handleCopyPasscode(tok.passcode)}
                                    className="p-1 text-slate-400 hover:text-indigo-600 transition"
                                    title="คัดลอกรหัสผ่าน"
                                  >
                                    <Copy className="w-3 h-3" />
                                  </button>
                                </div>
                              </td>

                              <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                                {tok.createdAtFormatted || formatThaiDate(new Date(tok.createdAt))}
                              </td>

                              <td className="py-3 px-3 whitespace-nowrap">
                                <span className={isExpired ? 'font-bold text-rose-600' : 'text-slate-700'}>
                                  {tok.validUntilFormatted}
                                </span>
                              </td>

                              <td className="py-3 px-3 text-center whitespace-nowrap">
                                {isExpired ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                    🔴 หมดอายุแล้ว
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                    🟢 ใช้งานได้ ({daysLeft} วัน)
                                  </span>
                                )}
                              </td>

                              <td className="py-3 px-3 text-center whitespace-nowrap">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleRenewToken(tok.passcode, 7)}
                                    className="px-2 py-1 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[10px] border border-indigo-200 transition"
                                    title="ขยายเวลาเพิ่ม 7 วัน"
                                  >
                                    +7ว
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRenewToken(tok.passcode, 30)}
                                    className="px-2 py-1 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] shadow-xs transition"
                                    title="ขยายเวลาเพิ่ม 30 วัน"
                                  >
                                    +30ว
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleRenewToken(tok.passcode, 90)}
                                    className="px-2 py-1 rounded-md bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-[10px] border border-purple-200 transition"
                                    title="ขยายเวลาเพิ่ม 90 วัน"
                                  >
                                    +90ว
                                  </button>
                                </div>
                              </td>

                              <td className="py-3 px-3 text-center whitespace-nowrap">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleCopyLink(tokLink)}
                                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition"
                                    title="คัดลอกลิงก์ใช้งาน"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleShareTokenToLine(tokLink, tok)}
                                    className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition"
                                    title="แชร์ลิงก์เข้า LINE"
                                  >
                                    <Share2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteToken(tok.passcode)}
                                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition"
                                    title="ลบข้อมูล User นี้"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Security note */}
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>การันตีความปลอดภัย & ข้อมูลแยกอิสระ:</strong> เมื่อสร้างลิงก์ User ใหม่ ระบบจะเคลียร์ล้างข้อมูลตั้งต้นให้เป็น 0 ดาว เพื่อให้ User ใหม่สร้างข้อมูลของตัวเอง โดยล็อกไม่ให้เข้าถึงการตั้งค่าแอดมิน และไม่มีปุ่มดาวน์โหลด Source Code
                </span>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 2: ดาวน์โหลด Full Source ZIP (Admin Only)
              ======================================================== */}
          {activeTab === 'download' && (
            <div className="space-y-5">
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-200 space-y-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">📦</span>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base font-display">
                      ดาวน์โหลด Source Code ทั้งหมด (.ZIP) สำหรับ Admin
                    </h4>
                    <p className="text-xs text-slate-600">
                      รวมไฟล์โค้ดล่าสุดทั้งหมด (src, config, vercel.json, package.json)
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    disabled={isZipping}
                    onClick={handleDownloadFullZip}
                    className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-sm shadow-md shadow-amber-500/25 transition active:scale-98 flex items-center justify-center gap-2 font-display"
                  >
                    {isZipping ? (
                      <>
                        <Loader2 className="w-5 h-5 text-slate-950 animate-spin" />
                        <span>กำลังบีบอัดไฟล์ ZIP ({zipProgress}%)...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5 text-slate-950" />
                        <span>ดาวน์โหลดไฟล์ Sourcecode ทั้งหมด (.ZIP)</span>
                      </>
                    )}
                  </button>
                </div>

                {downloadSuccess && (
                  <p className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 text-center">
                    ✓ ดาวน์โหลดสำเร็จ: {downloadSuccess}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 3: โหลดเฉพาะ src/utils (Admin Only)
              ======================================================== */}
          {activeTab === 'utils' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 flex items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-emerald-950 text-sm">
                    ดาวน์โหลดเฉพาะโฟลเดอร์ src/utils ทั้งหมด (8 ไฟล์)
                  </h4>
                  <p className="text-xs text-emerald-700">
                    สำหรับอัปเดตไฟล์ใน GitHub repo `Babyhomework/src/utils/`
                  </p>
                </div>
                <button
                  type="button"
                  disabled={isUtilsZipping}
                  onClick={handleDownloadUtilsZip}
                  className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5 shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>โหลด ZIP utils</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {UTILS_FILES_META.map((file) => (
                  <div
                    key={file.path}
                    className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="font-mono font-bold text-xs text-slate-900 truncate">
                          {file.name}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">{file.title}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const target = fileList.find((f) => f.path === file.path);
                        if (target?.content) {
                          downloadSingleTextFile(file.name, target.content);
                          soundManager.playStarPop();
                        }
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1 shrink-0"
                    >
                      <Download className="w-3 h-3" />
                      <span>โหลด</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 4: ดูโค้ดทีละไฟล์ (Admin Only)
              ======================================================== */}
          {activeTab === 'viewer' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <select
                  value={selectedFilePath}
                  onChange={(e) => setSelectedFilePath(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold bg-white"
                >
                  {fileList.map((f) => (
                    <option key={f.path} value={f.path}>
                      {f.path}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleCopySelectedFile}
                  className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5"
                >
                  {copiedFile ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedFile ? 'คัดลอกแล้ว' : 'คัดลอกทั้งไฟล์'}</span>
                </button>
              </div>

              <div className="bg-slate-950 text-slate-200 rounded-2xl p-4 overflow-x-auto max-h-[350px] text-xs font-mono border border-slate-800">
                <pre>{selectedFile?.content || '// ไม่มีเนื้อหาไฟล์'}</pre>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 5: แนะนำวิธีอัปเดตไฟล์ GitHub
              ======================================================== */}
          {activeTab === 'deploy' && (
            <div className="space-y-4 text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <Github className="w-4 h-4 text-slate-800" />
                <h4 className="font-bold text-sm text-slate-900">
                  แนะนำไฟล์และโฟลเดอร์ที่ควรอัปเดตใน GitHub
                </h4>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                  <h5 className="font-bold mb-1">📁 โฟลเดอร์ที่ 1: `src/utils/` (สำคัญมากสำหรับกล้องและการทำงาน)</h5>
                  <ul className="list-disc list-inside space-y-1 text-slate-700">
                    <li><code className="font-bold text-indigo-700">watermark.ts</code>: แก้ปัญหากล้องหมุนนานและประทับเวลาล้มเหลว</li>
                    <li><code className="font-bold text-indigo-700">storage.ts</code>: รหัสแอดมิน 099-2252601 + ล้างข้อมูลเริ่มใหม่ 0 ดาว + ตาราง User Link</li>
                    <li><code className="font-bold text-indigo-700">soundEffects.ts</code>: เสียงเตือนผู้ใช้หมดอายุ และระบบเสียงสังเคราะห์ภาษาไทย</li>
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-sky-900">
                  <h5 className="font-bold mb-1">📁 โฟลเดอร์ที่ 2: `src/components/`</h5>
                  <ul className="list-disc list-inside space-y-1 text-slate-700">
                    <li><code className="font-bold text-indigo-700">ParentPinModal.tsx</code>: รหัสแอดมิน 099-2252601 แบบซ่อนรหัสเวลาพิมพ์</li>
                    <li><code className="font-bold text-indigo-700">CameraSubmitModal.tsx</code>: แก้ไขระบบถ่ายรูปส่งงาน ไม่หมุนค้าง</li>
                    <li><code className="font-bold text-indigo-700">HeroOnboardingModal.tsx</code>: ถ่ายรูปโปรไฟล์และเซลฟี่กล้องหน้า</li>
                    <li><code className="font-bold text-indigo-700">ChoreQueueModal.tsx</code>: ปุ่มลบภารกิจ</li>
                    <li><code className="font-bold text-indigo-700">SharePlayerLinkModal.tsx</code>: ตารางบันทึก User, แจ้งเตือนหมดอายุพร้อมเสียง, ปุ่มกดรับทราบ</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500">
            ระบบแอดมินสำหรับผู้ปกครอง • ป้องกันการโหลดซอร์สโค้ดจากโหมดเด็ก
          </span>
          <button
            type="button"
            onClick={onClose}
            className="py-2 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow transition"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>

      {/* Requirement 4: Pop-up แจ้งเตือนเมื่อมี Link ไหนหมดอายุ ให้ Admin กดรับทราบหน้าต่างถึงจะหายไป */}
      {unacknowledgedExpiredTokens.length > 0 && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center shadow-2xl border-2 border-rose-400 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-3xl shadow-inner animate-bounce">
              🚨
            </div>

            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                ระบบแจ้งเตือนแอดมิน
              </span>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 font-display mt-2">
                พบ User หมดอายุการใช้งาน!
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                มีลิงก์ User ที่สร้างไว้หมดอายุแล้ว {unacknowledgedExpiredTokens.length} รายการ พร้อมเสียงแจ้งเตือน
              </p>
            </div>

            {/* Expired list */}
            <div className="space-y-2 max-h-48 overflow-y-auto p-1">
              {unacknowledgedExpiredTokens.map((tok) => (
                <div
                  key={tok.passcode}
                  className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-left flex items-center justify-between gap-2"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-rose-900">
                        👤 {tok.userName || tok.heroName}
                      </span>
                      <span className="font-mono text-[11px] bg-white px-1.5 py-0.5 rounded border border-rose-200 text-slate-700">
                        🔑 {tok.passcode}
                      </span>
                    </div>
                    <p className="text-[11px] text-rose-600 mt-0.5">
                      หมดอายุเมื่อ: {tok.validUntilFormatted}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRenewToken(tok.passcode, 30)}
                    className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition shrink-0"
                  >
                    +30 วัน
                  </button>
                </div>
              ))}
            </div>

            {/* Button: รับทราบหน้าต่างถึงจะหายไป */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleAcknowledgeExpired}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-black text-sm shadow-md shadow-rose-600/30 transition active:scale-98 flex items-center justify-center gap-2 font-display"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>กดรับทราบ (Acknowledge)</span>
              </button>
              <p className="text-[11px] text-slate-400 mt-2">
                เมื่อกดรับทราบ หน้าต่างเตือนนี้จะหายไป และสามารถกดต่ออายุในตารางได้ตลอดเวลา
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
