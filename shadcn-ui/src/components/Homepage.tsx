"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, BookOpen, Users, Trophy, Star, ChevronRight, Play, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import UpcomingEvents from '@/components/UpcomingEvents';

const features = [
  {
    icon: BookOpen,
    title: 'Workshops & Seminars',
    description: 'Hands-on sessions with tools to prepare you to change the world.',
    color: 'from-blue-500 to-blue-600',
    image: '/images/workshop.jpg'
  },
  {
    icon: Users,
    title: 'Networking',
    description: 'Connect with peers, mentors, and industry leaders.',
    color: 'from-purple-500 to-purple-600',
    image: '/images/networking.jpg'
  },
  {
    icon: Trophy,
    title: 'Competitions',
    description: 'Participate in game jams, hackathons, and coding challenges.',
    color: 'from-green-500 to-green-600',
    image: '/images/competition.jpg'
  },
  {
    icon: Star,
    title: 'Innovation Projects',
    description: 'Collaborate on real-world tech projects.',
    color: 'from-orange-500 to-orange-600',
    image: '/images/innovation.jpg'
  }
];

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Club Member',
    content: 'Joining the Tech Innovation Club opened doors to amazing projects and friends!',
    rating: 5,
    avatar: '/images/avatar-1.jpg',
    initials: 'SJ'
  },
  {
    name: 'Mike Chen',
    role: 'Hackathon Winner',
    content: 'The club events are super fun and the mentors are inspiring.',
    rating: 5,
    avatar: '/images/avatar-2.jpg',
    initials: 'MC'
  },
  {
    name: 'Emily Rodriguez',
    role: 'ACM Student',
    content: 'I learned so much about AI and robotics. Highly recommend for anyone curious about tech!',
    rating: 5,
    avatar: '/images/avatar-3.jpg',
    initials: 'ER'
  }
];

const stats = [
  { number: '120+', label: 'Resources Shared', color: 'text-blue-600' },
  { number: '18+', label: 'Events Hosted', color: 'text-purple-600' },
  { number: '350+', label: 'Active Members', color: 'text-green-600' }
];

const Homepage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50 py-24 px-4">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
        
        {/* Background Decorative Elements */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-left"
            >


              {/* Main Heading */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 leading-tight">
                Unlock Your
                <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Innovation Potential
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-xl text-slate-600 mb-10 leading-relaxed">
                Join the Tech Innovation Club to explore, build, and innovate with the brightest minds on campus. 
                Attend events, join projects, and connect with ACM's global network.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Button size="lg" asChild className="text-lg px-8 py-4 h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  <Link href="/join" className="flex items-center gap-2">
                    Get Started
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-lg px-8 py-4 h-14 border-2 border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 rounded-xl transition-all duration-300">
                  <Link href="/events" className="flex items-center gap-2">
                    <Play className="h-5 w-5" />
                    Check Out Our Events
                  </Link>
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
                    className="text-center"
                  >
                    <div className={`text-3xl font-bold ${stat.color} mb-2`}>{stat.number}</div>
                    <div className="text-slate-600 font-medium text-sm">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

                         {/* Right Hero Image */}
             <motion.div
               initial={{ opacity: 0, x: 30 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.8, delay: 0.2 }}
               className="relative"
             >
               <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                 <div className="aspect-square relative w-full h-96">
                   <img
                     src="/images/compscistockimage.jpg"
                     alt="Computer Science Innovation"
                     className="w-full h-full object-cover"
                   />
                   {/* Overlay for better text readability */}
                   <div className="absolute inset-0 bg-gradient-to-br from-slate-900/20 to-slate-900/40"></div>
                 </div>
               </div>
               
               {/* Floating Elements */}
               <div className="absolute -top-4 -right-4 w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                 <Trophy className="w-8 h-8 text-white" />
               </div>
               <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-green-400 rounded-full flex items-center justify-center shadow-lg">
                 <Users className="w-6 h-6 text-white" />
               </div>
             </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Why Join the Club?
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              The Tech Innovation Club, powered by ACM, is your gateway to hands-on learning, networking, and real-world impact.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                >
                  <Card className="h-full text-center border-0 shadow-lg hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden group">
                    <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                      <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-10`}></div>
                      <div className={`relative p-4 bg-gradient-to-r ${feature.color} rounded-2xl group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <CardHeader className="pb-4">
                      <CardTitle className="text-xl font-bold text-slate-900 mb-3">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="py-24 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Upcoming Events
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Join our workshops, seminars, and networking opportunities to enhance your skills.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <UpcomingEvents limit={3} showViewAll={true} />
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              What Our Members Say
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Hear from students who have transformed their tech journey with us.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full border-0 shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-8">
                    <div className="flex mb-6">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-slate-600 mb-6 italic text-lg leading-relaxed">"{testimonial.content}"</p>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {testimonial.initials}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{testimonial.name}</div>
                        <div className="text-sm text-slate-500">{testimonial.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-slate-900 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-slate-800 [mask-image:linear-gradient(0deg,transparent,white,transparent)] opacity-20"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Join the Tech Innovation Club?
            </h2>
            <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
              Become a member and unlock exclusive access to events, resources, and the ACM network.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" asChild className="text-lg px-8 py-4 h-14 bg-white text-slate-900 hover:bg-slate-100 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                <Link href="/join" className="flex items-center gap-2">
                  Join Now
                  <ChevronRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg px-8 py-4 h-14 border-2 border-slate-600 text-white hover:bg-slate-800 rounded-xl transition-all duration-300">
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Homepage; 