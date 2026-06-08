/**
 * Utility helpers for pronunciation, sounds and analytics
 */

// Voice synthesis helper
export function speakWord(text: string) {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    // Cancel prior speech first
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.95; // Slightly slower for language learners
    
    // Find an English voice if available
    const voices = window.speechSynthesis.getVoices();
    const enVoice = voices.find(v => v.lang.startsWith("en-"));
    if (enVoice) {
      utterance.voice = enVoice;
    }
    
    window.speechSynthesis.speak(utterance);
  } else {
    console.warn("Speech synthesis is not supported on this device/browser.");
  }
}

// Retro-beeps/tones helper for playful retro and kid-friendly feel (sound indicators)
export function playTone(type: "success" | "error" | "click" | "level_up") {
  if (typeof window === "undefined") return;
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return;

  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === "success") {
      // Ascending chord
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === "error") {
      // Descending buzz
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.linearRampToValueAtTime(90, now + 0.25);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === "click") {
      // Short click
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === "level_up") {
      // Fun fanfare
      osc.type = "triangle";
      osc.frequency.setValueAtTime(392.00, now); // G4
      osc.frequency.setValueAtTime(523.25, now + 0.1); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.2); // E5
      osc.frequency.setValueAtTime(1046.50, now + 0.35); // C6
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
      osc.start(now);
      osc.stop(now + 0.6);
    }
  } catch (err) {
    console.error("Failed to generate audio feedback:", err);
  }
}

// Date formatter helper
export function getFormattedToday(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const MOTTO_LIST = [
  "No pain, no gain. (一分耕耘，一分收获。)",
  "Practice makes perfect. (熟能生巧。)",
  "Reading makes a full man. (读书使人充实。)",
  "Never put off what you can do today until tomorrow. (今日事今日毕。)",
  "A bold attempt is half success. (勇敢的尝试是成功的一半。)",
  "Well begun is half done. (良好的开端是成功的一半。)",
  "Believe in yourself. You can master any English word! (相信自己，你可以掌握所有的英语单词！)",
  "Where there is a will, there is a way. (有志者事竟成。)",
  "All things are difficult before they are easy. (万事开头难。)"
];

export function getRandomMotto(): string {
  const index = Math.floor(Math.random() * MOTTO_LIST.length);
  return MOTTO_LIST[index];
}
