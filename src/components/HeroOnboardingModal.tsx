import React, { useState, useRef, useEffect, useCallback } from 'react';
import { HeroProfile } from '../types/chore';
import { HERO_AVATARS, saveProfile } from '../utils/storage';
import { soundManager } from '../utils/soundEffects';
import {
  Sparkles,
  Check,
  Heart,
  Camera,
  Smartphone,
  Upload,
  User,
  Cake,
  Image as ImageIcon,
  Video,
  RefreshCw,
  X,
  AlertTriangle,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  profile: HeroProfile;
  onSave: (updated: HeroProfile) => void;
  isMandatoryFirstTime?: boolean;
}

export const HeroOnboardingModal: React.FC<Props> = ({
  isOpen,
  onClose,
  profile,
  onSave,
  isMandatoryFirstTime = false,
}) => {
  const [nickname, setNickname] = useState(profile.nickname || 'น้องอาชิ');
  const [age, setAge] = useState<number>(profile.age || 7);
  const [gender, setGender] = useState<'boy' | 'girl' | 'other'>(profile.gender || 'boy');
  const [avatarMode, setAvatarMode] = useState<'cartoon' | 'camera'>(
    profile.isCustomPhoto ? 'camera' : 'cartoon'
  );
  const [selectedAvatarId, setSelectedAvatarId] = useState(profile.avatarId || HERO_AVATARS[0].id);
  const [customPhotoUrl, setCustomPhotoUrl] = useState<string | null>(
    profile.isCustomPhoto ? profile.avatarUrl : null
  );
  const [dreamReward, setDreamReward] = useState(profile.dreamReward || 'กินไอศกรีม 🍨');
  const [dreamRewardStars, setDreamRewardStars] = useState(profile.dreamRewardStars || 15);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  // Live selfie stream
  const [isLiveSelfieActive, setIsLiveSelfieActive] = useState(false);
  const [selfieStream, setSelfieStream] = useState<MediaStream | null>(null);
  const liveVideoRef = useRef<HTMLVideoElement | null>(null);

  const nativeCameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryFileInputRef = useRef<HTMLInputElement | null>(null);

  const stopSelfieWebcam = useCallback(() => {
    if (selfieStream) {
      selfieStream.getTracks().forEach((track) => track.stop());
      setSelfieStream(null);
    }
    setIsLiveSelfieActive(false);
  }, [selfieStream]);

  useEffect(() => {
    if (!isOpen) {
      stopSelfieWebcam();
      setIsProcessingPhoto(false);
      setPhotoError(null);
    } else {
      setNickname(profile.nickname || '');
      setAge(profile.age || 7);
      setGender(profile.gender || 'boy');
      setSelectedAvatarId(profile.avatarId || HERO_AVATARS[0].id);
      setCustomPhotoUrl(profile.isCustomPhoto ? profile.avatarUrl : null);
      setAvatarMode(profile.isCustomPhoto ? 'camera' : 'cartoon');
      setDreamReward(profile.dreamReward || 'กินไอศกรีม 🍨');
      setDreamRewardStars(profile.dreamRewardStars || 15);
    }
  }, [isOpen, profile, stopSelfieWebcam]);

  if (!isOpen) return null;

  const handleSelectAvatar = (avatar: (typeof HERO_AVATARS)[0]) => {
    setSelectedAvatarId(avatar.id);
    setCustomPhotoUrl(null);
    soundManager.playStarPop();
  };

  // Start live webcam selfie
  const handleStartLiveSelfie = async () => {
    stopSelfieWebcam();
    setPhotoError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('เบราว์เซอร์ไม่รองรับกล้องสด กรุณาใช้ปุ่มเปิดกล้องมือถือ');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } },
        audio: false,
      });
      setSelfieStream(stream);
      setIsLiveSelfieActive(true);
      if (liveVideoRef.current) {
        liveVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      setPhotoError('ไม่สามารถเปิดกล้องสดได้ กรุณาใช้ปุ่ม "เปิดกล้องมือถือ"');
      setIsLiveSelfieActive(false);
    }
  };

  // Capture snapshot from live webcam selfie
  const handleCaptureLiveSelfie = () => {
    if (!liveVideoRef.current) return;
    try {
      const video = liveVideoRef.current;
      const size = Math.min(video.videoWidth || 320, video.videoHeight || 320);
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const startX = ((video.videoWidth || 320) - size) / 2;
        const startY = ((video.videoHeight || 320) - size) / 2;
        ctx.drawImage(video, startX, startY, size, size, 0, 0, 256, 256);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setCustomPhotoUrl(dataUrl);
        soundManager.playSuccessFanfare();
        stopSelfieWebcam();
      }
    } catch (err) {
      console.error('Selfie snapshot error:', err);
      setPhotoError('เกิดข้อผิดพลาดในการถ่ายเซลฟี่');
    }
  };

  // Resize and crop to square 256x256 to prevent memory & localStorage quota issues on mobile
  const processAndSetProfilePhoto = async (file: File) => {
    setIsProcessingPhoto(true);
    setPhotoError(null);

    // Try createImageBitmap first for speed
    if (typeof window !== 'undefined' && 'createImageBitmap' in window) {
      try {
        const bitmap = await createImageBitmap(file);
        const size = Math.min(bitmap.width, bitmap.height);
        const startX = (bitmap.width - size) / 2;
        const startY = (bitmap.height - size) / 2;

        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(bitmap, startX, startY, size, size, 0, 0, 256, 256);
          const compactDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setCustomPhotoUrl(compactDataUrl);
          soundManager.playSuccessFanfare();
        }
        bitmap.close();
        setIsProcessingPhoto(false);
        return;
      } catch (bitmapErr) {
        console.warn('createImageBitmap failed, using fallback:', bitmapErr);
      }
    }

    // Fallback Image element
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      try {
        const size = Math.min(img.naturalWidth, img.naturalHeight);
        const startX = (img.naturalWidth - size) / 2;
        const startY = (img.naturalHeight - size) / 2;

        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, startX, startY, size, size, 0, 0, 256, 256);
          const compactDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setCustomPhotoUrl(compactDataUrl);
          soundManager.playSuccessFanfare();
        }
      } catch (err) {
        console.error('Error resizing profile photo:', err);
        setPhotoError('เกิดข้อผิดพลาดในการประมวลผลรูป กรุณาลองใหม่อีกครั้ง');
      } finally {
        URL.revokeObjectURL(objectUrl);
        setIsProcessingPhoto(false);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setIsProcessingPhoto(false);
      setPhotoError('ไม่สามารถโหลดรูปภาพได้ กรุณาลองเลือกรูปอื่น');
    };

    img.src = objectUrl;
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    soundManager.playCameraShutter();
    processAndSetProfilePhoto(file);
    e.target.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim()) return;

    const chosenAvatar = HERO_AVATARS.find((a) => a.id === selectedAvatarId) || HERO_AVATARS[0];
    const finalAvatarUrl = customPhotoUrl || chosenAvatar.image;

    const updated: HeroProfile = {
      ...profile,
      nickname: nickname.trim(),
      age: Number(age) || 7,
      gender,
      avatarId: customPhotoUrl ? 'custom_photo' : chosenAvatar.id,
      avatarUrl: finalAvatarUrl,
      isCustomPhoto: Boolean(customPhotoUrl),
      dreamReward: dreamReward.trim() || 'กินไอศกรีม 🍨',
      dreamRewardStars: Number(dreamRewardStars) || 15,
    };

    saveProfile(updated);
    onSave(updated);
    soundManager.playSuccessFanfare();
    stopSelfieWebcam();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/65 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-amber-100 my-auto max-h-[94vh] flex flex-col">
        {/* Header banner */}
        <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 p-5 sm:p-6 text-white text-center relative shrink-0">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl mb-2 text-2xl shadow-inner">
            {isMandatoryFirstTime ? '🌟' : '🦸‍♂️'}
          </div>
          {isMandatoryFirstTime && (
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-amber-100 text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5 text-yellow-200" />
              <span>ยินดีต้อนรับฮีโร่ใหม่ · ใช้งานครั้งแรก</span>
            </div>
          )}
          <h2 className="text-xl sm:text-2xl font-black tracking-tight font-display">
            {isMandatoryFirstTime ? 'สร้างชื่อ & เลือกรูปโปรไฟล์ฮีโร่' : 'ตั้งค่าโปรไฟล์ผู้พิชิตภารกิจ'}
          </h2>
          <p className="text-amber-50 text-xs sm:text-sm mt-0.5 max-w-sm mx-auto">
            {isMandatoryFirstTime
              ? 'กรุณาสร้างชื่อและเลือกรูปโปรไฟล์ของคุณให้เรียบร้อย เพื่อเริ่มต้นกำหนดภารกิจพิชิตงานบ้าน!'
              : 'ระบุชื่อ อายุ และเลือกรูปการ์ตูนหรือถ่ายรูปตัวเองเพื่อแสดงบนโปรไฟล์'}
          </p>
          {!isMandatoryFirstTime && (
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Scrollable form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* 1. ชื่อผู้พิชิตภารกิจ */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-500" />
              <span>ชื่อผู้พิชิตภารกิจ <span className="text-rose-500">*</span></span>
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="เช่น น้องอาชิ, น้องมะลิ, กัปตันคิดส์"
              maxLength={20}
              required
              className="w-full px-4 py-2.5 rounded-2xl border-2 border-slate-200 focus:border-amber-400 focus:ring-4 focus:ring-amber-100 outline-none text-base font-bold text-slate-900 transition"
            />
          </div>

          {/* 2. อายุ & 3. เพศ */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Cake className="w-3.5 h-3.5 text-amber-500" />
                <span>อายุ (ปี)</span>
              </label>
              <select
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-2xl border-2 border-slate-200 font-bold text-sm bg-white focus:border-amber-400 outline-none"
              >
                {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((a) => (
                  <option key={a} value={a}>
                    {a} ขวบ / ปี
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                เพศ
              </label>
              <div className="flex items-center gap-1.5">
                {[
                  { key: 'boy' as const, label: 'ชาย 👦' },
                  { key: 'girl' as const, label: 'หญิง 👧' },
                  { key: 'other' as const, label: 'ทั่วไป 🌟' },
                ].map((g) => (
                  <button
                    key={g.key}
                    type="button"
                    onClick={() => {
                      setGender(g.key);
                      soundManager.playStarPop();
                    }}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
                      gender === g.key
                        ? 'border-amber-500 bg-amber-50 text-amber-900 ring-2 ring-amber-300'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-white'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 4. เลือกรูปโปรไฟล์การ์ตูน หรือ ถ่ายรูปจริง */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                รูปโปรไฟล์ประจำตัว
              </label>
              <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setAvatarMode('cartoon');
                    stopSelfieWebcam();
                    soundManager.playStarPop();
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    avatarMode === 'cartoon' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  🎭 การ์ตูน ({HERO_AVATARS.length} ตัว)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAvatarMode('camera');
                    soundManager.playStarPop();
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    avatarMode === 'camera' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  📸 ถ่ายรูปจริง
                </button>
              </div>
            </div>

            {avatarMode === 'cartoon' ? (
              /* Cartoon Avatars Grid - Embedded SVGs never 404 */
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {HERO_AVATARS.map((avatar) => {
                  const isSelected = !customPhotoUrl && selectedAvatarId === avatar.id;
                  return (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() => handleSelectAvatar(avatar)}
                      className={`relative flex flex-col items-center p-2.5 rounded-2xl border-2 transition-all group text-left ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50 shadow-md ring-2 ring-amber-300'
                          : 'border-slate-100 bg-slate-50/70 hover:border-slate-300 hover:bg-white'
                      }`}
                    >
                      <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-xs relative mb-1.5 bg-slate-100 flex items-center justify-center p-0.5">
                        <img
                          src={avatar.image}
                          alt={avatar.name}
                          className="w-full h-full object-contain transition group-hover:scale-105"
                        />
                        {isSelected && (
                          <div className="absolute top-1 right-1 w-4 h-4 bg-amber-500 text-white rounded-full flex items-center justify-center shadow">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <span className="text-[11px] font-bold text-slate-800 text-center leading-tight line-clamp-1">
                        {avatar.name}
                      </span>
                      <span className="text-[9px] text-slate-500 text-center line-clamp-1">
                        {avatar.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              /* Real Photo Capture Mode (Live Webcam + Native Camera + Gallery) */
              <div className="p-4 rounded-2xl bg-amber-50/60 border-2 border-dashed border-amber-300 text-center space-y-3">
                {isLiveSelfieActive ? (
                  /* Live Webcam Stream inside modal */
                  <div className="space-y-3">
                    <div className="relative w-44 h-44 mx-auto rounded-3xl overflow-hidden ring-4 ring-amber-400 bg-black shadow-lg">
                      <video
                        ref={liveVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={handleCaptureLiveSelfie}
                        className="py-2.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md transition active:scale-95 flex items-center gap-1.5 font-display"
                      >
                        <Camera className="w-4 h-4" />
                        <span>📸 ถ่ายภาพนี้ทันที</span>
                      </button>
                      <button
                        type="button"
                        onClick={stopSelfieWebcam}
                        className="py-2.5 px-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs"
                      >
                        ปิดกล้อง
                      </button>
                    </div>
                  </div>
                ) : customPhotoUrl ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="relative w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-amber-400 shadow-md">
                      <img
                        src={customPhotoUrl}
                        alt="Custom Photo"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setCustomPhotoUrl(null)}
                        className="absolute bottom-1 right-1 bg-slate-900/80 text-white p-1 rounded-lg text-[10px]"
                      >
                        เปลี่ยน
                      </button>
                    </div>
                    <span className="text-xs font-bold text-emerald-700">
                      ✓ ใช้รูปถ่ายจริงแล้ว
                    </span>
                  </div>
                ) : (
                  <div className="py-2">
                    <div className="w-12 h-12 rounded-2xl bg-amber-200/60 text-amber-700 flex items-center justify-center mx-auto mb-2 text-xl">
                      📸
                    </div>
                    <p className="text-xs text-slate-600 font-medium">
                      ถ่ายรูปเซลฟี่น้อง หรือเลือกรูปจากแกลเลอรีในมือถือ
                    </p>
                  </div>
                )}

                {photoError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs text-center flex items-center justify-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>{photoError}</span>
                  </div>
                )}

                {!isLiveSelfieActive && (
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      disabled={isProcessingPhoto}
                      onClick={() => nativeCameraInputRef.current?.click()}
                      className="py-2.5 px-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-sm transition active:scale-95"
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>กล้องมือถือ</span>
                    </button>

                    <button
                      type="button"
                      disabled={isProcessingPhoto}
                      onClick={handleStartLiveSelfie}
                      className="py-2.5 px-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs flex flex-col items-center justify-center gap-1 shadow-sm transition active:scale-95"
                    >
                      <Video className="w-4 h-4" />
                      <span>กล้องในเว็บ</span>
                    </button>

                    <button
                      type="button"
                      disabled={isProcessingPhoto}
                      onClick={() => galleryFileInputRef.current?.click()}
                      className="py-2.5 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex flex-col items-center justify-center gap-1 transition active:scale-95 border border-slate-200"
                    >
                      <Upload className="w-4 h-4" />
                      <span>เลือกจากคลัง</span>
                    </button>
                  </div>
                )}

                {isProcessingPhoto && (
                  <p className="text-xs text-amber-600 font-bold animate-pulse">
                    กำลังปรับขนาดรูปภาพให้พอดี...
                  </p>
                )}

                {/* Hidden File Inputs */}
                <input
                  ref={nativeCameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="user"
                  onChange={handlePhotoCapture}
                  className="hidden"
                />
                <input
                  ref={galleryFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoCapture}
                  className="hidden"
                />
              </div>
            )}
          </div>

          {/* 5. รางวัลในฝัน */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>ของรางวัลในฝันที่อยากได้ (เมื่อสะสมดาวครบ)</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                value={dreamReward}
                onChange={(e) => setDreamReward(e.target.value)}
                placeholder="เช่น กินไอศกรีม 🍨"
                maxLength={30}
                className="sm:col-span-2 px-3.5 py-2.5 rounded-2xl border-2 border-slate-200 focus:border-amber-400 outline-none text-sm font-bold text-slate-800"
              />
              <div className="flex items-center gap-1.5 bg-amber-50 border-2 border-amber-200 rounded-2xl px-3 py-2">
                <span className="text-xs font-bold text-amber-800">เป้า:</span>
                <input
                  type="number"
                  min={5}
                  max={90}
                  value={dreamRewardStars}
                  onChange={(e) => setDreamRewardStars(Number(e.target.value))}
                  className="w-14 text-center font-black text-amber-900 bg-white rounded-lg border border-amber-300 py-1 text-sm outline-none"
                />
                <span className="text-xs font-bold text-amber-700">⭐</span>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100">
            {!isMandatoryFirstTime && (
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-sm transition"
              >
                ยกเลิก
              </button>
            )}
            <button
              type="submit"
              className={`py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-sm shadow-md shadow-amber-500/25 transition active:scale-95 font-display flex items-center justify-center gap-2 ${
                isMandatoryFirstTime ? 'w-full text-base' : ''
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{isMandatoryFirstTime ? '🚀 บันทึกโปรไฟล์ & เริ่มต้นกำหนดภารกิจ' : 'บันทึกโปรไฟล์'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
