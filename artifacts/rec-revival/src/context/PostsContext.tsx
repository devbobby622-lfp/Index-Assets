import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { UserRole } from './AuthContext';

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
  likes: string[];    // user IDs
  dislikes: string[]; // user IDs
}

interface PostsContextType {
  posts: Post[];
  createPost: (post: Omit<Post, 'id' | 'createdAt' | 'likes' | 'dislikes'>) => void;
  deletePost: (id: string) => void;
  likePost: (postId: string, userId: string) => void;
  dislikePost: (postId: string, userId: string) => void;
}

const PostsContext = createContext<PostsContextType | null>(null);
const STORAGE_KEY = 'rr_posts_v2';

function genId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function PostsProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>(() => {
    try {
      const migratePost = (p: Partial<Post>): Post => ({
        ...p as Post,
        likes: p.likes ?? [],
        dislikes: p.dislikes ?? [],
      });
      // Try v2, then fall back to v1
      const v2 = localStorage.getItem(STORAGE_KEY);
      if (v2) return (JSON.parse(v2) as Post[]).map(migratePost);
      const v1 = localStorage.getItem('rr_posts_v1');
      if (v1) return (JSON.parse(v1) as Post[]).map(migratePost);
    } catch {}
    return [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  }, [posts]);

  const createPost = useCallback((post: Omit<Post, 'id' | 'createdAt' | 'likes' | 'dislikes'>) => {
    setPosts(prev => [{ ...post, id: genId(), createdAt: new Date().toISOString(), likes: [], dislikes: [] }, ...prev]);
  }, []);

  const deletePost = useCallback((id: string) => {
    setPosts(prev => prev.filter(p => p.id !== id));
  }, []);

  const likePost = useCallback((postId: string, userId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const alreadyLiked = p.likes.includes(userId);
      return {
        ...p,
        likes: alreadyLiked ? p.likes.filter(id => id !== userId) : [...p.likes, userId],
        dislikes: p.dislikes.filter(id => id !== userId),
      };
    }));
  }, []);

  const dislikePost = useCallback((postId: string, userId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const alreadyDisliked = p.dislikes.includes(userId);
      return {
        ...p,
        dislikes: alreadyDisliked ? p.dislikes.filter(id => id !== userId) : [...p.dislikes, userId],
        likes: p.likes.filter(id => id !== userId),
      };
    }));
  }, []);

  return (
    <PostsContext.Provider value={{ posts, createPost, deletePost, likePost, dislikePost }}>
      {children}
    </PostsContext.Provider>
  );
}

export function usePosts() {
  const ctx = useContext(PostsContext);
  if (!ctx) throw new Error('usePosts must be used within PostsProvider');
  return ctx;
}
