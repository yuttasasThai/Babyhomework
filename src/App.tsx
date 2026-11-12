/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ChoreLog, ChoreTask, HeroProfile, WishlistReward } from './types/chore';
import {
  getStoredProfile,
  getStoredTasks,
  getStoredLogs,
  getStoredRewards,
  saveProfile,
  saveTasks,
  saveLogs,
  saveRewards,
  decodeUserToken,
  renewUserToken,
  UserTokenPayload,
} from './utils/storage';
import { soundManager } from './utils/soundEffects';
import { fireHeroConfetti } from './utils/confetti';
import { WatermarkResult } from './utils/watermark';

import { HeaderHeroBar } from './components/HeaderHeroBar';
import { HeroDisciplineBanner } from './components/HeroDisciplineBanner';
import { TreasureMapSection } from './components/TreasureMapSection';
import { HeroCommandCenter } from './components/HeroCommandCenter';
import { DailyMissionsModal } from './components/DailyMissionsModal';
import { ChoreQueueModal } from './components/ChoreQueueModal';
import { ChoreAlarmBanner } from './components/ChoreAlarmBanner';
import { ChoreCard } from './components/ChoreCard';
import { AddChoreModal } from './components/AddChoreModal';
import { CameraSubmitModal } from './components/CameraSubmitModal';
import { VictoryModal } from './components/VictoryModal';
import { HeroOnboardingModal } from './components/HeroOnboardingModal';
import { DisciplineDashboard } from './components/DisciplineDashboard';
import { ParentRewardsModal } from './components/ParentRewardsModal';
import { ParentApprovalModal } from './components/ParentApprovalModal';
import { LineGuideModal } from './components/LineGuideModal';
import { ParentPinModal } from './components/ParentPinModal';
import { SharePlayerLinkModal } from './components/SharePlayerLinkModal';
import { UserLoginModal } from './components/UserLoginModal';
import { HeroBootScreen } from './components/HeroBootScreen';
import { alarmManager } from './utils/alarmAudio';
import { APP_REVISION } from './config/revision';

import { Plus, Filter, Sparkles, CheckCircle2, ListTodo, Calendar, Award, MessageCircle } from 'lucide-react';

export default function App() {
  const [profile, setProfile] = useState<HeroProfile>(getStoredProfile);
  const [tasks, setTasks] = useState<ChoreTask[]>(getStoredTasks);
  const [logs, setLogs] = useState<ChoreLog[]>(getStoredLogs);
  const [rewards, setRewards] = useState<WishlistReward[]>(getStoredRewards);

  const [currentView, setCurrentView] = useState<'tasks' | 'stats' | 'gallery' | 'rewards'>('tasks');
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [isParentMode, setIsParentMode] = useState<boolean>(false);

  // Kid / Player mode detector: ?mode=player or ?u= or ?playerToken= prevents admin access without PIN
  const [isPlayerOnlyMode, setIsPlayerOnlyMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return (
        params.get('mode') === 'player' ||
        params.get('mode') === 'kid' ||
        Boolean(params.get('u')) ||
        Boolean(params.get('playerToken'))
      );
    }
    return false;
  });

  // User Token & Expiry States
  const [tokenPayload, setTokenPayload] = useState<UserTokenPayload | null>(null);
  const [isTokenExpired, setIsTokenExpired] = useState<boolean>(false);
  const [renewalInput, setRenewalInput] = useState<string>('');
  const [renewalMessage, setRenewalMessage] = useState<string | null>(null);
  const [welcomeBanner, setWelcomeBanner] = useState<string | null>(null);

  // Requirement 2: ลิงก์ user การเข้าใช้งานให้ใส่รหัสทุกครั้ง
  const [isUserLoggedIn, setIsUserLoggedIn] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('u') || params.get('playerToken');
      if (token) {
        return false; // บังคับให้ใส่รหัสผ่านทุกครั้งเมื่อเปิดลิงก์เข้ามา
      }
    }
    return true;
  });

  // Requirement 3: หน้า Boot Screen เวลาจะเข้าใช้งานหลังใส่รหัสผ่าน
  const [showBootScreen, setShowBootScreen] = useState<boolean>(false);

  // First-time onboarding for user link (สร้างชื่อ & เลือกโปรไฟล์ก่อนถึงจะเริ่มต้นกำหนดภารกิจได้)
  const [isFirstTimeOnboarding, setIsFirstTimeOnboarding] = useState<boolean>(false);

  // Modals state
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [showAddChore, setShowAddChore] = useState<boolean>(false);
  const [showDailyMissionsModal, setShowDailyMissionsModal] = useState<boolean>(false);
  const [showQueueModal, setShowQueueModal] = useState<boolean>(false);
  const [showLineGuide, setShowLineGuide] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [showParentPinModal, setShowParentPinModal] = useState<boolean>(false);
  const [pinSuccessCallback, setPinSuccessCallback] = useState<(() => void) | null>(null);

  const [selectedTaskForApproval, setSelectedTaskForApproval] = useState<ChoreTask | null>(null);
  const [activeTaskForCamera, setActiveTaskForCamera] = useState<ChoreTask | null>(null);
  const [activeAlarmTask, setActiveAlarmTask] = useState<ChoreTask | null>(null);
  const [victoryState, setVictoryState] = useState<{
    task: ChoreTask;
    watermark: WatermarkResult;
  } | null>(null);
  const [viewingProofTask, setViewingProofTask] = useState<ChoreTask | null>(null);

  // Check URL query for ?verifyTask=<taskId> (when parent taps the link from LINE!)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const verifyTaskId = params.get('verifyTask');
      if (verifyTaskId) {
        const targetTask = tasks.find((t) => t.id === verifyTaskId);
        if (targetTask) {
          setSelectedTaskForApproval(targetTask);
        }
      }
    }
  }, [tasks]);

  // Check URL query for ?u=<token> (short link) or ?playerToken=<token> (legacy)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('u') || params.get('playerToken');
      if (token) {
        const decoded = decodeUserToken(token);
        if (decoded.payload) {
          setTokenPayload(decoded.payload);
          if (decoded.isExpired) {
            setIsTokenExpired(true);
            soundManager.playContactAdminVoice();
          } else {
            setIsPlayerOnlyMode(true);
            // Requirement 2: ลิงก์ user การเข้าใช้งานให้ใส่รหัสทุกครั้ง
            setIsUserLoggedIn(false);

            // Requirement 2 (ล่าสุด): เคลียร์ภารกิจเก่าและประวัติเก่าออกทั้งหมดเมื่อใช้งานลิงก์ user ครั้งแรก
            const tokenKey = `${decoded.payload.passcode}_${decoded.payload.createdAt}`;
            const lastActiveToken = localStorage.getItem('chore_hero_active_player_token');
            if (lastActiveToken !== tokenKey) {
              localStorage.setItem('chore_hero_active_player_token', tokenKey);
              saveTasks([]);
              setTasks([]);
              saveLogs([]);
              setLogs([]);
              const resetRewards = getStoredRewards().map((r) => ({
                ...r,
                isClaimed: false,
                claimedAt: undefined,
              }));
              saveRewards(resetRewards);
              setRewards(resetRewards);

              if (decoded.payload.profile) {
                setProfile(decoded.payload.profile);
                saveProfile(decoded.payload.profile);
              }
            }
          }
        }
      }
    }
  }, []);

  // Unlock / Renew expired token with passcode
  const handleUnlockRenewal = () => {
    if (!tokenPayload) return;
    const cleanInput = renewalInput.trim().toUpperCase();
    if (cleanInput === tokenPayload.passcode.toUpperCase()) {
      soundManager.playSuccessFanfare();
      fireHeroConfetti();
      const renewed = renewUserToken(tokenPayload.passcode, 30);
      if (renewed) {
        setTokenPayload(renewed);
      }
      setIsTokenExpired(false);
      setIsPlayerOnlyMode(true);
      setRenewalMessage(null);
      setWelcomeBanner(`🎉 ต่ออายุสำเร็จแล้ว! ใช้งานได้ถึง ${renewed?.validUntilFormatted || 'อีก 30 วัน'}`);
      setTimeout(() => setWelcomeBanner(null), 9000);
    } else {
      soundManager.playStarPop();
      setRenewalMessage('รหัสต่ออายุไม่ถูกต้อง กรุณาติดต่อคุณพ่อคุณแม่');
    }
  };

  // Periodic alarm checker: checks current time against scheduled tasks every 20 seconds
  useEffect(() => {
    const checkSchedule = () => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;

      // Find first unacknowledged task matching or close to current time
      const dueTask = tasks.find(
        (t) =>
          t.status !== 'completed' &&
          !t.alarmAcknowledged &&
          t.scheduledTime === currentTimeStr
      );

      if (dueTask && activeAlarmTask?.id !== dueTask.id) {
        setActiveAlarmTask(dueTask);
        alarmManager.startPeriodicAlarm(dueTask.id, dueTask.title, profile.nickname);
      }
    };

    checkSchedule();
    const interval = setInterval(checkSchedule, 20000);
    return () => clearInterval(interval);
  }, [tasks, activeAlarmTask, profile.nickname]);

  // Handle child tapping "กดรับภารกิจ"
  const handleAcknowledgeAlarmTask = (task: ChoreTask) => {
    alarmManager.stopAlarm();
    setActiveAlarmTask(null);

    // Update task status to in_progress and acknowledged
    const updated = tasks.map((t) =>
      t.id === task.id ? { ...t, status: 'in_progress' as const, alarmAcknowledged: true } : t
    );
    setTasks(updated);
    saveTasks(updated);

    // Open camera immediately to complete chore
    setActiveTaskForCamera(task);
  };

  // Sync sound manager enabled state
  useEffect(() => {
    soundManager.enabled = profile.soundEnabled;
  }, [profile.soundEnabled]);

  // Handle sound toggle
  const handleToggleSound = () => {
    const updated = { ...profile, soundEnabled: !profile.soundEnabled };
    setProfile(updated);
    saveProfile(updated);
  };

  // Handle parent mode toggle with PIN protection for player mode
  const handleToggleParentMode = () => {
    if (isParentMode) {
      setIsParentMode(false);
      soundManager.playStarPop();
    } else {
      if (isPlayerOnlyMode) {
        setPinSuccessCallback(() => () => {
          setIsParentMode(true);
        });
        setShowParentPinModal(true);
      } else {
        setIsParentMode(true);
        soundManager.playStarPop();
      }
    }
  };

  // Safe handler to open Manage Chores (Requirement 3: link user ตั้งค่าปรับเพิ่มภารกิจได้เลยโดยไม่ต้องใส่รหัสผ่าน)
  const handleOpenManageChores = () => {
    // หากเป็นการใช้งานครั้งแรก ต้องสร้างชื่อและเลือกโปรไฟล์ก่อนถึงจะเริ่มต้นกำหนดภารกิจได้
    if (tokenPayload && isFirstTimeOnboarding) {
      setShowOnboarding(true);
      return;
    }
    setShowAddChore(true);
  };

  // Safe handler to open Queue Settings (Requirement 3: link user จัดคิวเวลาเตือนได้เลยโดยไม่ต้องใส่รหัสผ่าน)
  const handleOpenQueueSettings = () => {
    // หากเป็นการใช้งานครั้งแรก ต้องสร้างชื่อและเลือกโปรไฟล์ก่อนถึงจะเริ่มต้นกำหนดภารกิจได้
    if (tokenPayload && isFirstTimeOnboarding) {
      setShowOnboarding(true);
      return;
    }
    setShowQueueModal(true);
  };

  // Safe handler to open Admin Hub (ALWAYS requires PIN 099-2252601 first!)
  const handleOpenAdminHub = () => {
    setPinSuccessCallback(() => () => {
      setShowShareModal(true);
    });
    setShowParentPinModal(true);
  };

  // Handle Logout (Requirement 1 & 2: เมื่อออกจากระบบก็ให้ออกโดยสมบูรณ์ และเพิ่มปุ่มออกจากระบบ)
  const handleLogout = () => {
    soundManager.playStarPop();
    if (tokenPayload) {
      sessionStorage.removeItem(`chore_user_session_${tokenPayload.passcode}`);
    }
    sessionStorage.clear();
    setIsUserLoggedIn(false);
    setIsParentMode(false);
    setWelcomeBanner('🚪 ออกจากระบบเรียบร้อยแล้ว');
    setTimeout(() => setWelcomeBanner(null), 4000);
  };

  // Handle Adding Chore
  const handleAddChore = (newChoreData: Omit<ChoreTask, 'id' | 'createdAt' | 'status'>) => {
    const newTask: ChoreTask = {
      ...newChoreData,
      id: `task-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    const updated = [newTask, ...tasks];
    setTasks(updated);
    saveTasks(updated);
  };

  // Handle deleting a chore
  const handleDeleteChore = (taskId: string) => {
    const updated = tasks.filter((t) => t.id !== taskId);
    setTasks(updated);
    saveTasks(updated);
    soundManager.playStarPop();
  };

  // Handle submitting chore proof with watermark (Requirement 4: ส่วนที่ 1 ได้รับ 1 ส่วน = +1 ดาว)
  const handleSubmitProof = (task: ChoreTask, watermarkResult: WatermarkResult) => {
    // 1. Mark chore completed with Part 1 score
    const updatedTasks = tasks.map((t) => {
      if (t.id === task.id) {
        return {
          ...t,
          status: 'completed' as const,
          completedAt: watermarkResult.isoTimestamp,
          completedTimeFormatted: watermarkResult.thaiTimeFormatted,
          proofPhotoUrl: watermarkResult.dataUrl,
          submissionPartStars: 1,
          chatVerifiedPartStars: 0,
          isScoreFullyCompleted: false,
        };
      }
      return t;
    });
    setTasks(updatedTasks);
    saveTasks(updatedTasks);

    // 2. Add to logs
    const newLog: ChoreLog = {
      id: `log-${Date.now()}`,
      choreId: task.id,
      title: task.title,
      icon: task.icon,
      childName: profile.nickname,
      timestamp: watermarkResult.isoTimestamp,
      thaiDateFormatted: watermarkResult.thaiDateFormatted,
      thaiTimeFormatted: watermarkResult.thaiTimeFormatted,
      proofPhotoUrl: watermarkResult.dataUrl,
      starsEarned: 1, // คิดคะแนนจากงานที่ส่ง 1 ส่วน (+1 ดาว)
      submissionPartStars: 1,
      chatVerifiedPartStars: 0,
      isScoreFullyCompleted: false,
      category: task.category,
    };
    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);
    saveLogs(updatedLogs);

    // 3. Award Part 1 (+1 ดาว) & update streak in profile
    const updatedProfile: HeroProfile = {
      ...profile,
      totalStars: profile.totalStars + 1,
      lastActiveDate: new Date().toISOString().split('T')[0],
    };
    setProfile(updatedProfile);
    saveProfile(updatedProfile);

    // 4. Fire celebratory confetti & sound fanfare
    fireHeroConfetti();
    soundManager.playSuccessFanfare();

    // 5. Open Victory Modal
    setVictoryState({
      task: {
        ...task,
        status: 'completed',
        completedAt: watermarkResult.isoTimestamp,
        completedTimeFormatted: watermarkResult.thaiTimeFormatted,
        proofPhotoUrl: watermarkResult.dataUrl,
        submissionPartStars: 1,
        chatVerifiedPartStars: 0,
        isScoreFullyCompleted: false,
      },
      watermark: watermarkResult,
    });
  };

  // Handle Parent Approving Task & awarding Part 2 score (+1 ดาว จากการตรวจงานผ่าน Messenger/LINE)
  const handleApproveTask = (taskId: string, bonusStars: number, feedback: string) => {
    const nowIso = new Date().toISOString();
    const verifiedBonus = bonusStars > 0 ? bonusStars : 1;

    // 1. Update task with Part 2 score
    const updatedTasks = tasks.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          parentApproved: true,
          parentApprovedAt: nowIso,
          parentBonusStars: verifiedBonus,
          parentFeedback: feedback,
          chatVerifiedPartStars: verifiedBonus,
          isScoreFullyCompleted: true,
        };
      }
      return t;
    });
    setTasks(updatedTasks);
    saveTasks(updatedTasks);

    // 2. Update log
    const updatedLogs = logs.map((l) => {
      if (l.choreId === taskId) {
        return {
          ...l,
          parentApproved: true,
          parentApprovedAt: nowIso,
          parentBonusStars: verifiedBonus,
          parentFeedback: feedback,
          starsEarned: (l.starsEarned || 1) + verifiedBonus,
          chatVerifiedPartStars: verifiedBonus,
          isScoreFullyCompleted: true,
        };
      }
      return l;
    });
    setLogs(updatedLogs);
    saveLogs(updatedLogs);

    // 3. Award extra Part 2 star (+1 ดาว) to kid's total stars!
    const updatedProfile: HeroProfile = {
      ...profile,
      totalStars: profile.totalStars + verifiedBonus,
    };
    setProfile(updatedProfile);
    saveProfile(updatedProfile);

    // Update active modal task reference if open
    if (selectedTaskForApproval && selectedTaskForApproval.id === taskId) {
      setSelectedTaskForApproval({
        ...selectedTaskForApproval,
        parentApproved: true,
        parentApprovedAt: nowIso,
        parentBonusStars: verifiedBonus,
        parentFeedback: feedback,
        chatVerifiedPartStars: verifiedBonus,
        isScoreFullyCompleted: true,
      });
    }
  };

  // Handle Claiming reward
  const handleClaimReward = (reward: WishlistReward) => {
    const updatedProfile = {
      ...profile,
      totalStars: Math.max(0, profile.totalStars - reward.requiredStars),
    };
    setProfile(updatedProfile);
    saveProfile(updatedProfile);

    const updatedRewards = rewards.map((r) =>
      r.id === reward.id ? { ...r, isClaimed: true, claimedAt: new Date().toISOString() } : r
    );
    setRewards(updatedRewards);
    saveRewards(updatedRewards);
  };

  // Handle Adding reward
  const handleAddReward = (newRewardData: Omit<WishlistReward, 'id' | 'isClaimed'>) => {
    const newReward: WishlistReward = {
      ...newRewardData,
      id: `rew-${Date.now()}`,
      isClaimed: false,
    };
    const updated = [...rewards, newReward];
    setRewards(updated);
    saveRewards(updated);
  };

  // Reset daily chores for tomorrow
  const handleResetDailyChores = () => {
    const updated = tasks.map((t) => ({
      ...t,
      status: 'pending' as const,
      completedAt: undefined,
      completedTimeFormatted: undefined,
    }));
    setTasks(updated);
    saveTasks(updated);
  };

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (taskFilter === 'pending') return t.status === 'pending';
    if (taskFilter === 'completed') return t.status === 'completed';
    return true;
  });

  const pendingCount = tasks.filter((t) => t.status === 'pending').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/70 via-orange-50/30 to-amber-50/60 pb-20 selection:bg-amber-200">
      {/* Top Bar Contract Navigation */}
      <HeaderHeroBar
        profile={profile}
        currentView={currentView}
        onSelectView={setCurrentView}
        onOpenProfile={() => setShowOnboarding(true)}
        onToggleSound={handleToggleSound}
        isParentMode={isParentMode}
        onToggleParentMode={handleToggleParentMode}
        onOpenLineGuide={() => setShowLineGuide(true)}
        onOpenShareLink={handleOpenAdminHub}
        isPlayerOnlyMode={isPlayerOnlyMode}
        onLogout={handleLogout}
      />

      {/* Periodic Repeating Chore Alarm Banner */}
      <ChoreAlarmBanner
        activeAlarmTask={activeAlarmTask}
        childName={profile.nickname}
        onAcknowledgeTask={handleAcknowledgeAlarmTask}
        onDismiss={() => {
          alarmManager.stopAlarm();
          setActiveAlarmTask(null);
        }}
      />

      {/* User Token Welcome & Expiry Notification Banner */}
      {welcomeBanner && (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2.5 text-center text-xs sm:text-sm font-bold shadow-md flex items-center justify-center gap-2 animate-fade-in">
          <span>{welcomeBanner}</span>
          <button
            type="button"
            onClick={() => setWelcomeBanner(null)}
            className="p-1 rounded-md hover:bg-white/20 transition text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-6 sm:space-y-8">
        {/* Dynamic View Router */}
        {currentView === 'tasks' && (
          <div className="space-y-6 sm:space-y-8">
            {/* ========================================================
                ส่วนบน: ลายแทงแผนที่ผจญภัย (Treasure Adventure Map)
                พอกดเข้าไป ถึงจะมีหน้าต่างภารกิจประจำวัน
                ======================================================== */}
            <TreasureMapSection
              profile={profile}
              tasks={tasks}
              onOpenDailyMissions={() => setShowDailyMissionsModal(true)}
              onSelectTaskToSubmit={(task) => setActiveTaskForCamera(task)}
            />

            {/* ========================================================
                ส่วนล่าง: ศูนย์บัญชาการฮีโร่ตัวจิ๋ว (Hero Command Center)
                1) รูปโปรไฟล์ (ชื่อ/อายุ/เพศ/รูป) 2) แถบบอกระดับ 90 ดาว 3) ปุ่มปรับ/เพิ่มภารกิจ & จัดคิว
                ======================================================== */}
            <HeroCommandCenter
              profile={profile}
              tasks={tasks}
              onOpenProfile={() => setShowOnboarding(true)}
              onOpenManageChores={handleOpenManageChores}
              onOpenDailyMissions={() => setShowDailyMissionsModal(true)}
              onOpenQueueSettings={handleOpenQueueSettings}
            />
          </div>
        )}

        {currentView === 'stats' && (
          <div className="space-y-6">
            <HeroDisciplineBanner profile={profile} />
            <DisciplineDashboard profile={profile} tasks={tasks} logs={logs} />
          </div>
        )}

        {currentView === 'gallery' && (
          <div className="space-y-6">
            <HeroDisciplineBanner profile={profile} />
            <DisciplineDashboard profile={profile} tasks={tasks} logs={logs} />
          </div>
        )}

        {currentView === 'rewards' && (
          <div className="space-y-6">
            <HeroDisciplineBanner profile={profile} />
            <ParentRewardsModal
              profile={profile}
              rewards={rewards}
              onClaimReward={handleClaimReward}
              onAddReward={handleAddReward}
              onResetDailyChores={handleResetDailyChores}
              isParentMode={isParentMode}
            />
          </div>
        )}

        {/* GitHub / Vercel Live Deployment Version Badge (แสดงเวอร์ชันบนหน้าหลักเพื่อให้ตรวจสอบได้ง่าย) */}
        <footer className="pt-6 pb-2 text-center">
          <div className="inline-flex flex-wrap items-center justify-center gap-2 px-4 py-2 rounded-2xl bg-white/90 backdrop-blur-sm border border-slate-200/90 shadow-xs text-xs text-slate-600">
            <span className="flex items-center gap-1.5 font-bold text-slate-800">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-sm shadow-emerald-500/50" />
              <span>เวอร์ชันระบบ:</span>
              <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500 text-white font-mono font-black shadow-xs">
                v{APP_REVISION.version}
              </span>
            </span>
            <span className="text-slate-300">|</span>
            <span className="font-mono text-[11px] text-slate-600">
              GitHub ➔ Vercel: <span className="font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">{APP_REVISION.revision}</span>
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-[11px] text-slate-500">
              อัปเดต: {APP_REVISION.releaseDate}
            </span>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={handleOpenAdminHub}
              className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold underline cursor-pointer"
            >
              ตรวจสอบไฟล์ซอร์สโค้ด
            </button>
          </div>
        </footer>
      </main>

      {/* Daily Chore Missions Modal (Opens when tapping Treasure Map) */}
      <DailyMissionsModal
        isOpen={showDailyMissionsModal}
        onClose={() => setShowDailyMissionsModal(false)}
        tasks={tasks}
        profile={profile}
        onOpenSubmit={(task) => setActiveTaskForCamera(task)}
        onViewProof={(task) => setViewingProofTask(task)}
        onOpenParentApproval={(task) => setSelectedTaskForApproval(task)}
        onDelete={handleDeleteChore}
        onOpenAddChore={() => {
          setShowDailyMissionsModal(false);
          handleOpenManageChores();
        }}
        onOpenQueueSettings={() => {
          setShowDailyMissionsModal(false);
          handleOpenQueueSettings();
        }}
        isParentMode={isParentMode}
      />

      {/* Chore Queue & Time Alarm Scheduler Modal */}
      <ChoreQueueModal
        isOpen={showQueueModal}
        onClose={() => setShowQueueModal(false)}
        tasks={tasks}
        childName={profile.nickname}
        onUpdateTasks={(updated) => {
          setTasks(updated);
          saveTasks(updated);
        }}
        onOpenAddChore={() => {
          setShowQueueModal(false);
          setShowAddChore(true);
        }}
      />

      {/* Onboarding Profile Modal (สร้างชื่อ & เลือกโปรไฟล์ก่อนถึงจะเริ่มต้นกำหนดภารกิจได้) */}
      <HeroOnboardingModal
        isOpen={showOnboarding}
        onClose={() => {
          if (!isFirstTimeOnboarding) {
            setShowOnboarding(false);
          }
        }}
        profile={profile}
        isMandatoryFirstTime={isFirstTimeOnboarding}
        onSave={(updated) => {
          setProfile(updated);
          saveProfile(updated);
          if (tokenPayload) {
            localStorage.setItem(`chore_hero_onboarding_completed_${tokenPayload.passcode}_${tokenPayload.createdAt}`, 'true');
          }
          if (isFirstTimeOnboarding) {
            setIsFirstTimeOnboarding(false);
            setShowOnboarding(false);
            fireHeroConfetti();
            soundManager.playSuccessFanfare();
            setWelcomeBanner(`🎉 ยินดีต้อนรับฮีโร่ ${updated.nickname}! สร้างโปรไฟล์สำเร็จแล้ว เริ่มต้นกำหนดภารกิจกันเลย 🚀`);
            setTimeout(() => setWelcomeBanner(null), 7000);
            // เมื่อสร้างชื่อและเลือกโปรไฟล์เรียบร้อยแล้ว ให้เริ่มต้นกำหนดภารกิจได้ทันที
            setTimeout(() => {
              setShowAddChore(true);
            }, 400);
          } else {
            setShowOnboarding(false);
          }
        }}
      />

      {/* Add Chore Modal */}
      <AddChoreModal
        isOpen={showAddChore}
        onClose={() => setShowAddChore(false)}
        onAddChore={handleAddChore}
      />

      {/* Camera & Auto-Watermark Modal */}
      {activeTaskForCamera && (
        <CameraSubmitModal
          isOpen={Boolean(activeTaskForCamera)}
          onClose={() => setActiveTaskForCamera(null)}
          task={activeTaskForCamera}
          profile={profile}
          onSubmitProof={handleSubmitProof}
        />
      )}

      {/* Victory Celebration Modal */}
      {victoryState && (
        <VictoryModal
          isOpen={Boolean(victoryState)}
          onClose={() => setVictoryState(null)}
          task={victoryState.task}
          profile={profile}
          watermarkResult={victoryState.watermark}
          onOpenParentApproval={(t) => {
            setVictoryState(null);
            setSelectedTaskForApproval(t);
          }}
        />
      )}

      {/* Parent Approval & LINE Verification Modal */}
      {selectedTaskForApproval && (
        <ParentApprovalModal
          isOpen={Boolean(selectedTaskForApproval)}
          onClose={() => setSelectedTaskForApproval(null)}
          task={selectedTaskForApproval}
          profile={profile}
          onApproveTask={handleApproveTask}
        />
      )}

      {/* LINE Guide & Settings Modal */}
      <LineGuideModal
        isOpen={showLineGuide}
        onClose={() => setShowLineGuide(false)}
      />

      {/* Viewing Stamped Proof Modal */}
      {viewingProofTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 text-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-700 flex flex-col">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{viewingProofTask.icon}</span>
                <div>
                  <h4 className="font-bold text-white text-sm font-display">
                    {viewingProofTask.title}
                  </h4>
                  <p className="text-xs text-amber-400">
                    เสร็จเมื่อ: {viewingProofTask.completedTimeFormatted || 'เรียบร้อย'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingProofTask(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-black flex items-center justify-center max-h-[70vh] overflow-hidden">
              {viewingProofTask.proofPhotoUrl ? (
                <img
                  src={viewingProofTask.proofPhotoUrl}
                  alt={viewingProofTask.title}
                  className="max-h-[65vh] object-contain rounded-xl"
                />
              ) : (
                <div className="p-12 text-center text-slate-400">
                  <span className="text-6xl block mb-2">{viewingProofTask.icon}</span>
                  <span>ภารกิจนี้บันทึกว่าสำเร็จแล้ว</span>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>ยืนยันด้วยลายน้ำวันเวลาจริงบน Canvas</span>
              </span>
              <button
                onClick={() => setViewingProofTask(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Player Link & GitHub/Vercel Guide Modal (Admin Only) */}
      <SharePlayerLinkModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        profile={profile}
        tasks={tasks}
        logs={logs}
        rewards={rewards}
        isPlayerOnlyMode={isPlayerOnlyMode}
      />

      {/* Requirement 3: Expiry Screen Modal ("หมดอายุใช้งาน ต้องการใช้งาน ติดต่อ admin ช่างหน่อยชุมแพ 099-2256601") */}
      {isTokenExpired && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full text-center space-y-4 border-2 border-rose-400 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-3xl shadow-inner animate-bounce">
              ⚠️
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-black uppercase tracking-wider">
                แจ้งเตือนระบบ
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-rose-600 font-display">
                หมดอายุใช้งาน
              </h3>

              {/* Requirement 3: ข้อความตามที่ระบุชัดเจน */}
              <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-slate-900 text-sm sm:text-base font-bold leading-relaxed shadow-xs">
                "หมดอายุใช้งาน ต้องการใช้งาน ติดต่อ admin ช่างหน่อยชุมแพ 099-2256601"
              </div>

              <p className="text-xs text-slate-500">
                ลิงก์สำหรับ {tokenPayload?.userName || tokenPayload?.heroName || 'ผู้ใช้'} หมดอายุเมื่อ {tokenPayload?.validUntilFormatted}
              </p>
            </div>

            {/* Quick Contact buttons */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <a
                href="tel:0992256601"
                className="py-3 px-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-rose-600/25 transition active:scale-95"
              >
                <span>📞 โทร 099-2256601</span>
              </a>
              <a
                href="https://line.me/ti/p/~0992256601"
                target="_blank"
                rel="noreferrer"
                className="py-3 px-3 rounded-2xl bg-[#06C755] hover:bg-[#05b34c] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition active:scale-95"
              >
                <span>💬 ทัก LINE แอดมิน</span>
              </a>
            </div>

            {/* Renewal passcode unlock */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <p className="text-xs text-slate-500 font-medium">
                หรือกรอกรหัสต่ออายุ (หากได้รับจาก Admin แล้ว):
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={renewalInput}
                  onChange={(e) => setRenewalInput(e.target.value.toUpperCase())}
                  placeholder="รหัสต่ออายุ เช่น HERO-8821"
                  className="flex-1 px-3 py-2.5 rounded-xl border border-slate-300 text-center font-mono font-bold text-xs uppercase outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleUnlockRenewal}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition active:scale-95 shrink-0"
                >
                  ปลดล็อก
                </button>
              </div>
              {renewalMessage && (
                <p className="text-xs font-bold text-rose-600 animate-shake">
                  {renewalMessage}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Requirement 1 & 2: User Login Modal before entering user link */}
      <UserLoginModal
        isOpen={Boolean(tokenPayload && !isTokenExpired && !isUserLoggedIn && !showBootScreen)}
        tokenPayload={tokenPayload}
        profile={profile}
        onSuccessLogin={() => {
          // Requirement 3: หลังใส่รหัสผ่านสร้างหน้า บูท screen เวลาจะเข้าใช้งาน
          setShowBootScreen(true);
        }}
      />

      {/* Requirement 3: Hero Boot Screen หลังใส่รหัสผ่านสำเร็จ */}
      <HeroBootScreen
        isOpen={showBootScreen}
        profile={profile}
        onBootComplete={() => {
          setShowBootScreen(false);
          setIsUserLoggedIn(true);

          if (tokenPayload) {
            // เช็คว่าเป็นการใช้งานครั้งแรกหรือไม่ (สร้างชื่อและเลือกโปรไฟล์ก่อนถึงจะเริ่มต้นกำหนดภารกิจได้)
            const isCompleted =
              localStorage.getItem(`chore_hero_onboarding_completed_${tokenPayload.passcode}_${tokenPayload.createdAt}`) === 'true';
            if (!isCompleted) {
              setIsFirstTimeOnboarding(true);
              setShowOnboarding(true);
            } else {
              setWelcomeBanner(`🌟 ยินดีต้อนรับฮีโร่ ${profile.nickname || tokenPayload?.heroName}! เข้าสู่ระบบสำเร็จ`);
              setTimeout(() => setWelcomeBanner(null), 6000);
            }
          }
        }}
      />

      {/* Parent Security PIN Keypad Modal (Requirement 2: รหัส 099-2252601) */}
      <ParentPinModal
        isOpen={showParentPinModal}
        onClose={() => {
          setShowParentPinModal(false);
          setPinSuccessCallback(null);
        }}
        correctPin="099-2252601"
        onSuccess={() => {
          if (pinSuccessCallback) {
            pinSuccessCallback();
          }
          setShowParentPinModal(false);
          setPinSuccessCallback(null);
        }}
      />
    </div>
  );
}
