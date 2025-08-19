'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { quotesApi } from '@/lib/api';
import Button from '@/components/ui/Button';

export default function DebugPage() {
  const { user, isAuthenticated, token, isLoading: authLoading, error: authError } = useAuth();
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  const testAPI = async () => {
    setIsTesting(true);
    setTestResult(null);
    
    try {
      // Test quotes API
      const quotes = await quotesApi.getAll({ limit: 1 });
      setTestResult({
        success: true,
        message: 'API test successful',
        data: quotes
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: error.message,
        error: error
      });
    } finally {
      setIsTesting(false);
    }
  };

  const testCreateQuote = async () => {
    if (!isAuthenticated) {
      setTestResult({
        success: false,
        message: 'Not authenticated'
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);
    
    try {
      const quote = await quotesApi.create({
        content: 'This is a test quote from debug page'
      });
      setTestResult({
        success: true,
        message: 'Quote creation test successful',
        data: quote
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: error.message,
        error: error
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Debug Page</h1>
        
        {/* Authentication Status */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Authentication Status</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>Loading:</strong> {authLoading ? 'Yes' : 'No'}</p>
              <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
              <p><strong>Has User:</strong> {user ? 'Yes' : 'No'}</p>
              <p><strong>Has Token:</strong> {token ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <p><strong>Username:</strong> {user?.username || 'None'}</p>
              <p><strong>User ID:</strong> {user?.id || 'None'}</p>
              <p><strong>Token Length:</strong> {token ? token.length : 0}</p>
              <p><strong>Auth Error:</strong> {authError || 'None'}</p>
            </div>
          </div>
        </div>

        {/* Environment Variables */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Environment Variables</h2>
          <div className="text-sm">
            <p><strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'Not set'}</p>
            <p><strong>Node Env:</strong> {process.env.NODE_ENV}</p>
          </div>
        </div>

        {/* API Tests */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">API Tests</h2>
          <div className="space-y-4">
            <div className="flex space-x-4">
              <Button onClick={testAPI} disabled={isTesting}>
                Test Quotes API
              </Button>
              <Button onClick={testCreateQuote} disabled={isTesting || !isAuthenticated}>
                Test Create Quote
              </Button>
            </div>
            
            {testResult && (
              <div className={`p-4 rounded-md ${
                testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <p className={`text-sm ${testResult.success ? 'text-green-800' : 'text-red-800'}`}>
                  <strong>{testResult.success ? 'Success:' : 'Error:'}</strong> {testResult.message}
                </p>
                {testResult.data && (
                  <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                    {JSON.stringify(testResult.data, null, 2)}
                  </pre>
                )}
                {testResult.error && (
                  <pre className="mt-2 text-xs bg-red-100 p-2 rounded overflow-auto">
                    {JSON.stringify(testResult.error, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Local Storage */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Local Storage</h2>
          <div className="text-sm">
            <p><strong>Token:</strong> {typeof window !== 'undefined' ? (localStorage.getItem('token') ? 'Present' : 'Not found') : 'Server side'}</p>
            <p><strong>Token Value:</strong> {typeof window !== 'undefined' ? (localStorage.getItem('token') ? `${localStorage.getItem('token').substring(0, 50)}...` : 'None') : 'Server side'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
