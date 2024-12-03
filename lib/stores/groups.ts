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
} from 'firebase/firestore';
import { db } from '../firebase';
import { GroupStore, Group } from '../types';
import { useAuthStore } from './auth';

export const useGroupStore = create<GroupStore>((set) => ({
    groups: [],
    loading: false,

    createGroup: async (name: string) => {
        try {
            set({ loading: true });
            const user = useAuthStore.getState().user;
            if (!user) throw new Error('User not authenticated');

            const groupData = {
                name,
                createdBy: user.id,
                createdAt: Date.now(),
            };

            await addDoc(collection(db, 'groups'), groupData);
            await useGroupStore.getState().fetchGroups();
        } catch (error) {
            console.error('Create group error:', error);
            throw error;
        } finally {
            set({ loading: false });
        }
    },

    updateGroup: async (id: string, name: string) => {
        try {
            set({ loading: true });
            const user = useAuthStore.getState().user;
            if (!user) throw new Error('User not authenticated');

            await updateDoc(doc(db, 'groups', id), { name });
            await useGroupStore.getState().fetchGroups();
        } catch (error) {
            console.error('Update group error:', error);
            throw error;
        } finally {
            set({ loading: false });
        }
    },

    deleteGroup: async (id: string) => {
        try {
            set({ loading: true });
            const user = useAuthStore.getState().user;
            if (!user) throw new Error('User not authenticated');

            await deleteDoc(doc(db, 'groups', id));
            await useGroupStore.getState().fetchGroups();
        } catch (error) {
            console.error('Delete group error:', error);
            throw error;
        } finally {
            set({ loading: false });
        }
    },

    fetchGroups: async () => {
        try {
            set({ loading: true });
            const user = useAuthStore.getState().user;
            if (!user) throw new Error('User not authenticated');

            const q = query(
                collection(db, 'groups'));

            const querySnapshot = await getDocs(q);
            const groups = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Group[];

            set({ groups });
        } catch (error) {
            console.error('Fetch groups error:', error);
            throw error;
        } finally {
            set({ loading: false });
        }
    },
})); 