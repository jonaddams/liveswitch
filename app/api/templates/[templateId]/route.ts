import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ templateId: string }> }
) {
  try {
    const { templateId } = await params;
    
    // Validate template ID to prevent path traversal
    if (!/^[a-z-]+$/.test(templateId)) {
      return NextResponse.json(
        { error: 'Invalid template ID' },
        { status: 400 }
      );
    }

    const templatePath = join(process.cwd(), 'templates', `${templateId}.html`);
    const templateContent = await readFile(templatePath, 'utf-8');
    
    return new NextResponse(templateContent, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('Error loading template:', error);
    return NextResponse.json(
      { error: 'Template not found' },
      { status: 404 }
    );
  }
}