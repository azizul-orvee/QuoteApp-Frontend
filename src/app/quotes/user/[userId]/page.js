'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { quotesApi, authApi } from '@/lib/api';
import QuoteCard from '@/components/quotes/QuoteCard';
import Button from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';
import { Heart, User, Calendar, ArrowLeft, Quote } from 'lucide-react';

export default function UserQuotesPage() {
  const params = useParams();
  const [user, setUser] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadUserAndQuotes();
  }, [params.userId, page]);

  const loadUserAndQuotes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Load user profile and quotes in parallel
      const [userData, quotesData] = await Promise.all([
        authApi.getUserProfile(params.userId),
        quotesApi.getByUser(params.userId, { page, limit: 10 })
      ]);
      
      setUser(userData);
      
      if (page === 1) {
        setQuotes(quotesData.quotes || []);
      } else {
        setQuotes(prev => [...prev, ...(quotesData.quotes || [])]);
      }
      
      setHasMore(quotesData.quotes && quotesData.quotes.length === 10);
    } catch (err) {
      setError('Failed to load user or quotes');
      console.error('Error loading user quotes:', err);
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading User</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button>Go Home</Button>
            </Link>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link 
            href="/"
            className="inline-flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>

        {/* User Profile Header */}
        {user && (
          <div className="bg-white rounded-lg shadow-md p-8 mb-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <User className="h-10 w-10 text-red-500" />
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {user.username}'s Quotes
            </h1>
            
            <div className="flex items-center justify-center space-x-6 text-gray-600 mb-6">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Member since {formatDate(user.created_at)}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600 mb-2">
                  {quotes.length}
                </div>
                <p className="text-gray-600">Quotes Created</p>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {quotes.reduce((sum, quote) => sum + (quote.likes_count || 0), 0)}
                </div>
                <p className="text-gray-600">Total Likes</p>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {quotes.reduce((sum, quote) => sum + (quote.dislikes_count || 0), 0)}
                </div>
                <p className="text-gray-600">Total Dislikes</p>
              </div>
            </div>
          </div>
        )}

        {/* Quotes Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {user ? `${user.username}'s Quotes` : 'User Quotes'}
            </h2>
            {quotes.length > 0 && (
              <p className="text-gray-600">
                {quotes.length} quote{quotes.length !== 1 ? 's' : ''}
              </p>
            )}
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
                No quotes yet
              </h3>
              <p className="text-gray-600 mb-6">
                {user ? `${user.username} hasn't shared any quotes yet.` : 'This user has no quotes.'}
              </p>

            </div>
          )}
        </div>

        {/* Related Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">More Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            
            <Link href="/">
              <Button variant="outline" className="w-full h-12">
                Browse All Quotes
              </Button>
            </Link>
            
            <Link href="/create-quote">
              <Button variant="outline" className="w-full h-12">
                Create Your Own Quote
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
