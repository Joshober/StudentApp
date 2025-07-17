"use client";

import React, { useState } from 'react';
import { Search, Filter, BookOpen, Video, FileText, Download, Star, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'document' | 'video' | 'course' | 'tutorial';
  level: 'beginner' | 'intermediate' | 'advanced';
  subject: string;
  tags: string[];
  rating: number;
  duration: string;
  downloads: number;
  author: string;
  image: string;
}

const mockResources: Resource[] = [
  {
    id: '1',
    title: 'React Fundamentals Course',
    description: 'Complete guide to React basics including components, state, and props.',
    type: 'course',
    level: 'beginner',
    subject: 'Programming',
    tags: ['React', 'JavaScript', 'Frontend'],
    rating: 4.8,
    duration: '6 hours',
    downloads: 1247,
    author: 'Sarah Johnson',
    image: '/api/placeholder/400/250'
  },
  {
    id: '2',
    title: 'Advanced CSS Techniques',
    description: 'Master advanced CSS including Grid, Flexbox, and animations.',
    type: 'tutorial',
    level: 'intermediate',
    subject: 'Design',
    tags: ['CSS', 'Design', 'Frontend'],
    rating: 4.6,
    duration: '3 hours',
    downloads: 892,
    author: 'Mike Chen',
    image: '/api/placeholder/400/250'
  },
  {
    id: '3',
    title: 'Data Science Handbook',
    description: 'Comprehensive guide to data science concepts and tools.',
    type: 'document',
    level: 'advanced',
    subject: 'Data Science',
    tags: ['Python', 'Machine Learning', 'Statistics'],
    rating: 4.9,
    duration: '8 hours',
    downloads: 2156,
    author: 'Dr. Emily Rodriguez',
    image: '/api/placeholder/400/250'
  },
  {
    id: '4',
    title: 'UX Design Principles',
    description: 'Learn the fundamentals of user experience design.',
    type: 'video',
    level: 'beginner',
    subject: 'Design',
    tags: ['UX', 'Design', 'User Research'],
    rating: 4.7,
    duration: '2 hours',
    downloads: 1567,
    author: 'Alex Thompson',
    image: '/api/placeholder/400/250'
  },
  {
    id: '5',
    title: 'Node.js Backend Development',
    description: 'Build scalable backend applications with Node.js and Express.',
    type: 'course',
    level: 'intermediate',
    subject: 'Programming',
    tags: ['Node.js', 'JavaScript', 'Backend'],
    rating: 4.5,
    duration: '10 hours',
    downloads: 987,
    author: 'David Wilson',
    image: '/api/placeholder/400/250'
  },
  {
    id: '6',
    title: 'Machine Learning Basics',
    description: 'Introduction to machine learning algorithms and concepts.',
    type: 'tutorial',
    level: 'intermediate',
    subject: 'Data Science',
    tags: ['Machine Learning', 'Python', 'AI'],
    rating: 4.8,
    duration: '5 hours',
    downloads: 1342,
    author: 'Dr. Emily Rodriguez',
    image: '/api/placeholder/400/250'
  }
];

const typeColors = {
  document: 'bg-blue-100 text-blue-800 border-blue-200',
  video: 'bg-green-100 text-green-800 border-green-200',
  course: 'bg-purple-100 text-purple-800 border-purple-200',
  tutorial: 'bg-orange-100 text-orange-800 border-orange-200'
};

const levelColors = {
  beginner: 'bg-green-100 text-green-800 border-green-200',
  intermediate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  advanced: 'bg-red-100 text-red-800 border-red-200'
};

const Resources: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

  const filteredResources = React.useMemo(() => {
    return mockResources.filter(resource => {
      const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = selectedType === 'all' || resource.type === selectedType;
      const matchesLevel = selectedLevel === 'all' || resource.level === selectedLevel;
      const matchesSubject = selectedSubject === 'all' || resource.subject === selectedSubject;
      
      return matchesSearch && matchesType && matchesLevel && matchesSubject;
    });
  }, [searchTerm, selectedType, selectedLevel, selectedSubject]);

  const subjects = React.useMemo(() => {
    const uniqueSubjects = new Set(mockResources.map(r => r.subject));
    return Array.from(uniqueSubjects);
  }, []);

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
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Learning Resources</h1>
            <p className="text-lg text-gray-600">Discover curated educational materials to accelerate your learning</p>
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

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedType('all');
                    setSelectedLevel('all');
                    setSelectedSubject('all');
                  }}
                  className="w-full"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Resources Grid */}
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
                <div className="aspect-[2/1] bg-gradient-to-r from-blue-500 to-purple-600 relative">
                  <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                    <BookOpen className="h-12 w-12 text-white" />
                  </div>
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Badge className={typeColors[resource.type]}>
                      {resource.type}
                    </Badge>
                    <Badge className={levelColors[resource.level]}>
                      {resource.level}
                    </Badge>
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
                    <div className="flex items-center text-gray-600">
                      <Download className="h-4 w-4 mr-1 text-green-500" />
                      {resource.downloads}
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
                    <Button size="sm">
                      View Resource
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredResources.length === 0 && (
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