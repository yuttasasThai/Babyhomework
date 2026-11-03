import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChoreTask, HeroProfile } from '../types/chore';
import { generateWatermarkedPhoto, WatermarkResult } from '../utils/watermark';
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
        throw new Error('อุปกรณ์หรือเบราว์เซอร์ไม่รองรับการสตรีมกล้องสด กรุณาใช้ปุ่ม "เปิดกล้องมือถือถ่ายรูป"');
      }

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
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
      const message = err instanceof Error ? err.message : 'ไม่สามารถเปิดกล้องสดได้';
      setCameraError(message);
      setIsWebcamActive(false);
    }
  }, [stopWebcam]);

  useEffect(() => {
    // Cleanup on close
    if (!isOpen) {
      stopWebcam();
      setWatermarkedResult(null);
      setCountdown(null);
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
      alert('เกิดข้อผิดพลาดในการประทับเวลาบนภาพ กรุณาลองใหม่อีกครั้ง');
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

  // Process photo from native mobile camera or gallery
  const handleProcessImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        try {
          soundManager.playCameraShutter();
          const result = await generateWatermarkedPhoto({
            source: img,
            heroName: profile.nickname,
            choreTitle: task.title,
            choreIcon: task.icon,
          });
          setWatermarkedResult(result);
          stopWebcam();
        } catch (err) {
          console.error(err);
          alert('ไม่สามารถประทับเวลาบนภาพได้ กรุณาลองใหม่อีกครั้ง');
        } finally {
          setIsProcessing(false);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Sample quick photo for instant testing
  const handleUseDemoSnap = () => {
    setIsProcessing(true);
    const demoCanvas = document.createElement('canvas');
    demoCanvas.width = 1000;
    demoCanvas.height = 750;
    const ctx = demoCanvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, 1000, 750);

      const floorGrad = ctx.createLinearGradient(0, 450, 0, 750);
      floorGrad.addColorStop(0, '#e2e8f0');
      floorGrad.addColorStop(1, '#cbd5e1');
      ctx.fillStyle = floorGrad;
      ctx.fillRect(0, 450, 1000, 300);

      ctx.font = '120px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(task.icon, 500, 320);

      ctx.fillStyle = '#1e293b';
      ctx.font = "bold 36px 'Kanit', sans-serif";
      ctx.fillText(`ภาพหลักฐานงาน: ${task.title}`, 500, 410);

      ctx.fillStyle = '#10b981';
      ctx.font = "bold 28px 'Kanit', sans-serif";
      ctx.fillText('✓ สะอาดเรียบร้อย 100%', 500, 470);
    }

    const demoImg = new Image();
    demoImg.onload = async () => {
      const result = await generateWatermarkedPhoto({
        source: demoImg,
        heroName: profile.nickname,
        choreTitle: task.title,
        choreIcon: task.icon,
      });
      setWatermarkedResult(result);
      setIsProcessing(false);
      soundManager.playCameraShutter();
    };
    demoImg.src = demoCanvas.toDataURL('image/jpeg');
  };

  // Retake photo
  const handleRetake = () => {
    setWatermarkedResult(null);
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
                  เลือกเปิดกล้องมือถือถ่ายรูป ระบบจะประทับตราวันเวลาจริงลงบนภาพทันที
                </p>
              </div>

              {cameraError && (
                <div className="p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs text-left">
                  {cameraError}
                </div>
              )}

              {/* Primary Method 1: Native Mobile Camera (100% Works on Android & iOS, ignores iframe blocks) */}
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
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition border border-slate-700 min-h-[44px]"
                >
                  <Video className="w-4 h-4 text-amber-400" />
                  <span>เปิดกล้องสดในเว็บ</span>
                </button>

                <button
                  type="button"
                  onClick={() => galleryFileInputRef.current?.click()}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition border border-slate-700 min-h-[44px]"
                >
                  <Upload className="w-4 h-4 text-sky-400" />
                  <span>เลือกรูปในเครื่อง</span>
                </button>
              </div>

              {/* Quick sample button for testing */}
              <button
                type="button"
                onClick={handleUseDemoSnap}
                className="text-xs text-amber-300/80 hover:text-amber-300 underline font-medium block mx-auto pt-1"
              >
                ✨ กดที่นี่เพื่อทดสอบด้วยรูปตัวอย่างทันที
              </button>
            </div>
          )}

          {/* Native Camera input (Uses HTML5 capture attribute for Android / iOS) */}
          <input
            type="file"
            ref={nativeCameraInputRef}
            onChange={handleProcessImageFile}
            accept="image/*"
            capture="environment"
            className="hidden"
          />

          {/* Standard file input without capture */}
          <input
            type="file"
            ref={galleryFileInputRef}
            onChange={handleProcessImageFile}
            accept="image/*"
            className="hidden"
          />
        </div>

        {/* Modal Bottom Bar */}
        <div className="p-3.5 sm:p-4 border-t border-slate-800 bg-slate-950 shrink-0">
          {watermarkedResult ? (
            <div className="flex flex-col sm:flex-row items-center gap-2.5">
              <button
                type="button"
                onClick={handleRetake}
                className="w-full sm:w-auto flex-1 py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition flex items-center justify-center gap-1.5 min-h-[44px]"
              >
                <RefreshCw className="w-4 h-4" />
                <span>ถ่ายใหม่</span>
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                className="w-full sm:w-auto flex-2 py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/25 hover:brightness-110 active:scale-98 transition flex items-center justify-center gap-2 font-display min-h-[46px]"
              >
                <Sparkles className="w-4 h-4" />
                <span>🎉 ส่งงาน กดเสร็จภารกิจ! (+{task.starsReward} ⭐)</span>
              </button>
            </div>
          ) : isWebcamActive ? (
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={stopWebcam}
                className="py-2 px-3 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700"
              >
                ย้อนกลับ
              </button>
              <span className="text-[11px] text-amber-400">
                แตะปุ่มชัตเตอร์สีขาวตรงกลางเพื่อถ่ายภาพ
              </span>
            </div>
          ) : (
            <div className="text-center text-[11px] text-slate-400">
              🔒 ตราประทับลายน้ำ Canvas ป้องกันรูปส่งซ้ำ และระบุเวลาจริง
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
