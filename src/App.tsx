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
import { alarmManager } from './utils/alarmAudio';

import { Plus, Filter, Sparkles, CheckCircle2, ListTodo, Calendar, Award, MessageCircle } from 'lucide-react';

export default function App() {
  const [profile, setProfile] = useState<HeroProfile>(getStoredProfile);
  const [tasks, setTasks] = useState<ChoreTask[]>(getStoredTasks);
  const [logs, setLogs] = useState<ChoreLog[]>(getStoredLogs);
  const [rewards, setRewards] = useState<WishlistReward[]>(getStoredRewards);

  const [currentView, setCurrentView] = useState<'tasks' | 'stats' | 'gallery' | 'rewards'>('tasks');
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [isParentMode, setIsParentMode] = useState<boolean>(false);

  // Kid / Player mode detector: ?mode=player prevents admin access without PIN
  const [isPlayerOnlyMode, setIsPlayerOnlyMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('mode') === 'player' || params.get('mode') === 'kid';
    }
    return false;
  });

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

  // Safe handler to open Manage Chores (asks PIN if in player mode)
  const handleOpenManageChores = () => {
    if (isPlayerOnlyMode && !isParentMode) {
      setPinSuccessCallback(() => () => {
        setShowAddChore(true);
      });
      setShowParentPinModal(true);
    } else {
      setShowAddChore(true);
    }
  };

  // Safe handler to open Queue Settings (asks PIN if in player mode)
  const handleOpenQueueSettings = () => {
    if (isPlayerOnlyMode && !isParentMode) {
      setPinSuccessCallback(() => () => {
        setShowQueueModal(true);
      });
      setShowParentPinModal(true);
    } else {
      setShowQueueModal(true);
    }
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

  // Handle deleting a chore (in parent mode)
  const handleDeleteChore = (taskId: string) => {
    if (window.confirm('ต้องการลบภารกิจนี้ใช่หรือไม่?')) {
      const updated = tasks.filter((t) => t.id !== taskId);
      setTasks(updated);
      saveTasks(updated);
      soundManager.playStarPop();
    }
  };

  // Handle submitting chore proof with watermark
  const handleSubmitProof = (task: ChoreTask, watermarkResult: WatermarkResult) => {
    // 1. Mark chore completed
    const updatedTasks = tasks.map((t) => {
      if (t.id === task.id) {
        return {
          ...t,
          status: 'completed' as const,
          completedAt: watermarkResult.isoTimestamp,
          completedTimeFormatted: watermarkResult.thaiTimeFormatted,
          proofPhotoUrl: watermarkResult.dataUrl,
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
      starsEarned: task.starsReward,
      category: task.category,
    };
    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);
    saveLogs(updatedLogs);

    // 3. Award stars & update streak in profile
    const updatedProfile: HeroProfile = {
      ...profile,
      totalStars: profile.totalStars + task.starsReward,
      lastActiveDate: new Date().toISOString().split('T')[0],
    };
    setProfile(updatedProfile);
    saveProfile(updatedProfile);

    // 4. Fire celebratory confetti & sound fanfare
    fireHeroConfetti();
    soundManager.playSuccessFanfare();

    // 5. Open Victory Modal
    setVictoryState({
      task,
      watermark: watermarkResult,
    });
  };

  // Handle Parent Approving Task & awarding bonus stars
  const handleApproveTask = (taskId: string, bonusStars: number, feedback: string) => {
    const nowIso = new Date().toISOString();

    // 1. Update task
    const updatedTasks = tasks.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          parentApproved: true,
          parentApprovedAt: nowIso,
          parentBonusStars: bonusStars,
          parentFeedback: feedback,
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
          parentBonusStars: bonusStars,
          parentFeedback: feedback,
        };
      }
      return l;
    });
    setLogs(updatedLogs);
    saveLogs(updatedLogs);

    // 3. Award extra bonus stars to kid's total stars!
    const updatedProfile: HeroProfile = {
      ...profile,
      totalStars: profile.totalStars + bonusStars,
    };
    setProfile(updatedProfile);
    saveProfile(updatedProfile);

    // Update active modal task reference if open
    if (selectedTaskForApproval && selectedTaskForApproval.id === taskId) {
      setSelectedTaskForApproval({
        ...selectedTaskForApproval,
        parentApproved: true,
        parentApprovedAt: nowIso,
        parentBonusStars: bonusStars,
        parentFeedback: feedback,
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
        onOpenShareLink={() => setShowShareModal(true)}
        isPlayerOnlyMode={isPlayerOnlyMode}
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

      {/* Onboarding Profile Modal */}
      <HeroOnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        profile={profile}
        onSave={(updated) => setProfile(updated)}
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

      {/* Share Player Link & GitHub/Vercel Guide Modal */}
      <SharePlayerLinkModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        profile={profile}
        tasks={tasks}
        logs={logs}
        rewards={rewards}
      />

      {/* Parent Security PIN Keypad Modal */}
      <ParentPinModal
        isOpen={showParentPinModal}
        onClose={() => {
          setShowParentPinModal(false);
          setPinSuccessCallback(null);
        }}
        correctPin={profile.parentPin || '1234'}
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
