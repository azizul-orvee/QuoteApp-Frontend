'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { quotesApi } from '@/lib/api';
import QuoteCard from '@/components/quotes/QuoteCard';
import Button from '@/components/ui/Button';
import { Heart, User, ArrowLeft, Quote } from 'lucide-react';

export default function UserQuotesPage() {
  const params = useParams();
  const [quotes, setQuotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [userInfo, setUserInfo] = useState({
    id: '',
    username: '',
    quoteCount: 0
  });

  // Extract and validate userId
  const userId = params.userId;

  useEffect(() => {
    // Check if userId is valid before proceeding
    if (!userId || userId === 'undefined') {
      setError('Invalid user ID. Please check the URL.');
      setIsLoading(false);
      return;
    }
    
    loadUserAndQuotes();
  }, [userId, page]);

  const loadUserAndQuotes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Load user quotes
      const response = await quotesApi.getByUser(userId, { page, limit: 10 });
      
      if (response.quotes && response.quotes.length > 0) {
        if (page === 1) {
          setQuotes(response.quotes);
        } else {
          setQuotes(prev => [...prev, ...response.quotes]);
        }
        setHasMore(response.quotes.length === 10);
        
        // Extract user info from first quote
        const firstQuote = response.quotes[0];
        setUserInfo({
          id: userId,
          username: firstQuote.author_name || firstQuote.author_username || 'Unknown User',
          quoteCount: response.total || response.quotes.length
        });
      } else {
        setQuotes([]);
        setHasMore(false);
        setUserInfo({
          id: userId,
          username: 'Unknown User',
          quoteCount: 0
        });
      }
    } catch (err) {
      console.error('Error loading user quotes:', err);
      setError('Failed to load user quotes. Please try again.');
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

        {/* User Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
              <User className="h-8 w-8 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{userInfo.username}</h2>
              <p className="text-gray-600">{userInfo.quoteCount} quotes</p>
            </div>
          </div>
        </div>

        {/* Quotes Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              User Quotes
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
                This user has no quotes.
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
