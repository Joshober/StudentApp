"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  ExternalLink, 
  Edit, 
  Trash2, 
  Star, 
  Clock, 
  User, 
  Tag,
  Search,
  BookOpen,
  Video,
  FileText,
  Wrench,
  FileText as Article
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
  created_at: string;
  submitter_email?: string;
}

interface WebSearchResult {
  title: string;
  link: string;
  snippet: string;
}

const typeIcons = {
  course: BookOpen,
  video: Video,
  tutorial: FileText,
  article: Article,
  tool: Wrench,
  document: FileText
};

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

interface ResourceDetailProps {
  resourceId: number;
}

const ResourceDetail: React.FC<ResourceDetailProps> = ({ resourceId }) => {
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [webSearchResults, setWebSearchResults] = useState<WebSearchResult[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  // Edit form state
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    level: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    course: '',
    tags: '',
    type: 'course' as 'video' | 'article' | 'tutorial' | 'course' | 'tool',
    duration: '',
    author: '',
    link: ''
  });

  const fetchResource = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/resources/${resourceId}`);
      const data = await response.json();

      if (data.success) {
        const resourceData = {
          ...data.data,
          tags: typeof data.data.tags === 'string' ? JSON.parse(data.data.tags) : data.data.tags
        };
        setResource(resourceData);
        setEditForm({
          title: resourceData.title,
          description: resourceData.description,
          level: resourceData.level,
          course: resourceData.course,
          tags: Array.isArray(resourceData.tags) ? resourceData.tags.join(', ') : resourceData.tags,
          type: resourceData.type,
          duration: resourceData.duration,
          author: resourceData.author,
          link: resourceData.link
        });
      } else {
        toast({
          title: "Error",
          description: "Resource not found",
          variant: "destructive"
        });
        router.push('/resources');
      }
    } catch (error) {
      console.error('Error fetching resource:', error);
      toast({
        title: "Error",
        description: "Failed to fetch resource",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/current-user');
      const data = await response.json();
      if (data.success) {
        setCurrentUser(data.user);
        // Check if user is owner or admin
        if (resource) {
          setIsOwner(data.user.email === resource.submitter_email);
          setIsAdmin(data.user.role === 'admin');
        }
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const performWebSearch = async () => {
    if (!resource) return;
    
    try {
      const response = await fetch('/api/resources/web-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `${resource.title} ${resource.course} tutorial course`
        }),
      });

      const data = await response.json();
      if (data.success) {
        setWebSearchResults(data.results);
      }
    } catch (error) {
      console.error('Error performing web search:', error);
    }
  };

  const handleUpdateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`/api/resources/${resourceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editForm,
          tags: editForm.tags.split(',').map(tag => tag.trim())
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Resource updated successfully",
        });
        setIsEditDialogOpen(false);
        fetchResource(); // Refresh the data
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update resource",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating resource:', error);
      toast({
        title: "Error",
        description: "Failed to update resource",
        variant: "destructive"
      });
    }
  };

  const handleDeleteResource = async () => {
    try {
      const response = await fetch(`/api/resources/${resourceId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Resource deleted successfully",
        });
        router.push('/resources');
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to delete resource",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast({
        title: "Error",
        description: "Failed to delete resource",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchResource();
    fetchCurrentUser();
  }, [resourceId]);

  useEffect(() => {
    if (resource) {
      performWebSearch();
    }
  }, [resource]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading resource...</p>
        </div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Resource not found</h2>
          <p className="text-gray-600 mb-4">The resource you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/resources')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Resources
          </Button>
        </div>
      </div>
    );
  }

  const TypeIcon = typeIcons[resource.type];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => router.push('/resources')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Resources
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{resource.title}</h1>
                <p className="text-gray-600">by {resource.author}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {(isOwner || isAdmin) && (
                <>
                  <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Edit Resource</DialogTitle>
                        <DialogDescription>
                          Update the resource information.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <form onSubmit={handleUpdateResource} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="edit-title">Title *</Label>
                            <Input
                              id="edit-title"
                              value={editForm.title}
                              onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                              required
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="edit-author">Author *</Label>
                            <Input
                              id="edit-author"
                              value={editForm.author}
                              onChange={(e) => setEditForm({...editForm, author: e.target.value})}
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="edit-description">Description *</Label>
                          <Textarea
                            id="edit-description"
                            value={editForm.description}
                            onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                            rows={3}
                            required
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="edit-type">Type *</Label>
                            <Select value={editForm.type} onValueChange={(value: any) => setEditForm({...editForm, type: value})}>
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
                            <Label htmlFor="edit-level">Level *</Label>
                            <Select value={editForm.level} onValueChange={(value: any) => setEditForm({...editForm, level: value})}>
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
                            <Label htmlFor="edit-course">Subject *</Label>
                            <Input
                              id="edit-course"
                              value={editForm.course}
                              onChange={(e) => setEditForm({...editForm, course: e.target.value})}
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="edit-tags">Tags *</Label>
                            <Input
                              id="edit-tags"
                              value={editForm.tags}
                              onChange={(e) => setEditForm({...editForm, tags: e.target.value})}
                              placeholder="Comma-separated tags"
                              required
                            />
                          </div>

                          <div>
                            <Label htmlFor="edit-duration">Duration</Label>
                            <Input
                              id="edit-duration"
                              value={editForm.duration}
                              onChange={(e) => setEditForm({...editForm, duration: e.target.value})}
                              placeholder="e.g., 2 hours"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="edit-link">Resource Link *</Label>
                          <Input
                            id="edit-link"
                            type="url"
                            value={editForm.link}
                            onChange={(e) => setEditForm({...editForm, link: e.target.value})}
                            required
                          />
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsEditDialogOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button type="submit">
                            Update Resource
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Delete Resource</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to delete this resource? This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setIsDeleteDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={handleDeleteResource}
                        >
                          Delete Resource
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </>
              )}
              
              <Button onClick={() => window.open(resource.link, '_blank')}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Visit Resource
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Resource Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <TypeIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl">{resource.title}</CardTitle>
                        <CardDescription className="text-lg">
                          {resource.description}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <Star className="h-5 w-5 text-yellow-500 fill-current" />
                      <span className="text-sm text-gray-600">Rating: {resource.rating}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-blue-500" />
                      <span className="text-sm text-gray-600">Duration: {resource.duration}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="h-5 w-5 text-green-500" />
                      <span className="text-sm text-gray-600">Author: {resource.author}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Tag className="h-4 w-4 mr-1" />
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {resource.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2">
                    <Badge className={typeColors[resource.type]}>
                      {resource.type}
                    </Badge>
                    <Badge className={levelColors[resource.level]}>
                      {resource.level}
                    </Badge>
                    <Badge variant="outline">
                      {resource.course}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Web Search Results */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Search className="h-5 w-5 text-blue-500" />
                    <CardTitle>Related Resources from Web</CardTitle>
                  </div>
                  <CardDescription>
                    Additional learning resources found online related to this topic.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {webSearchResults.length > 0 ? (
                    <div className="space-y-4">
                      {webSearchResults.slice(0, 5).map((result, index) => (
                        <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <h4 className="font-medium text-blue-600 mb-1">
                            <a 
                              href={result.link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="hover:underline"
                            >
                              {result.title}
                            </a>
                          </h4>
                          <p className="text-sm text-gray-600">{result.snippet}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p>Searching for related resources...</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full" 
                    onClick={() => window.open(resource.link, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Visit Resource
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      navigator.clipboard.writeText(resource.link);
                      toast({
                        title: "Link copied",
                        description: "Resource link copied to clipboard",
                      });
                    }}
                  >
                    Copy Link
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Resource Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Resource Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Type:</span>
                    <Badge className={typeColors[resource.type]}>
                      {resource.type}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Level:</span>
                    <Badge className={levelColors[resource.level]}>
                      {resource.level}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Subject:</span>
                    <span className="text-sm font-medium">{resource.course}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Duration:</span>
                    <span className="text-sm font-medium">{resource.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Rating:</span>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 fill-current mr-1" />
                      <span className="text-sm font-medium">{resource.rating}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceDetail; 