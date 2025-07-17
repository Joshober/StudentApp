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
  AlertCircle
} from 'lucide-react';
import { getAIProviderKey } from '@/lib/config';

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
    color: 'bg-orange-100 text-orange-600'
  },
  {
    title: 'Essay Writing',
    prompt: 'I need help writing an essay about [topic]. Can you provide an outline and tips?',
    icon: BookOpen,
    color: 'bg-blue-100 text-blue-600'
  },
  {
    title: 'Code Review',
    prompt: 'Can you review this code and suggest improvements?',
    icon: Code,
    color: 'bg-green-100 text-green-600'
  },
  {
    title: 'Study Guide',
    prompt: 'Create a study guide for [subject] covering the main topics.',
    icon: BookOpen,
    color: 'bg-purple-100 text-purple-600'
  }
];

const MemoMessage = memo(function MemoMessage({ message }: { message: Message }) {
  return (
    <div
      className={cn(
        'flex gap-4',
        message.role === 'user' ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'flex gap-4 max-w-[85%]',
          message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
        )}
      >
        <div
          className={cn(
            'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg',
            message.role === 'user'
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
              : 'bg-gradient-to-r from-slate-500 to-slate-600 text-white'
          )}
        >
          {message.role === 'user' ? (
            <User className="h-5 w-5" />
          ) : (
            <Bot className="h-5 w-5" />
          )}
        </div>
        <div
          className={cn(
            'rounded-2xl p-6 shadow-lg',
            message.role === 'user'
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
              : 'bg-white/90 backdrop-blur-sm border border-white/40 text-slate-800'
          )}
        >
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
          <div className="text-xs opacity-70 mt-3">
            {new Date(message.timestamp).toLocaleTimeString()}
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
      className="w-full justify-start text-left h-auto p-4 bg-white/70 hover:bg-white/90 border-white/40 hover:border-indigo-200 hover:shadow-lg transition-all duration-300 rounded-xl"
      onClick={() => onClick(prompt.prompt)}
      disabled={disabled}
    >
      <div className={`p-2 rounded-lg ${prompt.color} mr-3`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 text-left">
        <div className="font-semibold text-sm text-slate-800">{prompt.title}</div>
        <div className="text-xs text-slate-600 truncate mt-1">{prompt.prompt}</div>
      </div>
    </Button>
  );
});

const HomeworkHelpPage: React.FC = () => {
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Remove hasEnvApiKey and hasApiKey

  useEffect(() => {
    if (!user && !isLoading) {
      router.push('/auth/signin');
    }
  }, [user, isLoading, router]);

  // Fetch token status when user is available - with caching
  useEffect(() => {
    if (user?.id && !tokenStatus) {
      fetchTokenStatus();
    }
  }, [user?.id]); // Only depend on user.id, not the entire user object

  const fetchTokenStatus = async () => {
    if (!user?.id || isLoadingTokens) return;
    
    setIsLoadingTokens(true);
    try {
      const response = await fetch(`/api/user/token-status?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setTokenStatus(data);
      }
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

  // Debounce function to prevent rapid successive requests
  const debounce = useCallback((func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }, []);

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
    try {
      const aiResponse = await getAIResponse(
        settings.provider,
        input,
        [],
        settings,
        user?.id
      );
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      
      // Refresh token status after successful request (debounced)
      debounce(fetchTokenStatus, 1000)();
    } catch (error) {
      console.error('OpenRouter API error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Sorry, I encountered an error. Please try again.';
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          role: 'assistant',
          content: errorMessage,
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsSending(false);
    }
  }, [input, isSending, settings, user?.id, tokenStatus]);

  const handleQuickPrompt = useCallback((prompt: string) => {
    setInput(prompt);
  }, []);

  const clearConversation = useCallback(() => setMessages([]), []);

  if (isLoading && showSpinner) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/30">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-3 rounded-2xl">
                <HelpCircle className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Homework Help
                </h1>
                <p className="text-slate-600 text-lg mt-2">
                  AI-powered assistance for your academic journey
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Token Status */}
            <Card className="bg-white/90 backdrop-blur-xl border-white/40 shadow-2xl hover:shadow-3xl transition-all duration-500 rounded-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-slate-800 flex items-center gap-3">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-2 rounded-xl">
                    <Zap className="h-4 w-4 text-white" />
                  </div>
                  Token Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingTokens ? (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Loading token status...</span>
                  </div>
                ) : tokenStatus ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Used:</span>
                      <span className="text-sm font-medium text-slate-800">
                        {tokenStatus.totalUsed.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Remaining:</span>
                      <span className={`text-sm font-medium ${
                        tokenStatus.remaining < 1000 ? 'text-red-600' : 
                        tokenStatus.remaining < 3000 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {tokenStatus.remaining.toLocaleString()}
                      </span>
                    </div>
                    {tokenStatus.openRouterCredits && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">OpenRouter Credits:</span>
                        <span className={`text-sm font-medium ${
                          tokenStatus.openRouterCredits.remaining < 1000 ? 'text-red-600' : 
                          tokenStatus.openRouterCredits.remaining < 5000 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {tokenStatus.openRouterCredits.remaining.toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          tokenStatus.remaining < 1000 ? 'bg-red-500' : 
                          tokenStatus.remaining < 3000 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${((tokenStatus.totalUsed / tokenStatus.limit) * 100)}%` }}
                      />
                    </div>
                    {!tokenStatus.hasTokens && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <span className="text-sm text-red-700 font-medium">
                          No tokens remaining
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-slate-400 text-sm">Token status unavailable</div>
                )}
              </CardContent>
            </Card>
            {/* AI Settings */}
            <Card className="bg-white/90 backdrop-blur-xl border-white/40 shadow-2xl hover:shadow-3xl transition-all duration-500 rounded-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-slate-800 flex items-center gap-3">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-xl">
                    <Settings className="h-4 w-4 text-white" />
                  </div>
                  AI Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div className="text-slate-400 text-sm">Loading settings...</div>}>
                  <AISettingsPanel />
                </Suspense>
              </CardContent>
            </Card>
            {/* Quick Prompts */}
            <Card className="bg-white/90 backdrop-blur-xl border-white/40 shadow-2xl hover:shadow-3xl transition-all duration-500 rounded-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-slate-800 flex items-center gap-3">
                  <div className="bg-gradient-to-r from-yellow-500 to-orange-600 p-2 rounded-xl">
                    <Lightbulb className="h-4 w-4 text-white" />
                  </div>
                  Quick Prompts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {quickPrompts.map((prompt) => (
                  <MemoQuickPrompt
                    key={prompt.title}
                    prompt={prompt}
                    onClick={handleQuickPrompt}
                    disabled={tokenStatus ? !tokenStatus.hasTokens : false}
                  />
                ))}
              </CardContent>
            </Card>
            {/* Clear Conversation */}
            <Button
              variant="outline"
              onClick={clearConversation}
              className="w-full bg-white/70 hover:bg-white/90 border-white/40 hover:border-red-200 hover:text-red-600 transition-all duration-300 rounded-xl h-12"
            >
              Clear Conversation
            </Button>
          </div>
          {/* Chat Area */}
          <div className="lg:col-span-3">
            <Card className="h-[700px] flex flex-col bg-white/90 backdrop-blur-xl border-white/40 shadow-2xl hover:shadow-3xl transition-all duration-500 rounded-2xl">
              <CardHeader className="pb-4 border-b border-slate-200/50">
                <CardTitle className="flex items-center justify-between text-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-2 rounded-xl">
                      <Bot className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl font-semibold">AI Assistant</span>
                  </div>
                  <Badge variant="outline" className="bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 border-indigo-200 px-3 py-1 rounded-full">
                    {settings.model?.split('/').pop()?.split(':')[0] || settings.model || 'OpenRouter'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              {/* Messages */}
              <ScrollArea className="flex-1 mb-6">
                <div className="space-y-6">
                  {messages.length === 0 && (
                    <div className="text-center text-slate-500 py-16">
                      <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                        <Bot className="h-10 w-10 text-indigo-600" />
                      </div>
                      <p className="text-2xl font-semibold mb-3 text-slate-700">
                        Ready to help!
                      </p>
                      <p className="text-slate-600 mb-6">
                        Start a conversation to get homework help
                      </p>
                    </div>
                  )}
                  {messages.map((message) => (
                    <MemoMessage key={message.id} message={message} />
                  ))}
                  {isSending && (
                    <div className="flex gap-4 justify-start">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-slate-500 to-slate-600 flex items-center justify-center shadow-lg">
                        <Bot className="h-5 w-5 text-white" />
                      </div>
                      <div className="bg-white/90 backdrop-blur-sm border border-white/40 rounded-2xl p-6 shadow-lg">
                        <div className="flex items-center gap-3">
                          <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
                          <span className="text-sm text-slate-700 font-medium">AI is thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              {/* Input Area */}
              <div className="flex gap-4 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl border border-slate-200/50 sticky bottom-0">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={tokenStatus && !tokenStatus.hasTokens ? 'No tokens remaining' : 'Ask for homework help...'}
                  className="flex-1 resize-none bg-white/80 border-slate-200 focus:bg-white focus:border-indigo-300 transition-all duration-300 rounded-xl"
                  rows={3}
                  disabled={isSending || (tokenStatus ? !tokenStatus.hasTokens : false)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={isSending || !input.trim() || (tokenStatus ? !tokenStatus.hasTokens : false)}
                  className="self-end bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-6"
                >
                  {isSending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeworkHelpPage; 