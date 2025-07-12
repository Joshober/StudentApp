import React, { useState, useMemo } from 'react';
import { Search, Filter, BookOpen, Users, Code, Palette, Building2, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

interface Resource {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  course: 'programming' | 'design' | 'business' | 'data-science' | 'marketing';
  tags: string[];
  type: 'video' | 'article' | 'tutorial' | 'course' | 'tool';
  duration?: string;
  author: string;
  rating: number;
  thumbnail: string;
  link: string;
}

const mockResources: Resource[] = [
  {
    id: '1',
    title: 'React Fundamentals for Beginners',
    description: 'Learn the basics of React including components, props, and state management.',
    level: 'beginner',
    course: 'programming',
    tags: ['React', 'JavaScript', 'Frontend'],
    type: 'course',
    duration: '4 hours',
    author: 'John Doe',
    rating: 4.8,
    thumbnail: '/api/placeholder/300/200',
    link: '#'
  },
  {
    id: '2',
    title: 'Advanced TypeScript Patterns',
    description: 'Master advanced TypeScript patterns and best practices for enterprise applications.',
    level: 'advanced',
    course: 'programming',
    tags: ['TypeScript', 'Patterns', 'Enterprise'],
    type: 'tutorial',
    duration: '2 hours',
    author: 'Jane Smith',
    rating: 4.9,
    thumbnail: '/api/placeholder/300/200',
    link: '#'
  },
  {
    id: '3',
    title: 'UI/UX Design Principles',
    description: 'Essential design principles for creating user-friendly interfaces.',
    level: 'intermediate',
    course: 'design',
    tags: ['UI/UX', 'Design', 'Principles'],
    type: 'article',
    duration: '1 hour',
    author: 'Mike Johnson',
    rating: 4.7,
    thumbnail: '/api/placeholder/300/200',
    link: '#'
  },
  {
    id: '4',
    title: 'Business Strategy Fundamentals',
    description: 'Learn the core concepts of business strategy and competitive analysis.',
    level: 'beginner',
    course: 'business',
    tags: ['Strategy', 'Business', 'Analysis'],
    type: 'course',
    duration: '6 hours',
    author: 'Sarah Wilson',
    rating: 4.6,
    thumbnail: '/api/placeholder/300/200',
    link: '#'
  },
  {
    id: '5',
    title: 'Data Science with Python',
    description: 'Complete guide to data science using Python, pandas, and machine learning.',
    level: 'intermediate',
    course: 'data-science',
    tags: ['Python', 'Data Science', 'ML'],
    type: 'course',
    duration: '8 hours',
    author: 'David Lee',
    rating: 4.8,
    thumbnail: '/api/placeholder/300/200',
    link: '#'
  },
  {
    id: '6',
    title: 'Digital Marketing Essentials',
    description: 'Master the fundamentals of digital marketing and social media strategy.',
    level: 'beginner',
    course: 'marketing',
    tags: ['Marketing', 'Digital', 'Social Media'],
    type: 'tutorial',
    duration: '3 hours',
    author: 'Emily Chen',
    rating: 4.5,
    thumbnail: '/api/placeholder/300/200',
    link: '#'
  }
];

const levelColors = {
  beginner: 'bg-green-100 text-green-800 border-green-200',
  intermediate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  advanced: 'bg-red-100 text-red-800 border-red-200'
};

const courseIcons = {
  programming: Code,
  design: Palette,
  business: Building2,
  'data-science': GraduationCap,
  marketing: Users
};

const Resources: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('rating');

  const filteredResources = useMemo(() => {
    let filtered = mockResources.filter(resource => {
      const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesLevel = selectedLevel === 'all' || resource.level === selectedLevel;
      const matchesCourse = selectedCourse === 'all' || resource.course === selectedCourse;
      
      return matchesSearch && matchesLevel && matchesCourse;
    });

    // Sort resources
    filtered = filtered.sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'level') {
        const levelOrder = { beginner: 1, intermediate: 2, advanced: 3 };
        return levelOrder[a.level] - levelOrder[b.level];
      }
      return 0;
    });

    return filtered;
  }, [searchTerm, selectedLevel, selectedCourse, sortBy]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedLevel('all');
    setSelectedCourse('all');
    setSortBy('rating');
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
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Learning Resources</h1>
            <p className="text-lg text-gray-600">Discover curated resources to enhance your skills and knowledge</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm border p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
            {/* Search */}
            <div className="flex-1 min-w-0">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Resources</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search by title, description, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Level Filter */}
            <div className="w-full lg:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Course Filter */}
            <div className="w-full lg:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  <SelectItem value="programming">Programming</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="data-science">Data Science</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort */}
            <div className="w-full lg:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="level">Level</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters */}
            <Button
              variant="outline"
              onClick={clearFilters}
              className="w-full lg:w-auto whitespace-nowrap"
            >
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </motion.div>

        {/* Results Summary */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mb-6"
        >
          <p className="text-gray-600">
            Showing {filteredResources.length} of {mockResources.length} resources
          </p>
        </motion.div>

        {/* Resources Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${selectedLevel}-${selectedCourse}-${searchTerm}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredResources.map((resource, index) => {
              const CourseIcon = courseIcons[resource.course];
              return (
                <motion.div
                  key={resource.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <Card className="h-full hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                    <div className="aspect-video bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg relative overflow-hidden">
                      <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                        <CourseIcon className="h-12 w-12 text-white" />
                      </div>
                      <Badge className={`absolute top-3 right-3 ${levelColors[resource.level]}`}>
                        {resource.level}
                      </Badge>
                    </div>
                    
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg font-semibold leading-tight">
                          {resource.title}
                        </CardTitle>
                      </div>
                      <CardDescription className="text-sm text-gray-600 mt-2">
                        {resource.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span className="flex items-center">
                          <BookOpen className="h-4 w-4 mr-1" />
                          {resource.type}
                        </span>
                        {resource.duration && (
                          <span>{resource.duration}</span>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">by {resource.author}</span>
                        <div className="flex items-center">
                          <span className="text-yellow-500 mr-1">★</span>
                          <span className="text-sm font-medium">{resource.rating}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {resource.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {resource.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{resource.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </CardContent>

                    <CardFooter>
                      <Button className="w-full" asChild>
                        <a href={resource.link}>
                          View Resource
                        </a>
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* No Results */}
        {filteredResources.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="text-center py-12"
          >
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No resources found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your filters or search terms to find what you're looking for.
            </p>
            <Button onClick={clearFilters}>Clear all filters</Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Resources;