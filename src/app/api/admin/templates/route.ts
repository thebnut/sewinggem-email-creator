import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { z } from 'zod';
import { extractPlaceholders, slugify } from '@/lib/placeholder';

const createTemplateSchema = z.object({
  name: z.string().min(1).max(255),
  content: z.string().min(1),
});

// GET /api/admin/templates - List all templates
export async function GET() {
  const session = await getSession();
  
  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  try {
    const templates = await prisma.template.findMany({
      orderBy: { updatedAt: 'desc' },
    });
    
    return NextResponse.json({
      success: true,
      templates,
    });
  } catch (error) {
    console.error('Failed to fetch templates:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

// POST /api/admin/templates - Create new template
export async function POST(request: NextRequest) {
  const session = await getSession();
  
  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  try {
    const body = await request.json();
    const { name, content } = createTemplateSchema.parse(body);
    
    const slug = slugify(name);
    const placeholders = extractPlaceholders(content);
    
    // Check if slug already exists
    const existing = await prisma.template.findUnique({
      where: { slug },
    });
    
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'A template with this name already exists' },
        { status: 400 }
      );
    }
    
    const template = await prisma.template.create({
      data: {
        name,
        slug,
        content,
        placeholders: placeholders.length > 0 ? placeholders : undefined,
      },
    });
    
    // Log the action
    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        templateId: template.id,
        templateName: template.name,
        details: { createdBy: session.username },
      },
    });
    
    return NextResponse.json({
      success: true,
      template,
    });
  } catch (error) {
    console.error('Failed to create template:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create template' },
      { status: 500 }
    );
  }
}