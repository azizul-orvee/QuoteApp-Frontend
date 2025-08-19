'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import { Heart, Plus, User, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navigation() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-red-500" />
            <span className="text-xl font-bold text-gray-900">QuoteHub</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className="text-gray-700 hover:text-red-500 transition-colors"
            >
              Home
            </Link>
            
            {process.env.NODE_ENV === 'development' && (
              <Link 
                href="/debug" 
                className="text-gray-700 hover:text-red-500 transition-colors"
              >
                Debug
              </Link>
            )}
            
            {isAuthenticated ? (
              <>
                <Link 
                  href="/create-quote" 
                  className="text-gray-700 hover:text-red-500 transition-colors"
                >
                  Create Quote
                </Link>
                <Link 
                  href="/my-quotes" 
                  className="text-gray-700 hover:text-red-500 transition-colors"
                >
                  My Quotes
                </Link>
                <div className="flex items-center space-x-4">
                  <Link href="/profile">
                    <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>{user?.username || 'Profile'}</span>
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleLogout}
                    className="flex items-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileMenu}
              className="p-2"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
              <Link 
                href="/" 
                className="block px-3 py-2 text-gray-700 hover:text-red-500 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              
              {process.env.NODE_ENV === 'development' && (
                <Link 
                  href="/debug" 
                  className="block px-3 py-2 text-gray-700 hover:text-red-500 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Debug
                </Link>
              )}
              
              {isAuthenticated ? (
                <>
                  <Link 
                    href="/create-quote" 
                    className="block px-3 py-2 text-gray-700 hover:text-red-500 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Create Quote
                  </Link>
                  <Link 
                    href="/my-quotes" 
                    className="block px-3 py-2 text-gray-700 hover:text-red-500 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    My Quotes
                  </Link>
                  <Link 
                    href="/profile" 
                    className="block px-3 py-2 text-gray-700 hover:text-red-500 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 text-gray-700 hover:text-red-500 transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/login" 
                    className="block px-3 py-2 text-gray-700 hover:text-red-500 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    href="/register" 
                    className="block px-3 py-2 text-gray-700 hover:text-red-500 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
