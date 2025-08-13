"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Navigation from '@/components/Navigation';
import UpcomingEvents from '@/components/UpcomingEvents';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  BookOpen, 
  Calendar, 
  TrendingUp, 
  Brain,
  Activity,
  Zap,
  AlertCircle
} from 'lucide-react';

interface TokenUsage {
  total_tokens: number;
  total_requests: number;
  model: string;
  date: string;
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [tokenUsage, setTokenUsage] = useState<TokenUsage[]>([]);
  const [totalTokens, setTotalTokens] = useState(0);
  const [tokenStatus, setTokenStatus] = useState<{
    totalUsed: number;
    remaining: number;
    hasTokens: boolean;
    limit: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchTokenUsage();
    }
  }, [user]);

  const fetchTokenUsage = async () => {
    try {
      const [usageResponse, statusResponse] = await Promise.all([
        fetch(`/api/user/token-usage?userId=${user?.id}`),
        fetch(`/api/user/token-status?userId=${user?.id}`)
      ]);
      
      if (usageResponse.ok) {
        const usageData = await usageResponse.json();
        setTokenUsage(usageData.usage || []);
        setTotalTokens(usageData.totalTokens || 0);
      }
      
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        setTokenStatus(statusData);
      }
    } catch (error) {
      console.error('Failed to fetch token data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Please sign in to view your dashboard</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user.name}!
          </h1>
          <p className="text-gray-600">
            Track your progress and manage your learning journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Token Status */}
          <Card className={`${tokenStatus && !tokenStatus.hasTokens ? 'bg-gradient-to-r from-red-500 to-pink-600' : 'bg-gradient-to-r from-green-500 to-emerald-600'} text-white`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/90 text-sm font-medium">Tokens Remaining</p>
                  <p className="text-2xl font-bold">
                    {tokenStatus ? tokenStatus.remaining.toLocaleString() : '...'}
                  </p>
                  {tokenStatus && !tokenStatus.hasTokens && (
                    <p className="text-xs text-white/80 mt-1">No tokens left</p>
                  )}
                </div>
                {tokenStatus && !tokenStatus.hasTokens ? (
                  <AlertCircle className="h-8 w-8 text-white/80" />
                ) : (
                  <Zap className="h-8 w-8 text-white/80" />
                )}
              </div>
            </CardContent>
          </Card>
          {/* AI Usage Stats */}
          <Card className="bg-white/90 backdrop-blur-xl border-white/40 shadow-2xl hover:shadow-3xl transition-all duration-500">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-2 rounded-xl">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                AI Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Tokens Used</span>
                  <span className="font-semibold text-lg">{totalTokens.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Requests</span>
                  <span className="font-semibold text-lg">{tokenUsage.reduce((sum, item) => sum + item.total_requests, 0)}</span>
                </div>
                <div className="pt-2">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.location.href = '/ai-assistant'}
                    disabled={tokenStatus ? !tokenStatus.hasTokens : false}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Use AI Features
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-white/90 backdrop-blur-xl border-white/40 shadow-2xl hover:shadow-3xl transition-all duration-500">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-xl">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => window.location.href = '/ai-assistant'}
                  disabled={tokenStatus ? !tokenStatus.hasTokens : false}
                >
                  <Brain className="h-4 w-4 mr-2" />
                  AI Assistant
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => window.location.href = '/resources'}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Learning Resources
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => window.location.href = '/events'}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Upcoming Events
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-white/90 backdrop-blur-xl border-white/40 shadow-2xl hover:shadow-3xl transition-all duration-500">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-2 rounded-xl">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                Recent AI Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Loading...</p>
                </div>
              ) : tokenUsage.length > 0 ? (
                <div className="space-y-3">
                  {tokenUsage.slice(0, 5).map((usage, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">{usage.model}</p>
                        <p className="text-xs text-gray-500">{usage.date}</p>
                      </div>
                      <Badge variant="secondary">
                        {usage.total_tokens.toLocaleString()} tokens
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Brain className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No AI activity yet</p>
                  <p className="text-xs text-gray-400">Try the homework help feature!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <UpcomingEvents limit={4} showViewAll={true} />
          </div>
          <div className="lg:col-span-1">
            <Card className="bg-white/90 backdrop-blur-xl border-white/40 shadow-2xl h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="bg-gradient-to-r from-orange-500 to-red-600 p-2 rounded-xl">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {tokenStatus ? tokenStatus.remaining.toLocaleString() : '0'}
                    </div>
                    <div className="text-sm text-blue-600">Tokens Available</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {tokenUsage.reduce((sum, item) => sum + item.total_requests, 0)}
                    </div>
                    <div className="text-sm text-green-600">AI Requests Made</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 mb-1">
                      {totalTokens.toLocaleString()}
                    </div>
                    <div className="text-sm text-purple-600">Total Tokens Used</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 