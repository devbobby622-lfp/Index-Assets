import { Volume2, VolumeX } from 'lucide-react';
import { useMusic } from '@/context/MusicContext';

export default function MusicPlayer() {
  const { isMuted, toggleMute } = useMusic();

  return (
    <button
      onClick={toggleMute}
      title={isMuted ? 'Unmute music' : 'Mute music'}
      className="fixed bottom-6 right-6 z-50 w-11 h-11 rounded-full flex items-center justify-center border border-border shadow-lg transition-all hover:scale-105 active:scale-95"
      style={{
        background: 'var(--nav-bg)',
        backdropFilter: 'blur(8px)',
        boxShadow: isMuted ? undefined : '0 0 16px hsl(var(--primary) / 0.35)',
      }}
    >
      {isMuted
        ? <VolumeX className="w-4 h-4 text-muted-foreground" />
        : <Volume2 className="w-4 h-4 text-primary" />
      }
    </button>
  );
}
