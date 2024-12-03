import { create } from 'zustand';
import { auth } from '../firebase';
import { onAuthStateChanged, UserInfo, signOut as firebaseSignOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { User } from '../types';
import { router } from 'expo-router';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  initialize: () => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  initialize: () => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      //@ts-ignore
      set({ user, isLoading: false });
    });
    return () => unsubscribe();
  },
  signIn: async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    //@ts-ignore

    set({ user: userCredential.user });
  },
  signUp: async (email: string, password: string, username: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: username });
    //@ts-ignore
    set({ user: userCredential.user });
  },
  signOut: async () => {
    await firebaseSignOut(auth);
    set({ user: null });
    router.replace('/(auth)/login');
  },
})); 