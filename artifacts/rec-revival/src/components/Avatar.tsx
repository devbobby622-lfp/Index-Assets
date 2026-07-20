import { User, isOnline } from '@/context/AuthContext';

interface AvatarProps {
  user: Pick<User, 'username' | 'profileImage' | 'lastSeen'>;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showOnline?: boolean;
  className?: string;
}

const SIZE_MAP = {
  xs: { outer: 'w-6 h-6', img: 'w-6 h-6', dot: 'w-2 h-2 border', initials: 'text-[9px]' },
  sm: { outer: 'w-8 h-8', img: 'w-8 h-8', dot: 'w-2.5 h-2.5 border', initials: 'text-xs' },
  md: { outer: 'w-10 h-10', img: 'w-10 h-10', dot: 'w-3 h-3 border-2', initials: 'text-sm' },
  lg: { outer: 'w-14 h-14', img: 'w-14 h-14', dot: 'w-3.5 h-3.5 border-2', initials: 'text-lg' },
  xl: { outer: 'w-20 h-20', img: 'w-20 h-20', dot: 'w-4 h-4 border-2', initials: 'text-2xl' },
};

export default function Avatar({ user, size = 'md', showOnline = false, className = '' }: AvatarProps) {
  const s = SIZE_MAP[size];
  const online = showOnline && isOnline(user);

  return (
    <div className={`relative flex-shrink-0 ${s.outer} ${className}`}>
      <div className={`${s.outer} rounded-full overflow-hidden bg-primary/10 ring-2 ${online ? 'ring-green-500' : 'ring-transparent'} transition-all`}>
        {user.profileImage ? (
          <img
            src={user.profileImage}
            alt={user.username}
            className={`${s.img} object-cover rounded-full`}
            onError={e => {
              // Fallback to default avatar on load error
              (e.currentTarget as HTMLImageElement).src = `${import.meta.env.BASE_URL}default-avatar.png`;
            }}
          />
        ) : (
          <img
            src={`${import.meta.env.BASE_URL}default-avatar.png`}
            alt={user.username}
            className={`${s.img} object-cover rounded-full`}
          />
        )}
      </div>
      {showOnline && (
        <span
          className={`absolute bottom-0 right-0 ${s.dot} rounded-full border-background ${online ? 'bg-green-500' : 'bg-muted-foreground/50'}`}
        />
      )}
    </div>
  );
}
