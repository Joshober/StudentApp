"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, ArrowRight, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

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
}

interface UpcomingEventsProps {
  limit?: number;
  showViewAll?: boolean;
  className?: string;
}

const typeColors = {
  workshop: 'bg-blue-100 text-blue-800 border-blue-200',
  seminar: 'bg-green-100 text-green-800 border-green-200',
  networking: 'bg-purple-100 text-purple-800 border-purple-200',
  webinar: 'bg-orange-100 text-orange-800 border-orange-200'
};

const UpcomingEvents: React.FC<UpcomingEventsProps> = ({ 
  limit = 3, 
  showViewAll = true,
  className = ""
}) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUpcomingEvents();
  }, []);

  const fetchUpcomingEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/events?limit=10');
      const data = await response.json();

      if (data.success) {
        // Filter for upcoming events (date >= today) and sort by date
        const today = new Date().toISOString().split('T')[0];
        const upcomingEvents = data.data
          .filter((event: any) => event.date >= today)
          .sort((a: any, b: any) => a.date.localeCompare(b.date))
          .slice(0, limit)
          .map((event: any) => ({
            ...event,
            tags: typeof event.tags === 'string' ? JSON.parse(event.tags) : event.tags
          }));
        
        setEvents(upcomingEvents);
      }
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString; // Keep as is for now, could format if needed
  };

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
          <span className="ml-2 text-gray-600">Loading events...</span>
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className={`${className}`}>
        <Card className="bg-white/90 backdrop-blur-xl border-white/40 shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-xl">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No upcoming events</p>
              <p className="text-sm text-gray-400">Check back soon for new events!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <Card className="bg-white/90 backdrop-blur-xl border-white/40 shadow-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-xl">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              Upcoming Events
            </CardTitle>
            {showViewAll && (
              <Button variant="ghost" size="sm" asChild>
                <Link href="/events" className="flex items-center gap-1 text-blue-600 hover:text-blue-700">
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {events.map((event) => (
              <Link 
                key={event.id} 
                href={`/events/${event.id}`}
                className="block"
              >
                <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group">
                  {/* Event Image */}
                  <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600">
                    {event.image && event.image !== '/api/placeholder/400/250' ? (
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Event Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                          {event.title}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                          {event.description}
                        </p>
                      </div>
                      <Badge className={`flex-shrink-0 ${typeColors[event.type]}`}>
                        {event.type}
                      </Badge>
                    </div>

                    {/* Event Meta */}
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(event.date)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(event.time)}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {event.registered}/{event.capacity}
                      </div>
                    </div>

                    {/* Tags */}
                    {event.tags && event.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {event.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {event.tags.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{event.tags.length - 2} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {showViewAll && events.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/events" className="flex items-center justify-center gap-2">
                  View All Events
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UpcomingEvents;
