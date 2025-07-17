"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

const TestAuthPage: React.FC = () => {
  const { user, signIn, signUp, logout } = useAuth();

  const handleTestSignIn = async () => {
    try {
      await signIn('test@example.com', 'password123');
      console.log('Test sign in successful');
    } catch (error) {
      console.error('Test sign in failed:', error);
    }
  };

  const handleTestSignUp = async () => {
    try {
      await signUp('newuser@example.com', 'password123', 'Test User');
      console.log('Test sign up successful');
    } catch (error) {
      console.error('Test sign up failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Auth Test Page</h1>
        
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="font-semibold mb-2">Current User:</h2>
            <pre className="text-sm">{user ? JSON.stringify(user, null, 2) : 'Not signed in'}</pre>
          </div>
          
          <div className="space-y-2">
            <Button onClick={handleTestSignIn} className="w-full">
              Test Sign In
            </Button>
            <Button onClick={handleTestSignUp} className="w-full">
              Test Sign Up
            </Button>
            <Button onClick={logout} variant="outline" className="w-full">
              Logout
            </Button>
          </div>
          
          <div className="pt-4 border-t">
            <Link href="/auth/signin">
              <Button variant="ghost" className="w-full">
                Go to Sign In Page
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button variant="ghost" className="w-full">
                Go to Register Page
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestAuthPage; 