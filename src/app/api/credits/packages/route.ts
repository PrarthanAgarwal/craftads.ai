import { NextResponse } from 'next/server';
import { getCreditPackages } from '@/lib/supabase';

export async function GET() {
  try {
    // Get credit packages (doesn't require authentication)
    const packages = await getCreditPackages();
    
    return NextResponse.json({
      success: true,
      data: {
        packages
      }
    });
  } catch (error) {
    console.error('Error fetching credit packages:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'SERVER_ERROR', 
          message: 'Failed to fetch credit packages' 
        } 
      },
      { status: 500 }
    );
  }
} 