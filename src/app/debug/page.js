'use client';

import { useState } from 'react';
import { quotesApi } from '@/lib/api';

export default function DebugPage() {
  const [testResults, setTestResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (message, type = 'info') => {
    setTestResults(prev => [...prev, { message, type, timestamp: new Date().toISOString() }]);
  };

  const testUserQuotes = async () => {
    setIsLoading(true);
    setTestResults([]);
    
    try {
      addResult('🚀 Starting user quotes API test...', 'info');
      
      // Test 1: Test with user ID 1
      addResult('📡 Testing API call to /quotes/user/1', 'info');
      const response1 = await quotesApi.getByUser('1', { page: 1, limit: 3 });
      addResult(`✅ User 1 quotes loaded: ${response1.quotes?.length || 0} quotes`, 'success');
      
      if (response1.quotes && response1.quotes.length > 0) {
        const firstQuote = response1.quotes[0];
        addResult(`📝 First quote: "${firstQuote.content.substring(0, 50)}..."`, 'info');
        addResult(`👤 Author ID: ${firstQuote.author_id}`, 'info');
        addResult(`👤 Author Name: ${firstQuote.author_name}`, 'info');
      }
      
      // Test 2: Test with user ID 2
      addResult('📡 Testing API call to /quotes/user/2', 'info');
      const response2 = await quotesApi.getByUser('2', { page: 1, limit: 3 });
      addResult(`✅ User 2 quotes loaded: ${response2.quotes?.length || 0} quotes`, 'success');
      
      // Test 3: Test with invalid user ID
      addResult('📡 Testing API call to /quotes/user/999', 'info');
      try {
        const response3 = await quotesApi.getByUser('999', { page: 1, limit: 3 });
        addResult(`✅ User 999 quotes loaded: ${response3.quotes?.length || 0} quotes`, 'success');
      } catch (error) {
        addResult(`❌ User 999 error: ${error.message}`, 'error');
      }
      
      addResult('🎉 All tests completed!', 'success');
      
    } catch (error) {
      addResult(`❌ Test failed: ${error.message}`, 'error');
      console.error('Debug test error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testHomepageQuotes = async () => {
    setIsLoading(true);
    setTestResults([]);
    
    try {
      addResult('🚀 Starting homepage quotes API test...', 'info');
      
      addResult('📡 Testing API call to /quotes (homepage)', 'info');
      const response = await quotesApi.getAll({ page: 1, limit: 3 });
      addResult(`✅ Homepage quotes loaded: ${response.quotes?.length || 0} quotes`, 'success');
      
      if (response.quotes && response.quotes.length > 0) {
        const firstQuote = response.quotes[0];
        addResult(`📝 First quote: "${firstQuote.content.substring(0, 50)}..."`, 'info');
        addResult(`👤 Author ID: ${firstQuote.author_id}`, 'info');
        addResult(`👤 Author Name: ${firstQuote.author_name}`, 'info');
        addResult(`👤 Author Username: ${firstQuote.author_username}`, 'info');
      }
      
      addResult('🎉 Homepage test completed!', 'success');
      
    } catch (error) {
      addResult(`❌ Test failed: ${error.message}`, 'error');
      console.error('Debug test error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">🔧 Debug & Testing Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">🧪 API Tests</h2>
            <div className="space-y-4">
              <button
                onClick={testUserQuotes}
                disabled={isLoading}
                className="w-full bg-blue-500 text-white px-4 py-3 rounded disabled:opacity-50 hover:bg-blue-600"
              >
                {isLoading ? 'Testing...' : 'Test User Quotes API'}
              </button>
              
              <button
                onClick={testHomepageQuotes}
                disabled={isLoading}
                className="w-full bg-green-500 text-white px-4 py-3 rounded disabled:opacity-50 hover:bg-green-600"
              >
                {isLoading ? 'Testing...' : 'Test Homepage Quotes API'}
              </button>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">📊 API Configuration</h2>
            <div className="space-y-2 text-sm">
              <p><strong>API Base URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api'}</p>
              <p><strong>Environment:</strong> {process.env.NODE_ENV}</p>
              <p><strong>Timestamp:</strong> {new Date().toISOString()}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">📋 Test Results</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-gray-500">No test results yet. Run a test to see results.</p>
            ) : (
              testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded border-l-4 ${
                    result.type === 'success' ? 'border-green-500 bg-green-50' :
                    result.type === 'error' ? 'border-red-500 bg-red-50' :
                    'border-blue-500 bg-blue-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{result.message}</span>
                    <span className="text-xs text-gray-500">{result.timestamp}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
