import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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

    // Parse request body
    const body = await req.json();
    const { generationId, imageUrl, prompt, metadata } = body;

    // Validate required fields
    if (!generationId || !imageUrl) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: generationId and imageUrl are required' },
        { status: 400 }
      );
    }
    
    // In a real implementation, we would save this to a database
    // For now, we'll just log it and pretend it's saved
    console.log('Recording generation for user:', session.user.email);
    console.log('Generation ID:', generationId);
    console.log('Image URL:', imageUrl);
    
    /* 
    This would be the real implementation when we have a database:
    
    await db.generations.create({
      data: {
        id: generationId,
        userId: session.user.id,
        imageUrl: imageUrl,
        prompt: prompt,
        metadata: metadata,
        createdAt: new Date()
      }
    });
    */
    
    // Return success
    return NextResponse.json({
      success: true,
      data: {
        id: generationId,
        recorded: true
      }
    });
    
  } catch (error: any) {
    console.error('Error recording generation:', error);
    return NextResponse.json(
      { success: false, error: 'Server error while recording generation' },
      { status: 500 }
    );
  }
} 