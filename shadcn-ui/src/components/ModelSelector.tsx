"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Zap, 
  Brain, 
  Loader2, 
  RefreshCw,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Settings
} from 'lucide-react';
import { getCachedModels } from '@/lib/api-cache';

interface OpenRouterModel {
  id: string;
  name: string;
  description: string;
  context_length: number;
  pricing: {
    prompt: string;
    completion: string;
  };
  architecture: {
    modality: string;
    tokenizer: string;
  };
  top_provider: {
    max_completion_tokens?: number;
    is_moderated: boolean;
  };
  tags: string[];
}

interface OpenRouterCredits {
  remaining: number;
  used: number;
  total: number;
}

interface ModelSelectorProps {
  selectedModel: string;
  onModelSelect: (modelId: string) => void;
  userId?: number;
  className?: string;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  onModelSelect,
  userId,
  className = ""
}) => {
  const [models, setModels] = useState<OpenRouterModel[]>([]);
  const [filteredModels, setFilteredModels] = useState<OpenRouterModel[]>([]);
  const [credits, setCredits] = useState<OpenRouterCredits | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchModels();
    }
  }, [userId]);

  useEffect(() => {
    // Filter models based on search term
    const filtered = models.filter(model => 
      model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredModels(filtered);
  }, [searchTerm, models]);

  const fetchModels = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getCachedModels(userId);
      const uniqueModels = data.models?.filter((model: any, index: number, self: any[]) => 
        index === self.findIndex((m: any) => m.id === model.id)
      ) || [];
      setModels(uniqueModels);
      setCredits(data.credits);
    } catch (error) {
      console.error('Failed to fetch models:', error);
      setError('Failed to fetch models from OpenRouter');
    } finally {
      setIsLoading(false);
    }
  };

  const formatContextLength = (length: number) => {
    if (length >= 1000000) {
      return `${(length / 1000000).toFixed(1)}M`;
    } else if (length >= 1000) {
      return `${(length / 1000).toFixed(0)}K`;
    }
    return length.toString();
  };

  const formatCredits = (credits: number) => {
    if (credits >= 1000000) {
      return `${(credits / 1000000).toFixed(1)}M`;
    } else if (credits >= 1000) {
      return `${credits.toLocaleString()}`;
    }
    return credits.toString();
  };

  const selectedModelData = models.find(m => m.id === selectedModel);

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Model Selector Header */}
      <Card className="bg-white/90 backdrop-blur-xl border border-white/30">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Brain className="h-4 w-4 text-blue-600" />
              AI Model
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-6 w-6 p-0"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Selected Model Display */}
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-lg">
                <Brain className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="font-semibold text-sm text-slate-800">
                  {selectedModelData?.name || 'Default Model'}
                </div>
                <div className="text-xs text-slate-600">
                  {selectedModelData?.description?.substring(0, 50) || 'AI Assistant Model'}...
                </div>
              </div>
            </div>
            <Badge variant="outline" className="text-xs text-green-600 border-green-200">
              FREE
            </Badge>
          </div>

          {/* Credits Display */}
          {credits && (
            <div className="flex items-center gap-2 mt-2 p-2 bg-green-50 rounded-lg border border-green-200">
              <Zap className="h-3 w-3 text-green-600" />
              <span className="text-xs text-green-700 font-medium">
                {formatCredits(credits.remaining)} credits remaining
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expanded Model List */}
      {isExpanded && (
        <Card className="bg-white/90 backdrop-blur-xl border border-white/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm">
              <span>Choose Model</span>
              <Button
                onClick={fetchModels}
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="h-6 px-2"
              >
                {isLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3" />
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
              <Input
                placeholder="Search models..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 h-8 text-xs"
              />
            </div>

            {/* Error Display */}
            {error && (
              <div className="flex items-center gap-2 text-red-700 text-xs p-2 bg-red-50 rounded-lg border border-red-200">
                <AlertCircle className="h-3 w-3" />
                <span>{error}</span>
              </div>
            )}

            {/* Models List */}
            <ScrollArea className="h-48">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                </div>
              ) : filteredModels.length > 0 ? (
                <div className="space-y-2">
                  {filteredModels.map((model) => (
                    <div
                      key={model.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 hover:border-blue-300 hover:bg-blue-50/50 ${
                        selectedModel === model.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200'
                      }`}
                      onClick={() => {
                        onModelSelect(model.id);
                        setIsExpanded(false);
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm text-gray-900">{model.name}</h4>
                            <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                              FREE
                            </Badge>
                            {model.top_provider?.is_moderated && (
                              <Badge variant="outline" className="text-xs text-blue-600 border-blue-200">
                                MODERATED
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                            {model.description}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span>Context: {formatContextLength(model.context_length)}</span>
                            <span>Provider: {model.top_provider?.max_completion_tokens ? 'Limited' : 'Unlimited'}</span>
                          </div>
                        </div>
                        {selectedModel === model.id && (
                          <CheckCircle className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 text-sm">
                  <Brain className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>No models found matching your search.</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 