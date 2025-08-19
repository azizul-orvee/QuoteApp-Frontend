'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { quotesApi } from '@/lib/api';
import QuoteCard from '@/components/quotes/QuoteCard';
import Button from '@/components/ui/Button';
import { Heart, Plus, Trash2, Edit, Eye } from 'lucide-react';

export default function MyQuotesPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [quotes, setQuotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadMyQuotes();
    }
  }, [isAuthenticated, user, page]);

  const loadMyQuotes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Loading quotes for user:', user?.id);
      const response = await quotesApi.getByUser(user.id, { page, limit: 10 });
      console.log('Quotes response:', response);
      
      if (page === 1) {
        setQuotes(response.quotes || []);
      } else {
        setQuotes(prev => [...prev, ...(response.quotes || [])]);
      }
      
      setHasMore(response.quotes && response.quotes.length === 10);
    } catch (err) {
      console.error('Error loading quotes:', err);
      if (err.status === 401) {
        setError('Authentication failed. Please login again.');
      } else {
        setError('Failed to load your quotes');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteQuote = async (quoteId) => {
    if (!confirm('Are you sure you want to delete this quote? This action cannot be undone.')) {
      return;
    }

    try {
      await quotesApi.delete(quoteId);
      setQuotes(prev => prev.filter(quote => quote.id !== quoteId));
    } catch (err) {
      alert('Failed to delete quote');
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

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show error if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <Heart className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to view your quotes.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button>Login</Button>
            </Link>
            <Link href="/register">
              <Button variant="outline">Register</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadMyQuotes}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Heart className="h-8 w-8 text-red-500" />
              <h1 className="text-3xl font-bold text-gray-900">My Quotes</h1>
            </div>
            
            <Link href="/create-quote">
              <Button className="flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Create Quote</span>
              </Button>
            </Link>
          </div>
          <p className="text-gray-600 mt-2">
            Welcome back, <span className="font-semibold text-red-600">{user?.username}</span>! Manage and view all the quotes you've created
          </p>
          
          {/* Debug Info - Remove in production */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-700 mb-2">Debug Info:</h4>
              <div className="text-xs text-blue-600 space-y-1">
                <p>User ID: {user?.id}</p>
                <p>Username: {user?.username}</p>
                <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
                <p>Auth Loading: {authLoading ? 'Yes' : 'No'}</p>
                <p>Quotes Count: {quotes.length}</p>
                <p>Page: {page}</p>
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 mb-2">
                {quotes.length}
              </div>
              <p className="text-gray-600">Total Quotes</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {quotes.reduce((sum, quote) => sum + (quote.likes || 0), 0)}
              </div>
              <p className="text-gray-600">Total Likes</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600 mb-2">
                {quotes.reduce((sum, quote) => sum + (quote.dislikes || 0), 0)}
              </div>
              <p className="text-gray-600">Total Dislikes</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">
                {quotes.length > 0 ? Math.round((quotes.reduce((sum, quote) => sum + (quote.likes || 0), 0) / quotes.length) * 100) / 100 : 0}
              </div>
              <p className="text-gray-600">Avg. Likes per Quote</p>
            </div>
          </div>
        </div>

        {/* Quotes List */}
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
                <div key={quote.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
                  {/* Quote Content */}
                  <div className="mb-4">
                    <blockquote className="text-lg text-gray-800 italic leading-relaxed">
                      "{quote.content.length > 150 ? quote.content.substring(0, 150) + '...' : quote.content}"
                    </blockquote>
                    {quote.content.length > 150 && (
                      <Link 
                        href={`/quotes/${quote.id}`}
                        className="text-red-500 hover:text-red-600 text-sm font-medium"
                      >
                        Read more
                      </Link>
                    )}
                  </div>

                  {/* Quote Footer */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <span>❤️ {quote.likes || 0}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>👎 {quote.dislikes || 0}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <Link href={`/quotes/${quote.id}`}>
                        <Button variant="ghost" size="sm" className="flex items-center space-x-1">
                          <Eye className="h-4 w-4" />
                          <span>View</span>
                        </Button>
                      </Link>
                      
                      <Link href={`/quotes/${quote.id}/edit`}>
                        <Button variant="outline" size="sm" className="flex items-center space-x-1">
                          <Edit className="h-4 w-4" />
                          <span>Edit</span>
                        </Button>
                      </Link>
                      
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleDeleteQuote(quote.id)}
                        className="flex items-center space-x-1"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Delete</span>
                      </Button>
                    </div>
                  </div>
                </div>
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
            <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No quotes yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start sharing your wisdom by creating your first quote.
            </p>
            <Link href="/create-quote">
              <Button size="lg" className="flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Create Your First Quote</span>
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
