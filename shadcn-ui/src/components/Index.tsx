"use client";

import React, { useState } from 'react';
import { BookOpen, Clock, Target, TrendingUp, Play, Pause, Square, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

interface StudySession {
  id: string;
  title: string;
  duration: number; // in minutes
  completed: number; // in minutes
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'not-started' | 'in-progress' | 'completed';
  lastStudied?: string; // Changed from Date to string
}

const mockStudySessions: StudySession[] = [
  {
    id: '1',
    title: 'React Fundamentals',
    duration: 120,
    completed: 45,
    subject: 'Programming',
    difficulty: 'medium',
    status: 'in-progress',
    lastStudied: '2024-01-15T00:00:00.000Z'
  },
  {
    id: '2',
    title: 'Advanced CSS Techniques',
    duration: 90,
    completed: 90,
    subject: 'Design',
    difficulty: 'hard',
    status: 'completed',
    lastStudied: '2024-01-10T00:00:00.000Z'
  },
  {
    id: '3',
    title: 'Data Science Basics',
    duration: 180,
    completed: 0,
    subject: 'Data Science',
    difficulty: 'easy',
    status: 'not-started'
  },
  {
    id: '4',
    title: 'UX Design Principles',
    duration: 60,
    completed: 30,
    subject: 'Design',
    difficulty: 'medium',
    status: 'in-progress',
    lastStudied: '2024-01-12T00:00:00.000Z'
  }
];

const difficultyColors = {
  easy: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  hard: 'bg-red-100 text-red-800 border-red-200'
};

const statusColors = {
  'not-started': 'bg-gray-100 text-gray-800 border-gray-200',
  'in-progress': 'bg-blue-100 text-blue-800 border-blue-200',
  'completed': 'bg-green-100 text-green-800 border-green-200'
};

const Index: React.FC = () => {
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const totalStudyTime = mockStudySessions.reduce((acc, session) => acc + session.completed, 0);
  const completedSessions = mockStudySessions.filter(session => session.status === 'completed').length;
  const inProgressSessions = mockStudySessions.filter(session => session.status === 'in-progress').length;

  const startSession = (sessionId: string) => {
    setActiveSession(sessionId);
    setIsRunning(true);
  };

  const pauseSession = () => {
    setIsRunning(false);
  };

  const stopSession = () => {
    setActiveSession(null);
    setIsRunning(false);
    setTimer(0);
  };

  const resetSession = () => {
    setTimer(0);
  };

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Study Dashboard</h1>
            <p className="text-lg text-gray-600">Track your learning progress and manage study sessions</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Study Time</p>
                  <p className="text-2xl font-bold text-gray-900">{Math.floor(totalStudyTime / 60)}h {totalStudyTime % 60}m</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-full">
                  <Target className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed Sessions</p>
                  <p className="text-2xl font-bold text-gray-900">{completedSessions}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900">{inProgressSessions}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-full">
                  <BookOpen className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                  <p className="text-2xl font-bold text-gray-900">{mockStudySessions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Active Session Timer */}
        {activeSession && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-md border p-6 mb-8"
          >
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Active Study Session</h3>
              <div className="text-4xl font-mono font-bold text-blue-600 mb-6">
                {formatTime(timer)}
              </div>
              <div className="flex justify-center gap-4">
                {!isRunning ? (
                  <Button onClick={() => setIsRunning(true)} size="lg">
                    <Play className="h-4 w-4 mr-2" />
                    Resume
                  </Button>
                ) : (
                  <Button onClick={pauseSession} size="lg" variant="outline">
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </Button>
                )}
                <Button onClick={stopSession} size="lg" variant="outline">
                  <Square className="h-4 w-4 mr-2" />
                  Stop
                </Button>
                <Button onClick={resetSession} size="lg" variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Study Sessions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {mockStudySessions.map((session, index) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl font-semibold">{session.title}</CardTitle>
                      <CardDescription className="text-gray-600 mt-1">
                        {session.subject}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={difficultyColors[session.difficulty]}>
                        {session.difficulty}
                      </Badge>
                      <Badge className={statusColors[session.status]}>
                        {session.status.replace('-', ' ')}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="text-gray-900">{Math.round((session.completed / session.duration) * 100)}%</span>
                    </div>
                    <Progress value={(session.completed / session.duration) * 100} className="h-2" />
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{session.completed} min completed</span>
                      <span>{session.duration} min total</span>
                    </div>
                  </div>

                  {session.lastStudied && (
                    <div className="text-sm text-gray-600">
                      Last studied: {new Date(session.lastStudied).toLocaleDateString()}
                    </div>
                  )}

                  <div className="flex gap-2">
                    {session.status === 'not-started' && (
                      <Button 
                        onClick={() => startSession(session.id)}
                        className="flex-1"
                        size="sm"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Start Session
                      </Button>
                    )}
                    {session.status === 'in-progress' && (
                      <Button 
                        onClick={() => startSession(session.id)}
                        className="flex-1"
                        size="sm"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Continue
                      </Button>
                    )}
                    {session.status === 'completed' && (
                      <Button 
                        variant="outline"
                        className="flex-1"
                        size="sm"
                      >
                        <BookOpen className="h-4 w-4 mr-2" />
                        Review
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8"
        >
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Start a new study session or review your progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button size="lg">
                  <BookOpen className="h-4 w-4 mr-2" />
                  New Study Session
                </Button>
                <Button size="lg" variant="outline">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Progress Report
                </Button>
                <Button size="lg" variant="outline">
                  <Target className="h-4 w-4 mr-2" />
                  Set Study Goals
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Index; 