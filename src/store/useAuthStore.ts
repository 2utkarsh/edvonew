import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AuthState } from '@/types';

interface AuthStore extends AuthState {
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      ...initialState,
      
      setUser: (user) => 
        set((state) => ({ 
          user, 
          isAuthenticated: !!user && !!state.token 
        })),
      
      setToken: (token) => 
        set((state) => ({ 
          token, 
          isAuthenticated: !!state.user && !!token 
        })),
      
      setLoading: (loading) => set({ loading }),
      
      logout: () => set(initialState),
    }),
    {
      name: 'auth-storage',
    }
  )
);
