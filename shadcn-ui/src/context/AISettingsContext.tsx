import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { AISettings, AIProvider } from '@/types';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { getAIProviderKey } from '@/lib/config';
import { getEnvironmentStatus } from '@/lib/env-check';

// Default settings
const defaultSettings: AISettings = {
  provider: 'openrouter',
  model: 'meta-llama/llama-3.2-3b-instruct:free', // More reliable default model
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
  setApiKey: (key: string) => void;
  clearApiKey: () => void;
  hasApiKey: boolean;
}

const AISettingsContext = createContext<AISettingsContextType | undefined>(undefined);

// Provider component
export const AISettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useLocalStorage<AISettings>('ai-settings', defaultSettings);
  
  // Initialize hasApiKey by checking both stored key and environment variables
  const [hasApiKey, setHasApiKey] = useState<boolean>(() => {
    const hasStoredKey = !!settings.apiKey;
    const hasEnvKey = !!getAIProviderKey(settings.provider);
    return hasStoredKey || hasEnvKey;
  });

  // Check for API key on mount and from environment variables
  useEffect(() => {
    const hasStoredKey = !!settings.apiKey;
    const hasEnvKey = !!getAIProviderKey(settings.provider);
    const hasKey = hasStoredKey || hasEnvKey;
    setHasApiKey(hasKey);
    
    // Check environment variables and provide helpful feedback
    const envStatus = getEnvironmentStatus();
    
    // Log for debugging only if no key is found
    if (hasEnvKey && !hasStoredKey) {
      console.log(`✅ API key detected from environment variables for ${settings.provider}`);
    } else if (!hasKey) {
      console.warn(`⚠️ No API key found for ${settings.provider}. Please set OPENROUTER_API_KEY in your .env.local file or add one in settings.`);
    }
  }, [settings.apiKey, settings.provider]);

  const updateSettings = (newSettings: Partial<AISettings>) => {
    setSettings({ ...settings, ...newSettings });
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