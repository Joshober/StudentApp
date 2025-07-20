"use client";

import { useState, useEffect, useMemo } from 'react';
import { useAISettings } from '@/context/AISettingsContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Settings, Info, Loader2, Search, CheckCircle } from 'lucide-react';
import { OPENROUTER_MODELS, getFreeModels, getPaidModels, formatModelPrice } from '@/lib/openrouter-models';

const AISettingsPanel = () => {
  const { settings, updateSettings } = useAISettings();
  
  // Memoize the updateSettings function to prevent unnecessary re-renders
  const handleModelSelect = useMemo(() => (modelId: string) => {
    if (settings.model !== modelId) {
      updateSettings({ model: modelId });
    }
  }, [settings.model, updateSettings]);
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [apiKeySource, setApiKeySource] = useState<'environment' | 'user' | null>(null);
  const [dynamicModels, setDynamicModels] = useState<any[]>([]);
  const [filteredModels, setFilteredModels] = useState<any[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [isLoadingApiKey, setIsLoadingApiKey] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Fallback to static models if dynamic fetch fails
  const freeModels = useMemo(() => 
    dynamicModels.length > 0 ? dynamicModels : getFreeModels(), 
    [dynamicModels]
  );
  const paidModels = useMemo(() => getPaidModels(), []);
  const allModels = useMemo(() => [...freeModels, ...paidModels], [freeModels, paidModels]);

  // Check API key source and fetch models when user changes - with caching
  useEffect(() => {
    if (user?.id) {
      // Only fetch if we haven't already loaded data for this user
      if (apiKeySource === null) {
        checkApiKeySource();
      }
      if (dynamicModels.length === 0) {
        fetchDynamicModels();
      }
    }
  }, [user?.id]); // Only depend on user.id, not the entire user object

  // Filter models based on search term
  useEffect(() => {
    if (!allModels.length || !open) return;
    
    const filtered = allModels.filter(model => 
      model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredModels(filtered);
  }, [searchTerm, allModels, open]);

  // Reset search when dialog closes
  useEffect(() => {
    if (!open) {
      setSearchTerm('');
    }
  }, [open]);

  const checkApiKeySource = async () => {
    if (!user?.id || isLoadingApiKey) return;
    
    setIsLoadingApiKey(true);
    try {
      const response = await fetch(`/api/user/api-key-status?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setApiKeySource(data.source);
      }
    } catch (error) {
      console.error('Failed to check API key source:', error);
    } finally {
      setIsLoadingApiKey(false);
    }
  };

  const fetchDynamicModels = async () => {
    if (!user?.id || isLoadingModels) return;
    
    setIsLoadingModels(true);
    try {
      // Use database models API instead of direct OpenRouter API
      const response = await fetch(`/api/openrouter/db-models?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        // Deduplicate models by ID to prevent React key conflicts
        const uniqueModels = data.models?.filter((model: any, index: number, self: any[]) => 
          index === self.findIndex((m: any) => m.id === model.id)
        ) || [];
        setDynamicModels(uniqueModels);
      }
    } catch (error) {
      console.error('Failed to fetch models from database:', error);
      // Fallback to static models
    } finally {
      setIsLoadingModels(false);
    }
  };
  
  const handleSaveSettings = () => {
    setOpen(false);
  };

  const formatContextLength = (length: number) => {
    if (length >= 1000000) {
      return `${(length / 1000000).toFixed(1)}M`;
    } else if (length >= 1000) {
      return `${(length / 1000).toFixed(0)}K`;
    }
    return length.toString();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-9 w-9">
          <Settings className="h-4 w-4" />
          <span className="sr-only">Settings</span>
        </Button>
      </DialogTrigger>
      {open && (
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>AI Tutor Settings</DialogTitle>
          <DialogDescription>
            Customize how the AI tutor responds to your questions
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="provider">AI Provider</Label>
            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="font-medium">OpenRouter</span>
                <Badge variant="secondary" className="text-xs">Recommended</Badge>
              </div>
              <div className="text-xs text-blue-600 ml-auto">
                Multiple free models available
              </div>
            </div>
            {apiKeySource && (
              <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-xs text-green-700">
                  <span className="font-medium">API Key:</span> {apiKeySource === 'user' ? 'User-provided' : apiKeySource === 'environment' ? 'Environment variable' : 'Not configured'}
                </div>
                <Badge variant="outline" className={`text-xs ${apiKeySource === 'environment' ? 'text-green-600 border-green-200' : apiKeySource === 'user' ? 'text-purple-600 border-purple-200' : 'text-gray-600 border-gray-200'}`}>
                  {apiKeySource === 'environment' ? 'PRIORITY' : apiKeySource === 'user' ? 'FALLBACK' : 'NONE'}
                </Badge>
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="model">AI Model Selection</Label>
            
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search models..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Model List */}
            <ScrollArea className="h-64 border rounded-lg">
              {isLoadingModels ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                </div>
              ) : filteredModels.length > 0 ? (
                <div className="p-2 space-y-2">
                  {/* Free Models Section */}
                  <div className="space-y-2">
                    <div className="px-2 py-1.5 text-sm font-semibold text-green-600 flex items-center gap-2">
                      <Info className="h-3 w-3" />
                      Free Models (Recommended)
                    </div>
                    {filteredModels.filter(model => freeModels.some(fm => fm.id === model.id)).map((model) => (
                      <div
                        key={model.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 hover:border-blue-300 hover:bg-blue-50/50 ${
                          settings.model === model.id 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200'
                        }`}
                                                 onClick={() => handleModelSelect(model.id)}
                       >
                         <div className="flex items-start justify-between">
                           <div className="flex-1">
                             <div className="flex items-center gap-2 mb-1">
                               <h4 className="font-medium text-sm text-gray-900">{model.name}</h4>
                               <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                                 FREE
                               </Badge>
                             </div>
                             <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                               {model.description}
                             </p>
                             <div className="flex items-center gap-3 text-xs text-gray-500">
                               <span>Context: {formatContextLength(model.context_length || 0)}</span>
                             </div>
                           </div>
                           {settings.model === model.id && (
                             <CheckCircle className="h-4 w-4 text-blue-600" />
                           )}
                         </div>
                       </div>
                     ))}
                   </div>

                   {/* Paid Models Section */}
                   {filteredModels.filter(model => paidModels.some(pm => pm.id === model.id)).length > 0 && (
                     <>
                       <Separator className="my-2" />
                       <div className="space-y-2">
                         <div className="px-2 py-1.5 text-sm font-semibold text-blue-600 flex items-center gap-2">
                           <Info className="h-3 w-3" />
                           Premium Models (Paid)
                         </div>
                         {filteredModels.filter(model => paidModels.some(pm => pm.id === model.id)).slice(0, 5).map((model) => (
                           <div
                             key={model.id}
                             className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 hover:border-blue-300 hover:bg-blue-50/50 ${
                               settings.model === model.id 
                                 ? 'border-blue-500 bg-blue-50' 
                                 : 'border-gray-200'
                             }`}
                             onClick={() => handleModelSelect(model.id)}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium text-sm text-gray-900">{model.name}</h4>
                                  <Badge variant="outline" className="text-xs text-blue-600 border-blue-200">
                                    PAID
                                  </Badge>
                                </div>
                                <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                                  {model.description}
                                </p>
                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                  <span>Context: {formatContextLength(model.context_length || 0)}</span>
                                  <span>{formatModelPrice(model)}</span>
                                </div>
                              </div>
                              {settings.model === model.id && (
                                <CheckCircle className="h-4 w-4 text-blue-600" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 text-sm">
                  <Info className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>No models found matching your search.</p>
                </div>
              )}
            </ScrollArea>
            
            <div className="text-xs text-muted-foreground mt-1">
              <Info className="h-3 w-3 inline mr-1" />
              Free models don't require payment. DeepSeek Coder is great for programming help!
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="teachingStyle">Teaching Style</Label>
            <Select
              value={settings.teachingStyle}
              onValueChange={(value) => 
                updateSettings({ teachingStyle: value as 'socratic' | 'direct' | 'guided' })
              }
            >
              <SelectTrigger id="teachingStyle">
                <SelectValue placeholder="Select a teaching style" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="socratic">Socratic (Ask Questions)</SelectItem>
                  <SelectItem value="direct">Direct (Give Answers)</SelectItem>
                  <SelectItem value="guided">Guided (Step by Step)</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="detailLevel">Detail Level</Label>
            <Select
              value={settings.detailLevel}
              onValueChange={(value) => 
                updateSettings({ detailLevel: value as 'basic' | 'intermediate' | 'advanced' })
              }
            >
              <SelectTrigger id="detailLevel">
                <SelectValue placeholder="Select detail level" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <div className="flex justify-between">
              <Label htmlFor="temperature">Response Creativity</Label>
              <span className="text-sm text-gray-500">{settings.temperature?.toFixed(1) || '0.7'}</span>
            </div>
            <Slider
              id="temperature"
              min={0}
              max={1}
              step={0.1}
              value={[settings.temperature || 0.7]}
              onValueChange={([value]) => updateSettings({ temperature: value })}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Focused</span>
              <span>Creative</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="includeExamples">Include Examples</Label>
            <Switch
              id="includeExamples"
              checked={settings.includeExamples}
              onCheckedChange={(checked) => updateSettings({ includeExamples: checked })}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={() => setOpen(false)} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleSaveSettings}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
      )}
    </Dialog>
  );
};

export default AISettingsPanel;