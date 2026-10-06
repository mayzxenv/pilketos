type SoundOptions = {
  frequency: number;
  duration: number;
  volume: number;
  type?: OscillatorType;
  startAt?: number;
};

let audioContext: AudioContext | null = null;
let thankYouAudioInstance: HTMLAudioElement | null = null;

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
  playAudioAsset(welcomeAudio);
}

export function playChooseCandidateSound(): void {
  playAudioAsset(chooseCandidateAudio);
}

export function playVoteCompleteSound(): void {
  if (typeof window === 'undefined') return;
  if (!thankYouAudioInstance) {
    thankYouAudioInstance = new Audio(thankYouAudio);
    thankYouAudioInstance.volume = 1;
  }
  thankYouAudioInstance.pause();
  thankYouAudioInstance.currentTime = 0;
  void thankYouAudioInstance.play().catch((error: unknown) => {
    console.warn('DIGIVOS7 tidak dapat memutar audio:', error);
  });
}

export function playBannerSound(): void {
  playAudioAsset(bannerAudio);
}

function playAudioAsset(source: string): void {
  if (typeof window === 'undefined') return;

  const audio = new Audio(source);
  audio.volume = 1;
  void audio.play().catch((error: unknown) => {
    console.warn('DIGIVOS7 tidak dapat memutar audio:', error);
  });
}
import chooseCandidateAudio from '../assets/pilihkandidat.mp3';
import welcomeAudio from '../assets/selamat datang.mp3';
import thankYouAudio from '../assets/terimakasih.mp3';
import bannerAudio from '../assets/page 2 di tempat banner.mp3';
