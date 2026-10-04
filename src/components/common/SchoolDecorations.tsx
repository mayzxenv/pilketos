import React from 'react';
import confetti from 'canvas-confetti';
import ballotBoxImage from '../../assets/images/icon.webp';

export function fireSchoolConfetti() {
  try {
    // School celebration colors: royal blue, emerald green, warm amber, bright cyan
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      colors: ['#2563EB', '#10B981', '#F59E0B', '#06B6D4', '#EC4899', '#8B5CF6']
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio)
      });
    }

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  } catch (err) {
    console.warn('Confetti unavailable in this environment', err);
  }
}

export const FloatingSchoolElements: React.FC<{ variant?: 'hero' | 'minimal' | 'full' }> = ({ variant = 'full' }) => {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-0 select-none opacity-85">
      {/* Drifting Clouds in the sky */}
      <div className="absolute top-6 left-8 animate-drift opacity-70">
        <svg width="110" height="54" viewBox="0 0 110 54" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M30 46C20 46 12 38 12 28C12 18.5 19.5 10.7 28.8 10.1C32.4 4.1 39 0 46.5 0C56 0 64 6.7 66 15.8C68.3 14.7 70.8 14 73.5 14C83.2 14 91 21.8 91 31.5C91 32.5 90.9 33.5 90.7 34.5C95.5 35.8 99 40.2 99 45.5C99 51.3 94.3 56 88.5 56H30C24.5 56 20 51.5 20 46Z"
            fill="#E0F2FE"
          />
        </svg>
      </div>

      <div className="absolute top-12 right-12 animate-drift opacity-60" style={{ animationDelay: '-8s' }}>
        <svg width="130" height="60" viewBox="0 0 110 54" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M25 46C15 46 8 38 8 28C8 18.5 15.5 10.7 24.8 10.1C28.4 4.1 35 0 42.5 0C52 0 60 6.7 62 15.8C64.3 14.7 66.8 14 69.5 14C79.2 14 87 21.8 87 31.5C87 32.5 86.9 33.5 86.7 34.5C91.5 35.8 95 40.2 95 45.5C95 51.3 90.3 56 84.5 56H25Z"
            fill="#E0F2FE"
          />
        </svg>
      </div>

      {variant !== 'minimal' && (
        <>
          {/* Floating Pencil */}
          <div className="absolute top-28 left-6 md:left-16 animate-float">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="drop-shadow-sm transform -rotate-12">
              <path d="M38 4L44 10L14 40L6 42L8 34L38 4Z" fill="#FBBF24" stroke="#D97706" strokeWidth="2" strokeLinejoin="round" />
              <path d="M32 10L38 16" stroke="#D97706" strokeWidth="2" />
              <path d="M6 42L11 37L9 39L6 42Z" fill="#374151" />
              <path d="M34 6L40 12" stroke="#FEF3C7" strokeWidth="2" />
            </svg>
          </div>

          {/* Floating School Book */}
          <div className="absolute top-36 right-8 md:right-20 animate-float-reverse">
            <svg width="50" height="50" viewBox="0 0 48 48" fill="none" className="drop-shadow-sm transform rotate-12">
              <rect x="8" y="10" width="30" height="28" rx="4" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="2" />
              <path d="M12 16H34M12 22H30M12 28H24" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <rect x="6" y="14" width="4" height="24" rx="2" fill="#F59E0B" />
            </svg>
          </div>

          {/* Floating Green Leaf (Eco School Vibe) */}
          <div className="absolute bottom-24 left-10 md:left-24 animate-float" style={{ animationDelay: '-2s' }}>
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" className="drop-shadow-sm transform rotate-45">
              <path d="M6 30C6 30 10 14 26 8C26 8 28 24 12 30C8.5 31.3 6 30 6 30Z" fill="#34D399" stroke="#059669" strokeWidth="1.5" />
              <path d="M10 26C14 22 20 16 26 8" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>

          {/* Floating Paper Airplane / Ballot */}
          <div className="absolute bottom-28 right-12 md:right-28 animate-float-reverse" style={{ animationDelay: '-3s' }}>
            <svg width="44" height="44" viewBox="0 0 40 40" fill="none" className="drop-shadow-sm transform -rotate-15">
              <path d="M4 18L36 6L22 34L17 22L4 18Z" fill="#93C5FD" stroke="#2563EB" strokeWidth="1.8" strokeLinejoin="round" />
              <path d="M36 6L17 22" stroke="#1E40AF" strokeWidth="1.5" />
            </svg>
          </div>
        </>
      )}
    </div>
  );
};

export const SchoolBagIllustration: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="12" y="22" width="40" height="34" rx="8" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="2.5" />
    <path d="M22 22V15C22 10.5 25.5 7 30 7H34C38.5 7 42 10.5 42 15V22" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
    <rect x="18" y="32" width="28" height="18" rx="4" fill="#60A5FA" stroke="#1D4ED8" strokeWidth="2" />
    <circle cx="32" cy="38" r="3" fill="#FBBF24" />
    <path d="M18 42H46" stroke="#2563EB" strokeWidth="1.5" />
  </svg>
);

export const BallotBoxIllustration: React.FC<{ className?: string }> = ({ className = 'w-12 h-12' }) => (
  <img src={ballotBoxImage} alt="Kotak suara SIVOT" className={`${className} object-contain`} />
);
