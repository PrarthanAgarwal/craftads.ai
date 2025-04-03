import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { completePayment } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    // Get the authenticated user session
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }
    
    // Parse the request body
    const body = await request.json();
    
    // Validate the request
    if (!body.paymentSessionId) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Payment session ID is required' } },
        { status: 422 }
      );
    }
    
    // In a real application, you would verify the payment status with your payment provider
    // For this mock implementation, we'll assume the payment was successful
    
    // Complete the payment
    const payment = await completePayment(
      body.paymentSessionId,
      body.providerPaymentId || `mock_${Date.now()}`, // In a real app, this would come from the payment provider
      'completed' // In a real app, this would be determined by the payment provider's response
    );
    
    return NextResponse.json({
      success: true,
      data: {
        transactionId: payment.id,
        status: 'completed',
        creditsPurchased: payment.credits_purchased,
        receiptUrl: `/api/receipts/${payment.id}` // In a real app, you'd generate a receipt
      }
    });
  } catch (error) {
    console.error('Error completing credit purchase:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'SERVER_ERROR', 
          message: 'Failed to complete credit purchase' 
        } 
      },
      { status: 500 }
    );
  }
} 