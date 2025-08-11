'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, ExternalLink, LogOut } from 'lucide-react';

interface Template {
  id: number;
  slug: string;
  name: string;
  placeholders: string[] | null;
  updatedAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchTemplates();
  }, []);
  
  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/admin/templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      } else if (response.status === 401) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    
    try {
      const response = await fetch(`/api/admin/templates/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        await fetchTemplates();
      }
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
  };
  
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Email Templates</h1>
            <p className="text-gray-600 mt-2">Manage your SewingGem email templates</p>
          </div>
          <div className="flex gap-4">
            <Link href="/templates/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Template
              </Button>
            </Link>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
        
        {loading ? (
          <div className="text-center py-12">Loading templates...</div>
        ) : templates.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-600 mb-4">No templates yet</p>
              <Link href="/templates/new">
                <Button>Create your first template</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{template.name}</CardTitle>
                      <CardDescription>
                        URL: /template/{template.slug}
                      </CardDescription>
                      {template.placeholders && template.placeholders.length > 0 && (
                        <div className="mt-2">
                          <span className="text-sm text-gray-600">Placeholders: </span>
                          <span className="text-sm font-mono">
                            {template.placeholders.join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/template/${template.slug}`} target="_blank">
                        <Button variant="outline" size="sm">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Link href={`/templates/${template.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(template.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}