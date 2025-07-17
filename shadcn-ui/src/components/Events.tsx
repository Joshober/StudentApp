"use client";

import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Users, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';

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

const mockEvents: Event[] = [
  {
    id: '1',
    title: 'React Advanced Patterns Workshop',
    description: 'Deep dive into advanced React patterns including compound components, render props, and custom hooks.',
    date: '2025-07-20',
    time: '14:00',
    location: 'Tech Hub, Room 201',
    type: 'workshop',
    capacity: 30,
    registered: 22,
    tags: ['React', 'JavaScript', 'Advanced'],
    speaker: 'Sarah Johnson',
    image: '/api/placeholder/400/250'
  },
  {
    id: '2',
    title: 'UX Design Fundamentals',
    description: 'Learn the core principles of user experience design and how to apply them in real projects.',
    date: '2025-07-22',
    time: '18:00',
    location: 'Online',
    type: 'webinar',
    capacity: 100,
    registered: 67,
    tags: ['UX', 'Design', 'Beginner'],
    speaker: 'Mike Chen',
    image: '/api/placeholder/400/250'
  },
  {
    id: '3',
    title: 'Data Science Career Panel',
    description: 'Industry professionals share insights about breaking into data science careers.',
    date: '2025-07-25',
    time: '19:00',
    location: 'Main Auditorium',
    type: 'seminar',
    capacity: 150,
    registered: 89,
    tags: ['Data Science', 'Career', 'Panel'],
    image: '/api/placeholder/400/250'
  },
  {
    id: '4',
    title: 'Startup Networking Mixer',
    description: 'Connect with entrepreneurs, investors, and fellow startup enthusiasts in a casual setting.',
    date: '2025-07-28',
    time: '17:30',
    location: 'Innovation Center Lobby',
    type: 'networking',
    capacity: 80,
    registered: 45,
    tags: ['Networking', 'Startup', 'Business'],
    image: '/api/placeholder/400/250'
  },
  {
    id: '5',
    title: 'Machine Learning Bootcamp',
    description: 'Intensive 2-day bootcamp covering ML fundamentals and practical applications.',
    date: '2025-08-01',
    time: '09:00',
    location: 'Computer Lab A',
    type: 'workshop',
    capacity: 25,
    registered: 18,
    tags: ['Machine Learning', 'Python', 'Intensive'],
    speaker: 'Dr. Emily Rodriguez',
    image: '/api/placeholder/400/250'
  },
  {
    id: '6',
    title: 'Digital Marketing Strategy',
    description: 'Learn how to create effective digital marketing campaigns for modern businesses.',
    date: '2025-08-05',
    time: '16:00',
    location: 'Online',
    type: 'webinar',
    capacity: 200,
    registered: 134,
    tags: ['Marketing', 'Digital', 'Strategy'],
    speaker: 'Alex Thompson',
    image: '/api/placeholder/400/250'
  }
];

const typeColors = {
  workshop: 'bg-blue-100 text-blue-800 border-blue-200',
  seminar: 'bg-green-100 text-green-800 border-green-200',
  networking: 'bg-purple-100 text-purple-800 border-purple-200',
  webinar: 'bg-orange-100 text-orange-800 border-orange-200'
};

const Events: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');

  const filteredEvents = React.useMemo(() => {
    let filtered = mockEvents.filter(event => 
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
  }, [selectedType, sortBy]);

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
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Upcoming Events</h1>
            <p className="text-lg text-gray-600">Join workshops, seminars, and networking opportunities</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                <div className="aspect-[2/1] bg-gradient-to-r from-blue-500 to-purple-600 relative">
                  <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                    <Calendar className="h-12 w-12 text-white" />
                  </div>
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

        {filteredEvents.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-600">Try adjusting your filters to see more events.</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Events; 