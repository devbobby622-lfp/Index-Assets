import { useEffect, useState } from 'react';
import splashGif from '@assets/rec-room-psvr_1784595804686.gif';

export default function SplashScreen() {
  // 'visible' → 'fading' → 'done'
  const [phase, setPhase] = useState<'visible' | 'fading' | 'done'>('visible');

  useEffect(() => {
    // Hold the splash for 2.2 s, then begin a 600 ms fade-out
    const hold = setTimeout(() => setPhase('fading'), 2200);
    return () => clearTimeout(hold);
  }, []);

  useEffect(() => {
    if (phase !== 'fading') return;
    const unmount = setTimeout(() => setPhase('done'), 650);
    return () => clearTimeout(unmount);
  }, [phase]);

  if (phase === 'done') return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#0d0d0d',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: phase === 'fading' ? 0 : 1,
        transition: phase === 'fading' ? 'opacity 600ms ease-out' : 'none',
        pointerEvents: phase === 'fading' ? 'none' : 'all',
      }}
    >
      <img
        src={splashGif}
        alt=""
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
        }}
        draggable={false}
      />
    </div>
  );
}
