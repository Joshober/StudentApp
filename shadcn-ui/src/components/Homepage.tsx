"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, BookOpen, Users, Trophy, Star, ChevronRight, Play, Sparkles, Zap, Target, Award, Globe, Mail, CheckCircle, Quote, TrendingUp, Heart, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import UpcomingEvents from '@/components/UpcomingEvents';

const features = [
  {
    icon: BookOpen,
    title: 'Workshops & Seminars',
    description: 'Hands-on sessions with cutting-edge tools and technologies to prepare you for the future.',
    color: 'from-blue-500 to-blue-600',
    image: '/images/workshop.jpg',
    benefits: ['Expert-led sessions', 'Latest tech trends', 'Practical skills']
  },
  {
    icon: Users,
    title: 'Networking',
    description: 'Connect with peers, mentors, and industry leaders from around the globe.',
    color: 'from-purple-500 to-purple-600',
    image: '/images/networking.jpg',
    benefits: ['Industry connections', 'Mentorship opportunities', 'Career guidance']
  },
  {
    icon: Trophy,
    title: 'Competitions',
    description: 'Participate in game jams, hackathons, and coding challenges with amazing prizes.',
    color: 'from-green-500 to-green-600',
    image: '/images/competition.jpg',
    benefits: ['Win prizes', 'Build portfolio', 'Team collaboration']
  },
  {
    icon: Star,
    title: 'Innovation Projects',
    description: 'Collaborate on real-world tech projects that make a difference.',
    color: 'from-orange-500 to-orange-600',
    image: '/images/innovation.jpg',
    benefits: ['Real-world impact', 'Portfolio building', 'Industry experience']
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
  { number: '120+', label: 'Resources Shared', color: 'text-blue-600', icon: BookOpen },
  { number: '18+', label: 'Events Hosted', color: 'text-purple-600', icon: Calendar },
  { number: '350+', label: 'Active Members', color: 'text-green-600', icon: Users },
  { number: '95%', label: 'Success Rate', color: 'text-orange-600', icon: TrendingUp }
];

const benefits = [
  { icon: Zap, text: 'Accelerate your learning with hands-on projects' },
  { icon: Target, text: 'Build a strong portfolio with real-world experience' },
  { icon: Award, text: 'Gain recognition through competitions and achievements' },
  { icon: Globe, text: 'Connect with a global network of tech professionals' }
];

const faqs = [
  {
    question: 'How do I join the Tech Innovation Club?',
    answer: 'Simply click the "Join Now" button and fill out our membership form. It\'s free and takes just a few minutes!'
  },
  {
    question: 'What events do you host?',
    answer: 'We host workshops, seminars, hackathons, networking events, and guest speaker sessions throughout the year.'
  },
  {
    question: 'Do I need prior experience?',
    answer: 'Not at all! We welcome students of all skill levels, from beginners to advanced programmers.'
  },
  {
    question: 'Is membership free?',
    answer: 'Yes! Our club membership is completely free for all students.'
  }
];

const Homepage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 300], [0, -50]);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate newsletter subscription
    setIsSubscribed(true);
    setTimeout(() => setIsSubscribed(false), 3000);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50 py-24 px-4">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
        
        {/* Enhanced Background Decorative Elements */}
        <motion.div 
          className="absolute top-20 right-10 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-20 left-10 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"
          animate={{ 
            scale: [1.1, 1, 1.1],
            opacity: [0.5, 0.3, 0.5]
          }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-green-400/10 to-blue-400/10 rounded-full blur-2xl"
          animate={{ 
            x: [-50, 50, -50],
            y: [-30, 30, -30]
          }}
          transition={{ 
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-left"
            >
              {/* Trust Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-full px-4 py-2 mb-6"
              >
                <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Trusted by 350+ Students
                </Badge>
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span className="text-sm text-slate-600">4.9/5 Rating</span>
              </motion.div>

              {/* Main Heading */}
              <motion.h1 
                className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                Unlock Your
                <motion.span 
                  className="block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent"
                  animate={{ 
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  Innovation Potential
                </motion.span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p 
                className="text-xl text-slate-600 mb-10 leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Join the Tech Innovation Club to explore, build, and innovate with the brightest minds on campus. 
                Attend events, join projects, and connect with ACM's global network.
              </motion.p>

              {/* Benefits List */}
              <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit.text}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                    className="flex items-center gap-3 text-slate-600"
                  >
                    <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <benefit.icon className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-sm">{benefit.text}</span>
                  </motion.div>
                ))}
              </motion.div>

              {/* CTA Buttons */}
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
              >
                <Button size="lg" asChild className="text-lg px-8 py-4 h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <Link href="/join" className="flex items-center gap-2">
                    Get Started
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-lg px-8 py-4 h-14 border-2 border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 rounded-xl transition-all duration-300 group">
                  <Link href="/events" className="flex items-center gap-2">
                    <Play className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    Check Out Our Events
                  </Link>
                </Button>
              </motion.div>

              {/* Enhanced Stats */}
              <motion.div 
                className="grid grid-cols-2 lg:grid-cols-4 gap-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.9 + index * 0.1 }}
                      className="text-center group"
                    >
                      <div className="flex items-center justify-center mb-2">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.color.replace('text-', 'from-').replace('-600', '-500')} to-${stat.color.split('-')[1]}-600`}>
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <div className={`text-2xl font-bold ${stat.color} mb-1 group-hover:scale-110 transition-transform`}>{stat.number}</div>
                      <div className="text-slate-600 font-medium text-xs">{stat.label}</div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </motion.div>

            {/* Right Hero Image */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
              style={{ y }}
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl group">
                <div className="aspect-square relative w-full h-96">
                  <img
                    src="/images/compscistockimage.jpg"
                    alt="Computer Science Innovation"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  {/* Enhanced Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-900/20 to-slate-900/40 group-hover:from-slate-900/10 group-hover:to-slate-900/30 transition-all duration-300"></div>
                  
                  {/* Floating Content Overlay */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 1 }}
                      className="bg-white/90 backdrop-blur-sm rounded-lg p-4"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <Sparkles className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-semibold text-slate-900">Join 350+ Innovators</span>
                      </div>
                      <p className="text-sm text-slate-600">Start your journey today</p>
                    </motion.div>
                  </div>
                </div>
              </div>
              
              {/* Enhanced Floating Elements */}
              <motion.div 
                className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg"
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Trophy className="w-8 h-8 text-white" />
              </motion.div>
              
              <motion.div 
                className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg"
                animate={{ 
                  y: [0, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Users className="w-6 h-6 text-white" />
              </motion.div>

              <motion.div 
                className="absolute top-1/2 -right-2 w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg"
                animate={{ 
                  x: [0, 10, 0],
                  rotate: [0, 180, 360]
                }}
                transition={{ 
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Heart className="w-5 h-5 text-white" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 rounded-full px-4 py-2 mb-6"
            >
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Why Choose Us</span>
            </motion.div>
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
                  <Card className="h-full text-center border-0 shadow-lg hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden group bg-white/80 backdrop-blur-sm">
                    <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden">
                      <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-10 group-hover:opacity-20 transition-opacity duration-300`}></div>
                      <motion.div 
                        className={`relative p-4 bg-gradient-to-r ${feature.color} rounded-2xl group-hover:scale-110 transition-transform duration-300`}
                        whileHover={{ rotate: 5 }}
                      >
                        <Icon className="h-8 w-8 text-white" />
                      </motion.div>
                      
                      {/* Floating particles effect */}
                      <div className="absolute inset-0 pointer-events-none">
                        {[...Array(3)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="absolute w-2 h-2 bg-white/30 rounded-full"
                            style={{
                              left: `${20 + i * 30}%`,
                              top: `${30 + i * 20}%`,
                            }}
                            animate={{
                              y: [0, -20, 0],
                              opacity: [0, 1, 0],
                            }}
                            transition={{
                              duration: 2 + i * 0.5,
                              repeat: Infinity,
                              delay: i * 0.3,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    <CardHeader className="pb-4">
                      <CardTitle className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-slate-600 leading-relaxed mb-4">{feature.description}</p>
                      
                      {/* Benefits list */}
                      <div className="space-y-2">
                        {feature.benefits.map((benefit, benefitIndex) => (
                          <motion.div
                            key={benefit}
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: 0.5 + benefitIndex * 0.1 }}
                            className="flex items-center gap-2 text-sm text-slate-500"
                          >
                            <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                            <span>{benefit}</span>
                          </motion.div>
                        ))}
                      </div>
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
      <section className="py-24 px-4 bg-gradient-to-br from-white to-slate-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-purple-100 text-purple-800 rounded-full px-4 py-2 mb-6"
            >
              <Quote className="h-4 w-4" />
              <span className="text-sm font-medium">Student Stories</span>
            </motion.div>
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
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <Card className="h-full border-0 shadow-lg rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 bg-white/80 backdrop-blur-sm group">
                  <CardContent className="p-8 relative">
                    {/* Quote icon */}
                    <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Quote className="h-12 w-12 text-slate-400" />
                    </div>
                    
                    <div className="flex mb-6">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: 0.5 + i * 0.1 }}
                        >
                          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        </motion.div>
                      ))}
                    </div>
                    
                    <p className="text-slate-600 mb-6 italic text-lg leading-relaxed relative z-10">
                      "{testimonial.content}"
                    </p>
                    
                    <div className="flex items-center gap-4">
                      <motion.div 
                        className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform duration-300"
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        {testimonial.initials}
                      </motion.div>
                      <div>
                        <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {testimonial.name}
                        </div>
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

      {/* FAQ Section */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-green-100 text-green-800 rounded-full px-4 py-2 mb-6"
            >
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Frequently Asked</span>
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Got Questions?
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Find answers to common questions about joining our club.
            </p>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-slate-900 mb-3 text-lg">{faq.question}</h3>
                    <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-24 px-4 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 rounded-full px-4 py-2 mb-6"
            >
              <Mail className="h-4 w-4" />
              <span className="text-sm font-medium">Stay Updated</span>
            </motion.div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Stay in the Loop
            </h2>
            <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
              Get the latest updates on events, workshops, and opportunities delivered to your inbox.
            </p>

            <motion.form
              onSubmit={handleNewsletterSubmit}
              className="max-w-md mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="flex gap-3">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 h-12 rounded-xl border-2 border-slate-200 focus:border-blue-500"
                  required
                />
                <Button
                  type="submit"
                  size="lg"
                  className="h-12 px-8 bg-slate-900 hover:bg-slate-800 text-white rounded-xl"
                  disabled={isSubscribed}
                >
                  {isSubscribed ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <Mail className="h-5 w-5" />
                  )}
                </Button>
              </div>
              
              {isSubscribed && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-green-600 mt-3 text-sm"
                >
                  Thanks for subscribing! 🎉
                </motion.p>
              )}
            </motion.form>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-sm text-slate-500 mt-4"
            >
              No spam, unsubscribe at any time.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-24 px-4 bg-slate-900 relative overflow-hidden">
        {/* Enhanced Background Pattern */}
        <div className="absolute inset-0 bg-grid-slate-800 [mask-image:linear-gradient(0deg,transparent,white,transparent)] opacity-20"></div>
        
        {/* Animated background elements */}
        <motion.div 
          className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-2xl"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ 
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-2xl"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.6, 0.3, 0.6]
          }}
          transition={{ 
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6"
            >
              <Sparkles className="h-4 w-4 text-white" />
              <span className="text-sm font-medium text-white">Join Today</span>
            </motion.div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Join the Tech Innovation Club?
            </h2>
            <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
              Become a member and unlock exclusive access to events, resources, and the ACM network.
            </p>
            
            <motion.div 
              className="flex flex-col sm:flex-row justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Button size="lg" asChild className="text-lg px-8 py-4 h-14 bg-white text-slate-900 hover:bg-slate-100 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group">
                <Link href="/join" className="flex items-center gap-2">
                  Join Now
                  <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg px-8 py-4 h-14 border-2 border-slate-600 text-white hover:bg-slate-800 rounded-xl transition-all duration-300 group">
                <Link href="/contact" className="flex items-center gap-2">
                  Contact Us
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </motion.div>

            {/* Trust indicators */}
            <motion.div 
              className="mt-12 flex flex-wrap justify-center items-center gap-8 text-slate-400"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-sm">Free Membership</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-sm">No Commitment</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-sm">Instant Access</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Homepage; 