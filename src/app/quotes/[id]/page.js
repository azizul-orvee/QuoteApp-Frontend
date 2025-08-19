'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { quotesApi, reactionsApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { Heart, User, Calendar, ThumbsUp, ThumbsDown, Edit, Trash2, ArrowLeft } from 'lucide-react';

export default function QuoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [quote, setQuote] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiking, setIsLiking] = useState(false);
  const [isDisliking, setIsDisliking] = useState(false);

  useEffect(() => {
    loadQuote();
  }, [params.id]);

  const loadQuote = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const quoteData = await quotesApi.getById(params.id);
      setQuote(quoteData);
    } catch (err) {
      setError('Quote not found or has been removed');
      console.error('Error loading quote:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReaction = async (reactionType) => {
    if (!isAuthenticated) return;

    const isLike = reactionType === 'like';
    const setIsLoading = isLike ? setIsLiking : setIsDisliking;
    
    setIsLoading(true);
    
    try {
      const apiCall = isLike ? reactionsApi.like : reactionsApi.dislike;
      const result = await apiCall(quote.id);
      
      // Update the quote with new reaction data
      setQuote(prev => ({
        ...prev,
        likes_count: result.likes_count || result.likes || prev.likes_count || prev.likes || 0,
        dislikes_count: result.dislikes_count || result.dislikes || prev.dislikes_count || prev.dislikes || 0,
        userReaction: result.userReaction,
      }));
    } catch (error) {
      console.error('Failed to update reaction:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this quote? This action cannot be undone.')) {
      return;
    }

    try {
      await quotesApi.delete(quote.id);
      router.push('/my-quotes');
    } catch (err) {
      alert('Failed to delete quote');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quote...</p>
        </div>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Quote Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The quote you are looking for does not exist.'}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button>Go Home</Button>
            </Link>

          </div>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === quote.author_id || user?.id === quote.userId;
  const hasLiked = quote.userReaction === 'like';
  const hasDisliked = quote.userReaction === 'dislike';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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

        {/* Quote Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          {/* Quote Content */}
          <div className="text-center mb-8">
            <blockquote className="text-3xl md:text-4xl text-gray-800 italic leading-relaxed mb-6">
              "{quote.content}"
            </blockquote>
            
            {/* Author Info */}
            <div className="flex items-center justify-center space-x-4 text-gray-600">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <Link 
                  href={`/quotes/user/${quote.author_id || quote.userId}`}
                  className="hover:text-red-500 transition-colors font-medium"
                >
                  {quote.author_username || quote.user?.username || 'Anonymous'}
                </Link>
              </div>
              
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>{formatDate(quote.created_at || quote.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Reactions */}
          <div className="flex items-center justify-center space-x-6 mb-8">
            <Button
              variant={hasLiked ? 'default' : 'outline'}
              size="lg"
              onClick={() => handleReaction('like')}
              disabled={!isAuthenticated || isLiking}
              loading={isLiking}
              className={`flex items-center space-x-2 ${
                hasLiked ? 'bg-red-500 hover:bg-red-600' : ''
              }`}
            >
              <ThumbsUp className="h-5 w-5" />
              <span>{quote.likes_count || quote.likes || 0}</span>
            </Button>

            <Button
              variant={hasDisliked ? 'default' : 'outline'}
              size="lg"
              onClick={() => handleReaction('dislike')}
              disabled={!isAuthenticated || isDisliking}
              loading={isDisliking}
              className={`flex items-center space-x-2 ${
                hasDisliked ? 'bg-gray-500 hover:bg-gray-600' : ''
              }`}
            >
              <ThumbsDown className="h-5 w-5" />
              <span>{quote.dislikes_count || quote.dislikes || 0}</span>
            </Button>
          </div>

          {/* Owner Actions */}
          {isOwner && (
            <div className="flex justify-center space-x-4 pt-6 border-t border-gray-200">
              <Link href={`/quotes/${quote.id}/edit`}>
                <Button variant="outline" className="flex items-center space-x-2">
                  <Edit className="h-4 w-4" />
                  <span>Edit Quote</span>
                </Button>
              </Link>
              
              <Button 
                variant="destructive" 
                onClick={handleDelete}
                className="flex items-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete Quote</span>
              </Button>
            </div>
          )}
        </div>

        {/* Related Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">More Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            
            {isAuthenticated && (
              <Link href="/create-quote">
                <Button variant="outline" className="w-full h-12">
                  Create New Quote
                </Button>
              </Link>
            )}
            
            <Link href={`/quotes/user/${quote.author_id || quote.userId}`}>
              <Button variant="outline" className="w-full h-12">
                View User's Quotes
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
