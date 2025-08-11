'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import dynamic from 'next/dynamic';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import { extractPlaceholders, slugify } from '@/lib/placeholder';

const MDEditor = dynamic(
  () => import('@uiw/react-md-editor'),
  { ssr: false }
);

export default function EditTemplatePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    fetchTemplate();
  }, [id]);
  
  const fetchTemplate = async () => {
    try {
      const response = await fetch(`/api/admin/templates/${id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.template) {
          setName(data.template.name);
          setContent(data.template.content);
        }
      } else if (response.status === 401) {
        router.push('/login');
      } else {
        setError('Template not found');
      }
    } catch (error) {
      setError('Failed to load template');
    } finally {
      setLoading(false);
    }
  };
  
  const placeholders = extractPlaceholders(content || '');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    
    try {
      const response = await fetch(`/api/admin/templates/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          content,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        router.push('/dashboard');
      } else {
        setError(data.error || 'Failed to update template');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>Loading template...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Edit Template</CardTitle>
            <CardDescription>
              Update your email template
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Template Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Enrollment Confirmation"
                  required
                  disabled={saving}
                />
                {name && (
                  <p className="text-sm text-gray-600">
                    URL will be: /template/{slugify(name)}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label>Template Content</Label>
                <div className="bg-blue-50 p-4 rounded-md mb-4">
                  <p className="text-sm text-blue-900 font-medium mb-2">
                    How to use placeholders:
                  </p>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Use double curly braces: {'{{PLACEHOLDER_NAME}}'}</li>
                    <li>• Use UPPERCASE letters and underscores only</li>
                    <li>• Examples: {'{{CUSTOMER_NAME}}'}, {'{{ORDER_NUMBER}}'}, {'{{DATE}}'}</li>
                  </ul>
                </div>
                
                <div className="border rounded-md">
                  <MDEditor
                    value={content}
                    onChange={(val) => setContent(val || '')}
                    preview="edit"
                    height={400}
                  />
                </div>
                
                {placeholders.length > 0 && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-md">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Detected Placeholders:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {placeholders.map((placeholder) => (
                        <span
                          key={placeholder}
                          className="px-3 py-1 bg-white border rounded-md text-sm font-mono"
                        >
                          {placeholder}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {error && (
                <div className="text-sm text-red-600">
                  {error}
                </div>
              )}
              
              <div className="flex justify-end gap-4">
                <Link href="/dashboard">
                  <Button type="button" variant="outline" disabled={saving}>
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={saving || !name || !content}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}