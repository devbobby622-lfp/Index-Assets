import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';

interface MusicContextType {
  isMuted: boolean;
  isPlaying: boolean;
  toggleMute: () => void;
}

const MusicContext = createContext<MusicContextType | null>(null);

export function MusicProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(true); // default muted
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audio = new Audio(`${import.meta.env.BASE_URL}music.mp3`);
    audio.loop = true;
    audio.volume = 0.35;
    audio.muted = true;
    audioRef.current = audio;

    const tryPlay = () => {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    };

    // Try to play on first user interaction
    const onInteraction = () => {
      tryPlay();
      window.removeEventListener('click', onInteraction);
      window.removeEventListener('keydown', onInteraction);
    };
    window.addEventListener('click', onInteraction);
    window.addEventListener('keydown', onInteraction);

    return () => {
      audio.pause();
      window.removeEventListener('click', onInteraction);
      window.removeEventListener('keydown', onInteraction);
    };
  }, []);

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const next = !isMuted;
    audio.muted = next;
    setIsMuted(next);
    if (!isPlaying) {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  return (
    <MusicContext.Provider value={{ isMuted, isPlaying, toggleMute }}>
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error('useMusic must be used within MusicProvider');
  return ctx;
}
