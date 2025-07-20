"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  User, 
  Key, 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Info,
  ExternalLink,
  Copy,
  Eye,
  EyeOff,
  Loader2,
  Crown
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ProfilePage: React.FC = () => {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [tokenUsage, setTokenUsage] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isUpdatingAdmin, setIsUpdatingAdmin] = useState(false);

  useEffect(() => {
    if (!user && !isLoading) {
      router.push('/auth/signin');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user?.id) {
      fetchTokenUsage();
      checkAdminStatus();
    }
  }, [user?.id]);

  const checkAdminStatus = async () => {
    try {
      const response = await fetch(`/api/user/admin-status?email=${user?.email}`);
      if (response.ok) {
        const data = await response.json();
        setIsAdmin(data.isAdmin);
      } else if (response.status === 404) {
        // User not found in database, create them
        await createUserInDatabase();
      }
    } catch (error) {
      console.error('Failed to check admin status:', error);
    }
  };

  const createUserInDatabase = async () => {
    try {
      const response = await fetch('/api/user/create-in-db', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user?.email,
          name: user?.name
        }),
      });

      if (response.ok) {
        // Retry checking admin status after creating user
        const adminResponse = await fetch(`/api/user/admin-status?email=${user?.email}`);
        if (adminResponse.ok) {
          const data = await adminResponse.json();
          setIsAdmin(data.isAdmin);
        }
      }
    } catch (error) {
      console.error('Failed to create user in database:', error);
    }
  };

  const fetchTokenUsage = async () => {
    try {
      const response = await fetch(`/api/user/token-usage?userId=${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setTokenUsage(data);
      }
    } catch (error) {
      console.error('Failed to fetch token usage:', error);
    }
  };

  const handleUpdateApiKey = async () => {
    if (!user?.id) return;

    setIsUpdating(true);
    setMessage(null);

    try {
      const response = await fetch('/api/user/update-api-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          apiKey: apiKey.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: data.message || 'API key validated and updated successfully!' 
        });
        setApiKey('');
        
        // Show credits info if available
        if (data.credits) {
          console.log('API key credits:', data.credits);
        }
        
        // Refresh user data to get updated API key status
        window.location.reload();
      } else {
        setMessage({ 
          type: 'error', 
          text: data.error || 'Failed to update API key' 
        });
        
        // Show suggestion if available
        if (data.suggestion) {
          console.log('Suggestion:', data.suggestion);
        }
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'Failed to update API key. Please check your internet connection and try again.' 
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setMessage({ type: 'success', text: 'Copied to clipboard!' });
    setTimeout(() => setMessage(null), 2000);
  };

  const handleToggleAdmin = async () => {
    if (!user?.email) return;

    setIsUpdatingAdmin(true);
    setMessage(null);

    try {
      const response = await fetch('/api/user/toggle-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          isAdmin: !isAdmin
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsAdmin(!isAdmin);
        setMessage({ 
          type: 'success', 
          text: data.message || `Successfully ${!isAdmin ? 'granted' : 'revoked'} admin privileges!` 
        });
        
        // Refresh the page to update the user context
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setMessage({ 
          type: 'error', 
          text: data.error || 'Failed to update admin status' 
        });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'Failed to update admin status. Please check your internet connection and try again.' 
      });
    } finally {
      setIsUpdatingAdmin(false);
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

  const formatCredits = (credits: number) => {
    if (credits >= 1000000) {
      return `${(credits / 1000000).toFixed(2)}M`;
    } else if (credits >= 1000) {
      return `${(credits / 1000).toFixed(2)}K`;
    }
    return credits.toFixed(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/50">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-xl">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Profile Settings
                </h1>
                <p className="text-slate-600 text-base mt-1">
                  Manage your account and OpenRouter API key
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mb-6">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <h3 className="font-medium text-slate-800">Understanding Tokens vs Credits</h3>
                  <div className="text-sm text-slate-600 space-y-1">
                    <p><strong>Platform Tokens:</strong> Your usage limit on this platform (10,000 tokens). Each AI request consumes tokens.</p>
                    <p><strong>OpenRouter Credits:</strong> Your personal OpenRouter account credits. Used when you add your own API key.</p>
                    <p><strong>Why Add Your API Key?</strong> Avoid rate limits, get better performance, and use your own OpenRouter credits.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Toggle Section */}
        <div className="mb-6">
          <Card className="bg-white/80 backdrop-blur-sm border border-white/50 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Crown className="h-5 w-5 text-amber-600" />
                Admin Privileges
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-slate-800">Admin Status</h3>
                  <p className="text-sm text-slate-600">
                    {isAdmin 
                      ? 'You have admin privileges. You can approve/reject resources and access admin features.' 
                      : 'You are a regular user. Toggle to gain admin privileges for resource management.'
                    }
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={isAdmin ? "default" : "secondary"} className={isAdmin ? "bg-amber-100 text-amber-800" : ""}>
                    {isAdmin ? 'Admin' : 'User'}
                  </Badge>
                  <Button
                    onClick={handleToggleAdmin}
                    disabled={isUpdatingAdmin}
                    variant={isAdmin ? "destructive" : "default"}
                    size="sm"
                  >
                    {isUpdatingAdmin ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Updating...
                      </>
                    ) : (
                      isAdmin ? 'Remove Admin' : 'Make Admin'
                    )}
                  </Button>
                </div>
              </div>
              
              {isAdmin && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-amber-800">
                      <p className="font-medium mb-1">Admin Features Available:</p>
                      <ul className="space-y-1 text-xs">
                        <li>• Approve or reject pending resources</li>
                        <li>• View all pending resources from all users</li>
                        <li>• Access admin-only sections in the platform</li>
                        <li>• Manage resource approval workflow</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Info */}
          <Card className="bg-white/80 backdrop-blur-sm border border-white/50 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-blue-600" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-slate-600">Name</Label>
                <p className="text-slate-800 font-medium">{user.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-slate-600">Email</Label>
                <p className="text-slate-800 font-medium">{user.email}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-slate-600">Role</Label>
                <Badge variant="secondary" className="mt-1">
                  {user.role || 'student'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* API Key Management */}
          <Card className="bg-white/80 backdrop-blur-sm border border-white/50 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Key className="h-5 w-5 text-amber-600" />
                OpenRouter API Key
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {user.openrouter_api_key ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">API Key Configured</span>
                  </div>
                  <div className="relative">
                    <Input
                      type={showApiKey ? 'text' : 'password'}
                      value={user.openrouter_api_key || ''}
                      readOnly
                      className="pr-20"
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="h-6 w-6 p-0"
                      >
                        {showApiKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(user.openrouter_api_key || '')}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-700">No API Key Configured</span>
                  </div>
                  <p className="text-sm text-slate-600">
                    Add your OpenRouter API key to avoid rate limiting and get better performance.
                  </p>
                </div>
              )}

              <Separator />

              <div className="space-y-3">
                <Label htmlFor="apiKey" className="text-sm font-medium">
                  {user.openrouter_api_key ? 'Update' : 'Add'} API Key
                </Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="sk-or-v1-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="font-mono text-sm"
                />
                <Button
                  onClick={handleUpdateApiKey}
                  disabled={!apiKey.trim() || isUpdating}
                  className="w-full"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Validating API Key...
                    </>
                  ) : (
                    user.openrouter_api_key ? 'Update Key' : 'Add Key'
                  )}
                </Button>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Info className="h-3 w-3" />
                <span>Get your API key from</span>
                <a
                  href="https://openrouter.ai/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  OpenRouter
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <div className="text-xs text-slate-500 mt-2">
                <p>✅ Your API key will be validated against OpenRouter's actual APIs before saving.</p>
                <p>✅ This ensures only working, valid API keys are stored.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Token Usage */}
        {tokenUsage && (
          <Card className="bg-white/80 backdrop-blur-sm border border-white/50 shadow-sm mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5 text-emerald-600" />
                Usage & Credits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Local Token System */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <h3 className="font-medium text-slate-800">Local Token System</h3>
                    <Badge variant="outline" className="text-xs">Platform Limit</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="text-2xl font-bold text-blue-600">{tokenUsage.totalUsed || 0}</div>
                      <div className="text-sm text-slate-600">Tokens Used</div>
                    </div>
                    <div className="text-center p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                      <div className="text-2xl font-bold text-emerald-600">
                        {Math.max(0, 10000 - (tokenUsage.totalUsed || 0))}
                      </div>
                      <div className="text-sm text-slate-600">Tokens Remaining</div>
                    </div>
                    <div className="text-center p-4 bg-slate-50 rounded-lg border border-slate-100">
                      <div className="text-2xl font-bold text-slate-600">
                        {tokenUsage.totalRequests || 0}
                      </div>
                      <div className="text-sm text-slate-600">Total Requests</div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    These are your platform usage limits. Each AI request consumes tokens.
                  </p>
                </div>

                {/* OpenRouter Credits */}
                {user.openrouter_api_key && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <h3 className="font-medium text-slate-800">OpenRouter Credits</h3>
                      <Badge variant="outline" className="text-xs">Your API Key</Badge>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {tokenUsage.openRouterCredits ? 
                            formatCredits(tokenUsage.openRouterCredits.remaining) : 
                            'Check API Key'
                          }
                        </div>
                        <div className="text-sm text-slate-600 mb-2">Credits Remaining</div>
                        <p className="text-xs text-slate-500">
                          These are your OpenRouter account credits. Used when you have your own API key.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Explanation */}
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <h4 className="font-medium text-slate-800 mb-2">How It Works</h4>
                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p><strong>Local Tokens:</strong> Platform usage limit (10,000 tokens). Each AI request consumes tokens.</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p><strong>OpenRouter Credits:</strong> Your personal OpenRouter account credits. Used when you add your own API key.</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p><strong>Priority:</strong> If you have your own API key, it's used first. Otherwise, the server API key is used.</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Message */}
        {message && (
          <Alert className={cn(
            "mt-4",
            message.type === 'success' ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
          )}>
            <AlertDescription className={cn(
              message.type === 'success' ? "text-green-800" : "text-red-800"
            )}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
