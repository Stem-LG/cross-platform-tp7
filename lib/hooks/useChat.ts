import { useEffect } from 'react';
import { useChatStore } from '../stores/chat';
import { useAuth } from './useAuth';

export const useChat = (groupId: string) => {
  const { messages, loading, sendMessage, fetchMessages } = useChatStore();
  const { user } = useAuth();

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    if (user && groupId) {
      fetchMessages(groupId).then((unsub) => {
        unsubscribe = unsub;
      });
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user, groupId]);

  return {
    messages: messages[groupId] || [],
    loading,
    sendMessage: (content: string) => sendMessage(groupId, content),
  };
}; 