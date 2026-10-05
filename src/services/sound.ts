type SoundOptions = {
  frequency: number;
  duration: number;
  volume: number;
  type?: OscillatorType;
  startAt?: number;
};

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;

  if (!audioContext) {
    const AudioContextConstructor =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

    if (!AudioContextConstructor) return null;
    audioContext = new AudioContextConstructor();
  }

  return audioContext;
}

function playTone({ frequency, duration, volume, type = 'sine', startAt = 0 }: SoundOptions): void {
  const context = getAudioContext();
  if (!context) return;

  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const startTime = context.currentTime + startAt;

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startTime);
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration);
}

function resumeAudio(): void {
  const context = getAudioContext();
  if (!context || context.state === 'running') return;

  void context.resume().catch((error: unknown) => {
    console.warn('DIGIVOS7 tidak dapat mengaktifkan suara:', error);
  });
}

export function playClickSound(): void {
  resumeAudio();
  playTone({
    frequency: 720,
    duration: 0.08,
    volume: 0.045,
    type: 'sine'
  });
}

export function playWelcomeSound(): void {
  resumeAudio();
  playTone({
    frequency: 523.25,
    duration: 0.18,
    volume: 0.06,
    type: 'sine'
  });
  playTone({
    frequency: 659.25,
    duration: 0.24,
    volume: 0.06,
    type: 'sine',
    startAt: 0.12
  });
  playTone({
    frequency: 783.99,
    duration: 0.3,
    volume: 0.05,
    type: 'sine',
    startAt: 0.24
  });
}

export function speakInstruction(message: string): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(message);
  utterance.lang = 'id-ID';
  utterance.rate = 0.92;
  utterance.pitch = 1.04;
  utterance.volume = 1;
  window.speechSynthesis.speak(utterance);
}
