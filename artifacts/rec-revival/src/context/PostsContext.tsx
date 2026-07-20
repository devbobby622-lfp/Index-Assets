import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export interface Post {
  id: string;
  authorId: string;
  authorUsername: string;
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
const STORAGE_KEY = 'rr_posts_v1';

export function PostsProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  }, [posts]);

  const createPost = useCallback((post: Omit<Post, 'id' | 'createdAt'>) => {
    setPosts(ps => [{
      ...post,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }, ...ps]);
  }, []);

  const deletePost = useCallback((id: string) => {
    setPosts(ps => ps.filter(p => p.id !== id));
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
