'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/context/AuthContext';
import { quotesApi } from '@/lib/api';
import Button from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';
import { Heart, Plus, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

const createQuoteSchema = z.object({
  content: z.string().min(10, 'Quote must be at least 10 characters long').max(1000, 'Quote must be less than 1000 characters'),
});

export default function CreateQuotePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/create-quote');
    }
  }, [isAuthenticated, authLoading, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(createQuoteSchema),
  });

  const content = watch('content', '');
  const characterCount = content.length;

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(false);
      
      console.log('Creating quote with data:', data);
      const result = await quotesApi.create(data);
      console.log('Quote creation result:', result);
      
      setSuccess(true);
      reset(); // Clear the form
      
      // Redirect after a short delay to show success message
      setTimeout(() => {
        router.push('/my-quotes');
      }, 2000);
      
    } catch (err) {
      console.error('Quote creation error:', err);
      
      if (err.status === 401) {
        // Authentication error - redirect to login
        router.push('/login?redirect=/create-quote');
        return;
      }
      
      setError(err.message || 'Failed to create quote. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to create quotes.</p>
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/my-quotes"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to My Quotes
          </Link>
          
          <div className="flex items-center space-x-3">
            <Heart className="h-8 w-8 text-red-500" />
            <h1 className="text-3xl font-bold text-gray-900">Create New Quote</h1>
          </div>
          <p className="text-gray-600 mt-2">
            Welcome back, <span className="font-semibold text-red-600">{user?.username}</span>! Share your wisdom and inspire others with a meaningful quote
          </p>
        </div>

        {/* Create Quote Form */}
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Quote Content
              </label>
              <Textarea
                id="content"
                rows={6}
                placeholder="Enter your inspiring quote here..."
                error={!!errors.content}
                errorMessage={errors.content?.message}
                {...register('content')}
                className="resize-none"
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-sm text-gray-500">
                  Share wisdom that resonates with others
                </p>
                <span className={`text-sm ${
                  characterCount > 900 ? 'text-red-500' : 'text-gray-500'
                }`}>
                  {characterCount}/1000
                </span>
              </div>
            </div>

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <p className="text-sm text-green-600">
                    Quote created successfully! Redirecting to your quotes...
                  </p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                type="submit"
                className="flex-1"
                loading={isLoading}
                disabled={isLoading || success}
                size="lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                {success ? 'Quote Created!' : 'Create Quote'}
              </Button>
              
              <Link href="/my-quotes" className="flex-1">
                <Button variant="outline" size="lg" className="w-full">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </div>

        {/* Tips */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Tips for Great Quotes</h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              Keep it concise but meaningful
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              Share personal insights or favorite wisdom
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              Make sure it's original or properly attributed
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              Consider how it might inspire others
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
