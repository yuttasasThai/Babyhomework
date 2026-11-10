// Synthesized sound effects using Web Audio API - zero external audio asset dependencies

class SoundManager {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  playStarPop() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(1174.66, now + 0.15); // D6

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  playSuccessFanfare() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      const now = ctx.currentTime;

      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const noteStart = now + index * 0.09;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.22, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.01, noteStart + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(noteStart);
        osc.stop(noteStart + 0.36);
      });
    } catch {
      // Fallback
    }
  }

  playLevelUp() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51]; // A4, C#5, E5, A5, C#6, E6
      const now = ctx.currentTime;

      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const noteStart = now + index * 0.08;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.25, noteStart);
        gain.gain.exponentialRampToValueAtTime(0.01, noteStart + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(noteStart);
        osc.stop(noteStart + 0.45);
      });
    } catch {
      // Fallback
    }
  }

  playCameraShutter() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Click snap sound
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.06);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.07);
    } catch {
      // Fallback
    }
  }
  playWarningAlert() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Two-tone warning beep
      [0, 0.15, 0.3].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, now + offset); // A5
        osc.frequency.setValueAtTime(659.25, now + offset + 0.07); // E5

        gain.gain.setValueAtTime(0.2, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.01, now + offset + 0.14);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + offset);
        osc.stop(now + offset + 0.14);
      });
    } catch {
      // Audio autoplay policy fallback
    }
  }

  speakThai(text: string) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'th-TH';
      utterance.rate = 1.0;
      utterance.pitch = 1.05;

      const voices = window.speechSynthesis.getVoices();
      const thaiVoice = voices.find((v) => v.lang === 'th-TH' || v.lang.startsWith('th'));
      if (thaiVoice) {
        utterance.voice = thaiVoice;
      }
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis failed:', err);
    }
  }

  playExpiredUserVoiceAlert(userName: string) {
    this.playWarningAlert();
    setTimeout(() => {
      this.speakThai(`ยูสเซอร์ ${userName} หมดอายุแล้วค่ะ`);
    }, 500);
  }

  playContactAdminVoice() {
    this.playWarningAlert();
    setTimeout(() => {
      this.speakThai('หมดอายุใช้งาน ต้องการใช้งาน ติดต่อ admin ช่างหน่อยชุมแพ 099-2256601 ค่ะ');
    }, 500);
  }
}

export const soundManager = new SoundManager();

