import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { replacePlaceholders } from '@/lib/placeholder';
import { renderMarkdown } from '@/lib/markdown';

// GET /api/templates/[slug] - Get template with placeholders replaced
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const template = await prisma.template.findUnique({
      where: { slug },
    });
    
    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      );
    }
    
    // Get URL parameters for placeholder replacement
    const searchParams = request.nextUrl.searchParams;
    const placeholderValues: Record<string, string> = {};
    
    searchParams.forEach((value, key) => {
      // Decode the value (handles URL encoding)
      placeholderValues[key] = decodeURIComponent(value);
    });
    
    // Replace placeholders in content
    const processedContent = replacePlaceholders(template.content, placeholderValues);
    
    // Render markdown to HTML
    const html = renderMarkdown(processedContent);
    
    return NextResponse.json({
      success: true,
      template: {
        name: template.name,
        content: processedContent,
        html,
        placeholders: template.placeholders,
      },
    });
  } catch (error) {
    console.error('Failed to fetch template:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch template' },
      { status: 500 }
    );
  }
}