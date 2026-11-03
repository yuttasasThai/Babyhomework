import { soundManager } from './soundEffects';

class AlarmManager {
  private isAlarmPlaying: boolean = false;
  private intervalId: number | null = null;
  public activeAlarmTaskId: string | null = null;

  // Speak task title in Thai voice
  speakTaskAlarm(taskTitle: string, childName: string) {
    if (typeof window === 'undefined') return;

    // 1. Play synthesized chime alarm sound
    soundManager.playStarPop();
    setTimeout(() => soundManager.playLevelUp(), 300);

    // 2. Speak Thai speech if Web Speech API is supported
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel(); // Stop any pending speech
        const text = `ถึงเวลาทำภารกิจแล้วจ้า! ${taskTitle} น้อง${childName} มาลุยกันเถอะ!`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'th-TH';
        utterance.rate = 0.95;
        utterance.pitch = 1.1; // Cheerful slightly higher pitch for kids

        // Find Thai voice if available
        const voices = window.speechSynthesis.getVoices();
        const thaiVoice = voices.find((v) => v.lang.includes('th') || v.lang.includes('TH'));
        if (thaiVoice) {
          utterance.voice = thaiVoice;
        }

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('Speech synthesis error:', err);
      }
    }
  }

  // Start periodic alarm (repeats every 2 minutes until acknowledged)
  startPeriodicAlarm(
    taskId: string,
    taskTitle: string,
    childName: string,
    intervalMs: number = 120000 // 2 minutes
  ) {
    this.activeAlarmTaskId = taskId;
    this.speakTaskAlarm(taskTitle, childName);

    // Clear previous interval if any
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    // Repeat every intervalMs until stopAlarm is called
    this.intervalId = window.setInterval(() => {
      this.speakTaskAlarm(taskTitle, childName);
    }, intervalMs);
  }

  // Stop alarm when child clicks "กดรับภารกิจ"
  stopAlarm() {
    this.activeAlarmTaskId = null;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const alarmManager = new AlarmManager();
