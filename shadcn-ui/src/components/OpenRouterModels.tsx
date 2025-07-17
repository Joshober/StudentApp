"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
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
  AlertCircle
} from 'lucide-react';

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

export const OpenRouterModels: React.FC = () => {
  const { user } = useAuth();
  const [models, setModels] = useState<OpenRouterModel[]>([]);
  const [filteredModels, setFilteredModels] = useState<OpenRouterModel[]>([]);
  const [credits, setCredits] = useState<OpenRouterCredits | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchModels();
    }
  }, [user]);

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
    if (!user?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/openrouter/models?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        // Deduplicate models by ID to prevent React key conflicts
        const uniqueModels = data.models?.filter((model: any, index: number, self: any[]) => 
          index === self.findIndex((m: any) => m.id === model.id)
        ) || [];
        setModels(uniqueModels);
        setCredits(data.userCredits);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch models');
      }
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

  return (
    <div className="space-y-6">
      {/* Header with Credits */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Brain className="h-5 w-5 text-blue-600" />
              OpenRouter Models
            </CardTitle>
            <Button
              onClick={fetchModels}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {credits && (
            <div className="flex items-center gap-4 p-3 bg-white/80 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Credits:</span>
                <span className="text-sm text-green-700 font-bold">
                  {formatCredits(credits.remaining)} remaining
                </span>
              </div>
              <div className="text-xs text-gray-600">
                Used: {formatCredits(credits.used)} / {formatCredits(credits.total)}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search models by name, description, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Models List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Free Models ({filteredModels.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : filteredModels.length > 0 ? (
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {filteredModels.map((model) => (
                  <div
                    key={model.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900">{model.name}</h3>
                          <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                            FREE
                          </Badge>
                          {model.top_provider?.is_moderated && (
                            <Badge variant="outline" className="text-xs text-blue-600 border-blue-200">
                              MODERATED
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {model.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Context: {formatContextLength(model.context_length)} tokens</span>
                          <span>Provider: {model.top_provider?.max_completion_tokens ? 'Limited' : 'Unlimited'}</span>
                        </div>
                        {model.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {model.tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {model.tags.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{model.tags.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'No models found matching your search.' : 'No models available.'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}; 