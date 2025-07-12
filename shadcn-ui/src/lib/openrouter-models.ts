import { OpenRouterModel } from '@/types';

// Popular OpenRouter models with their details
export const OPENROUTER_MODELS: OpenRouterModel[] = [
  // Free models
  {
    id: 'meta-llama/llama-3.2-3b-instruct:free',
    name: 'Llama 3.2 3B Instruct (Free)',
    pricing: { prompt: '0', completion: '0' },
    context_length: 131072,
    architecture: { modality: 'text', tokenizer: 'Llama3' },
    top_provider: { is_moderated: false }
  },
  {
    id: 'meta-llama/llama-3.2-1b-instruct:free',
    name: 'Llama 3.2 1B Instruct (Free)',
    pricing: { prompt: '0', completion: '0' },
    context_length: 131072,
    architecture: { modality: 'text', tokenizer: 'Llama3' },
    top_provider: { is_moderated: false }
  },
  {
    id: 'qwen/qwen-2-7b-instruct:free',
    name: 'Qwen 2 7B Instruct (Free)',
    pricing: { prompt: '0', completion: '0' },
    context_length: 32768,
    architecture: { modality: 'text', tokenizer: 'Qwen2' },
    top_provider: { is_moderated: false }
  },
  {
    id: 'microsoft/phi-3-medium-128k-instruct:free',
    name: 'Phi-3 Medium 128K Instruct (Free)',
    pricing: { prompt: '0', completion: '0' },
    context_length: 128000,
    architecture: { modality: 'text', tokenizer: 'Phi3' },
    top_provider: { is_moderated: false }
  },
  {
    id: 'microsoft/phi-3-mini-128k-instruct:free',
    name: 'Phi-3 Mini 128K Instruct (Free)',
    pricing: { prompt: '0', completion: '0' },
    context_length: 128000,
    architecture: { modality: 'text', tokenizer: 'Phi3' },
    top_provider: { is_moderated: false }
  },
  // Popular paid models
  {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o Mini',
    pricing: { prompt: '0.15', completion: '0.6' },
    context_length: 128000,
    architecture: { modality: 'text+vision', tokenizer: 'cl100k_base' },
    top_provider: { is_moderated: true }
  },
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    pricing: { prompt: '5', completion: '15' },
    context_length: 128000,
    architecture: { modality: 'text+vision', tokenizer: 'cl100k_base' },
    top_provider: { is_moderated: true }
  },
  {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    pricing: { prompt: '3', completion: '15' },
    context_length: 200000,
    architecture: { modality: 'text+vision', tokenizer: 'claude' },
    top_provider: { is_moderated: true }
  },
  {
    id: 'anthropic/claude-3-haiku',
    name: 'Claude 3 Haiku',
    pricing: { prompt: '0.25', completion: '1.25' },
    context_length: 200000,
    architecture: { modality: 'text+vision', tokenizer: 'claude' },
    top_provider: { is_moderated: true }
  },
  {
    id: 'meta-llama/llama-3.1-405b-instruct',
    name: 'Llama 3.1 405B Instruct',
    pricing: { prompt: '3', completion: '3' },
    context_length: 131072,
    architecture: { modality: 'text', tokenizer: 'Llama3' },
    top_provider: { is_moderated: false }
  },
  {
    id: 'meta-llama/llama-3.1-70b-instruct',
    name: 'Llama 3.1 70B Instruct',
    pricing: { prompt: '0.52', completion: '0.75' },
    context_length: 131072,
    architecture: { modality: 'text', tokenizer: 'Llama3' },
    top_provider: { is_moderated: false }
  },
  {
    id: 'meta-llama/llama-3.1-8b-instruct',
    name: 'Llama 3.1 8B Instruct',
    pricing: { prompt: '0.055', completion: '0.055' },
    context_length: 131072,
    architecture: { modality: 'text', tokenizer: 'Llama3' },
    top_provider: { is_moderated: false }
  },
  {
    id: 'google/gemini-pro-1.5',
    name: 'Gemini Pro 1.5',
    pricing: { prompt: '2.5', completion: '7.5' },
    context_length: 2097152,
    architecture: { modality: 'text+vision', tokenizer: 'gemini' },
    top_provider: { is_moderated: true }
  },
  {
    id: 'google/gemini-flash-1.5',
    name: 'Gemini Flash 1.5',
    pricing: { prompt: '0.075', completion: '0.3' },
    context_length: 1048576,
    architecture: { modality: 'text+vision', tokenizer: 'gemini' },
    top_provider: { is_moderated: true }
  },
  {
    id: 'mistralai/mistral-large',
    name: 'Mistral Large',
    pricing: { prompt: '3', completion: '9' },
    context_length: 128000,
    architecture: { modality: 'text', tokenizer: 'mistral' },
    top_provider: { is_moderated: false }
  },
  {
    id: 'mistralai/mistral-nemo',
    name: 'Mistral Nemo',
    pricing: { prompt: '0.13', completion: '0.13' },
    context_length: 128000,
    architecture: { modality: 'text', tokenizer: 'mistral' },
    top_provider: { is_moderated: false }
  }
];

export const getFreeModels = () => {
  return OPENROUTER_MODELS.filter(model => 
    model.pricing.prompt === '0' && model.pricing.completion === '0'
  );
};

export const getPaidModels = () => {
  return OPENROUTER_MODELS.filter(model => 
    model.pricing.prompt !== '0' || model.pricing.completion !== '0'
  );
};

export const getModelById = (id: string) => {
  return OPENROUTER_MODELS.find(model => model.id === id);
};

export const formatModelPrice = (model: OpenRouterModel) => {
  if (model.pricing.prompt === '0' && model.pricing.completion === '0') {
    return 'Free';
  }
  return `$${model.pricing.prompt}/$${model.pricing.completion} per 1M tokens`;
};