'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/context/AuthContext';
import { quotesApi } from '@/lib/api';
import Button from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';
import { Heart, Edit, ArrowLeft, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

const editQuoteSchema = z.object({
  content: z.string().min(10, 'Quote must be at least 10 characters long').max(1000, 'Quote must be less than 1000 characters'),
});

export default function EditQuotePage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [quote, setQuote] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(editQuoteSchema),
  });

  const content = watch('content', '');
  const characterCount = content.length;

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=' + encodeURIComponent(`/quotes/${params.id}/edit`));
      return;
    }

    if (isAuthenticated) {
      loadQuote();
    }
  }, [authLoading, isAuthenticated, params.id, router]);

  const loadQuote = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const quoteData = await quotesApi.getById(params.id);
      
      // Check if user owns this quote
      if (quoteData.author_id !== user?.id && quoteData.userId !== user?.id) {
        setError('You do not have permission to edit this quote');
        return;
      }
      
      setQuote(quoteData);
      setValue('content', quoteData.content);
    } catch (err) {
      console.error('Error loading quote:', err);
      if (err.status === 404) {
        setError('Quote not found');
      } else if (err.status === 403) {
        setError('You do not have permission to edit this quote');
      } else {
        setError('Failed to load quote. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(false);
      
      console.log('Updating quote with data:', data);
      const result = await quotesApi.update(params.id, data);
      console.log('Quote update result:', result);
      
      setSuccess(true);
      
      // Redirect after a short delay to show success message
      setTimeout(() => {
        router.push(`/quotes/${params.id}`);
      }, 2000);
      
    } catch (err) {
      console.error('Quote update error:', err);
      
      if (err.status === 401) {
        // Authentication error - redirect to login
        router.push('/login?redirect=' + encodeURIComponent(`/quotes/${params.id}/edit`));
        return;
      }
      
      if (err.status === 403) {
        setError('You do not have permission to edit this quote');
      } else if (err.status === 404) {
        setError('Quote not found');
      } else {
        setError(err.message || 'Failed to update quote. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-red-500 animate-spin mx-auto mb-4" />
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
          <p className="text-gray-600 mb-6">You need to be logged in to edit quotes.</p>
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

  // Show loading while fetching quote
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-red-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading quote...</p>
        </div>
      </div>
    );
  }

  // Show error if quote couldn't be loaded
  if (error && !quote) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Quote</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button>Go Home</Button>
            </Link>
            <Link href="/my-quotes">
              <Button variant="outline">My Quotes</Button>
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
            href={`/quotes/${params.id}`}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Quote
          </Link>
          
          <div className="flex items-center space-x-3">
            <Heart className="h-8 w-8 text-red-500" />
            <h1 className="text-3xl font-bold text-gray-900">Edit Quote</h1>
          </div>
          <p className="text-gray-600 mt-2">
            Edit your quote, <span className="font-semibold text-red-600">{user?.username}</span>
          </p>
        </div>

        {/* Edit Quote Form */}
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
                    Quote updated successfully! Redirecting to quote view...
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
                loading={isSaving}
                disabled={isSaving || success}
                size="lg"
              >
                <Edit className="h-5 w-5 mr-2" />
                {success ? 'Quote Updated!' : 'Update Quote'}
              </Button>
              
              <Link href={`/quotes/${params.id}`} className="flex-1">
                <Button variant="outline" size="lg" className="w-full">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </div>

        {/* Tips */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Editing Tips</h3>
          <ul className="space-y-2 text-blue-800">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              Keep your quote concise but meaningful
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              Ensure the message is clear and inspiring
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              Check for typos and grammar
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              Consider how your changes might affect readers
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
