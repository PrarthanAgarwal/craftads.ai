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
    const { requiredCredits = 1, operation = 'unknown' } = body;

    // Fetch the user's credit balance
    const balanceRes = await fetch(`${req.nextUrl.origin}/api/credits/balance`, {
      method: 'GET',
      headers: {
        'Cookie': req.headers.get('cookie') || '',
      }
    });
    
    if (!balanceRes.ok) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch credit balance' },
        { status: 500 }
      );
    }
    
    const balanceData = await balanceRes.json();
    
    // Check if they have enough credits
    if (!balanceData.success || balanceData.data.credits < requiredCredits) {
      return NextResponse.json({
        success: false,
        error: 'Insufficient credits',
        data: {
          requiredCredits,
          availableCredits: balanceData.success ? balanceData.data.credits : 0,
          operation
        }
      });
    }
    
    // Return success
    return NextResponse.json({
      success: true,
      data: {
        requiredCredits,
        availableCredits: balanceData.data.credits,
        operation
      }
    });
    
  } catch (error: any) {
    console.error('Error validating credits:', error);
    return NextResponse.json(
      { success: false, error: 'Server error while validating credits' },
      { status: 500 }
    );
  }
} 