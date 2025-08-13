"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, BookOpen, Video, FileText, Download, Star, Clock, Plus, X, User, CheckCircle, XCircle, Loader2, AlertCircle, Crown, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface Resource {
  id: number;
  title: string;
  description: string;
  type: 'document' | 'video' | 'course' | 'tutorial' | 'article' | 'tool';
  level: 'beginner' | 'intermediate' | 'advanced';
  course: string;
  tags: string[];
  rating: number;
  duration: string;
  author: string;
  thumbnail: string;
  link: string;
  is_approved?: boolean;
  submitter_email?: string;
  submitter_name?: string;
}

const typeColors = {
  document: 'bg-blue-100 text-blue-800 border-blue-200',
  video: 'bg-green-100 text-green-800 border-green-200',
  course: 'bg-purple-100 text-purple-800 border-purple-200',
  tutorial: 'bg-orange-100 text-orange-800 border-orange-200',
  article: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  tool: 'bg-pink-100 text-pink-800 border-pink-200'
};

const levelColors = {
  beginner: 'bg-green-100 text-green-800 border-green-200',
  intermediate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  advanced: 'bg-red-100 text-red-800 border-red-200'
};

const Resources: React.FC = () => {
  const router = useRouter();
  const [resources, setResources] = useState<Resource[]>([]);
  const [pendingResources, setPendingResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPending, setShowPending] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const { toast } = useToast();

  // Form state for resource submission
  const [submitForm, setSubmitForm] = useState({
    title: '',
    description: '',
    level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    course: '',
    tags: '',
    type: 'course' as 'video' | 'article' | 'tutorial' | 'course' | 'tool',
    duration: '',
    author: '',
    link: '',
    submitterNotes: '',
    imageUrl: '',
    imageFile: null as File | null
  });

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/current-user');
      const data = await response.json();
      console.log('Current user data:', data); // Debug log
      if (data.success) {
        setCurrentUser(data.user);
        const adminStatus = data.user.role === 'admin' || data.user.is_admin;
        console.log('Admin status:', adminStatus); // Debug log
        setIsAdmin(adminStatus);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchResources = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedType !== 'all') params.append('type', selectedType);
      if (selectedLevel !== 'all') params.append('level', selectedLevel);
      if (selectedSubject !== 'all') params.append('course', selectedSubject);
      if (searchTerm) params.append('search', searchTerm);
      
      // Add user context for filtering
      if (currentUser?.email) {
        params.append('userEmail', currentUser.email);
        params.append('isAdmin', isAdmin.toString());
        if (showPending) {
          params.append('includePending', 'true');
        }
      }

      const response = await fetch(`/api/resources?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setResources(data.data.map((resource: any) => ({
          ...resource,
          tags: typeof resource.tags === 'string' ? JSON.parse(resource.tags) : resource.tags
        })));
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
      toast({
        title: "Error",
        description: "Failed to fetch resources",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingResources = async () => {
    if (!currentUser?.email) return;
    
    try {
      const response = await fetch('/api/resources/pending');
      const data = await response.json();

      if (data.success) {
        setPendingResources(data.data.map((resource: any) => ({
          ...resource,
          tags: typeof resource.tags === 'string' ? JSON.parse(resource.tags) : resource.tags
        })));
      }
    } catch (error) {
      console.error('Error fetching pending resources:', error);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  // Debug log for admin status
  useEffect(() => {
    console.log('isAdmin state changed:', isAdmin);
  }, [isAdmin]);

  useEffect(() => {
    fetchResources();
    if (currentUser) {
      fetchPendingResources();
    }
  }, [searchTerm, selectedType, selectedLevel, selectedSubject, currentUser, isAdmin, showPending]);

  const handleSubmitResource = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let imageUrl = submitForm.imageUrl;

      // If a file is selected, upload it first
      if (submitForm.imageFile) {
        const formData = new FormData();
        formData.append('image', submitForm.imageFile);

        const uploadResponse = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData,
        });

        const uploadData = await uploadResponse.json();

        if (uploadData.success) {
          imageUrl = uploadData.url;
        } else {
          toast({
            title: "Error",
            description: "Failed to upload image",
            variant: "destructive"
          });
          return;
        }
      }

      const response = await fetch('/api/resources/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...submitForm,
          thumbnail: imageUrl || '/api/placeholder/300/200',
          tags: submitForm.tags.split(',').map(tag => tag.trim())
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Resource submitted successfully! It will be reviewed by an admin.",
        });
        setIsSubmitDialogOpen(false);
        setSubmitForm({
          title: '',
          description: '',
          level: 'beginner',
          course: '',
          tags: '',
          type: 'course',
          duration: '',
          author: '',
          link: '',
          submitterNotes: '',
          imageUrl: '',
          imageFile: null
        });
        fetchResources(); // Refresh the list
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to submit resource",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error submitting resource:', error);
      toast({
        title: "Error",
        description: "Failed to submit resource",
        variant: "destructive"
      });
    }
  };

  const handleApproveResource = async (resourceId: number) => {
    setProcessingId(resourceId);
    try {
      const response = await fetch('/api/resources/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resourceId
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Resource approved successfully",
        });
        fetchResources();
        fetchPendingResources();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to approve resource",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error approving resource:', error);
      toast({
        title: "Error",
        description: "Failed to approve resource",
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectResource = async (resourceId: number) => {
    setProcessingId(resourceId);
    try {
      const response = await fetch('/api/resources/reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resourceId
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Resource rejected successfully",
        });
        fetchResources();
        fetchPendingResources();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to reject resource",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error rejecting resource:', error);
      toast({
        title: "Error",
        description: "Failed to reject resource",
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  const filteredResources = React.useMemo(() => {
    return resources.filter(resource => {
      const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = selectedType === 'all' || resource.type === selectedType;
      const matchesLevel = selectedLevel === 'all' || resource.level === selectedLevel;
      const matchesSubject = selectedSubject === 'all' || resource.course === selectedSubject;
      
      return matchesSearch && matchesType && matchesLevel && matchesSubject;
    });
  }, [resources, searchTerm, selectedType, selectedLevel, selectedSubject]);

  const subjects = React.useMemo(() => {
    const uniqueSubjects = new Set(resources.map(r => r.course));
    return Array.from(uniqueSubjects);
  }, [resources]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-between items-start"
          >
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Learning Resources</h1>
              <p className="text-lg text-gray-600">Discover curated educational materials to accelerate your learning</p>
            </div>
            
            <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="flex items-center gap-2"
                  disabled={!currentUser}
                  title={!currentUser ? "Please log in to submit resources" : ""}
                >
                  <Plus className="h-4 w-4" />
                  Submit Resource
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Submit a Resource</DialogTitle>
                  <DialogDescription>
                    Share a valuable educational resource with the community. All submissions will be reviewed.
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmitResource} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Resource Title *</Label>
                      <Input
                        id="title"
                        value={submitForm.title}
                        onChange={(e) => setSubmitForm({...submitForm, title: e.target.value})}
                        placeholder="Enter resource title"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="author">Author *</Label>
                      <Input
                        id="author"
                        value={submitForm.author}
                        onChange={(e) => setSubmitForm({...submitForm, author: e.target.value})}
                        placeholder="Resource author"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={submitForm.description}
                      onChange={(e) => setSubmitForm({...submitForm, description: e.target.value})}
                      placeholder="Describe the resource"
                      rows={3}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="type">Type *</Label>
                      <Select value={submitForm.type} onValueChange={(value: any) => setSubmitForm({...submitForm, type: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="course">Course</SelectItem>
                          <SelectItem value="tutorial">Tutorial</SelectItem>
                          <SelectItem value="video">Video</SelectItem>
                          <SelectItem value="article">Article</SelectItem>
                          <SelectItem value="tool">Tool</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="level">Level *</Label>
                      <Select value={submitForm.level} onValueChange={(value: any) => setSubmitForm({...submitForm, level: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="course">Subject *</Label>
                      <Input
                        id="course"
                        value={submitForm.course}
                        onChange={(e) => setSubmitForm({...submitForm, course: e.target.value})}
                        placeholder="e.g., programming, design"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tags">Tags *</Label>
                      <Input
                        id="tags"
                        value={submitForm.tags}
                        onChange={(e) => setSubmitForm({...submitForm, tags: e.target.value})}
                        placeholder="Comma-separated tags"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="duration">Duration</Label>
                      <Input
                        id="duration"
                        value={submitForm.duration}
                        onChange={(e) => setSubmitForm({...submitForm, duration: e.target.value})}
                        placeholder="e.g., 2 hours"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="link">Resource Link *</Label>
                    <Input
                      id="link"
                      type="url"
                      value={submitForm.link}
                      onChange={(e) => setSubmitForm({...submitForm, link: e.target.value})}
                      placeholder="https://..."
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="image">Resource Image</Label>
                    <div className="space-y-2">
                      <div>
                        <Label htmlFor="imageUrl" className="text-sm text-gray-600">Image URL (optional)</Label>
                        <Input
                          id="imageUrl"
                          type="url"
                          value={submitForm.imageUrl}
                          onChange={(e) => setSubmitForm({...submitForm, imageUrl: e.target.value})}
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">OR</span>
                      </div>
                      <div>
                        <Label htmlFor="imageFile" className="text-sm text-gray-600">Upload Image (optional)</Label>
                        <Input
                          id="imageFile"
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            setSubmitForm({...submitForm, imageFile: file || null});
                          }}
                        />
                        <p className="text-xs text-gray-500 mt-1">Max 5MB. Supported: JPG, PNG, GIF, WebP</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="submitterName">Your Name</Label>
                      <Input
                        id="submitterName"
                        value={currentUser?.name || 'Not logged in'}
                        disabled
                        placeholder="Your name"
                      />
                      <p className="text-sm text-gray-500 mt-1">Your information will be automatically filled from your account</p>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="submitterNotes">Additional Notes</Label>
                    <Textarea
                      id="submitterNotes"
                      value={submitForm.submitterNotes}
                      onChange={(e) => setSubmitForm({...submitForm, submitterNotes: e.target.value})}
                      placeholder="Any additional information about the resource..."
                      rows={2}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsSubmitDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      Submit Resource
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </motion.div>
        </div>
      </div>



      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm border p-6 mb-8"
        >
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="document">Documents</SelectItem>
                    <SelectItem value="video">Videos</SelectItem>
                    <SelectItem value="course">Courses</SelectItem>
                    <SelectItem value="tutorial">Tutorials</SelectItem>
                    <SelectItem value="article">Articles</SelectItem>
                    <SelectItem value="tool">Tools</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {subjects.map(subject => (
                      <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedType('all');
                    setSelectedLevel('all');
                    setSelectedSubject('all');
                  }}
                  className="flex-1"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
                
                {isAdmin && (
                  <Button
                    variant={showPending ? "default" : "outline"}
                    onClick={() => setShowPending(!showPending)}
                    className="flex-1"
                  >
                    {showPending ? "Hide Pending" : "Show Pending"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Admin Review Section */}
        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8"
          >
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-amber-100 p-2 rounded-lg">
                    <Crown className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-amber-800">Admin Review</h2>
                    <p className="text-amber-600">Review and approve pending resources</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                  {pendingResources.length} pending
                </Badge>
              </div>
              
              {pendingResources.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Pending Resources</h3>
                  <p className="text-gray-600">All resources have been reviewed and processed.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingResources.map((resource) => (
                    <Card key={resource.id} className="bg-white/80 backdrop-blur-sm border border-amber-200 shadow-sm">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                              {resource.title}
                            </CardTitle>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                              <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                {resource.author}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {resource.duration}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={typeColors[resource.type]}>
                                {resource.type}
                              </Badge>
                              <Badge className={levelColors[resource.level]}>
                                {resource.level}
                              </Badge>
                              <Badge variant="outline" className="text-amber-600 border-amber-300">
                                Pending Review
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        {/* Description */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                          <p className="text-gray-700 leading-relaxed">{resource.description}</p>
                        </div>

                        {/* Resource Image */}
                        {resource.thumbnail && resource.thumbnail !== '/api/placeholder/300/200' && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Resource Image</h4>
                            <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                              <img
                                src={resource.thumbnail}
                                alt={resource.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Course and Tags */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Course/Subject</h4>
                            <Badge variant="outline">{resource.course}</Badge>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
                            <div className="flex flex-wrap gap-1">
                              {resource.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Submitter Info */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-medium text-gray-900 mb-2">Submitted By</h4>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <User className="h-4 w-4" />
                            <span>{resource.submitter_name || 'Unknown'}</span>
                            <span>•</span>
                            <span>{resource.submitter_email}</span>
                          </div>
                        </div>

                        {/* Resource Link */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Resource Link</h4>
                          <div className="flex items-center gap-2">
                            <a
                              href={resource.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                            >
                              {resource.link}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        </div>

                        <Separator />

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                          <Button
                            onClick={() => handleApproveResource(resource.id)}
                            disabled={processingId === resource.id}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            {processingId === resource.id ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Approving...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve Resource
                              </>
                            )}
                          </Button>
                          <Button
                            onClick={() => handleRejectResource(resource.id)}
                            disabled={processingId === resource.id}
                            variant="destructive"
                            className="flex-1"
                          >
                            {processingId === resource.id ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Rejecting...
                              </>
                            ) : (
                              <>
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject Resource
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Pending Resources Section */}
        {pendingResources.length > 0 && !isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8"
          >
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-yellow-800">
                    {isAdmin ? 'Pending Resources' : 'Your Pending Resources'}
                  </h2>
                  <p className="text-yellow-600">
                    {isAdmin ? 'Resources waiting for approval' : 'Your submitted resources waiting for admin approval'}
                  </p>
                </div>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  {pendingResources.length} pending
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {pendingResources.map((resource, index) => (
                  <motion.div
                    key={resource.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="bg-white rounded-lg border border-yellow-200 p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{resource.title}</h3>
                        <p className="text-sm text-gray-600">by {resource.author}</p>
                      </div>
                      <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                        Pending
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {resource.description}
                    </p>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className={typeColors[resource.type]}>
                        {resource.type}
                      </Badge>
                      <Badge className={levelColors[resource.level]}>
                        {resource.level}
                      </Badge>
                    </div>
                    
                    {isAdmin && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApproveResource(resource.id)}
                          className="flex-1"
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRejectResource(resource.id)}
                          className="flex-1"
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Resources Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading resources...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredResources.map((resource, index) => (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-0 shadow-md overflow-hidden">
                  <div className="aspect-[2/1] relative overflow-hidden">
                    {resource.thumbnail && resource.thumbnail !== '/api/placeholder/300/200' ? (
                      <img
                        src={resource.thumbnail}
                        alt={resource.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to placeholder if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.src = '/api/placeholder/300/200';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                        <BookOpen className="h-12 w-12 text-white" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4 flex gap-2">
                      <Badge className={typeColors[resource.type]}>
                        {resource.type}
                      </Badge>
                      <Badge className={levelColors[resource.level]}>
                        {resource.level}
                      </Badge>
                      {!resource.is_approved && (
                        <Badge variant="outline" className="text-yellow-600 border-yellow-300 bg-yellow-50">
                          Pending
                        </Badge>
                      )}
                    </div>
                  </div>

                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-xl font-semibold leading-tight">
                        {resource.title}
                      </CardTitle>
                    </div>
                    <CardDescription className="text-gray-600 mt-2">
                      {resource.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-600">
                        <Star className="h-4 w-4 mr-1 text-yellow-500 fill-current" />
                        {resource.rating}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-4 w-4 mr-1 text-blue-500" />
                        {resource.duration}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {resource.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                                      <div className="flex justify-between items-center pt-4">
                    <div className="text-sm text-gray-600">
                      by {resource.author}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => router.push(`/resources/${resource.id}`)}
                      >
                        View Details
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => window.open(resource.link, '_blank')}
                      >
                        Visit Resource
                      </Button>
                    </div>
                  </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && filteredResources.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-gray-500">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
              <p className="text-gray-600">Try adjusting your search or filters to see more resources.</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Resources; 