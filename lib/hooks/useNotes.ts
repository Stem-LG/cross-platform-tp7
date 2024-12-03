import { useEffect } from 'react';
import { useNoteStore } from '../stores/notes';
import { useAuth } from './useAuth';

export const useNotes = (groupId: string) => {
  const { notes, loading, createNote, updateNote, deleteNote, fetchNotes } = useNoteStore();
  const { user } = useAuth();

  useEffect(() => {
    if (user && groupId) {
      fetchNotes(groupId);
    }
  }, [user, groupId]);

  return {
    notes: notes[groupId] || [],
    loading,
    createNote: (title: string, content: string) => createNote(groupId, title, content),
    updateNote: (noteId: string, title: string, content: string) => updateNote(groupId, noteId, title, content),
    deleteNote: (noteId: string) => deleteNote(groupId, noteId),
  };
}; 