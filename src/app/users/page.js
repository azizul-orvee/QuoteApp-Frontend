'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usersApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { Heart, Users, TrendingUp, User, Calendar, ThumbsUp, ThumbsDown, Quote, ArrowLeft } from 'lucide-react';
import { quotesApi } from '@/lib/api'; // Added import for quotesApi

export default function UsersPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadUsers();
    }
  }, [isAuthenticated]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Try to get users from the users API first
      let data;
      try {
        data = await usersApi.getAll();
      } catch (usersError) {
        console.warn('Users API failed, trying quotes API as fallback:', usersError);
        // Fallback: get users from quotes API
        const quotesResponse = await quotesApi.getAll({ limit: 100 });
        if (quotesResponse.quotes && quotesResponse.quotes.length > 0) {
          // Extract unique users from quotes
          const userMap = new Map();
          quotesResponse.quotes.forEach(quote => {
            if (quote.author_id && quote.author_name) {
              if (!userMap.has(quote.author_id)) {
                userMap.set(quote.author_id, {
                  id: quote.author_id,
                  username: quote.author_name,
                  quoteCount: 1,
                  likes_count: quote.likes_count || 0,
                  dislikes_count: quote.dislikes_count || 0,
                  created_at: quote.created_at
                });
              } else {
                const user = userMap.get(quote.author_id);
                user.quoteCount += 1;
                user.likes_count += quote.likes_count || 0;
                user.dislikes_count += quote.dislikes_count || 0;
              }
            }
          });
          data = Array.from(userMap.values());
        } else {
          throw new Error('No quotes available for fallback');
        }
      }
      
      // Handle different response formats
      if (data && data.success && Array.isArray(data.data)) {
        setUsers(data.data);
      } else if (Array.isArray(data)) {
        setUsers(data);
      } else if (data && data.users && Array.isArray(data.users)) {
        setUsers(data.users);
      } else {
        console.warn('Unexpected API response format:', data);
        setUsers([]);
        setError('Unexpected data format received from server');
      }
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Failed to load users. Please try again.');
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
          <p className="text-gray-600 mb-6">You need to be logged in to view users.</p>
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
            <p className="text-gray-600">Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Heart className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Users</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={loadUsers}>Try Again</Button>
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
            href="/"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          
          <div className="flex items-center space-x-3">
            <Users className="h-8 w-8 text-red-500" />
            <h1 className="text-3xl font-bold text-gray-900">Community Users</h1>
          </div>
          <p className="text-gray-600 mt-2">
            Discover the amazing community of quote creators and their contributions
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <Users className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-gray-900">
              {Array.isArray(users) ? users.length : 0}
            </h3>
            <p className="text-gray-600">Total Users</p>
          </div>
          
                     <div className="bg-white rounded-lg shadow-md p-6 text-center">
             <Quote className="h-8 w-8 text-blue-500 mx-auto mb-2" />
             <h3 className="text-2xl font-bold text-gray-900">
               {Array.isArray(users) ? users.reduce((sum, user) => sum + (user.quoteCount || user.quotes_count || 0), 0) : 0}
             </h3>
             <p className="text-gray-600">Total Quotes</p>
           </div>
           
           <div className="bg-white rounded-lg shadow-md p-6 text-center">
             <ThumbsUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
             <h3 className="text-2xl font-bold text-gray-900">
               {Array.isArray(users) ? users.reduce((sum, user) => sum + (user.likes_count || user.totalLikes || 0), 0) : 0}
             </h3>
             <p className="text-gray-600">Total Likes</p>
           </div>
           
           <div className="bg-white rounded-lg shadow-md p-6 text-center">
             <ThumbsDown className="h-8 w-8 text-gray-500 mx-auto mb-2" />
             <h3 className="text-2xl font-bold text-gray-900">
               {Array.isArray(users) ? users.reduce((sum, user) => sum + (user.dislikes_count || user.totalDislikes || 0), 0) : 0}
             </h3>
             <p className="text-gray-600">Total Dislikes</p>
           </div>
        </div>



        {/* Users List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Users & Statistics</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quotes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Likes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dislikes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
                             <tbody className="bg-white divide-y divide-gray-200">
                 {users.map((user, index) => {
                   return (
                     <tr key={user.id || index} className="hover:bg-gray-50">
                       <td className="px-6 py-4 whitespace-nowrap">
                         <div className="flex items-center">
                           <div className="flex-shrink-0 h-10 w-10">
                             <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                               <User className="h-6 w-6 text-red-600" />
                             </div>
                           </div>
                           <div className="ml-4">
                             <div className="text-sm font-medium text-gray-900">
                               {user.username || user.name || 'Unknown'}
                             </div>
                             <div className="text-sm text-gray-500">
                               ID: {user.id || user.userId || 'NO_ID'} | 
                               Fields: {Object.keys(user).join(', ')}
                             </div>
                           </div>
                         </div>
                       </td>
                       
                       <td className="px-6 py-4 whitespace-nowrap">
                         <div className="text-sm text-gray-900">{user.quoteCount || user.quotes_count || 0}</div>
                         <div className="text-sm text-gray-500">quotes</div>
                       </td>
                       
                       <td className="px-6 py-4 whitespace-nowrap">
                         <div className="flex items-center">
                           <ThumbsUp className="h-4 w-4 text-green-500 mr-2" />
                           <span className="text-sm text-gray-900">{user.likes_count || user.totalLikes || 0}</span>
                         </div>
                       </td>
                       
                       <td className="px-6 py-4 whitespace-nowrap">
                         <div className="flex items-center">
                           <ThumbsDown className="h-4 w-4 text-gray-500 mr-2" />
                           <span className="text-sm text-gray-900">{user.dislikes_count || user.totalDislikes || 0}</span>
                         </div>
                       </td>
                       
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                         {formatDate(user.created_at || user.createdAt || new Date())}
                       </td>
                       
                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                         <div className="flex space-x-2">
                           <Link href={`/users/${user.id || user.userId || index}`}>
                             <Button size="sm" variant="outline">
                               View Profile
                             </Button>
                           </Link>
                           {user.id || user.userId ? (
                             <Link href={`/quotes/user/${user.id || user.userId}`}>
                               <Button size="sm" variant="ghost">
                                 View Quotes
                               </Button>
                             </Link>
                           ) : (
                             <span className="text-gray-400 text-xs px-2 py-1">
                               No ID available
                             </span>
                           )}
                         </div>
                       </td>
                     </tr>
                   );
                 })}
               </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {users.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-600">There are no users in the community yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
