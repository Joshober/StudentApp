import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { AISettings, AIProvider } from '@/types';
import { useLocalStorage } from '@/hooks/use-local-storage';

// Default settings
const defaultSettings: AISettings = {
  provider: 'openrouter',
  model: 'meta-llama/llama-3.2-3b-instruct:free',
  temperature: 0.7,
  maxTokens: 2000,
  teachingStyle: 'socratic',
  detailLevel: 'intermediate',
  includeExamples: true,
};

// Create context
interface AISettingsContextType {
  settings: AISettings;
  updateSettings: (newSettings: Partial<AISettings>) => void;
  setProvider: (provider: AIProvider) => void;
  setApiKey: (key: string) => void;
  clearApiKey: () => void;
  hasApiKey: boolean;
}

const AISettingsContext = createContext<AISettingsContextType | undefined>(undefined);

// Provider component
export const AISettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useLocalStorage<AISettings>('ai-settings', defaultSettings);
  const [hasApiKey, setHasApiKey] = useState<boolean>(!!settings.apiKey);

  // Check for API key on mount
  useEffect(() => {
    setHasApiKey(!!settings.apiKey);
  }, [settings.apiKey]);

  const updateSettings = (newSettings: Partial<AISettings>) => {
    setSettings({ ...settings, ...newSettings });
  };

  const setProvider = (provider: AIProvider) => {
    setSettings({ ...settings, provider });
  };

  const setApiKey = (apiKey: string) => {
    setSettings({ ...settings, apiKey });
  };

  const clearApiKey = () => {
    const { apiKey, ...rest } = settings;
    setSettings(rest as AISettings);
  };

  return (
    <AISettingsContext.Provider value={{ 
      settings, 
      updateSettings, 
      setProvider, 
      setApiKey, 
      clearApiKey, 
      hasApiKey 
    }}>
      {children}
    </AISettingsContext.Provider>
  );
};

// Hook for using the context
export const useAISettings = () => {
  const context = useContext(AISettingsContext);
  if (context === undefined) {
    throw new Error('useAISettings must be used within a AISettingsProvider');
  }
  return context;
};