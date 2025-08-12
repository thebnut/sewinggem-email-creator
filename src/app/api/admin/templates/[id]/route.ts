import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { z } from 'zod';
import { extractPlaceholders, slugify } from '@/lib/placeholder';

const updateTemplateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  content: z.string().min(1).optional(),
});

// GET /api/admin/templates/[id] - Get single template
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession();
  
  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  try {
    const template = await prisma.template.findUnique({
      where: { id: parseInt(id) },
    });
    
    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      template,
    });
  } catch (error) {
    console.error('Failed to fetch template:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch template' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/templates/[id] - Update template
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession();
  
  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  try {
    const body = await request.json();
    const { name, content } = updateTemplateSchema.parse(body);
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: Record<string, any> = {};
    
    if (name !== undefined) {
      updateData.name = name;
      updateData.slug = slugify(name);
      
      // Check if new slug conflicts with another template
      const existing = await prisma.template.findFirst({
        where: {
          slug: updateData.slug,
          NOT: { id: parseInt(id) },
        },
      });
      
      if (existing) {
        return NextResponse.json(
          { success: false, error: 'A template with this name already exists' },
          { status: 400 }
        );
      }
    }
    
    if (content !== undefined) {
      updateData.content = content;
      const placeholders = extractPlaceholders(content);
      updateData.placeholders = placeholders.length > 0 ? placeholders : undefined;
    }
    
    const template = await prisma.template.update({
      where: { id: parseInt(id) },
      data: updateData,
    });
    
    // Log the action
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE',
        templateId: template.id,
        templateName: template.name,
        details: { updatedBy: session.username },
      },
    });
    
    return NextResponse.json({
      success: true,
      template,
    });
  } catch (error) {
    console.error('Failed to update template:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update template' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/templates/[id] - Delete template
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getSession();
  
  if (!session) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  try {
    const template = await prisma.template.findUnique({
      where: { id: parseInt(id) },
    });
    
    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      );
    }
    
    await prisma.template.delete({
      where: { id: parseInt(id) },
    });
    
    // Log the action
    await prisma.auditLog.create({
      data: {
        action: 'DELETE',
        templateId: template.id,
        templateName: template.name,
        details: { deletedBy: session.username },
      },
    });
    
    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Failed to delete template:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete template' },
      { status: 500 }
    );
  }
}