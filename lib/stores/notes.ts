import { create } from 'zustand';
import {
  collection,
  query,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase';
import { NoteStore, Note } from '../types';
import { useAuthStore } from './auth';

export const useNoteStore = create<NoteStore>((set, get) => ({
  notes: {},
  loading: false,

  createNote: async (groupId: string, title: string, content: string) => {
    try {
      set({ loading: true });
      const user = useAuthStore.getState().user;
      if (!user) throw new Error('User not authenticated');

      const noteData = {
        groupId,
        title,
        content,
        createdBy: user.id,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      await addDoc(collection(db, 'notes'), noteData);
      await get().fetchNotes(groupId);
    } catch (error) {
      console.error('Create note error:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateNote: async (groupId: string, noteId: string, title: string, content: string) => {
    try {
      set({ loading: true });
      const user = useAuthStore.getState().user;
      if (!user) throw new Error('User not authenticated');

      await updateDoc(doc(db, 'notes', noteId), {
        title,
        content,
        updatedAt: Date.now(),
      });
      await get().fetchNotes(groupId);
    } catch (error) {
      console.error('Update note error:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  deleteNote: async (groupId: string, noteId: string) => {
    try {
      set({ loading: true });
      const user = useAuthStore.getState().user;
      if (!user) throw new Error('User not authenticated');

      await deleteDoc(doc(db, 'notes', noteId));
      await get().fetchNotes(groupId);
    } catch (error) {
      console.error('Delete note error:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  fetchNotes: async (groupId: string) => {
    try {
      set({ loading: true });
      const user = useAuthStore.getState().user;
      if (!user) throw new Error('User not authenticated');

      const q = query(
        collection(db, 'notes'),
        where('groupId', '==', groupId),
        where('createdBy', '==', user.id),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const notes = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Note[];

      set(state => ({
        notes: {
          ...state.notes,
          [groupId]: notes,
        },
      }));
    } catch (error) {
      console.error('Fetch notes error:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },
})); 