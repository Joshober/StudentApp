import { createContext, useContext, ReactNode, useState } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { StudySession, FileUpload, Message } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Create context
interface StudySessionContextType {
  sessions: StudySession[];
  currentSession: StudySession | null;
  createSession: (title: string, subject?: string) => void;
  selectSession: (id: string) => void;
  addFileToCurrentSession: (file: FileUpload) => void;
  removeFileFromCurrentSession: (fileId: string) => void;
  addMessage: (content: string, role: 'user' | 'assistant') => void;
}

const StudySessionContext = createContext<StudySessionContextType | undefined>(undefined);

// Provider component
export const StudySessionProvider = ({ children }: { children: ReactNode }) => {
  const [sessions, setSessions] = useLocalStorage<StudySession[]>('study-sessions', []);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // Get the current session object
  const currentSession = currentSessionId 
    ? sessions.find(session => session.id === currentSessionId) || null
    : null;

  // Create a new study session
  const createSession = (title: string, subject?: string) => {
    const newSession: StudySession = {
      id: uuidv4(),
      title,
      subject,
      files: [],
      messages: [],
      createdAt: new Date()
    };
    
    setSessions([...sessions, newSession]);
    setCurrentSessionId(newSession.id);
  };

  // Select an existing session
  const selectSession = (id: string) => {
    setCurrentSessionId(id);
  };

  // Add a file to the current session
  const addFileToCurrentSession = (file: FileUpload) => {
    if (!currentSessionId) return;
    
    const updatedSessions = sessions.map(session => {
      if (session.id === currentSessionId) {
        return {
          ...session,
          files: [...session.files, file]
        };
      }
      return session;
    });
    
    setSessions(updatedSessions);
  };

  // Remove a file from the current session
  const removeFileFromCurrentSession = (fileId: string) => {
    if (!currentSessionId) return;
    
    const updatedSessions = sessions.map(session => {
      if (session.id === currentSessionId) {
        return {
          ...session,
          files: session.files.filter(file => file.id !== fileId)
        };
      }
      return session;
    });
    
    setSessions(updatedSessions);
  };

  // Add a message to the current session
  const addMessage = (content: string, role: 'user' | 'assistant') => {
    if (!currentSessionId) return;
    
    const message: Message = {
      id: uuidv4(),
      role,
      content,
      timestamp: new Date()
    };
    
    const updatedSessions = sessions.map(session => {
      if (session.id === currentSessionId) {
        return {
          ...session,
          messages: [...session.messages, message]
        };
      }
      return session;
    });
    
    setSessions(updatedSessions);
  };

  return (
    <StudySessionContext.Provider value={{ 
      sessions, 
      currentSession, 
      createSession, 
      selectSession,
      addFileToCurrentSession,
      removeFileFromCurrentSession,
      addMessage
    }}>
      {children}
    </StudySessionContext.Provider>
  );
};

// Hook for using the context
export const useStudySession = () => {
  const context = useContext(StudySessionContext);
  if (context === undefined) {
    throw new Error('useStudySession must be used within a StudySessionProvider');
  }
  return context;
};