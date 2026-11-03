import React, { useState, useRef } from 'react';
import { HeroProfile } from '../types/chore';
import { HERO_AVATARS, saveProfile } from '../utils/storage';
import { soundManager } from '../utils/soundEffects';
import { Sparkles, Check, Heart, Camera, Smartphone, Upload, User, Cake } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  profile: HeroProfile;
  onSave: (updated: HeroProfile) => void;
}

export const HeroOnboardingModal: React.FC<Props> = ({
  isOpen,
  onClose,
  profile,
  onSave,
}) => {
  const [nickname, setNickname] = useState(profile.nickname || 'น้องอาชิ');
  const [age, setAge] = useState<number>(profile.age || 7);
  const [gender, setGender] = useState<'boy' | 'girl' | 'other'>(profile.gender || 'boy');
  const [avatarMode, setAvatarMode] = useState<'cartoon' | 'camera'>('cartoon');
  const [selectedAvatarId, setSelectedAvatarId] = useState(profile.avatarId || HERO_AVATARS[0].id);
  const [customPhotoUrl, setCustomPhotoUrl] = useState<string | null>(
    profile.isCustomPhoto ? profile.avatarUrl : null
  );
  const [dreamReward, setDreamReward] = useState(profile.dreamReward || 'กินไอศกรีม 🍨');
  const [dreamRewardStars, setDreamRewardStars] = useState(profile.dreamRewardStars || 15);

  const nativeCameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryFileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleSelectAvatar = (avatar: (typeof HERO_AVATARS)[0]) => {
    setSelectedAvatarId(avatar.id);
    setCustomPhotoUrl(null);
    soundManager.playStarPop();
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    soundManager.playCameraShutter();
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setCustomPhotoUrl(event.target.result);
        soundManager.playSuccessFanfare();
      }
    };
    reader.readAsDataURL(file);
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
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/65 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-amber-100 my-auto max-h-[94vh] flex flex-col">
        {/* Header banner */}
        <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 p-5 sm:p-6 text-white text-center relative shrink-0">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl mb-2 text-2xl shadow-inner">
            🦸‍♂️
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight font-display">
            สร้างโปรไฟล์ผู้พิชิตภารกิจ
          </h2>
          <p className="text-amber-50 text-xs sm:text-sm mt-0.5">
            ระบุชื่อ อายุ เพศ และเลือกรูปการ์ตูนหรือถ่ายรูปตัวเองเพื่อเริ่มการผจญภัย
          </p>
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
                    soundManager.playStarPop();
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    avatarMode === 'cartoon' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  🎭 การ์ตูน 3D
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
              /* Cartoon Avatars Grid */
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {HERO_AVATARS.map((avatar) => {
                  const isSelected = !customPhotoUrl && selectedAvatarId === avatar.id;
                  return (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() => handleSelectAvatar(avatar)}
                      className={`relative flex flex-col items-center p-2 rounded-2xl border-2 transition-all group text-left ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50 shadow-md ring-2 ring-amber-300'
                          : 'border-slate-100 bg-slate-50/70 hover:border-slate-300 hover:bg-white'
                      }`}
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden shadow-xs relative mb-1.5 bg-slate-200">
                        <img
                          src={avatar.image}
                          alt={avatar.name}
                          className="w-full h-full object-cover transition group-hover:scale-105"
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
                    </button>
                  );
                })}
              </div>
            ) : (
              /* Real Photo Capture Mode */
              <div className="p-4 rounded-2xl bg-amber-50/60 border-2 border-dashed border-amber-300 text-center space-y-3">
                {customPhotoUrl ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden ring-4 ring-amber-400 shadow-md">
                      <img
                        src={customPhotoUrl}
                        alt="Custom Avatar"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>ใช้รูปถ่ายจริงนี้เป็นโปรไฟล์</span>
                    </span>
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto text-2xl">
                    <Camera className="w-7 h-7" />
                  </div>
                )}

                <p className="text-xs text-slate-600">
                  ถ่ายรูปหน้าตัวเองสุดน่ารัก หรือเลือกรูปจากมือถือมาตั้งเป็นรูปโปรไฟล์ฮีโร่
                </p>

                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <button
                    type="button"
                    onClick={() => nativeCameraInputRef.current?.click()}
                    className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow"
                  >
                    <Smartphone className="w-4 h-4 text-slate-950" />
                    <span>📸 เปิดกล้องถ่ายรูปเดี๋ยวนี้</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => galleryFileInputRef.current?.click()}
                    className="py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-300"
                  >
                    <Upload className="w-4 h-4" />
                    <span>เลือกรูปจากเครื่อง</span>
                  </button>
                </div>

                {/* Hidden camera inputs */}
                <input
                  type="file"
                  ref={nativeCameraInputRef}
                  onChange={handlePhotoCapture}
                  accept="image/*"
                  capture="user"
                  className="hidden"
                />
                <input
                  type="file"
                  ref={galleryFileInputRef}
                  onChange={handlePhotoCapture}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            )}
          </div>

          {/* Goal / Wishlist target */}
          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/60">
            <div className="flex items-center gap-1.5 mb-2 text-amber-900 font-bold text-xs">
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              <span>เป้าหมายรางวัลในฝัน (ชวนให้มีไฟทำทุกวัน!)</span>
            </div>
            <div className="space-y-2">
              <input
                type="text"
                value={dreamReward}
                onChange={(e) => setDreamReward(e.target.value)}
                placeholder="เช่น กินไอศกรีม 🍨 หรือ ซื้อของเล่น 40 ดาว"
                className="w-full px-3 py-2 rounded-xl border border-amber-300/80 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-2xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-xs shadow-lg shadow-amber-500/25 hover:from-amber-600 hover:to-orange-600 transition flex items-center justify-center gap-2 font-display"
            >
              <Sparkles className="w-4 h-4" />
              <span>บันทึกโปรไฟล์ผู้พิชิต</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
