import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChoreTask, HeroProfile } from '../types/chore';
import { generateWatermarkedPhoto, WatermarkResult } from '../utils/watermark';
import { soundManager } from '../utils/soundEffects';
import { Camera, RefreshCw, Upload, X, CheckCircle2, Smartphone, Video, Loader2 } from 'lucide-react';

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
  const [watermarkedResult, setWatermarkedResult] = useState<WatermarkResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryFileInputRef = useRef<HTMLInputElement | null>(null);

  const stopWebcam = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsWebcamActive(false);
  }, [stream]);

  const startWebcam = useCallback(async (facing: 'environment' | 'user') => {
    stopWebcam();
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facing }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      setStream(newStream);
      setIsWebcamActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch {
      alert('เบราว์เซอร์ไม่รองรับกล้องสด กรุณากดปุ่ม "เปิดกล้องมือถือถ่ายรูปทันที"');
    }
  }, [stopWebcam]);

  useEffect(() => {
    if (!isOpen) {
      stopWebcam();
      setWatermarkedResult(null);
      setIsProcessing(false);
    }
  }, [isOpen, stopWebcam]);

  if (!isOpen) return null;

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
    } catch {
      alert('เกิดข้อผิดพลาดในการประทับเวลา กรุณาลองใช้ปุ่มเปิดกล้องมือถือ');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    soundManager.playCameraShutter();

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = async () => {
      URL.revokeObjectURL(objectUrl);
      try {
        const result = await generateWatermarkedPhoto({
          source: img,
          heroName: profile.nickname,
          choreTitle: task.title,
          choreIcon: task.icon,
        });
        setWatermarkedResult(result);
        stopWebcam();
      } catch {
        alert('เกิดข้อผิดพลาดในการประทับเวลาบนภาพ กรุณาลองใหม่อีกครั้ง');
      } finally {
        setIsProcessing(false);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setIsProcessing(false);
      alert('ไม่สามารถอ่านรูปภาพจากกล้องได้');
    };
    img.src = objectUrl;
    e.target.value = '';
  };

  const handleUseDemoSnap = () => {
    setIsProcessing(true);
    const demoCanvas = document.createElement('canvas');
    demoCanvas.width = 1000;
    demoCanvas.height = 750;
    const ctx = demoCanvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, 1000, 750);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(0, 450, 1000, 300);
      ctx.font = '120px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(task.icon, 500, 320);
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText(`ภาพหลักฐานงาน: ${task.title}`, 500, 410);
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 28px sans-serif';
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 text-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-700 flex flex-col my-auto max-h-[96vh]">
        <div className="p-3.5 sm:p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{task.icon}</span>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white font-display line-clamp-1">
                ส่งงาน: {task.title}
              </h3>
              <p className="text-[11px] text-amber-400 font-medium">
                ระบบประทับวันเวลาจริงอัตโนมัติบนภาพ
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative bg-black flex-1 flex flex-col items-center justify-center min-h-[280px] p-2 overflow-hidden">
          {watermarkedResult ? (
            <div className="relative w-full h-full flex flex-col items-center justify-center">
              <img src={watermarkedResult.dataUrl} alt="Proof" className="max-h-[50vh] max-w-full rounded-2xl object-contain border border-amber-500/50" />
              <div className="absolute top-3 left-3 bg-emerald-500/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>ประทับตราวันเวลาจริงสำเร็จ!</span>
              </div>
            </div>
          ) : isWebcamActive ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover max-h-[50vh] rounded-2xl" />
              <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-3 z-10">
                <button type="button" onClick={handleCaptureFromWebcam} disabled={isProcessing} className="w-14 h-14 rounded-full bg-white p-1 shadow-xl">
                  <div className="w-full h-full rounded-full bg-amber-500 flex items-center justify-center">
                    <Camera className="w-6 h-6 text-slate-950" />
                  </div>
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-sm p-4 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                <Camera className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white font-display">ถ่ายรูปส่งงาน {task.icon}</h4>
                <p className="text-xs text-slate-300 mt-1">กดถ่ายรูปงานบ้าน ระบบจะประทับวันเวลาจริงลงบนภาพทันที</p>
              </div>
              <button
                type="button"
                onClick={() => nativeCameraInputRef.current?.click()}
                disabled={isProcessing}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-slate-950 font-black text-sm shadow-lg flex items-center justify-center gap-2"
              >
                <Smartphone className="w-5 h-5 text-slate-950" />
                <span>📸 เปิดกล้องมือถือถ่ายรูปทันที</span>
              </button>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button type="button" onClick={() => startWebcam(facingMode)} className="py-2.5 px-3 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold border border-slate-700 flex items-center justify-center gap-1.5">
                  <Video className="w-4 h-4 text-sky-400" />
                  <span>กล้องสดในเว็บ</span>
                </button>
                <button type="button" onClick={() => galleryFileInputRef.current?.click()} className="py-2.5 px-3 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold border border-slate-700 flex items-center justify-center gap-1.5">
                  <Upload className="w-4 h-4 text-emerald-400" />
                  <span>เลือกจากคลังรูป</span>
                </button>
              </div>
              <div className="pt-2 border-t border-slate-800">
                <button type="button" onClick={handleUseDemoSnap} className="text-xs text-amber-400 underline font-medium">
                  ✨ กดที่นี่เพื่อทดสอบด้วยรูปตัวอย่างทันที
                </button>
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center gap-2 z-30">
              <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
              <p className="text-xs text-amber-300 font-bold">กำลังประทับตราวันเวลาจริงลงบนภาพ...</p>
            </div>
          )}
        </div>

        <input ref={nativeCameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleProcessImageFile} className="hidden" />
        <input ref={galleryFileInputRef} type="file" accept="image/*" onChange={handleProcessImageFile} className="hidden" />

        <div className="p-3.5 sm:p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
          {watermarkedResult ? (
            <>
              <button type="button" onClick={() => setWatermarkedResult(null)} className="py-2 px-4 rounded-xl text-slate-300 text-xs font-bold">
                ถ่ายใหม่
              </button>
              <button
                type="button"
                onClick={() => {
                  onSubmitProof(task, watermarkedResult);
                  onClose();
                }}
                className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-sm shadow-lg flex items-center gap-1.5 font-display"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>ยืนยันส่งงาน (+{task.starsReward} ⭐)</span>
              </button>
            </>
          ) : (
            <div className="w-full flex items-center justify-center text-[11px] text-slate-400">
              🔒 ตราประทับลายน้ำ Canvas ป้องกันรูปส่งซ้ำ และระบุเวลาจริง
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
