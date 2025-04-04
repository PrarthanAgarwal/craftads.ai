import { NextRequest, NextResponse } from 'next/server';
import { GalleryService, TemplateSearchParams } from '@/services/gallery/galleryService';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Function to generate a deterministic hash from a string
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

// Fisher-Yates shuffle algorithm with seed
function seedShuffle<T>(array: T[], seed: string): T[] {
  const result = [...array];
  const seedValue = hashString(seed);
  let currentSeed = seedValue;
  
  // Seeded random number generator
  const seededRandom = () => {
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    return currentSeed / 233280;
  };
  
  for (let i = result.length - 1; i > 0; i--) {
    // Use seeded random for consistent shuffle
    const j = Math.floor(seededRandom() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  
  return result;
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const urlParams = url.searchParams;
    
    // Extract search parameters
    const categoryParam = urlParams.get('category');
    
    // Parse multiple categories if present (comma-separated)
    let categories: string[] | undefined;
    if (categoryParam?.includes(',')) {
      categories = categoryParam.split(',').filter(Boolean);
    }
    
    const templateParams: TemplateSearchParams = {
      query: urlParams.get('q') || undefined,
      category: categories || categoryParam || undefined,
      limit: urlParams.has('limit') ? parseInt(urlParams.get('limit') as string, 10) : 50,
      offset: urlParams.has('offset') ? parseInt(urlParams.get('offset') as string, 10) : 0,
      isPremium: urlParams.has('premium') 
        ? urlParams.get('premium') === 'true'
        : undefined,
      isFeatured: urlParams.has('featured')
        ? urlParams.get('featured') === 'true'
        : undefined
    };
    
    // Check for random ordering flag
    const random = urlParams.get('random') === 'true';
    const seed = urlParams.get('seed') || Date.now().toString();
    
    // Use the modified method that doesn't rely on the stored procedure
    let templates = await GalleryService.getTemplates(templateParams);
    
    // Apply random ordering if requested
    if (random) {
      templates = seedShuffle(templates, seed);
    }
    
    return NextResponse.json({
      success: true,
      data: templates,
      meta: {
        count: templates.length,
        limit: templateParams.limit,
        offset: templateParams.offset,
        seed: seed
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