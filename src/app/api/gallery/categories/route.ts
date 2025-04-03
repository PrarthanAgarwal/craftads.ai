import { NextRequest, NextResponse } from 'next/server';
import { GalleryService } from '@/services/gallery/galleryService';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get('slug');
    
    // If slug is provided, get the specific category
    if (slug) {
      const category = await GalleryService.getCategoryBySlug(slug);
      
      if (!category) {
        return NextResponse.json(
          { success: false, error: 'Category not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        data: category
      });
    }
    
    // Otherwise, get all categories
    const categories = await GalleryService.getCategories();
    
    return NextResponse.json({
      success: true,
      data: categories
    });
  } catch (error: any) {
    console.error('Error fetching gallery categories:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch gallery categories' 
      },
      { status: 500 }
    );
  }
} 