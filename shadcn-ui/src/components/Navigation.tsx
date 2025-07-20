"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  BookOpen,
  Calendar,
  Mail,
  User,
  LogIn,
  LogOut,
  Menu,
  X,
  Brain,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const Navigation: React.FC = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const navigationItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/resources", label: "Resources", icon: BookOpen },
    { path: "/events", label: "Events", icon: Calendar },
    { path: "/contact", label: "Contact", icon: Mail },
  ];

  const userNavigationItems = [
    { path: "/dashboard", label: "Dashboard", icon: User },
    { path: "/ai-assistant", label: "AI Assistant", icon: Brain },
    { path: "/resources", label: "Resources", icon: BookOpen },
    { path: "/events", label: "Events", icon: Calendar },
    { path: "/contact", label: "Contact", icon: Mail },
  ];

  const adminNavigationItems = [
    { path: "/dashboard", label: "Dashboard", icon: User },
    { path: "/ai-assistant", label: "AI Assistant", icon: Brain },
    { path: "/resources", label: "Resources", icon: BookOpen },
    { path: "/events", label: "Events", icon: Calendar },
    { path: "/contact", label: "Contact", icon: Mail },
  ];

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check admin status
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user?.email) {
        try {
          const response = await fetch(`/api/user/admin-status?email=${user.email}`);
          if (response.ok) {
            const data = await response.json();
            setIsAdmin(data.isAdmin);
          }
        } catch (error) {
          console.error('Failed to check admin status:', error);
        }
      }
    };

    checkAdminStatus();
  }, [user?.email]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-xl border-b border-white/20"
          : "bg-white/90 backdrop-blur-sm shadow-lg border-b border-white/20"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="h-10 w-10 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <span className="text-white font-bold text-lg">EL</span>
            </div>
            <span className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:to-purple-700 transition-all duration-300">
              EduLearn
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {(user ? (isAdmin ? adminNavigationItems : userNavigationItems) : navigationItems).map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;

              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={cn(
                    "flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105",
                    isActive
                      ? "text-blue-600 bg-blue-50/80 backdrop-blur-sm shadow-md border border-blue-200"
                      : "text-slate-700 hover:text-blue-600 hover:bg-white/60 hover:backdrop-blur-sm"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link href="/profile">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-white/60 hover:backdrop-blur-sm transition-all duration-300"
                  >
                    <User className="h-4 w-4 mr-2 text-blue-600" />
                    {user.name}
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="hover:scale-105 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-300"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/signin">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-white/60 hover:backdrop-blur-sm transition-all duration-300"
                  >
                    <LogIn className="h-4 w-4 mr-2 text-blue-600" />
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={cn(
            "md:hidden border-t border-gray-200 transition-all duration-300 ease-in-out",
            isMobileMenuOpen
              ? "max-h-96 opacity-100"
              : "max-h-0 opacity-0 overflow-hidden"
          )}
        >
          <div className="px-2 pt-2 pb-3 space-y-1">
            {(user ? (isAdmin ? adminNavigationItems : userNavigationItems) : navigationItems).map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;

              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-all duration-200 hover:scale-105",
                    isActive
                      ? "text-blue-600 bg-blue-50 shadow-sm"
                      : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* Mobile Auth Buttons */}
            <div className="pt-4 border-t border-gray-200 space-y-2">
              {user ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start hover:bg-gray-100"
                  >
                    <User className="h-4 w-4 mr-2" />
                    {user.name}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="w-full justify-start hover:scale-105 transition-transform duration-200"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/auth/signin" className="w-full">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start hover:bg-gray-100"
                    >
                      <LogIn className="h-4 w-4 mr-2" />
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/register" className="w-full">
                    <Button
                      size="sm"
                      className="w-full justify-start hover:scale-105 transition-transform duration-200"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
