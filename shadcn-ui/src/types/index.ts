export type AIProvider = 'openrouter';

export interface OpenRouterModel {
  id: string;
  name: string;
  pricing: {
    prompt: string;
    completion: string;
  };
  context_length: number;
  architecture: {
    modality: string;
    tokenizer: string;
    instruct_type?: string;
  };
  top_provider: {
    max_completion_tokens?: number;
    is_moderated: boolean;
  };
  per_request_limits?: {
    prompt_tokens: string;
    completion_tokens: string;
  };
}

export interface AISettings {
  provider: AIProvider;
  apiKey?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  teachingStyle?: 'socratic' | 'direct' | 'guided';
  detailLevel?: 'basic' | 'intermediate' | 'advanced';
  includeExamples?: boolean;
}

export interface FileUpload {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
  content?: string;
  createdAt: string; // Changed from Date to string
}

export interface StudySession {
  id: string;
  title: string;
  subject?: string;
  files: FileUpload[];
  messages: Message[];
  createdAt: string; // Changed from Date to string
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string; // Changed from Date to string
}