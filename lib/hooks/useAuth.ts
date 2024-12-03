import { useEffect } from 'react';
import { onAuthStateChanged, UserInfo } from 'firebase/auth';
import { auth } from '../firebase';
import { useAuthStore } from '../stores/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { User } from '../types';

export const useAuth = () => {
    const { user, isLoading } = useAuthStore();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                const userData = userDoc.data() as User;
                useAuthStore.setState({
                    user: userData,
                    isLoading: false
                });
            } else {
                useAuthStore.setState({
                    user: null,
                    isLoading: false
                });
            }
        });

        return () => unsubscribe();
    }, []);

    return { user, isLoading };
}; 