import { NextRequest, NextResponse } from 'next/server';
import { GalleryService } from '@/services/gallery/galleryService';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = session.user.id || '';
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID not found in session' },
        { status: 400 }
      );
    }
    
    // Get user's favorite templates
    const favorites = await GalleryService.getUserFavorites(userId);
    
    return NextResponse.json({
      success: true,
      data: favorites
    });
  } catch (error: any) {
    console.error('Error fetching user favorites:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch user favorites' 
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = session.user.id || '';
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID not found in session' },
        { status: 400 }
      );
    }
    
    // Parse request body
    const body = await req.json();
    const { templateId, action } = body;
    
    if (!templateId) {
      return NextResponse.json(
        { success: false, error: 'Template ID is required' },
        { status: 400 }
      );
    }
    
    if (!action || !['add', 'remove', 'check'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Valid action is required (add, remove, or check)' },
        { status: 400 }
      );
    }
    
    // Handle different actions
    if (action === 'add') {
      await GalleryService.addFavorite(userId, templateId);
      return NextResponse.json({
        success: true,
        message: 'Template added to favorites'
      });
    } else if (action === 'remove') {
      await GalleryService.removeFavorite(userId, templateId);
      return NextResponse.json({
        success: true,
        message: 'Template removed from favorites'
      });
    } else if (action === 'check') {
      const isFavorite = await GalleryService.isFavorite(userId, templateId);
      return NextResponse.json({
        success: true,
        data: { isFavorite }
      });
    }
    
    // This should never happen due to the validation above
    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error managing favorites:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to manage favorites' },
      { status: 500 }
    );
  }
} 