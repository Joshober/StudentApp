"use client";

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import { OpenRouterModels } from '@/components/OpenRouterModels';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Zap, Search, Info } from 'lucide-react';

const ModelsPage: React.FC = () => {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!user && !isLoading) {
      router.push('/auth/signin');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
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
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-2xl">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  AI Models
                </h1>
                <p className="text-slate-600 text-lg mt-2">
                  Discover and explore free AI models from OpenRouter
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Info className="h-5 w-5 text-blue-600" />
              About OpenRouter Models
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 bg-white/80 rounded-lg border border-blue-200">
                <Zap className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-medium text-sm">Free Models</div>
                  <div className="text-xs text-gray-600">No cost to use</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/80 rounded-lg border border-blue-200">
                <Search className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-medium text-sm">Search & Filter</div>
                  <div className="text-xs text-gray-600">Find the perfect model</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/80 rounded-lg border border-blue-200">
                <Brain className="h-5 w-5 text-purple-600" />
                <div>
                  <div className="font-medium text-sm">Real-time Credits</div>
                  <div className="text-xs text-gray-600">Track your usage</div>
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-600 bg-white/60 p-4 rounded-lg border border-blue-200">
              <p className="mb-2">
                <strong>How it works:</strong> OpenRouter provides access to hundreds of AI models from various providers. 
                Free models are available without any cost, while paid models require credits.
              </p>
              <p>
                <strong>Credits:</strong> Your OpenRouter account comes with free credits that can be used for paid models. 
                Free models don't consume credits and are always available.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Models Component */}
        <OpenRouterModels />
      </div>
    </div>
  );
};

export default ModelsPage; 