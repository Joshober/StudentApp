import { AIProvider, AISettings } from '@/types';

// Helper function to create teaching context based on settings
const createTeachingContext = (settings: AISettings, files: string[]) => {
  const styleInstructions = {
    socratic: "Guide the student by asking thought-provoking questions that help them discover the answer themselves. Don't give direct answers.",
    direct: "Provide clear, direct answers and explanations to the student's questions.",
    guided: "Break down complex problems into step-by-step guidance, explaining each step clearly."
  };

  const detailInstructions = {
    basic: "Keep explanations simple and accessible, avoiding technical jargon.",
    intermediate: "Provide moderate detail with some technical terms explained clearly.",
    advanced: "Use technical language and provide comprehensive, detailed explanations."
  };

  let context = `You are a helpful AI tutor. Your teaching approach should be ${settings.teachingStyle || 'socratic'}: ${styleInstructions[settings.teachingStyle || 'socratic']}

Detail level: ${settings.detailLevel || 'intermediate'} - ${detailInstructions[settings.detailLevel || 'intermediate']}

${settings.includeExamples ? 'Include relevant examples to illustrate your points.' : 'Focus on concepts without providing examples.'}`;

  if (files.length > 0) {
    context += `\n\nThe student has uploaded the following materials for reference:\n${files.join('\n\n---\n\n')}`;
  }

  return context;
};

// OpenAI API implementation
export const callOpenAI = async (
  prompt: string, 
  files: string[], 
  settings: AISettings
) => {
  try {
    if (!settings.apiKey) {
      throw new Error('OpenAI API key is required');
    }

    const context = createTeachingContext(settings, files);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: settings.model || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: context },
          { role: 'user', content: prompt }
        ],
        temperature: settings.temperature || 0.7,
        max_tokens: settings.maxTokens || 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'OpenAI API request failed');
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'No response generated';
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    throw new Error(`Failed to get response from OpenAI: ${error.message}`);
  }
};

// Anthropic API implementation
export const callAnthropic = async (
  prompt: string, 
  files: string[], 
  settings: AISettings
) => {
  try {
    if (!settings.apiKey) {
      throw new Error('Anthropic API key is required');
    }

    const context = createTeachingContext(settings, files);
    
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.apiKey}`,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: settings.model || 'claude-3-haiku-20240307',
        max_tokens: settings.maxTokens || 2000,
        temperature: settings.temperature || 0.7,
        messages: [
          { role: 'user', content: `${context}\n\nStudent question: ${prompt}` }
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Anthropic API request failed');
    }

    const data = await response.json();
    return data.content[0]?.text || 'No response generated';
  } catch (error) {
    console.error('Error calling Anthropic:', error);
    throw new Error(`Failed to get response from Anthropic: ${error.message}`);
  }
};

// OpenRouter API implementation
export const callOpenRouter = async (
  prompt: string, 
  files: string[], 
  settings: AISettings
) => {
  try {
    if (!settings.apiKey) {
      throw new Error('OpenRouter API key is required');
    }

    const context = createTeachingContext(settings, files);
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'AI Homework Tutor',
      },
      body: JSON.stringify({
        model: settings.model || 'meta-llama/llama-3.2-3b-instruct:free',
        messages: [
          { role: 'system', content: context },
          { role: 'user', content: prompt }
        ],
        temperature: settings.temperature || 0.7,
        max_tokens: settings.maxTokens || 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'OpenRouter API request failed';
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error?.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'No response generated';
  } catch (error) {
    console.error('Error calling OpenRouter:', error);
    throw new Error(`Failed to get response from OpenRouter: ${error.message}`);
  }
};

export const getAIResponse = async (
  provider: AIProvider, 
  prompt: string, 
  files: string[], 
  settings: AISettings
) => {
  switch (provider) {
    case 'openai':
      return callOpenAI(prompt, files, settings);
    case 'anthropic':
      return callAnthropic(prompt, files, settings);
    case 'openrouter':
      return callOpenRouter(prompt, files, settings);
    default:
      throw new Error(`Unsupported AI provider: ${provider}`);
  }
};