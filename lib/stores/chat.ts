import { create } from 'zustand';
import {
    collection,
    query,
    where,
    addDoc,
    orderBy,
    limit,
    onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase';
import { ChatStore, Message } from '../types';
import { useAuthStore } from './auth';

export const useChatStore = create<ChatStore>((set, get) => ({
    messages: {},
    loading: false,

    sendMessage: async (groupId: string, content: string) => {
        try {
            set({ loading: true });
            const user = useAuthStore.getState().user;
            if (!user) throw new Error('User not authenticated');

            const messageData = {
                groupId,
                content,
                senderId: user.id,
                senderName: user.username,
                createdAt: Date.now(),
            };

            await addDoc(collection(db, 'messages'), messageData);
        } catch (error) {
            console.error('Send message error:', error);
            throw error;
        } finally {
            set({ loading: false });
        }
    },

    fetchMessages: async (groupId: string) => {
        try {
            set({ loading: true });
            const user = useAuthStore.getState().user;
            if (!user) throw new Error('User not authenticated');

            const q = query(
                collection(db, 'messages'),
                where('groupId', '==', groupId),
                orderBy('createdAt', 'desc'),
                limit(50)
            );

            // Set up real-time listener
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const messages = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Message[];

                set(state => ({
                    messages: {
                        ...state.messages,
                        [groupId]: messages.reverse(),
                    },
                }));
            });

            // Store unsubscribe function for cleanup
            return unsubscribe;
        } catch (error) {
            console.error('Fetch messages error:', error);
            throw error;
        } finally {
            set({ loading: false });
        }
    },
})); 