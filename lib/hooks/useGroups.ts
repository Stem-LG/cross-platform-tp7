import { useEffect } from 'react';
import { useGroupStore } from '../stores/groups';
import { useAuth } from './useAuth';

interface CreateGroupData {
    name: string;
    createdBy: string;
}

export const useGroups = () => {
  const { groups, loading, createGroup, updateGroup, deleteGroup, fetchGroups } = useGroupStore();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchGroups();
    }
  }, [user]);

  return {
    groups,
    loading,
    createGroup,
    updateGroup,
    deleteGroup,
    fetchGroups,
  };
}; 