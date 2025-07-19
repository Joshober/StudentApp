"use client";

import React, { useState, useEffect, useRef, useCallback, memo, Suspense, lazy } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useAISettings } from '@/context/AISettingsContext';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getAIResponse } from '@/lib/ai-providers';
import { getInitialData, refreshTokenStatus } from '@/lib/api-cache';
import { ModelSelector } from '@/components/ModelSelector';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import {
  HelpCircle,
  Send,
  Bot,
  User,
  Loader2,
  BookOpen,
  Calculator,
  Code,
  Lightbulb,
  Settings,
  Zap,
  AlertCircle,
  Brain,
  Search,
  RefreshCw,
  CheckCircle,
  MessageSquare,
  Sparkles
} from 'lucide-react';

// Fix dynamic import for React.lazy - import default export
const AISettingsPanel = lazy(() => import('@/components/AISettingsPanel'));

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const quickPrompts = [
  {
    title: 'Math Problem',
    prompt: 'Can you help me solve this math problem step by step?',
    icon: Calculator,
    color: 'bg-orange-50 text-orange-700 border-orange-200'
  },
  {
    title: 'Essay Writing',
    prompt: 'I need help writing an essay about [topic]. Can you provide an outline and tips?',
    icon: BookOpen,
    color: 'bg-blue-50 text-blue-700 border-blue-200'
  },
  {
    title: 'Code Review',
    prompt: 'Can you review this code and suggest improvements?',
    icon: Code,
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  {
    title: 'Study Guide',
    prompt: 'Create a study guide for [subject] covering the main topics.',
    icon: BookOpen,
    color: 'bg-purple-50 text-purple-700 border-purple-200'
  }
];

const MemoMessage = memo(function MemoMessage({ message }: { message: Message }) {
  return (
    <div
      className={cn(
        'flex gap-3 mb-6',
        message.role === 'user' ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'flex gap-3 max-w-[80%]',
          message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
        )}
      >
        <div
          className={cn(
            'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm',
            message.role === 'user'
              ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
              : 'bg-gradient-to-br from-slate-600 to-slate-700 text-white'
          )}
        >
          {message.role === 'user' ? (
            <User className="h-4 w-4" />
          ) : (
            <Bot className="h-4 w-4" />
          )}
        </div>
        <div
          className={cn(
            'rounded-2xl px-4 py-3 shadow-sm border',
            message.role === 'user'
              ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
              : 'bg-white border-slate-200 text-slate-800'
          )}
        >
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
          <div className={cn(
            "text-xs mt-2 opacity-60",
            message.role === 'user' ? 'text-white/70' : 'text-slate-500'
          )}>
            {new Date(message.timestamp).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
      </div>
    </div>
  );
});

const MemoQuickPrompt = memo(function MemoQuickPrompt({ prompt, onClick, disabled }: {
  prompt: typeof quickPrompts[0],
  onClick: (prompt: string) => void,
  disabled: boolean
}) {
  const Icon = prompt.icon;
  return (
    <Button
      variant="outline"
      size="sm"
      className="w-full justify-start text-left h-auto p-3 bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all duration-200 rounded-xl"
      onClick={() => onClick(prompt.prompt)}
      disabled={disabled}
    >
      <div className={`p-2 rounded-lg ${prompt.color} mr-3 border`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 text-left">
        <div className="font-medium text-sm text-slate-800">{prompt.title}</div>
        <div className="text-xs text-slate-500 truncate mt-1">{prompt.prompt}</div>
      </div>
    </Button>
  );
});

const AIAssistantPage: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { settings } = useAISettings();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);
  const [tokenStatus, setTokenStatus] = useState<{
    totalUsed: number;
    remaining: number;
    hasTokens: boolean;
    limit: number;
    openRouterCredits?: {
      remaining: number;
      used: number;
      total: number;
    };
  } | null>(null);
  const [isLoadingTokens, setIsLoadingTokens] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>('meta-llama/llama-3.2-3b-instruct:free');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user && !isLoading) {
      router.push('/auth/signin');
    }
  }, [user, isLoading, router]);

  // Fetch initial data when user is available
  useEffect(() => {
    if (user?.id && !tokenStatus) {
      fetchInitialData();
    }
  }, [user?.id]);

  const fetchInitialData = async () => {
    if (!user?.id) return;
    
    setIsLoadingTokens(true);
    
    try {
      const data = await getInitialData(user.id);
      setTokenStatus(data.tokenStatus);
    } catch (error) {
      console.error('Failed to fetch initial data:', error);
    } finally {
      setIsLoadingTokens(false);
    }
  };

  const fetchTokenStatus = async () => {
    if (!user?.id || isLoadingTokens) return;
    
    setIsLoadingTokens(true);
    try {
      const data = await refreshTokenStatus(user.id);
      setTokenStatus(data);
    } catch (error) {
      console.error('Failed to fetch token status:', error);
    } finally {
      setIsLoadingTokens(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isLoading) {
      const t = setTimeout(() => setShowSpinner(true), 300);
      return () => clearTimeout(t);
    } else {
      setShowSpinner(false);
    }
  }, [isLoading]);

  const handleSendMessage = useCallback(async () => {
    if (!input.trim() || isSending) return;
    
    // Check if user has tokens remaining
    if (tokenStatus && !tokenStatus.hasTokens) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'You have used all your available tokens. Please contact support to get more tokens.',
          timestamp: new Date()
        }
      ]);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsSending(true);
    
    // Retry logic for rate limiting
    let retryCount = 0;
    const maxRetries = 2;
    
    while (retryCount <= maxRetries) {
      try {
        // Create settings with selected model
        const settingsWithModel = {
          ...settings,
          model: selectedModel
        };
        
        const aiResponse = await getAIResponse(
          settings.provider,
          input,
          [],
          settingsWithModel,
          user?.id
        );
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: aiResponse,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        
        // Refresh token status after successful request
        if (user?.id) {
          fetchTokenStatus();
        }
        
        break; // Success, exit retry loop
        
      } catch (error) {
        retryCount++;
        
        if (error instanceof Error) {
          const errorText = error.message;
          
          // If it's a rate limit error and we haven't exceeded max retries, wait and retry
          if (errorText.includes('Rate limit exceeded') && retryCount <= maxRetries) {
            const waitTime = 30; // Wait 30 seconds before retry
            const retryMessage: Message = {
              id: (Date.now() + retryCount).toString(),
              role: 'assistant',
              content: `⏳ **Rate Limited**: ${errorText}\n\nRetrying in ${waitTime} seconds... (Attempt ${retryCount}/${maxRetries + 1})`,
              timestamp: new Date()
            };
            setMessages(prev => [...prev, retryMessage]);
            
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
            continue;
          }
          
          // Handle other errors or max retries exceeded
          let errorMessage = 'Failed to get response. Please try again.';
          
          if (errorText.includes('Rate limit exceeded')) {
            errorMessage = `${errorText}\n\n💡 **Tip**: Try switching to a different model or wait a few minutes before trying again.`;
          } else if (errorText.includes('Invalid API key')) {
            errorMessage = 'API configuration error. Please contact support.';
          } else if (errorText.includes('Token limit exceeded')) {
            errorMessage = 'You have used all your available tokens. Please contact support to get more tokens.';
          } else if (errorText.includes('Failed to contact OpenRouter')) {
            errorMessage = 'Network error. Please check your internet connection and try again.';
          } else {
            errorMessage = errorText;
          }
          
          const errorResponse: Message = {
            id: (Date.now() + retryCount).toString(),
            role: 'assistant',
            content: `❌ **Error**: ${errorMessage}`,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, errorResponse]);
        } else {
          const errorResponse: Message = {
            id: (Date.now() + retryCount).toString(),
            role: 'assistant',
            content: `❌ **Error**: Failed to get response. Please try again.`,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, errorResponse]);
        }
        
        break; // Exit retry loop
      }
    }
    
    setIsSending(false);
  }, [input, isSending, tokenStatus, settings, selectedModel, user?.id]);

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt);
  };

  const formatCredits = (credits: number) => {
    if (credits >= 1000000) {
      return `${(credits / 1000000).toFixed(1)}M`;
    } else if (credits >= 1000) {
      return `${credits.toLocaleString()}`;
    }
    return credits.toString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent mx-auto mb-3"></div>
          <p className="text-slate-600 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/50">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-xl">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  AI Assistant
                </h1>
                <p className="text-slate-600 text-base mt-1">
                  Get homework help and explore AI models in one place
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <Card className="bg-white/80 backdrop-blur-sm border border-white/50 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <HelpCircle className="h-5 w-5 text-indigo-600" />
                  AI Homework Assistant
                </CardTitle>
                {!user?.openrouter_api_key && (
                  <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center gap-2 text-amber-800">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Add your OpenRouter API key</span>
                    </div>
                    <p className="text-xs text-amber-700 mt-1">
                      To avoid rate limiting and get better performance, add your own API key in your{' '}
                      <a href="/profile" className="underline hover:text-amber-900">profile settings</a>.
                    </p>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Messages */}
                <ScrollArea className="h-[500px]">
                  <div className="px-2">
                    {messages.length === 0 && (
                      <div className="text-center text-slate-500 py-12">
                        <Bot className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                        <p className="text-lg font-medium text-slate-600">Start a conversation!</p>
                        <p className="text-sm text-slate-500 mt-1">Ask me anything about your homework or studies.</p>
                      </div>
                    )}
                    {messages.map((message) => (
                      <MemoMessage key={message.id} message={message} />
                    ))}
                    {isSending && (
                      <div className="flex gap-3 justify-start mb-6">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                        <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3">
                          <Loader2 className="h-4 w-4 animate-spin text-slate-600" />
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Input */}
                <div className="flex gap-3 pt-2">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask me anything about your homework..."
                    className="flex-1 resize-none border-slate-200 focus:border-indigo-300 focus:ring-indigo-200"
                    rows={3}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={isSending || !input.trim()}
                    className="px-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 border-0 shadow-sm"
                  >
                    {isSending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Model Selector */}
            <ModelSelector
              selectedModel={selectedModel}
              onModelSelect={setSelectedModel}
              userId={user?.id}
            />

            {/* Quick Prompts */}
            <Card className="bg-white/80 backdrop-blur-sm border border-white/50 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Lightbulb className="h-4 w-4 text-amber-600" />
                  Quick Prompts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {quickPrompts.map((prompt, index) => (
                  <MemoQuickPrompt
                    key={index}
                    prompt={prompt}
                    onClick={handleQuickPrompt}
                    disabled={isSending}
                  />
                ))}
              </CardContent>
            </Card>

            {/* Token Status */}
            {tokenStatus && (
              <Card className="bg-white/80 backdrop-blur-sm border border-white/50 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Zap className="h-4 w-4 text-emerald-600" />
                    Usage Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Local Token System */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium text-slate-700">Platform Tokens</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-600">Remaining:</span>
                        <span className="text-xs font-medium text-emerald-600">
                          {tokenStatus.remaining}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-600">Used:</span>
                        <span className="text-xs font-medium text-slate-700">
                          {tokenStatus.totalUsed}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* OpenRouter Credits */}
                  {tokenStatus.openRouterCredits && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-xs font-medium text-slate-700">OpenRouter Credits</span>
                      </div>
                      <div className="pt-2 border-t border-slate-200">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-600">Remaining:</span>
                          <span className="text-xs font-medium text-purple-600">
                            {formatCredits(tokenStatus.openRouterCredits.remaining)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Quick Explanation */}
                  <div className="pt-2 border-t border-slate-200">
                    <p className="text-xs text-slate-500">
                      {user?.openrouter_api_key ? 
                        'Using your OpenRouter API key' : 
                        'Using server API key. Add your own for better performance.'
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI Settings */}
            <Card className="bg-white/80 backdrop-blur-sm border border-white/50 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Settings className="h-4 w-4 text-blue-600" />
                  AI Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div className="text-center py-4"><Loader2 className="h-5 w-5 animate-spin mx-auto text-slate-400" /></div>}>
                  <AISettingsPanel />
                </Suspense>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantPage; 