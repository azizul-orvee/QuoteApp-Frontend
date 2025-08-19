'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usersApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { Heart, User, Calendar, ThumbsUp, ThumbsDown, Quote, ArrowLeft, TrendingUp, BarChart3, Activity, Users } from 'lucide-react';
import { quotesApi } from '@/lib/api'; // Added quotesApi import

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Extract and validate userId from params
  const userId = params.userId;

  useEffect(() => {
    if (isAuthenticated && userId) {
      loadUserData();
    }
  }, [isAuthenticated, userId]);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Load user profile
      let profileData;
      try {
        profileData = await usersApi.getProfile(userId);
      } catch (profileError) {
        console.warn('User Profile API failed, trying quotes API as fallback:', profileError);
        // Fallback: get user data from quotes API
        const quotesResponse = await quotesApi.getByUser(userId, { limit: 1 });
        if (quotesResponse.quotes && quotesResponse.quotes.length > 0) {
          const firstQuote = quotesResponse.quotes[0];
          profileData = {
            id: userId,
            username: firstQuote.author_name || firstQuote.author_username || 'Unknown User',
            created_at: firstQuote.created_at || new Date().toISOString()
          };
        } else {
          throw new Error('No quotes available for fallback');
        }
      }
      
      // Ensure the profile data has the correct ID
      const profileWithId = {
        ...profileData,
        id: profileData.id || userId // Use params userId as fallback
      };
      
      setUserProfile(profileWithId);

      // Load user stats
      try {
        const statsData = await usersApi.getStats(userId);
        setUserStats(statsData);
      } catch (statsErr) {
        console.warn('Could not load user stats:', statsErr);
        // Stats are optional, continue without them
      }
    } catch (err) {
      console.error('Error loading user data:', err);
      setError('Failed to load user data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Redirect if not authenticated
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <Heart className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to view user profiles.</p>
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading user profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Heart className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">User Not Found</h2>
            <p className="text-gray-600 mb-6">{error || 'The user you are looking for does not exist.'}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/users">
                <Button>Back to Users</Button>
              </Link>
              <Link href="/">
                <Button variant="outline">Go Home</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/users"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Link>
          
          <div className="flex items-center space-x-3">
            <User className="h-8 w-8 text-red-500" />
            <h1 className="text-3xl font-bold text-gray-900">{userProfile.username}</h1>
          </div>
          <p className="text-gray-600 mt-2">
            User Profile & Statistics
          </p>
        </div>

        {/* User Profile Card */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-center space-x-6 mb-6">
            <div className="flex-shrink-0">
              <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center">
                <User className="h-12 w-12 text-red-600" />
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{userProfile.username}</h2>
              <p className="text-gray-600">User ID: {userProfile.id}</p>
              <p className="text-gray-600">Member since {formatDate(userProfile.created_at)}</p>
            </div>
            <div className="flex space-x-3">
              {userProfile.id ? (
                <Link href={`/quotes/user/${userProfile.id}`}>
                  <Button variant="outline">
                    View Quotes
                  </Button>
                </Link>
              ) : (
                <span className="text-gray-400 text-xs px-2 py-1">
                  No ID available
                </span>
              )}
              <Link href="/users">
                <Button variant="ghost">
                  Back to Users
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        {userStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <Quote className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <h3 className="text-3xl font-bold text-gray-900">{userStats.quoteCount}</h3>
              <p className="text-gray-600">Total Quotes</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <ThumbsUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <h3 className="text-3xl font-bold text-gray-900">{userStats.totalLikes}</h3>
              <p className="text-gray-600">Total Likes</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <ThumbsDown className="h-8 w-8 text-gray-500 mx-auto mb-2" />
              <h3 className="text-3xl font-bold text-gray-900">{userStats.totalDislikes}</h3>
              <p className="text-gray-600">Total Dislikes</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <TrendingUp className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <h3 className="text-3xl font-bold text-gray-900">
                {userStats.totalLikes + userStats.totalDislikes}
              </h3>
              <p className="text-gray-600">Total Reactions</p>
            </div>
          </div>
        )}

        {/* Detailed Stats */}
        {userStats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Performance Metrics */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center space-x-2 mb-4">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                <h3 className="text-lg font-semibold text-gray-900">Performance Metrics</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Average Likes per Quote</span>
                  <span className="font-semibold text-gray-900">
                    {userStats.quoteCount > 0 ? (userStats.totalLikes / userStats.quoteCount).toFixed(1) : 0}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Like to Dislike Ratio</span>
                  <span className="font-semibold text-gray-900">
                    {userStats.totalDislikes > 0 ? (userStats.totalLikes / userStats.totalDislikes).toFixed(1) : '∞'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Engagement Rate</span>
                  <span className="font-semibold text-gray-900">
                    {userStats.quoteCount > 0 ? ((userStats.totalLikes + userStats.totalDislikes) / userStats.quoteCount).toFixed(1) : 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Activity Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Activity className="h-5 w-5 text-green-500" />
                <h3 className="text-lg font-semibold text-gray-900">Activity Summary</h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Member Since</span>
                  <span className="font-semibold text-gray-900">
                    {formatDate(userProfile.created_at)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Activity</span>
                  <span className="font-semibold text-gray-900">
                    {userStats.quoteCount + userStats.totalLikes + userStats.totalDislikes}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {userProfile.id ? (
              <Link href={`/quotes/user/${userProfile.id}`}>
                <Button variant="outline" className="w-full h-12">
                  <Quote className="h-5 w-5 mr-2" />
                  View All Quotes
                </Button>
              </Link>
            ) : (
              <div className="w-full h-12 flex items-center justify-center text-gray-400 text-sm border-2 border-dashed border-gray-300 rounded">
                No ID available
              </div>
            )}
            
            <Link href="/users">
              <Button variant="outline" className="w-full h-12">
                <Users className="h-5 w-5 mr-2" />
                Browse Users
              </Button>
            </Link>
            
            <Link href="/create-quote">
              <Button className="w-full h-12">
                <Heart className="h-5 w-5 mr-2" />
                Create Quote
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
