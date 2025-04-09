import { NextResponse } from 'next/server';
import { getCreditPackages } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    // Get the billing period from query params
    const { searchParams } = new URL(request.url);
    const isYearly = searchParams.get('yearly') === 'true';

    // Get credit packages (doesn't require authentication)
    const packages = await getCreditPackages();
    
    // Filter packages based on billing period
    const filteredPackages = packages.filter(pkg => 
      isYearly ? pkg.name.includes('Yearly') : !pkg.name.includes('Yearly')
    );

    return NextResponse.json({
      success: true,
      data: {
        packages: filteredPackages
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