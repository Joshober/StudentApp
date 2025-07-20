"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, Filter, Plus, User, CheckCircle, XCircle, Loader2, AlertCircle, Crown, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: 'workshop' | 'seminar' | 'networking' | 'webinar';
  capacity: number;
  registered: number;
  tags: string[];
  speaker?: string;
  image: string;
  is_approved?: boolean;
  submitter_email?: string;
  submitter_name?: string;
}

// Mock events removed - now using database

const typeColors = {
  workshop: 'bg-blue-100 text-blue-800 border-blue-200',
  seminar: 'bg-green-100 text-green-800 border-green-200',
  networking: 'bg-purple-100 text-purple-800 border-purple-200',
  webinar: 'bg-orange-100 text-orange-800 border-orange-200'
};

const Events: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [pendingEvents, setPendingEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toast } = useToast();

  // Form state for event submission
  const [submitForm, setSubmitForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    type: 'workshop' as 'workshop' | 'seminar' | 'networking' | 'webinar',
    capacity: 50,
    speaker: '',
    tags: '',
    submitterNotes: '',
    imageUrl: '',
    imageFile: null as File | null
  });

  const filteredEvents = React.useMemo(() => {
    let filtered = events.filter(event => 
      selectedType === 'all' || event.type === selectedType
    );

    filtered = filtered.sort((a, b) => {
      if (sortBy === 'date') {
        // Compare ISO strings directly instead of creating Date objects
        return a.date.localeCompare(b.date);
      }
      if (sortBy === 'popularity') return b.registered - a.registered;
      if (sortBy === 'capacity') return (b.capacity - b.registered) - (a.capacity - a.registered);
      return 0;
    });

    return filtered;
  }, [events, selectedType, sortBy]);

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

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedType !== 'all') params.append('type', selectedType);
      
      // Add user context for filtering
      if (currentUser?.email) {
        params.append('userEmail', currentUser.email);
        params.append('isAdmin', isAdmin.toString());
      }

      const response = await fetch(`/api/events?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setEvents(data.data.map((event: any) => ({
          ...event,
          tags: typeof event.tags === 'string' ? JSON.parse(event.tags) : event.tags
        })));
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: "Failed to fetch events",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingEvents = async () => {
    if (!currentUser?.email) return;
    
    try {
      const response = await fetch(`/api/events/pending?userEmail=${currentUser.email}`);
      const data = await response.json();

      if (data.success) {
        setPendingEvents(data.data.map((event: any) => ({
          ...event,
          tags: typeof event.tags === 'string' ? JSON.parse(event.tags) : event.tags
        })));
      }
    } catch (error) {
      console.error('Error fetching pending events:', error);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    fetchEvents();
    if (currentUser) {
      fetchPendingEvents();
    }
  }, [selectedType, currentUser, isAdmin]);

  // Debug log for admin status
  useEffect(() => {
    console.log('isAdmin state changed:', isAdmin);
  }, [isAdmin]);

  const handleSubmitEvent = async (e: React.FormEvent) => {
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

      const response = await fetch('/api/events/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...submitForm,
          image: imageUrl || '/api/placeholder/400/250',
          tags: submitForm.tags.split(',').map(tag => tag.trim())
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Event submitted successfully! It will be reviewed by an admin.",
        });
        setIsSubmitDialogOpen(false);
        setSubmitForm({
          title: '',
          description: '',
          date: '',
          time: '',
          location: '',
          type: 'workshop',
          capacity: 50,
          speaker: '',
          tags: '',
          submitterNotes: '',
          imageUrl: '',
          imageFile: null
        });
        fetchEvents(); // Refresh the list
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to submit event",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error submitting event:', error);
      toast({
        title: "Error",
        description: "Failed to submit event",
        variant: "destructive"
      });
    }
  };

  const handleApproveEvent = async (eventId: string) => {
    setProcessingId(eventId);
    try {
      const response = await fetch('/api/events/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
          userEmail: currentUser?.email
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Event approved successfully",
        });
        fetchEvents();
        fetchPendingEvents();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to approve event",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error approving event:', error);
      toast({
        title: "Error",
        description: "Failed to approve event",
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectEvent = async (eventId: string) => {
    setProcessingId(eventId);
    try {
      const response = await fetch('/api/events/reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
          userEmail: currentUser?.email
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Event rejected successfully",
        });
        fetchEvents();
        fetchPendingEvents();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to reject event",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error rejecting event:', error);
      toast({
        title: "Error",
        description: "Failed to reject event",
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    // Only create Date object for display formatting
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
            className="flex justify-between items-start"
          >
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Upcoming Events</h1>
              <p className="text-lg text-gray-600">Join workshops, seminars, and networking opportunities</p>
            </div>
            
            <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="flex items-center gap-2"
                  disabled={!currentUser}
                  title={!currentUser ? "Please log in to submit events" : ""}
                >
                  <Plus className="h-4 w-4" />
                  Submit Event
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Submit an Event</DialogTitle>
                  <DialogDescription>
                    Share an upcoming event with the community. All submissions will be reviewed.
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmitEvent} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Event Title *</Label>
                      <Input
                        id="title"
                        value={submitForm.title}
                        onChange={(e) => setSubmitForm({...submitForm, title: e.target.value})}
                        placeholder="Enter event title"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="speaker">Speaker/Organizer</Label>
                      <Input
                        id="speaker"
                        value={submitForm.speaker}
                        onChange={(e) => setSubmitForm({...submitForm, speaker: e.target.value})}
                        placeholder="Event speaker or organizer"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={submitForm.description}
                      onChange={(e) => setSubmitForm({...submitForm, description: e.target.value})}
                      placeholder="Describe the event"
                      rows={3}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="date">Date *</Label>
                      <Input
                        id="date"
                        type="date"
                        value={submitForm.date}
                        onChange={(e) => setSubmitForm({...submitForm, date: e.target.value})}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="time">Time *</Label>
                      <Input
                        id="time"
                        type="time"
                        value={submitForm.time}
                        onChange={(e) => setSubmitForm({...submitForm, time: e.target.value})}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="type">Event Type *</Label>
                      <Select value={submitForm.type} onValueChange={(value: any) => setSubmitForm({...submitForm, type: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="workshop">Workshop</SelectItem>
                          <SelectItem value="seminar">Seminar</SelectItem>
                          <SelectItem value="networking">Networking</SelectItem>
                          <SelectItem value="webinar">Webinar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="location">Location *</Label>
                      <Input
                        id="location"
                        value={submitForm.location}
                        onChange={(e) => setSubmitForm({...submitForm, location: e.target.value})}
                        placeholder="Event location or 'Online'"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="capacity">Capacity</Label>
                      <Input
                        id="capacity"
                        type="number"
                        value={submitForm.capacity}
                        onChange={(e) => setSubmitForm({...submitForm, capacity: parseInt(e.target.value)})}
                        placeholder="Maximum attendees"
                        min="1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="tags">Tags</Label>
                    <Input
                      id="tags"
                      value={submitForm.tags}
                      onChange={(e) => setSubmitForm({...submitForm, tags: e.target.value})}
                      placeholder="Comma-separated tags"
                    />
                  </div>

                  <div>
                    <Label htmlFor="image">Event Image</Label>
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

                  <div>
                    <Label htmlFor="submitterNotes">Additional Notes</Label>
                    <Textarea
                      id="submitterNotes"
                      value={submitForm.submitterNotes}
                      onChange={(e) => setSubmitForm({...submitForm, submitterNotes: e.target.value})}
                      placeholder="Any additional information about the event..."
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
                      Submit Event
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </motion.div>
        </div>
      </div>



      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                    <p className="text-amber-600">Review and approve pending events</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                  {pendingEvents.length} pending
                </Badge>
              </div>
              
              {pendingEvents.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Pending Events</h3>
                  <p className="text-gray-600">All events have been reviewed and processed.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingEvents.map((event) => (
                    <Card key={event.id} className="bg-white/80 backdrop-blur-sm border border-amber-200 shadow-sm">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
                              {event.title}
                            </CardTitle>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {formatDate(event.date)}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {event.time}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={typeColors[event.type]}>
                                {event.type}
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
                          <p className="text-gray-700 leading-relaxed">{event.description}</p>
                        </div>

                        {/* Event Image */}
                        {event.image && event.image !== '/api/placeholder/400/250' && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Event Image</h4>
                            <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                              <img
                                src={event.image}
                                alt={event.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Event Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Location</h4>
                            <Badge variant="outline">{event.location}</Badge>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Capacity</h4>
                            <Badge variant="outline">{event.capacity} attendees</Badge>
                          </div>
                        </div>

                        {/* Speaker and Tags */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {event.speaker && (
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Speaker/Organizer</h4>
                              <Badge variant="outline">{event.speaker}</Badge>
                            </div>
                          )}
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
                            <div className="flex flex-wrap gap-1">
                              {event.tags.map((tag) => (
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
                            <span>{event.submitter_name || 'Unknown'}</span>
                            <span>•</span>
                            <span>{event.submitter_email}</span>
                          </div>
                        </div>

                        <Separator />

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                          <Button
                            onClick={() => handleApproveEvent(event.id)}
                            disabled={processingId === event.id}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            {processingId === event.id ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Approving...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve Event
                              </>
                            )}
                          </Button>
                          <Button
                            onClick={() => handleRejectEvent(event.id)}
                            disabled={processingId === event.id}
                            variant="destructive"
                            className="flex-1"
                          >
                            {processingId === event.id ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Rejecting...
                              </>
                            ) : (
                              <>
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject Event
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

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm border p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
            <div className="w-full lg:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">Event Type</label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="workshop">Workshops</SelectItem>
                  <SelectItem value="seminar">Seminars</SelectItem>
                  <SelectItem value="networking">Networking</SelectItem>
                  <SelectItem value="webinar">Webinars</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full lg:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="popularity">Popularity</SelectItem>
                  <SelectItem value="capacity">Available Spots</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              onClick={() => {
                setSelectedType('all');
                setSortBy('date');
              }}
              className="w-full lg:w-auto"
            >
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </motion.div>

        {/* Events Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-gray-600">Loading events...</span>
            </div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-600">No approved events are currently available.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300 border-0 shadow-md overflow-hidden">
                <div className="aspect-[2/1] relative overflow-hidden">
                  {event.image && event.image !== '/api/placeholder/400/250' ? (
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to placeholder if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.src = '/api/placeholder/400/250';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                      <Calendar className="h-12 w-12 text-white" />
                    </div>
                  )}
                  <Badge className={`absolute top-4 right-4 ${typeColors[event.type]}`}>
                    {event.type}
                  </Badge>
                </div>

                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-xl font-semibold leading-tight">
                      {event.title}
                    </CardTitle>
                  </div>
                  <CardDescription className="text-gray-600 mt-2">
                    {event.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                      {formatDate(event.date)}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-4 w-4 mr-2 text-green-500" />
                      {event.time}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 text-red-500" />
                      {event.location}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Users className="h-4 w-4 mr-2 text-purple-500" />
                      {event.registered}/{event.capacity} registered
                    </div>
                  </div>

                  {event.speaker && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Speaker:</span> {event.speaker}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-4">
                    <div className="text-sm text-gray-600">
                      {event.capacity - event.registered} spots remaining
                    </div>
                    <Button size="sm">
                      Register Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        )}
      </div>
    </div>
  );
};

export default Events; 