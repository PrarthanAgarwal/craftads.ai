import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Mock data for generations
interface Generation {
  id: string;
  userId: string;
  imageUrl: string;
  createdAt: string;
  prompt: string;
  model: string;
  creditsCost: number;
}

// In a real app, this would come from a database
const mockGenerations: Generation[] = Array.from({ length: 17 }).map((_, i) => {
  // Create a date some random time in the past (up to 30 days ago)
  const daysAgo = Math.floor(Math.random() * 30);
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  
  const mockPrompts = [
    "Product integration with sleek fashion ad style",
    "Style transfer from luxury brand ad to my product",
    "Custom ad with minimalist aesthetic",
    "Product showcased in seasonal summer theme",
    "Brand adaptation with modern typography"
  ];

  return {
    id: `gen-${Date.now() + i}`,
    userId: 'user-1',
    imageUrl: `/images/mock_generations/generation_${(i % 5) + 1}.jpg`,
    createdAt: date.toISOString(),
    prompt: mockPrompts[i % mockPrompts.length],
    model: "Mock GPT-4o",
    creditsCost: 1
  };
});

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

    // Get pagination parameters
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '8', 10);
    const sortOrder = url.searchParams.get('sort') || 'desc';
    
    // Validate pagination parameters
    if (isNaN(page) || page < 1) {
      return NextResponse.json(
        { success: false, error: 'Invalid page parameter' },
        { status: 400 }
      );
    }
    
    if (isNaN(limit) || limit < 1 || limit > 100) {
      return NextResponse.json(
        { success: false, error: 'Invalid limit parameter' },
        { status: 400 }
      );
    }

    // Calculate offsets for pagination
    const startIndex = (page - 1) * limit;
    
    // Filter generations for the current user
    // In a real app, this would be a database query
    let filteredGenerations = mockGenerations.filter(
      // In a real app, we would match on the actual user ID
      // For now, let's just return all mock generations
      // (gen) => gen.userId === session.user.id
      () => true
    );
    
    // Sort generations
    filteredGenerations = filteredGenerations.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });
    
    // Paginate
    const paginatedGenerations = filteredGenerations.slice(
      startIndex,
      startIndex + limit
    );
    
    // Calculate total pages
    const totalItems = filteredGenerations.length;
    const totalPages = Math.ceil(totalItems / limit);
    
    // Return the paginated results
    return NextResponse.json({
      success: true,
      data: {
        generations: paginatedGenerations,
        pagination: {
          page,
          limit,
          totalItems,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
    
  } catch (error: any) {
    console.error('Error fetching generation history:', error);
    return NextResponse.json(
      { success: false, error: 'Server error while fetching generation history' },
      { status: 500 }
    );
  }
} 