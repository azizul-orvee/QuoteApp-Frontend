'use client';

import { useState, useEffect } from 'react';
import { quotesApi } from '@/lib/api';

export default function TestUserQuotesPage() {
  const [quotes, setQuotes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState('1');

  const testUserQuotes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Testing user quotes for ID:', userId);
      const response = await quotesApi.getByUser(userId, { page: 1, limit: 5 });
      
      console.log('API Response:', response);
      setQuotes(response.quotes || []);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Test User Quotes API</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter User ID"
              className="border p-2 rounded"
            />
            <button
              onClick={testUserQuotes}
              disabled={isLoading}
              className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Test API'}
            </button>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          {quotes.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Quotes for User {userId}:</h2>
              <div className="space-y-4">
                {quotes.map((quote) => (
                  <div key={quote.id} className="border p-4 rounded">
                    <p className="text-lg mb-2">"{quote.content}"</p>
                    <div className="text-sm text-gray-600">
                      <p>Author ID: {quote.author_id}</p>
                      <p>Author Name: {quote.author_name}</p>
                      <p>Likes: {quote.likes_count}</p>
                      <p>Dislikes: {quote.dislikes_count}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
