"use client";

import { useState, useEffect } from 'react';
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
import { Settings, Info, Loader2 } from 'lucide-react';
import { OPENROUTER_MODELS, getFreeModels, getPaidModels, formatModelPrice } from '@/lib/openrouter-models';

const AISettingsPanel = () => {
  const { settings, updateSettings } = useAISettings();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [apiKeySource, setApiKeySource] = useState<'environment' | 'user' | null>(null);
  const [dynamicModels, setDynamicModels] = useState<any[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [isLoadingApiKey, setIsLoadingApiKey] = useState(false);
  
  // Fallback to static models if dynamic fetch fails
  const freeModels = dynamicModels.length > 0 ? dynamicModels : getFreeModels();
  const paidModels = getPaidModels();

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
      const response = await fetch(`/api/openrouter/models?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        // Deduplicate models by ID to prevent React key conflicts
        const uniqueModels = data.models?.filter((model: any, index: number, self: any[]) => 
          index === self.findIndex((m: any) => m.id === model.id)
        ) || [];
        setDynamicModels(uniqueModels);
      }
    } catch (error) {
      console.error('Failed to fetch dynamic models:', error);
      // Fallback to static models
    } finally {
      setIsLoadingModels(false);
    }
  };
  
  const handleSaveSettings = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-9 w-9">
          <Settings className="h-4 w-4" />
          <span className="sr-only">Settings</span>
        </Button>
      </DialogTrigger>
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
            <Select
              value={settings.model}
              onValueChange={(value) => updateSettings({ model: value })}
            >
              <SelectTrigger id="model">
                <SelectValue placeholder={isLoadingModels ? "Loading models..." : "Select a model"} />
              </SelectTrigger>
              <SelectContent className="max-h-80">
                <SelectGroup>
                  <div className="px-2 py-1.5 text-sm font-semibold text-green-600 flex items-center gap-2">
                    <Info className="h-3 w-3" />
                    Free Models (Recommended)
                    {isLoadingModels && <Loader2 className="h-3 w-3 animate-spin" />}
                  </div>
                  {freeModels.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{model.name}</span>
                          <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                            FREE
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {model.context_length?.toLocaleString() || 'Unknown'} tokens context
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectGroup>
                <Separator className="my-2" />
                <SelectGroup>
                  <div className="px-2 py-1.5 text-sm font-semibold text-blue-600 flex items-center gap-2">
                    <Info className="h-3 w-3" />
                    Premium Models (Paid)
                  </div>
                  {paidModels.slice(0, 5).map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{model.name}</span>
                          <Badge variant="outline" className="text-xs text-blue-600 border-blue-200">
                            PAID
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          <div>{formatModelPrice(model)}</div>
                          <div>{model.context_length.toLocaleString()} tokens context</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
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
    </Dialog>
  );
};

export default AISettingsPanel;