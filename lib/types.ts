export interface User {
    id: string;
    email: string;
    username: string;
}

export interface Group {
    id: string;
    name: string;
    createdBy: string;
    createdAt: number;
}

export interface Note {
    id: string;
    groupId: string;
    title: string;
    content: string;
    createdBy: string;
    createdAt: number;
    updatedAt: number;
}

export interface Message {
    id: string;
    groupId: string;
    content: string;
    senderId: string;
    senderName: string;
    createdAt: number;
}

export interface AuthStore {
    user: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    //   signInWithGoogle: () => Promise<void>;
    signUp: (email: string, password: string, username: string) => Promise<void>;
    signOut: () => Promise<void>;
}

export interface GroupStore {
    groups: Group[];
    loading: boolean;
    createGroup: (name: string) => Promise<void>;
    updateGroup: (id: string, name: string) => Promise<void>;
    deleteGroup: (id: string) => Promise<void>;
    fetchGroups: () => Promise<void>;
}

export interface NoteStore {
    notes: Record<string, Note[]>;
    loading: boolean;
    createNote: (groupId: string, title: string, content: string) => Promise<void>;
    updateNote: (groupId: string, noteId: string, title: string, content: string) => Promise<void>;
    deleteNote: (groupId: string, noteId: string) => Promise<void>;
    fetchNotes: (groupId: string) => Promise<void>;
}

export interface ChatStore {
    messages: Record<string, Message[]>;
    loading: boolean;
    sendMessage: (groupId: string, content: string) => Promise<void>;
    fetchMessages: (groupId: string) => Promise<() => void>;
} 