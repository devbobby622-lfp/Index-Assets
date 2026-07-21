import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { UserRole } from './AuthContext';
import { useRealtime } from './RealtimeContext';

export interface Post {
  id: string;
  authorId: string;
  authorUsername: string;
  authorIcon?: string;
  authorRole?: UserRole;
  authorIsAdmin?: boolean;
  title: string;
  content: string;
  imageUrl?: string;
  isAnnouncement: boolean;
  createdAt: string;
  likes: string[];
  dislikes: string[];
}

interface PostsContextType {
  posts: Post[];
  isLoading: boolean;
  createPost: (post: Omit<Post, 'id' | 'createdAt' | 'likes' | 'dislikes'>) => Promise<void>;
  deletePost: (id: string, authorId: string) => Promise<void>;
  likePost: (postId: string, userId: string) => Promise<void>;
  dislikePost: (postId: string, userId: string) => Promise<void>;
}

const PostsContext = createContext<PostsContextType | null>(null);

function genId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function PostsProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { socket } = useRealtime();

  // Load posts from API on mount
  useEffect(() => {
    fetch('/api/posts')
      .then((r) => r.json())
      .then((data: Post[]) => {
        setPosts(data);
      })
      .catch(() => {
        // Fall back to localStorage if API is unavailable
        try {
          const stored = localStorage.getItem('rr_posts_v2');
          if (stored) setPosts(JSON.parse(stored));
        } catch {}
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Subscribe to realtime post events
  useEffect(() => {
    if (!socket) return;

    const onCreated = (post: Post) => {
      setPosts((prev) => {
        // Deduplicate by id
        if (prev.some((p) => p.id === post.id)) return prev;
        return [post, ...prev];
      });
    };

    const onUpdated = (post: Post) => {
      setPosts((prev) => prev.map((p) => (p.id === post.id ? post : p)));
    };

    const onDeleted = (postId: string) => {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    };

    socket.on('post:created', onCreated);
    socket.on('post:updated', onUpdated);
    socket.on('post:deleted', onDeleted);

    return () => {
      socket.off('post:created', onCreated);
      socket.off('post:updated', onUpdated);
      socket.off('post:deleted', onDeleted);
    };
  }, [socket]);

  const createPost = useCallback(
    async (post: Omit<Post, 'id' | 'createdAt' | 'likes' | 'dislikes'>) => {
      const id = genId();
      await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...post, id }),
      });
      // State will update via the 'post:created' socket event broadcast by the server
    },
    []
  );

  const deletePost = useCallback(async (id: string, authorId: string) => {
    await fetch(`/api/posts/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authorId }),
    });
    // State will update via 'post:deleted' socket event
  }, []);

  const likePost = useCallback(async (postId: string, userId: string) => {
    await fetch(`/api/posts/${postId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    // State will update via 'post:updated' socket event
  }, []);

  const dislikePost = useCallback(async (postId: string, userId: string) => {
    await fetch(`/api/posts/${postId}/dislike`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    // State will update via 'post:updated' socket event
  }, []);

  return (
    <PostsContext.Provider
      value={{ posts, isLoading, createPost, deletePost, likePost, dislikePost }}
    >
      {children}
    </PostsContext.Provider>
  );
}

export function usePosts() {
  const ctx = useContext(PostsContext);
  if (!ctx) throw new Error('usePosts must be used within PostsProvider');
  return ctx;
}
