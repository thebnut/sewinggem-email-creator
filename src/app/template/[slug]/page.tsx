'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Copy } from 'lucide-react';

interface TemplateData {
  name: string;
  content: string;
  html: string;
  placeholders: string[] | null;
}

export default function TemplateViewerPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  
  const [template, setTemplate] = useState<TemplateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  
  useEffect(() => {
    fetchTemplate();
  }, [slug, searchParams]);
  
  const fetchTemplate = async () => {
    try {
      // Build query string from search params
      const queryString = searchParams.toString();
      const url = `/api/templates/${slug}${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setTemplate(data.template);
      } else {
        setError(data.error || 'Template not found');
      }
    } catch (err) {
      setError('Failed to load template');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCopy = async () => {
    if (!template) return;
    
    try {
      // Copy the markdown content to clipboard
      await navigator.clipboard.writeText(template.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };
  
  const handleCopyHtml = async () => {
    if (!template) return;
    
    try {
      // Copy the HTML content to clipboard
      await navigator.clipboard.writeText(template.html);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div>Loading template...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-lg font-semibold mb-2">Template Not Found</h2>
              <p className="text-gray-600">{error}</p>
              
              {template?.placeholders && template.placeholders.length > 0 && (
                <div className="mt-4 p-4 bg-gray-50 rounded-md text-left">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    This template requires the following parameters in the URL:
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {template.placeholders.map((placeholder) => (
                      <li key={placeholder}>
                        • {placeholder}
                      </li>
                    ))}
                  </ul>
                  <p className="text-sm text-gray-600 mt-3">
                    Example: ?CUSTOMER_NAME=John&ORDER_NUMBER=12345
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{template?.name}</CardTitle>
                <p className="text-sm text-gray-600 mt-2">
                  SewingGem Email Template
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Text
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyHtml}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy HTML
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-white border rounded-lg p-6">
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: template?.html || '' }}
              />
            </div>
            
            {/* Show missing placeholders if any */}
            {template?.placeholders && template.placeholders.length > 0 && (
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-md">
                <p className="text-sm font-medium text-amber-900 mb-2">
                  Template Placeholders:
                </p>
                <div className="flex flex-wrap gap-2">
                  {template.placeholders.map((placeholder) => {
                    const hasValue = searchParams.has(placeholder);
                    return (
                      <span
                        key={placeholder}
                        className={`px-3 py-1 rounded-md text-sm font-mono ${
                          hasValue
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : 'bg-gray-100 text-gray-800 border border-gray-200'
                        }`}
                      >
                        {placeholder}
                        {hasValue && `: ${searchParams.get(placeholder)}`}
                      </span>
                    );
                  })}
                </div>
                {template.placeholders.some(p => !searchParams.has(p)) && (
                  <p className="text-sm text-amber-800 mt-3">
                    Add missing placeholders to the URL as query parameters.
                    <br />
                    Example: ?CUSTOMER_NAME=John&ORDER_NUMBER=12345
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}