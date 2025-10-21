import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuthUser } from "../types";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (payload: { user: AuthUser; token: string }) => void;
  logout: () => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: ({ user, token }) =>
        set({
          user,
          token,
          isAuthenticated: true
        }),
      logout: () => set({ user: null, token: null, isAuthenticated: false })
    }),
    {
      name: "careerconnect-auth"
    }
  )
);

export default useAuthStore;
