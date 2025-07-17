"use client";

import { useState } from 'react';
import { useStudySession } from '@/context/StudySessionContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, BookOpen, Clock } from 'lucide-react';
import { format } from 'date-fns';

const subjects = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Computer Science',
  'English',
  'History',
  'Geography',
  'Economics',
  'Other',
];

export const SessionSelector = () => {
  const { sessions, createSession, selectSession, currentSession } = useStudySession();
  const [newSessionDialogOpen, setNewSessionDialogOpen] = useState(false);
  const [newSessionTitle, setNewSessionTitle] = useState('');
  const [newSessionSubject, setNewSessionSubject] = useState('');

  const handleCreateSession = () => {
    if (!newSessionTitle.trim()) return;
    
    createSession(newSessionTitle, newSessionSubject || undefined);
    setNewSessionDialogOpen(false);
    setNewSessionTitle('');
    setNewSessionSubject('');
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg">Study Sessions</h2>
        <Dialog open={newSessionDialogOpen} onOpenChange={setNewSessionDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              New Session
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Study Session</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Session Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Calculus Homework"
                  value={newSessionTitle}
                  onChange={(e) => setNewSessionTitle(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="subject">Subject (Optional)</Label>
                <Select
                  value={newSessionSubject}
                  onValueChange={setNewSessionSubject}
                >
                  <SelectTrigger id="subject">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setNewSessionDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateSession}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-8 text-gray-500 border rounded-lg p-6">
          <BookOpen className="h-10 w-10 mx-auto mb-2 opacity-50" />
          <p className="font-medium">No Study Sessions Yet</p>
          <p className="text-sm mt-2">Create your first session to get started</p>
          <Button className="mt-4" onClick={() => setNewSessionDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Create First Session
          </Button>
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-200px)]">
          <Accordion type="single" collapsible className="w-full">
            {sessions.map((session) => (
              <AccordionItem 
                value={session.id} 
                key={session.id}
                className={currentSession?.id === session.id ? 'border border-primary rounded-md px-3' : ''}
              >
                <div className="flex items-center">
                  <AccordionTrigger className="flex-1">
                    <div className="text-left">
                      <div>{session.title}</div>
                      {session.subject && (
                        <div className="text-xs text-gray-500">{session.subject}</div>
                      )}
                    </div>
                  </AccordionTrigger>
                  <Button
                    variant={currentSession?.id === session.id ? "secondary" : "ghost"}
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      selectSession(session.id);
                    }}
                  >
                    Open
                  </Button>
                </div>
                <AccordionContent>
                  <div className="py-2 space-y-2 text-sm">
                    <div className="flex items-center text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      {format(new Date(session.createdAt), 'MMM d, yyyy')}
                    </div>
                    <div>
                      <span className="font-medium">Files:</span> {session.files.length}
                    </div>
                    <div>
                      <span className="font-medium">Messages:</span> {session.messages.length}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollArea>
      )}
    </div>
  );
};