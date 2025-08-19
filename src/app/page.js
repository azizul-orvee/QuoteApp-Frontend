'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { quotesApi } from '@/lib/api';
import QuoteCard from '@/components/quotes/QuoteCard';
import Button from '@/components/ui/Button';
import { Heart, Plus, TrendingUp, Users, Quote, Wifi, WifiOff, RefreshCw } from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated, user, token } = useAuth();
  const [quotes, setQuotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    loadQuotes();
  }, [page]);

  const loadQuotes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await quotesApi.getAll({ page, limit: 10 });
      
      if (page === 1) {
        setQuotes(response.quotes || []);
      } else {
        setQuotes(prev => [...prev, ...(response.quotes || [])]);
      }
      
      setHasMore(response.quotes && response.quotes.length === 10);
    } catch (err) {
      console.error('Error loading quotes:', err);
      if (err.status === 0 || err.message === 'Network error') {
        setError('connection_error');
      } else {
        setError('Failed to load quotes');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReactionUpdate = (quoteId, updatedQuote) => {
    setQuotes(prev => 
      prev.map(quote => 
        quote.id === quoteId ? { ...quote, ...updatedQuote } : quote
      )
    );
  };

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  const retryConnection = async () => {
    setIsRetrying(true);
    await loadQuotes();
    setIsRetrying(false);
  };

  // Enhanced error state with eye-catching sad emoji
  if (error === 'connection_error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-pink-50 to-red-100">
        <div className="text-center max-w-2xl mx-auto px-6">
          {/* Large animated sad emoji */}
          <div className="mb-8">
            <div className="text-9xl mb-4 animate-bounce">😢</div>
            <div className="text-6xl mb-2 animate-pulse">💔</div>
          </div>
          
          {/* Connection status icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <WifiOff className="h-16 w-16 text-red-500 animate-pulse" />
              <div className="absolute -top-2 -right-2">
                <div className="h-6 w-6 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Error message */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Oops! Connection Lost
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            We're having trouble connecting to our servers. 
            <br />
            <span className="font-semibold text-red-600">Don't worry, we're working on it!</span>
          </p>
          
          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button 
              onClick={retryConnection} 
              disabled={isRetrying}
              size="lg" 
              className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              {isRetrying ? (
                <RefreshCw className="h-5 w-5 animate-spin" />
              ) : (
                <Wifi className="h-5 w-5" />
              )}
              <span>{isRetrying ? 'Reconnecting...' : 'Try Again'}</span>
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="flex items-center space-x-2 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transform hover:scale-105 transition-all duration-200"
            >
              <RefreshCw className="h-5 w-5" />
              <span>Refresh Page</span>
            </Button>
          </div>
          
          {/* Fun message */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <p className="text-gray-700 text-lg">
              <span className="text-2xl mr-2">🌟</span>
              <strong>Pro tip:</strong> Check your internet connection and try again!
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Regular error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-100">
        <div className="text-center max-w-2xl mx-auto px-6">
          <div className="mb-8">
            <div className="text-8xl mb-4 animate-bounce">😕</div>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Something went wrong
          </h1>
          <p className="text-xl text-gray-600 mb-8">{error}</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={loadQuotes} size="lg">
              Try Again
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-red-50 to-red-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-6">
            <Heart className="h-16 w-16 text-red-500" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Discover Inspiring Quotes
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Share wisdom, find inspiration, and connect with others through the power of words. 
            Join our community of quote enthusiasts today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Link href="/create-quote">
                <Button size="lg" className="flex items-center space-x-2">
                  <Plus className="h-5 w-5" />
                  <span>Create Quote</span>
                </Button>
              </Link>
            ) : (
              <Link href="/register">
                <Button size="lg" className="flex items-center space-x-2">
                  <Plus className="h-5 w-5" />
                  <span>Get Started</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <Quote className="h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {quotes.length}+
              </h3>
              <p className="text-gray-600">Inspiring Quotes</p>
            </div>
            <div className="flex flex-col items-center">
              <Users className="h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Growing
              </h3>
              <p className="text-gray-600">Community</p>
            </div>
            <div className="flex flex-col items-center">
              <TrendingUp className="h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Daily
              </h3>
              <p className="text-gray-600">New Content</p>
            </div>
          </div>
          
          {/* Debug Information - Remove this in production */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-8 p-4 bg-gray-100 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Debug Info:</h4>
              <div className="text-xs text-gray-600 space-y-1">
                <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
                <p>Quotes Count: {quotes.length}</p>
                <p>Error: {error || 'None'}</p>
                <p>Page: {page}</p>
                <p>Has More: {hasMore ? 'Yes' : 'No'}</p>
                <hr className="my-2" />
                <p><strong>Auth Status:</strong></p>
                <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
                <p>User: {user?.username || 'None'}</p>
                <p>Has Token: {token ? 'Yes' : 'No'}</p>
                <p>Token Length: {token ? token.length : 0}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Quotes Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Latest Quotes
            </h2>
            <p className="text-lg text-gray-600">
              Discover the most recent wisdom shared by our community
            </p>
          </div>

          {isLoading && quotes.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                  <div className="h-24 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : quotes.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {quotes.map((quote) => (
                  <QuoteCard
                    key={quote.id}
                    quote={quote}
                    onReactionUpdate={handleReactionUpdate}
                  />
                ))}
              </div>

              {hasMore && (
                <div className="text-center">
                  <Button
                    onClick={loadMore}
                    disabled={isLoading}
                    loading={isLoading}
                    variant="outline"
                    size="lg"
                  >
                    Load More Quotes
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Quote className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No quotes available
              </h3>
              <p className="text-gray-600 mb-6">
                {isAuthenticated ? 'Be the first to share a quote!' : 'Sign up to start sharing quotes!'}
              </p>
              {isAuthenticated ? (
                <Link href="/create-quote">
                  <Button>Create Your First Quote</Button>
                </Link>
              ) : (
                <Link href="/register">
                  <Button>Get Started</Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Share Your Wisdom?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of users who are already sharing and discovering inspiring quotes.
          </p>
          {!isAuthenticated && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg">Create Account</Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg">Sign In</Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
