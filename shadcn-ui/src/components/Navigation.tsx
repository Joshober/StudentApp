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
        "sticky top-0 z-50 transition-all duration-300 border-b",
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-slate-200"
          : "bg-white/90 backdrop-blur-sm border-slate-100"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="h-12 w-12 bg-slate-900 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-lg">
              <span className="text-white font-bold text-xl">AC</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-2xl text-slate-900 group-hover:text-slate-700 transition-colors duration-300">
                ACM Club
              </span>
              <span className="text-xs text-slate-500 font-medium">Tech Innovation</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {(user ? (isAdmin ? adminNavigationItems : userNavigationItems) : navigationItems).map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;

              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={cn(
                    "flex items-center space-x-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105",
                    isActive
                      ? "text-slate-900 bg-slate-100 shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <>
                <Link href="/profile">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-slate-100 hover:text-slate-900 transition-all duration-300"
                  >
                    <User className="h-4 w-4 mr-2" />
                    {user.name}
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-300"
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
                    className="hover:bg-slate-100 hover:text-slate-900 transition-all duration-300"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button
                    size="sm"
                    className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
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
              className="p-2 hover:bg-slate-100"
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
            "md:hidden border-t border-slate-200 transition-all duration-300 ease-in-out",
            isMobileMenuOpen
              ? "max-h-96 opacity-100"
              : "max-h-0 opacity-0 overflow-hidden"
          )}
        >
          <div className="px-2 pt-4 pb-6 space-y-2">
            {(user ? (isAdmin ? adminNavigationItems : userNavigationItems) : navigationItems).map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;

              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={cn(
                    "flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 hover:scale-105",
                    isActive
                      ? "text-slate-900 bg-slate-100 shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* Mobile Auth Buttons */}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              {user ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start hover:bg-slate-100"
                  >
                    <User className="h-4 w-4 mr-2" />
                    {user.name}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="w-full justify-start hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all duration-300"
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
                      className="w-full justify-start hover:bg-slate-100"
                    >
                      <LogIn className="h-4 w-4 mr-2" />
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/auth/register" className="w-full">
                    <Button
                      size="sm"
                      className="w-full justify-start bg-slate-900 hover:bg-slate-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
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
