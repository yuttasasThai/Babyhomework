import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChoreTask, HeroProfile } from '../types/chore';
import { generateWatermarkedPhoto, processImageFileToWatermark, WatermarkResult } from '../utils/watermark';
import { soundManager } from '../utils/soundEffects';
import {
  Camera,
  RefreshCw,
  Upload,
  X,
  Sparkles,
  CheckCircle2,
  Smartphone,
  Video,
  Loader2,
  AlertTriangle,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  task: ChoreTask;
  profile: HeroProfile;
  onSubmitProof: (task: ChoreTask, watermarkResult: WatermarkResult) => void;
}

export const CameraSubmitModal: React.FC<Props> = ({
  isOpen,
  onClose,
  task,
  profile,
  onSubmitProof,
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isWebcamActive, setIsWebcamActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [watermarkedResult, setWatermarkedResult] = useState<WatermarkResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryFileInputRef = useRef<HTMLInputElement | null>(null);

  // Stop webcam tracks cleanly
  const stopWebcam = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsWebcamActive(false);
  }, [stream]);

  // Start webcam
  const startWebcam = useCallback(async (facing: 'environment' | 'user') => {
    stopWebcam();
    setCameraError(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('เบราว์เซอร์ไม่รองรับกล้องสด กรุณากดปุ่ม "เปิดกล้องมือถือถ่ายรูป" ด้านล่าง');
      }

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setStream(newStream);
      setIsWebcamActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'ไม่สามารถเปิดกล้องสดได้ กรุณาใช้ปุ่มถ่ายรูปด้วยกล้องมือถือ';
      setCameraError(message);
      setIsWebcamActive(false);
    }
  }, [stopWebcam]);

  useEffect(() => {
    if (!isOpen) {
      stopWebcam();
      setWatermarkedResult(null);
      setCountdown(null);
      setIsProcessing(false);
      setCameraError(null);
    }
  }, [isOpen, stopWebcam]);

  if (!isOpen) return null;

  // Toggle front/rear camera for webcam
  const handleToggleFacingMode = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startWebcam(nextMode);
  };

  // Capture snapshot from webcam video
  const handleCaptureFromWebcam = async () => {
    if (!videoRef.current) return;
    setIsProcessing(true);
    soundManager.playCameraShutter();

    try {
      const result = await generateWatermarkedPhoto({
        source: videoRef.current,
        heroName: profile.nickname,
        choreTitle: task.title,
        choreIcon: task.icon,
      });
      setWatermarkedResult(result);
      stopWebcam();
    } catch (err) {
      console.error('Failed to watermark photo:', err);
      setCameraError('เกิดข้อผิดพลาดในการประทับเวลาบนภาพ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsProcessing(false);
    }
  };

  // 3-second timer snapshot
  const handleStartCountdown = () => {
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          handleCaptureFromWebcam();
          return null;
        }
        soundManager.playStarPop();
        return prev - 1;
      });
    }, 1000);
  };

  // Process photo from native mobile camera or gallery (Fast & Memory Safe)
  const handleProcessImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setCameraError(null);
    soundManager.playCameraShutter();

    // Safety timeout: automatically reset spinner if takes more than 4.5s
    const safetyTimer = setTimeout(() => {
      setIsProcessing(false);
      setCameraError('การประมวลผลรูปใช้เวลานานเกินไป กรุณากดลองอีกครั้ง');
    }, 4500);

    try {
      const result = await processImageFileToWatermark(
        file,
        profile.nickname,
        task.title,
        task.icon
      );
      clearTimeout(safetyTimer);
      setWatermarkedResult(result);
      stopWebcam();
    } catch (err) {
      clearTimeout(safetyTimer);
      console.error('Watermark error:', err);
      setCameraError(err instanceof Error ? err.message : 'ไม่สามารถประทับเวลาบนรูปได้ กรุณาลองถ่ายใหม่อีกครั้ง');
    } finally {
      setIsProcessing(false);
      e.target.value = '';
    }
  };

  // Sample quick photo for instant testing
  const handleUseDemoSnap = async () => {
    setIsProcessing(true);
    setCameraError(null);
    soundManager.playCameraShutter();

    const demoCanvas = document.createElement('canvas');
    demoCanvas.width = 960;
    demoCanvas.height = 720;
    const ctx = demoCanvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, 960, 720);

      const floorGrad = ctx.createLinearGradient(0, 420, 0, 720);
      floorGrad.addColorStop(0, '#e2e8f0');
      floorGrad.addColorStop(1, '#cbd5e1');
      ctx.fillStyle = floorGrad;
      ctx.fillRect(0, 420, 960, 300);

      ctx.font = '110px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(task.icon, 480, 300);

      ctx.fillStyle = '#1e293b';
      ctx.font = "bold 34px 'Kanit', sans-serif";
      ctx.fillText(`ภาพหลักฐานงาน: ${task.title}`, 480, 390);

      ctx.fillStyle = '#10b981';
      ctx.font = "bold 26px 'Kanit', sans-serif";
      ctx.fillText('✓ สะอาดเรียบร้อย 100%', 480, 450);
    }

    try {
      const result = await generateWatermarkedPhoto({
        source: demoCanvas,
        heroName: profile.nickname,
        choreTitle: task.title,
        choreIcon: task.icon,
      });
      setWatermarkedResult(result);
    } catch (err) {
      console.error('Demo snap error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Retake photo
  const handleRetake = () => {
    setWatermarkedResult(null);
    setCameraError(null);
  };

  // Confirm final submission
  const handleFinalSubmit = () => {
    if (!watermarkedResult) return;
    onSubmitProof(task, watermarkedResult);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 text-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-700 flex flex-col my-auto max-h-[96vh]">
        {/* Top Header */}
        <div className="p-3.5 sm:p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{task.icon}</span>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white font-display line-clamp-1">
                ส่งงาน: {task.title}
              </h3>
              <p className="text-[11px] text-amber-400 font-medium">
                ระบบประทับวันเวลาจริงอัตโนมัติบนภาพ ป้องกันการใช้รูปเก่า
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition min-h-[40px] min-w-[40px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport & Modes Content */}
        <div className="relative bg-black flex-1 flex flex-col items-center justify-center min-h-[280px] sm:min-h-[360px] p-2 overflow-hidden">
          {watermarkedResult ? (
            /* Result Preview */
            <div className="relative w-full h-full flex flex-col items-center justify-center">
              <img
                src={watermarkedResult.dataUrl}
                alt="Watermarked Chore Proof"
                className="max-h-[50vh] sm:max-h-[55vh] max-w-full rounded-2xl shadow-xl object-contain border border-amber-500/50"
              />
              <div className="absolute top-3 left-3 bg-emerald-500/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md flex items-center gap-1 shadow-lg">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>ประทับตราวันเวลาจริงสำเร็จ!</span>
              </div>
            </div>
          ) : isWebcamActive ? (
            /* Live Webcam Stream View */
            <div className="relative w-full h-full flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover max-h-[50vh] rounded-2xl"
              />

              {countdown !== null && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-20">
                  <span className="text-7xl font-black text-amber-400 animate-ping font-display">
                    {countdown}
                  </span>
                </div>
              )}

              {/* Shutter overlay for live webcam */}
              <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-3 z-10">
                <button
                  type="button"
                  onClick={handleToggleFacingMode}
                  className="p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white backdrop-blur-sm border border-white/20"
                  title="สลับกล้อง"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleCaptureFromWebcam}
                  disabled={isProcessing}
                  className="w-14 h-14 rounded-full bg-white hover:bg-slate-200 p-1 shadow-xl transition active:scale-95 flex items-center justify-center"
                >
                  <div className="w-full h-full rounded-full bg-amber-500 flex items-center justify-center">
                    <Camera className="w-6 h-6 text-slate-950" />
                  </div>
                </button>
                <button
                  type="button"
                  onClick={handleStartCountdown}
                  className="px-2.5 py-1.5 rounded-full bg-slate-900/80 text-amber-300 text-[11px] font-bold backdrop-blur-sm border border-white/20"
                >
                  3วิ
                </button>
              </div>
            </div>
          ) : (
            /* Main Capture Choice Menu (100% Reliable for Mobile & Android) */
            <div className="w-full max-w-sm p-4 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto ring-4 ring-amber-500/10">
                <Camera className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-lg font-bold text-white font-display">
                  ถ่ายรูปส่งงาน {task.icon}
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  กดถ่ายรูปงานบ้านที่ทำเสร็จ ระบบจะประทับวันเวลาและรหัสตรวจรับลงบนภาพทันที
                </p>
              </div>

              {cameraError && (
                <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/50 text-rose-300 text-xs text-left flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{cameraError}</span>
                </div>
              )}

              {/* Primary Method 1: Native Mobile Camera (100% Reliable on Android & iOS) */}
              <button
                type="button"
                onClick={() => nativeCameraInputRef.current?.click()}
                disabled={isProcessing}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/25 hover:brightness-110 active:scale-98 transition flex items-center justify-center gap-2.5 font-display min-h-[48px]"
              >
                <Smartphone className="w-5 h-5 text-slate-950" />
                <span>📸 เปิดกล้องมือถือถ่ายรูปทันที</span>
              </button>

              {/* Secondary Methods */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => startWebcam(facingMode)}
                  disabled={isProcessing}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center justify-center gap-1.5 transition"
                >
                  <Video className="w-4 h-4 text-sky-400" />
                  <span>กล้องสดในเว็บ</span>
                </button>

                <button
                  type="button"
                  onClick={() => galleryFileInputRef.current?.click()}
                  disabled={isProcessing}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center justify-center gap-1.5 transition"
                >
                  <Upload className="w-4 h-4 text-emerald-400" />
                  <span>เลือกจากคลังรูป</span>
                </button>
              </div>

              <div className="pt-2 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={handleUseDemoSnap}
                  disabled={isProcessing}
                  className="text-xs text-amber-400/90 hover:text-amber-300 underline underline-offset-4 font-medium"
                >
                  ✨ กดที่นี่เพื่อทดสอบด้วยรูปตัวอย่างทันที
                </button>
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          {isProcessing && (
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center gap-2 z-30">
              <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
              <p className="text-xs text-amber-300 font-bold">กำลังประทับตราวันเวลาจริงลงบนภาพ...</p>
            </div>
          )}
        </div>

        {/* Hidden Native File Inputs */}
        <input
          ref={nativeCameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleProcessImageFile}
          className="hidden"
        />
        <input
          ref={galleryFileInputRef}
          type="file"
          accept="image/*"
          onChange={handleProcessImageFile}
          className="hidden"
        />

        {/* Modal Bottom Footer Actions */}
        <div className="p-3.5 sm:p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
          {watermarkedResult ? (
            <>
              <button
                type="button"
                onClick={handleRetake}
                className="py-2.5 px-4 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-bold transition flex items-center gap-1.5"
              >
                <RefreshCw className="w-4 h-4" />
                <span>ถ่ายใหม่</span>
              </button>

              <button
                type="button"
                onClick={handleFinalSubmit}
                className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-sm shadow-lg shadow-emerald-500/25 transition active:scale-95 flex items-center gap-1.5 font-display"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>ยืนยันส่งงาน (+{task.starsReward} ⭐)</span>
              </button>
            </>
          ) : (
            <div className="w-full flex items-center justify-center text-[11px] text-slate-400 gap-1.5">
              <span>🔒 ตราประทับลายน้ำ Canvas ป้องกันรูปส่งซ้ำ และระบุเวลาจริง</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
