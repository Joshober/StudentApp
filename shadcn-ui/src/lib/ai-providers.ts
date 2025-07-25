import { AIProvider, AISettings } from '@/types';
import { getAIProviderKey } from './config';

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

// OpenRouter API implementation
export const callOpenRouter = async (
  prompt: string, 
  files: string[], 
  settings: AISettings,
  userId?: number
) => {
  try {
    // Always use the server API route
    const context = createTeachingContext(settings, files);
    const response = await fetch('/api/openrouter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        model: settings.model,
        settings: { ...settings, context },
        userId,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'OpenRouter API request failed';
      let retryAfter = null;
      
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error || errorJson.message || errorMessage;
        retryAfter = errorJson.retryAfter;
        
        // Handle specific error cases with better messaging
        if (response.status === 429) {
          const waitTime = retryAfter || 60;
          throw new Error(`Rate limit exceeded. Please wait ${waitTime} seconds before trying again.`);
        }
        
        if (response.status === 401) {
          throw new Error('Invalid API key. Please check your OpenRouter configuration.');
        }
        
        if (response.status === 403 && errorJson.error?.includes('Token limit exceeded')) {
          throw new Error('You have used all your available tokens. Please contact support to get more tokens.');
        }
        
        // Handle model-specific errors
        if (errorJson.model) {
          errorMessage += ` (Model: ${errorJson.model})`;
        }
        
      } catch (parseError) {
        errorMessage = errorText || errorMessage;
      }
      
      const finalErrorMessage = `${response.status}: ${errorMessage}`;
      throw new Error(finalErrorMessage);
    } else {
      // Success! Return the response
      const data = await response.json();
      return data.choices?.[0]?.message?.content || 'No response generated';
    }
  } catch (error) {
    console.error('Error calling OpenRouter:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to get response from OpenRouter: ${errorMessage}`);
  }
};

export const getAIResponse = async (
  provider: AIProvider, 
  prompt: string, 
  files: string[], 
  settings: AISettings,
  userId?: number
) => {
  if (provider === 'openrouter') {
    return callOpenRouter(prompt, files, settings, userId);
  }
  throw new Error(`Unsupported AI provider: ${provider}`);
};