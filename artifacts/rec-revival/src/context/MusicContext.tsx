import { createContext, useContext, useEffect, useRef, useState, useCallback, ReactNode } from 'react';

interface MusicContextType {
  isMuted: boolean;
  isPlaying: boolean;
  volume: number;          // 0–1
  currentTime: number;     // seconds
  duration: number;        // seconds
  toggleMute: () => void;
  setVolume: (v: number) => void;
  seek: (t: number) => void;
  play: () => void;
  pause: () => void;
}

const MusicContext = createContext<MusicContextType | null>(null);

export function MusicProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.35);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = new Audio(`${import.meta.env.BASE_URL}music.mp3`);
    audio.loop = true;
    audio.volume = 0.35;
    audio.muted = true;
    audioRef.current = audio;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDuration = () => setDuration(audio.duration);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onDuration);
    audio.addEventListener('durationchange', onDuration);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);

    const tryPlay = () => {
      audio.play().catch(() => {});
      window.removeEventListener('click', tryPlay);
      window.removeEventListener('keydown', tryPlay);
    };
    window.addEventListener('click', tryPlay);
    window.addEventListener('keydown', tryPlay);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onDuration);
      audio.removeEventListener('durationchange', onDuration);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      window.removeEventListener('click', tryPlay);
      window.removeEventListener('keydown', tryPlay);
    };
  }, []);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const next = !isMuted;
    audio.muted = next;
    setIsMuted(next);
    if (!isPlaying) audio.play().catch(() => {});
  }, [isMuted, isPlaying]);

  const setVolume = useCallback((v: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const clamped = Math.max(0, Math.min(1, v));
    audio.volume = clamped;
    setVolumeState(clamped);
    if (clamped > 0 && audio.muted) {
      audio.muted = false;
      setIsMuted(false);
    }
  }, []);

  const seek = useCallback((t: number) => {
    const audio = audioRef.current;
    if (!audio || !isFinite(t)) return;
    audio.currentTime = t;
    setCurrentTime(t);
  }, []);

  const play = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = false;
    setIsMuted(false);
    audio.play().catch(() => {});
  }, []);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  return (
    <MusicContext.Provider value={{ isMuted, isPlaying, volume, currentTime, duration, toggleMute, setVolume, seek, play, pause }}>
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error('useMusic must be used within MusicProvider');
  return ctx;
}
