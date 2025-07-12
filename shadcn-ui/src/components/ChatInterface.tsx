import { useState, useRef, useEffect } from 'react';
import { useStudySession } from '@/context/StudySessionContext';
import { useAISettings } from '@/context/AISettingsContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getAIResponse } from '@/lib/ai-providers';
import { AISettingsPanel } from './AISettingsPanel';
import { Loader2, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

export const ChatInterface = () => {
  const { currentSession, addMessage } = useStudySession();
  const { settings, hasApiKey } = useAISettings();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession?.messages]);

  const handleSend = async () => {
    if (!message.trim() || !currentSession) return;
    
    // Add user message
    addMessage(message, 'user');
    setMessage('');
    
    // Get AI response
    setLoading(true);
    
    try {
      // Extract file contents from current session
      const fileContents = currentSession.files
        .map(file => file.content || '')
        .filter(content => content.length > 0);
      
      // Call the AI provider
      const aiResponse = await getAIResponse(
        settings.provider,
        message,
        fileContents,
        settings
      );
      
      // Add AI response
      addMessage(aiResponse, 'assistant');
    } catch (error) {
      console.error('Error getting AI response:', error);
      addMessage('Sorry, I encountered an error while processing your request. Please try again.', 'assistant');
    } finally {
      setLoading(false);
    }
  };

  if (!currentSession) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <p className="text-lg text-gray-600">No active study session</p>
        <p className="text-sm text-gray-500 mt-2">
          Create or select a session to start chatting
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between border-b px-4 py-2">
        <h3 className="font-medium">{currentSession.title}</h3>
        <AISettingsPanel />
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {currentSession.messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Upload your homework files and ask questions to get help.</p>
              <p className="text-sm mt-2">The AI tutor will guide you through the learning process.</p>
            </div>
          ) : (
            currentSession.messages.map((msg) => (
              <div 
                key={msg.id}
                className={cn(
                  "p-4 rounded-lg max-w-[80%]",
                  msg.role === 'user' 
                    ? "bg-primary text-primary-foreground ml-auto" 
                    : "bg-muted mr-auto"
                )}
              >
                <ReactMarkdown className="prose prose-sm dark:prose-invert">
                  {msg.content}
                </ReactMarkdown>
                <div className="text-xs mt-1 opacity-70">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      <div className="border-t p-4">
        <div className="flex space-x-2">
          <Textarea
            placeholder={hasApiKey 
              ? "Type your question..." 
              : "Please set your API key in settings..."
            }
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={loading || !hasApiKey}
            className="resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button 
            onClick={handleSend}
            disabled={!message.trim() || loading || !hasApiKey}
            className="px-3"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
        {!hasApiKey && (
          <p className="text-xs text-yellow-600 mt-2">
            ⚠️ API key required. Click the settings icon to add your key.
          </p>
        )}
      </div>
    </div>
  );
};