"use client";

import React, { useState, useEffect, useRef, useCallback, memo, Suspense, lazy } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useAISettings } from '@/context/AISettingsContext';
import { useStudySession } from '@/context/StudySessionContext';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getAIResponse } from '@/lib/ai-providers';
import { getInitialData, refreshTokenStatus } from '@/lib/api-cache';
import { FileUploadArea } from '@/components/FileUploadArea';
import { DocumentContent } from '@/lib/document-reader';

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
  Sparkles,
  Activity,
  TrendingUp,
  CreditCard,
  Clock,
  BarChart3,
  XCircle,
  FileText,
  X,
  File,
  FileImage,
  FileCode,
  FileSpreadsheet,
  FileType,
  FileArchive,
  FileVideo,
  FileAudio,
  Calendar
} from 'lucide-react';

// Fix dynamic import for React.lazy - import default export
const AISettingsPanel = lazy(() => import('@/components/AISettingsPanel'));

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: Array<{
    fileName: string;
    fileSize: number;
    wordCount: number;
    fileType: string;
  }>;
}

interface AIUsageData {
  userId: number;
  userApiKeyStatus: 'none' | 'valid' | 'error';
  tokenStatus: {
    totalUsed: number;
    remaining: number;
    hasTokens: boolean;
    limit: number;
    percentageUsed: number;
  };
  usageStats: {
    totalRequests: number;
    averageTokensPerRequest: number;
    detailedUsage: any[];
    modelUsage: Record<string, any>;
    popularModels: any[];
  };
  models: {
    available: number;
    recommended: any[];
    userUsage: any[];
  };
  openRouter: {
    credits: any;
    hasApiKey: boolean;
    modelsAvailable: boolean;
  };
  system: {
    cacheStats: any;
    rateLimitInfo: any;
    lastUpdated: string;
  };
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
          <div className={cn(
            'prose prose-sm max-w-none',
            message.role === 'user' 
              ? 'prose-invert text-white [&>*]:text-white [&_p]:text-white [&_strong]:text-white [&_em]:text-white [&_code]:text-white [&_pre]:text-white [&_blockquote]:text-white [&_ul]:text-white [&_ol]:text-white [&_li]:text-white'
              : ''
          )}>
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
          
          {/* File Attachments Display */}
          {message.attachments && message.attachments.length > 0 && (
            <div className={cn(
              'mt-3 pt-3 border-t',
              message.role === 'user' ? 'border-white/20' : 'border-slate-200'
            )}>
              <div className="space-y-2">
                {message.attachments.map((file, index) => (
                  <div
                    key={index}
                    className={cn(
                      'flex items-center gap-2 p-2 rounded-lg',
                      message.role === 'user' 
                        ? 'bg-white/10 text-white/90' 
                        : 'bg-slate-50 text-slate-700'
                    )}
                  >
                    <div className={cn(
                      'flex items-center justify-center w-6 h-6 rounded',
                      message.role === 'user' ? 'bg-white/20' : 'bg-slate-200'
                    )}>
                      {getFileIcon(file.fileName, cn(
                        'h-3 w-3',
                        message.role === 'user' ? 'text-white' : 'text-slate-600'
                      ))}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        'text-xs font-medium truncate',
                        message.role === 'user' ? 'text-white' : 'text-slate-700'
                      )}>
                        {file.fileName}
                      </p>
                      <div className="flex items-center gap-2 text-xs opacity-70">
                        <span className={message.role === 'user' ? 'text-white/70' : 'text-slate-500'}>
                          {(file.fileSize / 1024).toFixed(1)} KB
                        </span>
                        <span className={message.role === 'user' ? 'text-white/70' : 'text-slate-500'}>
                          {file.wordCount} words
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
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
      className="w-full justify-start text-left h-auto p-3 bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all duration-200 rounded-xl whitespace-normal"
      onClick={() => onClick(prompt.prompt)}
      disabled={disabled}
    >
      <div className={`p-2 rounded-lg ${prompt.color} mr-3 border`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 text-left min-w-0">
        <div className="font-medium text-sm text-slate-800">{prompt.title}</div>
        <div className="text-xs text-slate-500 mt-1 break-words leading-relaxed">{prompt.prompt}</div>
      </div>
    </Button>
  );
});

const getFileIcon = (fileName: string, className: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'pdf':
      return <FileType className={className} />;
    case 'doc':
    case 'docx':
      return <FileText className={className} />;
    case 'txt':
      return <FileText className={className} />;
    case 'md':
      return <FileCode className={className} />;
    case 'csv':
      return <FileSpreadsheet className={className} />;
    case 'json':
      return <FileCode className={className} />;
    case 'html':
    case 'htm':
      return <FileCode className={className} />;
    case 'zip':
    case 'rar':
    case '7z':
      return <FileArchive className={className} />;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'svg':
      return <FileImage className={className} />;
    case 'mp4':
    case 'avi':
    case 'mov':
    case 'wmv':
      return <FileVideo className={className} />;
    case 'mp3':
    case 'wav':
    case 'flac':
    case 'aac':
      return <FileAudio className={className} />;
    default:
      return <File className={className} />;
  }
};

const AIAssistantPage: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { settings } = useAISettings();
  const { currentSession, addFileToCurrentSession, removeFileFromCurrentSession } = useStudySession();
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
  const [aiUsageData, setAiUsageData] = useState<AIUsageData | null>(null);
  const [isLoadingUsageData, setIsLoadingUsageData] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState<DocumentContent[]>([]);
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

  // Fetch comprehensive AI usage data
  useEffect(() => {
    if (user?.id) {
      fetchAIUsageData();
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

  const fetchAIUsageData = async () => {
    if (!user?.id) return;
    
    setIsLoadingUsageData(true);
    try {
      const response = await fetch(`/api/user/ai-usage?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setAiUsageData(data);
        
        // Set default model if available and not already set
        if (data.models.recommended.length > 0 && !selectedModel) {
          setSelectedModel(data.models.recommended[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch AI usage data:', error);
    } finally {
      setIsLoadingUsageData(false);
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
        
        // Refresh token status and usage data after successful request
        if (user?.id) {
          fetchTokenStatus();
          setTimeout(() => {
            fetchAIUsageData();
          }, 1000);
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

  const handleFilesReady = (files: any[]) => {
    console.log('Files ready received:', files);
    const documents = files.map(file => file.content).filter(Boolean);
    console.log('Documents extracted:', documents);
    setUploadedDocuments(documents);
    
    // Also add files to the study session context
    files.forEach(file => {
      if (file.content) {
        addFileToCurrentSession({
          id: file.id,
          name: file.name,
          type: file.type,
          size: file.size,
          content: file.content.text,
          createdAt: new Date().toISOString()
        });
      }
    });
  };

  const handleSendFilesToAI = (files: any[]) => {
    const documents = files.map(file => file.content).filter(Boolean);
    if (documents.length > 0) {
      const documentText = documents.map(doc => 
        `Document: ${doc.metadata.fileName}\n\n${doc.text}`
      ).join('\n\n---\n\n');
      
      const message = `I've uploaded ${documents.length} document(s). Please analyze them and help me understand the content:\n\n${documentText}`;
      setInput(message);
    }
  };

  const handleRemoveFile = (fileId: string) => {
    // Remove file from uploadedDocuments based on the fileId
    setUploadedDocuments(prev => prev.filter((_, index) => `doc-${index}` !== fileId));
    
    // Also remove from study session context
    removeFileFromCurrentSession(fileId);
  };

  const handleSendMessageWithFiles = async () => {
    // Check if we have either a message or uploaded files
    if (!input.trim() && uploadedDocuments.length === 0) return;
    
    // Check if any files are still processing
    const hasProcessingFiles = uploadedDocuments.some(doc => !doc.text || doc.text.trim() === '');
    if (hasProcessingFiles) {
      // Show error or wait for processing to complete
      return;
    }
    
    const messageText = input.trim();
    
    // Create file attachments for display
    const attachments = uploadedDocuments.map(doc => ({
      fileName: doc.metadata.fileName,
      fileSize: doc.metadata.fileSize,
      wordCount: doc.metadata.wordCount,
      fileType: doc.metadata.fileType
    }));
    
    // Send user message with file attachments
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText || 'Please analyze the uploaded documents.',
      timestamp: new Date(),
      attachments: attachments.length > 0 ? attachments : undefined
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setUploadedDocuments([]); // Clear uploaded documents after sending
    setIsSending(true);
    
    try {
      // For AI processing, we still need to include the full document content
      const documentText = uploadedDocuments.length > 0 
        ? uploadedDocuments.map(doc => 
            `Document: ${doc.metadata.fileName}\n\n${doc.text}`
          ).join('\n\n---\n\n')
        : '';
      
      const aiMessage = documentText 
        ? `${messageText || 'Please analyze the uploaded documents.'}\n\n---\n\nUploaded Documents:\n\n${documentText}`
        : messageText;
      
      const response = await getAIResponse(
        'openrouter',
        aiMessage,
        [], // files array - we're including files in the message
        { 
          provider: 'openrouter',
          model: selectedModel 
        }, // settings
        user?.id
      );
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSending(false);
    }
  };

  const formatCredits = (credits: number) => {
    if (credits >= 1000000) {
      return `${(credits / 1000000).toFixed(1)}M`;
    } else if (credits >= 1000) {
      return `${credits.toLocaleString()}`;
    }
    return credits.toString();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
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
            <div className="flex items-center justify-between">
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
              {aiUsageData && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(aiUsageData.system.lastUpdated).toLocaleTimeString()}
                </Badge>
              )}
            </div>
          </div>
        </div>

        <Tabs defaultValue="chat" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="models">Models</TabsTrigger>
          </TabsList>

          {/* Chat Tab */}
          <TabsContent value="chat" className="space-y-6">
            {/* Main Chat Interface with Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Chat Interface - Main Content */}
              <div className="lg:col-span-3">
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
                    <div className="space-y-3 pt-2">
                      {/* Message Input */}
                      <div className="flex gap-3">
                        <div className="flex-1 relative">
                          <Textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={uploadedDocuments.length > 0 
                              ? `Type your message here... (${uploadedDocuments.length} file${uploadedDocuments.length > 1 ? 's' : ''} ready to send)`
                              : "Ask me anything about your homework... (You can also upload documents above)"
                            }
                            className="min-h-[60px] max-h-[200px] resize-none border-slate-200 focus:border-indigo-300 focus:ring-indigo-200 rounded-xl pr-12 transition-all duration-200"
                            rows={3}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessageWithFiles();
                              }
                            }}
                            style={{
                              height: 'auto',
                              minHeight: '60px',
                              maxHeight: '200px',
                              overflowY: 'auto'
                            }}
                            onInput={(e) => {
                              const target = e.target as HTMLTextAreaElement;
                              target.style.height = 'auto';
                              target.style.height = Math.min(target.scrollHeight, 200) + 'px';
                            }}
                          />
                          
                          {/* File Upload Button - Positioned inside textarea */}
                          <div className="absolute right-2 top-2">
                            <FileUploadArea
                              onFilesReady={handleFilesReady}
                              onSendToAI={handleSendFilesToAI}
                              onRemoveFile={handleRemoveFile}
                              disabled={isSending}
                              uploadedFiles={uploadedDocuments.map((doc, index) => ({
                                id: `doc-${index}`,
                                name: doc.metadata.fileName,
                                size: doc.metadata.fileSize,
                                type: doc.metadata.fileType,
                                content: doc,
                                status: 'ready' as const,
                                progress: 100
                              }))}
                            />
                          </div>
                        </div>
                        
                        <Button
                          onClick={handleSendMessageWithFiles}
                          disabled={isSending || (!input.trim() && uploadedDocuments.length === 0) || uploadedDocuments.some(doc => !doc.text || doc.text.trim() === '')}
                          className="px-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 border-0 shadow-sm rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      
                      {/* File List Display */}
                      {(uploadedDocuments.length > 0 || (currentSession?.files && currentSession.files.length > 0)) && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full">
                              <FileText className="h-3 w-3 text-blue-600" />
                            </div>
                            <span className="text-sm font-semibold text-gray-700">
                              Attached Files ({(uploadedDocuments.length + (currentSession?.files?.length || 0))})
                            </span>
                          </div>
                          <div className="grid gap-2">
                            {/* Show uploaded documents */}
                            {uploadedDocuments.map((doc, index) => (
                              <div
                                key={`doc-${index}`}
                                className="group relative flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200/60 shadow-sm hover:shadow-md transition-all duration-200"
                              >
                                <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg border border-green-200">
                                  {getFileIcon(doc.metadata.fileName, "h-5 w-5 text-green-600")}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-semibold text-gray-900 truncate">
                                      {doc.metadata.fileName}
                                    </p>
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                      Ready
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3 mt-1">
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                      <FileText className="h-3 w-3" />
                                      {(doc.metadata.fileSize / 1024).toFixed(1)} KB
                                    </span>
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                      <MessageSquare className="h-3 w-3" />
                                      {doc.metadata.wordCount} words
                                    </span>
                                  </div>
                                </div>
                                
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveFile(`doc-${index}`)}
                                  className="h-8 w-8 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            
                            {/* Show files from study session */}
                            {currentSession?.files?.map((file) => (
                              <div
                                key={file.id}
                                className="group relative flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200/60 shadow-sm hover:shadow-md transition-all duration-200"
                              >
                                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg border border-blue-200">
                                  {getFileIcon(file.name, "h-5 w-5 text-blue-600")}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-semibold text-gray-900 truncate">
                                      {file.name}
                                    </p>
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                      Session
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3 mt-1">
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                      <FileText className="h-3 w-3" />
                                      {(file.size / 1024).toFixed(1)} KB
                                    </span>
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      {new Date(file.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                                
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFileFromCurrentSession(file.id)}
                                  className="h-8 w-8 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                {/* Model Selector with Token Info and AI Settings */}
                <Card className="bg-white/80 backdrop-blur-sm border border-white/50 shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Brain className="h-4 w-4 text-blue-600" />
                        AI Model & Settings
                      </CardTitle>
                      <Suspense fallback={<div className="h-9 w-9 bg-gray-200 rounded animate-pulse"></div>}>
                        <AISettingsPanel />
                      </Suspense>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Token Usage Stats */}
                    {aiUsageData && (
                      <div className="space-y-3 pt-2 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Token Usage</span>
                          <span className="text-sm font-medium">
                            {aiUsageData.tokenStatus.totalUsed.toLocaleString()}/{aiUsageData.tokenStatus.limit.toLocaleString()}
                          </span>
                        </div>
                        <Progress value={aiUsageData.tokenStatus.percentageUsed} className="h-2" />
                        
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Total Requests:</span>
                            <span className="font-medium">{aiUsageData.usageStats.totalRequests}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Avg Tokens:</span>
                            <span className="font-medium">{aiUsageData.usageStats.averageTokensPerRequest}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Token Status Details */}
                    {tokenStatus && (
                      <div className="space-y-3 pt-2 border-t border-gray-200">
                        <div className="space-y-2">
                          {/* Platform Tokens */}
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-xs font-medium text-slate-700">Platform Tokens</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Remaining:</span>
                              <span className="font-medium text-emerald-600">
                                {tokenStatus.remaining}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-600">Used:</span>
                              <span className="font-medium text-slate-700">
                                {tokenStatus.totalUsed}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* OpenRouter Credits */}
                        {tokenStatus.openRouterCredits && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                              <span className="text-xs font-medium text-slate-700">OpenRouter Credits</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">Remaining:</span>
                                <span className="font-medium text-purple-600">
                                  {formatCredits(tokenStatus.openRouterCredits.remaining)}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">Used:</span>
                                <span className="font-medium text-slate-700">
                                  {formatCredits(tokenStatus.openRouterCredits.used)}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* API Key Status */}
                        {aiUsageData && (
                          <div className="pt-2 border-t border-gray-200">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(aiUsageData.userApiKeyStatus)}
                              <span className="text-xs font-medium capitalize">{aiUsageData.userApiKeyStatus}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {aiUsageData.openRouter.hasApiKey ? 'Using your OpenRouter API key' : 'Using server API key'}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

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
              </div>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {aiUsageData ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Token Usage */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Token Usage</CardTitle>
                      <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{aiUsageData.tokenStatus.totalUsed.toLocaleString()}</div>
                      <p className="text-xs text-muted-foreground">
                        {aiUsageData.tokenStatus.remaining.toLocaleString()} remaining
                      </p>
                      <Progress value={aiUsageData.tokenStatus.percentageUsed} className="mt-2" />
                    </CardContent>
                  </Card>

                  {/* Total Requests */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{aiUsageData.usageStats.totalRequests}</div>
                      <p className="text-xs text-muted-foreground">
                        {aiUsageData.usageStats.averageTokensPerRequest} avg tokens/request
                      </p>
                    </CardContent>
                  </Card>

                  {/* Available Models */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Available Models</CardTitle>
                      <Brain className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{aiUsageData.models.available}</div>
                      <p className="text-xs text-muted-foreground">
                        {aiUsageData.openRouter.hasApiKey ? 'API Key configured' : 'No API key'}
                      </p>
                    </CardContent>
                  </Card>

                  {/* API Key Status */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">API Key Status</CardTitle>
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(aiUsageData.userApiKeyStatus)}
                        <span className="text-sm font-medium capitalize">{aiUsageData.userApiKeyStatus}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {aiUsageData.openRouter.hasApiKey ? 'OpenRouter connected' : 'No API key set'}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Popular Models */}
                {aiUsageData.usageStats.popularModels.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5" />
                        Most Used Models
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">Your most frequently used AI models</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {aiUsageData.usageStats.popularModels.map((model: any, index: number) => (
                          <div key={model.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">{model.name}</p>
                              <p className="text-sm text-gray-600">
                                {model.totalRequests} requests • {model.totalTokens.toLocaleString()} tokens
                              </p>
                            </div>
                            <Badge variant="secondary">
                              #{index + 1}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-slate-400" />
                    <p className="text-slate-600">Loading analytics...</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Models Tab */}
          <TabsContent value="models" className="space-y-6">
            {aiUsageData ? (
              <Card>
                <CardHeader>
                  <CardTitle>Recommended Models</CardTitle>
                  <p className="text-sm text-muted-foreground">Free models recommended for your usage</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {aiUsageData.models.recommended.map((model: any) => (
                      <div key={model.id} className="p-4 border rounded-lg">
                        <h4 className="font-medium">{model.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Context: {model.context_length.toLocaleString()} tokens
                        </p>
                        <Badge variant="outline" className="mt-2">Free</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-slate-400" />
                    <p className="text-slate-600">Loading models...</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AIAssistantPage; 