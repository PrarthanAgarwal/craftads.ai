import { NextRequest, NextResponse } from 'next/server';
import { GalleryService, TemplateSearchParams } from '@/services/gallery/galleryService';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const urlParams = url.searchParams;
    
    // Extract search parameters
    const templateParams: TemplateSearchParams = {
      query: urlParams.get('q') || undefined,
      category: urlParams.get('category') || undefined,
      limit: urlParams.has('limit') ? parseInt(urlParams.get('limit') as string, 10) : 50,
      offset: urlParams.has('offset') ? parseInt(urlParams.get('offset') as string, 10) : 0,
      isPremium: urlParams.has('premium') 
        ? urlParams.get('premium') === 'true'
        : undefined,
      isFeatured: urlParams.has('featured')
        ? urlParams.get('featured') === 'true'
        : undefined
    };
    
    // Use the modified method that doesn't rely on the stored procedure
    const templates = await GalleryService.getTemplates(templateParams);
    
    return NextResponse.json({
      success: true,
      data: templates,
      meta: {
        count: templates.length,
        limit: templateParams.limit,
        offset: templateParams.offset
      }
    });
  } catch (error: any) {
    console.error('Error fetching gallery templates:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch gallery templates' 
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication - only admins should be able to add templates
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Check if user is admin (implementation depends on your auth model)
    // This is a placeholder - implement your admin check logic
    const isAdmin = session.user?.email?.endsWith('@craftads.com') || false;
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Admin privileges required' },
        { status: 403 }
      );
    }
    
    // For now, this endpoint is not implemented
    // In the future, it would handle template creation
    return NextResponse.json(
      { success: false, error: 'Template creation API not yet implemented' },
      { status: 501 }
    );
  } catch (error: any) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create template' },
      { status: 500 }
    );
  }
} 