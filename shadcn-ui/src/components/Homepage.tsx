"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, Users, Trophy, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

const features = [
  {
    icon: BookOpen,
    title: 'Workshops & Seminars',
    description: 'Hands-on sessions on AI, Robotics, Web, and more.'
  },
  {
    icon: Users,
    title: 'Networking',
    description: 'Connect with peers, mentors, and industry leaders.'
  },
  {
    icon: Trophy,
    title: 'Competitions',
    description: 'Participate in hackathons and coding challenges.'
  },
  {
    icon: Star,
    title: 'Innovation Projects',
    description: 'Collaborate on real-world tech projects.'
  }
];

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Club Member',
    content: 'Joining the Tech Innovation Club opened doors to amazing projects and friends!',
    rating: 5
  },
  {
    name: 'Mike Chen',
    role: 'Hackathon Winner',
    content: 'The club events are super fun and the mentors are inspiring.',
    rating: 5
  },
  {
    name: 'Emily Rodriguez',
    role: 'ACM Student',
    content: 'I learned so much about AI and robotics. Highly recommend for anyone curious about tech!',
    rating: 5
  }
];

const Homepage: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm tracking-wide mb-2">Tech Innovation Club</span>
            <span className="inline-block px-3 py-1 rounded-full bg-gray-900 text-white text-xs font-bold tracking-widest mb-2 ml-2">Powered by ACM</span>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Unlock Your
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {' '}Innovation Potential
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Join the Tech Innovation Club to explore, build, and innovate with the brightest minds on campus. Attend events, join projects, and connect with ACM’s global network.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
              <Button size="lg" asChild className="text-lg px-8 py-3">
                <Link href="/join">
                  Become a Member
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg px-8 py-3">
                <Link href="/events">View Events</Link>
              </Button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">120+</div>
              <div className="text-gray-600">Resources Shared</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">18+</div>
              <div className="text-gray-600">Events Hosted</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">350+</div>
              <div className="text-gray-600">Active Members</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Join the Club?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
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
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <Card className="h-full text-center border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader>
                      <div className="mx-auto mb-4 p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full w-fit">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-xl font-semibold mb-2">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What Our Members Say
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
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
                <Card className="h-full border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-600 mb-4 italic">"{testimonial.content}"</p>
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-500">{testimonial.role}</div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Join the Tech Innovation Club?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Become a member and unlock exclusive access to events, resources, and the ACM network.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" variant="secondary" asChild className="text-lg px-8 py-3">
                <Link href="/join">Join Now</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg px-8 py-3 border-white text-white hover:bg-white hover:text-blue-600">
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