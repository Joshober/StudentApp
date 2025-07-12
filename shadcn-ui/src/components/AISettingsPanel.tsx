import { useState } from 'react';
import { useAISettings } from '@/context/AISettingsContext';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Settings, Info } from 'lucide-react';
import { OPENROUTER_MODELS, getFreeModels, getPaidModels, formatModelPrice } from '@/lib/openrouter-models';

export const AISettingsPanel = () => {
  const { settings, updateSettings, setApiKey } = useAISettings();
  const [open, setOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  
  const freeModels = getFreeModels();
  const paidModels = getPaidModels();
  
  const handleSaveSettings = () => {
    // If API key was entered, save it
    if (apiKeyInput) {
      setApiKey(apiKeyInput);
    }
    setOpen(false);
  };

  const handleProviderChange = (provider: 'openai' | 'anthropic' | 'openrouter') => {
    updateSettings({ provider });
    // Set default model based on provider
    if (provider === 'openrouter') {
      updateSettings({ model: 'meta-llama/llama-3.2-3b-instruct:free' });
    } else if (provider === 'openai') {
      updateSettings({ model: 'gpt-4o-mini' });
    } else if (provider === 'anthropic') {
      updateSettings({ model: 'claude-3-haiku-20240307' });
    }
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
            <Select
              value={settings.provider}
              onValueChange={handleProviderChange}
            >
              <SelectTrigger id="provider">
                <SelectValue placeholder="Select a provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="openrouter">
                    <div className="flex items-center gap-2">
                      <span>OpenRouter</span>
                      <Badge variant="secondary" className="text-xs">Recommended</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="anthropic">Anthropic</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {settings.provider === 'openrouter' && (
            <div className="grid gap-2">
              <Label htmlFor="model">Model Selection</Label>
              <Select
                value={settings.model}
                onValueChange={(value) => updateSettings({ model: value })}
              >
                <SelectTrigger id="model">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent className="max-h-80">
                  <SelectGroup>
                    <div className="px-2 py-1.5 text-sm font-semibold text-green-600 flex items-center gap-2">
                      <Info className="h-3 w-3" />
                      Free Models
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
                            {model.context_length.toLocaleString()} tokens context
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                  <Separator className="my-2" />
                  <SelectGroup>
                    <div className="px-2 py-1.5 text-sm font-semibold text-blue-600 flex items-center gap-2">
                      <Info className="h-3 w-3" />
                      Premium Models
                    </div>
                    {paidModels.map((model) => (
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
                Free models don't require payment, but may have usage limits.
              </div>
            </div>
          )}

          {settings.provider !== 'openrouter' && (
            <div className="grid gap-2">
              <Label htmlFor="model">Model</Label>
              <Select
                value={settings.model}
                onValueChange={(value) => updateSettings({ model: value })}
              >
                <SelectTrigger id="model">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {settings.provider === 'openai' && (
                      <>
                        <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                        <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                        <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                        <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                      </>
                    )}
                    {settings.provider === 'anthropic' && (
                      <>
                        <SelectItem value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</SelectItem>
                        <SelectItem value="claude-3-haiku-20240307">Claude 3 Haiku</SelectItem>
                        <SelectItem value="claude-3-opus-20240229">Claude 3 Opus</SelectItem>
                      </>
                    )}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="grid gap-2">
            <Label htmlFor="apiKey">
              API Key
              {settings.provider === 'openrouter' && (
                <span className="text-xs text-muted-foreground ml-2">
                  (Get free key at openrouter.ai)
                </span>
              )}
            </Label>
            <Input
              id="apiKey"
              type="password"
              placeholder={
                settings.provider === 'openrouter' 
                  ? "sk-or-v1-..." 
                  : "Enter your API key"
              }
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
            />
            {settings.provider === 'openrouter' && (
              <div className="text-xs text-muted-foreground">
                <a 
                  href="https://openrouter.ai/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Get your free OpenRouter API key here
                </a>
              </div>
            )}
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