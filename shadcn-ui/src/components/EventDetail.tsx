"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  User, 
  Tag,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Loader2,
  ExternalLink,
  Mail,
  Phone,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  contact_email?: string;
  contact_phone?: string;
  website?: string;
  additional_info?: string;
}

const typeColors = {
  workshop: 'bg-blue-100 text-blue-800 border-blue-200',
  seminar: 'bg-green-100 text-green-800 border-green-200',
  networking: 'bg-purple-100 text-purple-800 border-purple-200',
  webinar: 'bg-orange-100 text-orange-800 border-orange-200'
};

interface EventDetailProps {
  eventId: string;
}

const EventDetail: React.FC<EventDetailProps> = ({ eventId }) => {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registering, setRegistering] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  // Edit form state
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    type: 'workshop' as 'workshop' | 'seminar' | 'networking' | 'webinar',
    capacity: 50,
    speaker: '',
    tags: '',
    contact_email: '',
    contact_phone: '',
    website: '',
    additional_info: ''
  });

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/events/${eventId}`);
      const data = await response.json();

      if (data.success) {
        const eventData = {
          ...data.data,
          tags: typeof data.data.tags === 'string' ? JSON.parse(data.data.tags) : data.data.tags
        };
        setEvent(eventData);
        setEditForm({
          title: eventData.title,
          description: eventData.description,
          date: eventData.date,
          time: eventData.time,
          location: eventData.location,
          type: eventData.type,
          capacity: eventData.capacity,
          speaker: eventData.speaker || '',
          tags: Array.isArray(eventData.tags) ? eventData.tags.join(', ') : eventData.tags,
          contact_email: eventData.contact_email || '',
          contact_phone: eventData.contact_phone || '',
          website: eventData.website || '',
          additional_info: eventData.additional_info || ''
        });

        // Check if current user is registered for this event
        if (currentUser?.email) {
          const registrationResponse = await fetch(`/api/events/check-registration?eventId=${eventId}&userEmail=${currentUser.email}`);
          const registrationData = await registrationResponse.json();
          if (registrationData.success) {
            setIsRegistered(registrationData.isRegistered);
          }
        }
      } else {
        toast({
          title: "Error",
          description: "Event not found",
          variant: "destructive"
        });
        router.push('/events');
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      toast({
        title: "Error",
        description: "Failed to fetch event",
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
        if (event) {
          setIsOwner(data.user.email === event.submitter_email);
          setIsAdmin(data.user.role === 'admin' || data.user.is_admin);
        }
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const handleRegister = async () => {
    if (!currentUser) {
      toast({
        title: "Error",
        description: "Please log in to register for events",
        variant: "destructive"
      });
      return;
    }

    setRegistering(true);
    try {
      const response = await fetch('/api/events/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
          userEmail: currentUser.email
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Successfully registered for the event!",
        });
        setIsRegistered(true);
        fetchEvent(); // Refresh event data to update registration count
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to register for event",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error registering for event:', error);
      toast({
        title: "Error",
        description: "Failed to register for event",
        variant: "destructive"
      });
    } finally {
      setRegistering(false);
    }
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`/api/events/${eventId}`, {
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
          description: "Event updated successfully",
        });
        setIsEditDialogOpen(false);
        fetchEvent(); // Refresh the data
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update event",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating event:', error);
      toast({
        title: "Error",
        description: "Failed to update event",
        variant: "destructive"
      });
    }
  };

  const handleDeleteEvent = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Event deleted successfully",
        });
        router.push('/events');
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to delete event",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchEvent();
    fetchCurrentUser();
  }, [eventId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading event...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Event not found</h2>
          <p className="text-gray-600 mb-4">The event you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/events')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isEventFull = event.registered >= event.capacity;
  const spotsRemaining = event.capacity - event.registered;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => router.push('/events')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Events
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
                <p className="text-gray-600">
                  {event.speaker && `by ${event.speaker}`}
                  {!event.speaker && `Organized by ${event.submitter_name || 'Community'}`}
                </p>
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
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Edit Event</DialogTitle>
                        <DialogDescription>
                          Update the event information.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <form onSubmit={handleUpdateEvent} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="edit-title">Event Title *</Label>
                            <Input
                              id="edit-title"
                              value={editForm.title}
                              onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                              required
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="edit-speaker">Speaker/Organizer</Label>
                            <Input
                              id="edit-speaker"
                              value={editForm.speaker}
                              onChange={(e) => setEditForm({...editForm, speaker: e.target.value})}
                              placeholder="Event speaker or organizer"
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
                            <Label htmlFor="edit-date">Date *</Label>
                            <Input
                              id="edit-date"
                              type="date"
                              value={editForm.date}
                              onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                              required
                            />
                          </div>

                          <div>
                            <Label htmlFor="edit-time">Time *</Label>
                            <Input
                              id="edit-time"
                              type="time"
                              value={editForm.time}
                              onChange={(e) => setEditForm({...editForm, time: e.target.value})}
                              required
                            />
                          </div>

                          <div>
                            <Label htmlFor="edit-type">Event Type *</Label>
                            <Select value={editForm.type} onValueChange={(value: any) => setEditForm({...editForm, type: value})}>
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
                            <Label htmlFor="edit-location">Location *</Label>
                            <Input
                              id="edit-location"
                              value={editForm.location}
                              onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                              placeholder="Event location or 'Online'"
                              required
                            />
                          </div>

                          <div>
                            <Label htmlFor="edit-capacity">Capacity</Label>
                            <Input
                              id="edit-capacity"
                              type="number"
                              value={editForm.capacity}
                              onChange={(e) => setEditForm({...editForm, capacity: parseInt(e.target.value)})}
                              placeholder="Maximum attendees"
                              min="1"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="edit-tags">Tags</Label>
                          <Input
                            id="edit-tags"
                            value={editForm.tags}
                            onChange={(e) => setEditForm({...editForm, tags: e.target.value})}
                            placeholder="Comma-separated tags"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="edit-contact-email">Contact Email</Label>
                            <Input
                              id="edit-contact-email"
                              type="email"
                              value={editForm.contact_email}
                              onChange={(e) => setEditForm({...editForm, contact_email: e.target.value})}
                              placeholder="Contact email for questions"
                            />
                          </div>

                          <div>
                            <Label htmlFor="edit-contact-phone">Contact Phone</Label>
                            <Input
                              id="edit-contact-phone"
                              value={editForm.contact_phone}
                              onChange={(e) => setEditForm({...editForm, contact_phone: e.target.value})}
                              placeholder="Contact phone number"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="edit-website">Website</Label>
                          <Input
                            id="edit-website"
                            type="url"
                            value={editForm.website}
                            onChange={(e) => setEditForm({...editForm, website: e.target.value})}
                            placeholder="Event website URL"
                          />
                        </div>

                        <div>
                          <Label htmlFor="edit-additional-info">Additional Information</Label>
                          <Textarea
                            id="edit-additional-info"
                            value={editForm.additional_info}
                            onChange={(e) => setEditForm({...editForm, additional_info: e.target.value})}
                            placeholder="Any additional information about the event..."
                            rows={3}
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
                            Update Event
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
                        <DialogTitle>Delete Event</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to delete this event? This action cannot be undone.
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
                          onClick={handleDeleteEvent}
                        >
                          Delete Event
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </>
              )}
              
              <Button 
                onClick={handleRegister}
                disabled={isEventFull || isRegistered || registering || !currentUser}
                className="min-w-[140px]"
              >
                {registering ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Registering...
                  </>
                ) : isRegistered ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Registered
                  </>
                ) : isEventFull ? (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Event Full
                  </>
                ) : (
                  <>
                    <Users className="h-4 w-4 mr-2" />
                    Register Now
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card>
                <div className="aspect-[2/1] relative overflow-hidden">
                  {event.image && event.image !== '/api/placeholder/400/250' ? (
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
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
              </Card>
            </motion.div>

            {/* Event Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">{event.title}</CardTitle>
                  <CardDescription className="text-lg">
                    {event.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Event Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-blue-500" />
                      <span className="text-sm text-gray-600">{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-green-500" />
                      <span className="text-sm text-gray-600">{event.time}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-5 w-5 text-red-500" />
                      <span className="text-sm text-gray-600">{event.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-purple-500" />
                      <span className="text-sm text-gray-600">
                        {event.registered}/{event.capacity} registered
                      </span>
                    </div>
                  </div>

                  {/* Tags */}
                  {event.tags && event.tags.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <Tag className="h-4 w-4 mr-1" />
                        Tags
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {event.tags.map((tag) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Additional Information */}
                  {event.additional_info && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Additional Information</h3>
                      <p className="text-gray-600 leading-relaxed">{event.additional_info}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Registration Status */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Registration Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Available Spots:</span>
                    <Badge variant={isEventFull ? "destructive" : "secondary"}>
                      {spotsRemaining} remaining
                    </Badge>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(event.registered / event.capacity) * 100}%` }}
                    ></div>
                  </div>
                  
                  <div className="text-center text-sm text-gray-600">
                    {event.registered} of {event.capacity} spots filled
                  </div>

                  <Button 
                    onClick={handleRegister}
                    disabled={isEventFull || isRegistered || registering || !currentUser}
                    className="w-full"
                  >
                    {registering ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Registering...
                      </>
                    ) : isRegistered ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Already Registered
                      </>
                    ) : isEventFull ? (
                      <>
                        <XCircle className="h-4 w-4 mr-2" />
                        Event Full
                      </>
                    ) : !currentUser ? (
                      <>
                        <User className="h-4 w-4 mr-2" />
                        Login to Register
                      </>
                    ) : (
                      <>
                        <Users className="h-4 w-4 mr-2" />
                        Register Now
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Event Information */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Event Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Type:</span>
                    <Badge className={typeColors[event.type]}>
                      {event.type}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Date:</span>
                    <span className="text-sm font-medium">{formatDate(event.date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Time:</span>
                    <span className="text-sm font-medium">{event.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Location:</span>
                    <span className="text-sm font-medium">{event.location}</span>
                  </div>
                  {event.speaker && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Speaker:</span>
                      <span className="text-sm font-medium">{event.speaker}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact Information */}
            {(event.contact_email || event.contact_phone || event.website) && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {event.contact_email && (
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <a 
                          href={`mailto:${event.contact_email}`}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {event.contact_email}
                        </a>
                      </div>
                    )}
                    {event.contact_phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <a 
                          href={`tel:${event.contact_phone}`}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {event.contact_phone}
                        </a>
                      </div>
                    )}
                    {event.website && (
                      <div className="flex items-center space-x-2">
                        <Globe className="h-4 w-4 text-gray-400" />
                        <a 
                          href={event.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          Visit Website
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
