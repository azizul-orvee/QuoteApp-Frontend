'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { reactionsApi } from '@/lib/api';
import { formatDate, truncateText } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { Heart, MessageCircle, ThumbsUp, ThumbsDown, User, Calendar } from 'lucide-react';

export default function QuoteCard({ quote, onReactionUpdate }) {
  const { isAuthenticated, user } = useAuth();
  const [isLiking, setIsLiking] = useState(false);
  const [isDisliking, setIsDisliking] = useState(false);
  
  // Local state for real-time count updates
  const [localLikesCount, setLocalLikesCount] = useState(quote.likes_count || 0);
  const [localDislikesCount, setLocalDislikesCount] = useState(quote.dislikes_count || 0);
  const [userReaction, setUserReaction] = useState(quote.userReaction || null);

  // Map backend fields to frontend expectations
  const isOwner = user?.id === quote.author_id;
  const hasLiked = userReaction === 'like';
  const hasDisliked = userReaction === 'dislike';

  // Update local state when quote prop changes
  useEffect(() => {
    setLocalLikesCount(quote.likes_count || 0);
    setLocalDislikesCount(quote.dislikes_count || 0);
    setUserReaction(quote.userReaction || null);
  }, [quote.likes_count, quote.dislikes_count, quote.userReaction]);

  const handleReaction = async (reactionType) => {
    if (!isAuthenticated) return;

    const isLike = reactionType === 'like';
    const setIsLoading = isLike ? setIsLiking : setIsDisliking;
    
    setIsLoading(true);
    
    try {
      // Optimistic update - update counts immediately for better UX
      if (isLike) {
        if (hasLiked) {
          // Unlike
          setLocalLikesCount(prev => prev - 1);
          setUserReaction(null);
        } else {
          // Like
          setLocalLikesCount(prev => prev + 1);
          if (hasDisliked) {
            setLocalDislikesCount(prev => prev - 1);
          }
          setUserReaction('like');
        }
      } else {
        if (hasDisliked) {
          // Undislike
          setLocalDislikesCount(prev => prev - 1);
          setUserReaction(null);
        } else {
          // Dislike
          setLocalDislikesCount(prev => prev + 1);
          if (hasLiked) {
            setLocalLikesCount(prev => prev - 1);
          }
          setUserReaction('dislike');
        }
      }

      const apiCall = isLike ? reactionsApi.like : reactionsApi.dislike;
      const result = await apiCall(quote.id);
      
      // Update with actual backend response
      if (result && result.likes_count !== undefined) {
        setLocalLikesCount(result.likes_count);
      }
      if (result && result.dislikes_count !== undefined) {
        setLocalDislikesCount(result.dislikes_count);
      }
      if (result && result.userReaction !== undefined) {
        setUserReaction(result.userReaction);
      }
      
      if (onReactionUpdate) {
        onReactionUpdate(quote.id, result);
      }
    } catch (error) {
      console.error('Failed to update reaction:', error);
      
      // Revert optimistic updates on error
      setLocalLikesCount(quote.likes_count || 0);
      setLocalDislikesCount(quote.dislikes_count || 0);
      setUserReaction(quote.userReaction || null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
      {/* Quote Content */}
      <div className="mb-4">
        <blockquote className="text-lg text-gray-800 italic leading-relaxed">
          "{truncateText(quote.content, 200)}"
        </blockquote>
        {quote.content.length > 200 && (
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
            <User className="h-4 w-4" />
            <Link 
              href={`/quotes/user/${quote.author_id}`}
              className="hover:text-red-500 transition-colors"
            >
              {quote.author_username || quote.author?.username || 'Anonymous'}
            </Link>
          </div>
          
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(quote.created_at)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {/* Like Button */}
          <Button
            variant={hasLiked ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleReaction('like')}
            disabled={!isAuthenticated || isLiking}
            loading={isLiking}
            className={`flex items-center space-x-1 ${
              hasLiked ? 'bg-red-500 hover:bg-red-600' : ''
            }`}
          >
            <ThumbsUp className="h-4 w-4" />
            <span>{localLikesCount}</span>
          </Button>

          {/* Dislike Button */}
          <Button
            variant={hasDisliked ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleReaction('dislike')}
            disabled={!isAuthenticated || isDisliking}
            loading={isDisliking}
            className={`flex items-center space-x-1 ${
              hasDisliked ? 'bg-gray-500 hover:bg-gray-600' : ''
            }`}
          >
            <ThumbsDown className="h-4 w-4" />
            <span>{localDislikesCount}</span>
          </Button>

          {/* Owner Actions */}
          {isOwner && (
            <div className="flex items-center space-x-2 ml-2">
              <Link href={`/quotes/${quote.id}/edit`}>
                <Button variant="outline" size="sm">
                  Edit
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
