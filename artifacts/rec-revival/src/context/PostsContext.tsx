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
}

interface PostsContextType {
  posts: Post[];
  createPost: (post: Omit<Post, 'id' | 'createdAt'>) => void;
  deletePost: (id: string) => void;
}

const PostsContext = createContext<PostsContextType | null>(null);
const STORAGE_KEY = 'rr_posts_v2';

function genId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function PostsProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>(() => {
    try {
      // Try v2, then fall back to v1
      const v2 = localStorage.getItem(STORAGE_KEY);
      if (v2) return JSON.parse(v2);
      const v1 = localStorage.getItem('rr_posts_v1');
      if (v1) return JSON.parse(v1);
    } catch {}
    return [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  }, [posts]);

  const createPost = useCallback((post: Omit<Post, 'id' | 'createdAt'>) => {
    setPosts(prev => [{ ...post, id: genId(), createdAt: new Date().toISOString() }, ...prev]);
  }, []);

  const deletePost = useCallback((id: string) => {
    setPosts(prev => prev.filter(p => p.id !== id));
  }, []);

  return (
    <PostsContext.Provider value={{ posts, createPost, deletePost }}>
      {children}
    </PostsContext.Provider>
  );
}

export function usePosts() {
  const ctx = useContext(PostsContext);
  if (!ctx) throw new Error('usePosts must be used within PostsProvider');
  return ctx;
}
