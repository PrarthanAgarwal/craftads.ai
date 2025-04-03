import { NextResponse } from 'next/server';
import { completePayment } from '@/lib/supabase';

// This is a mock payment endpoint for demonstration purposes.
// In a real application, this would be handled by your payment provider (e.g., Stripe).
export async function GET(request: Request) {
  try {
    // Get the payment ID from the query string
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('paymentId');
    
    if (!paymentId) {
      return new Response('Payment ID is required', { status: 400 });
    }
    
    // Generate a mock payment provider ID
    const mockProviderPaymentId = `mock_${Date.now()}`;
    
    // Complete the payment
    await completePayment(
      paymentId,
      mockProviderPaymentId,
      'completed'
    );
    
    // In a real application, this would redirect to a success page
    // For this mock implementation, we'll just return a simple HTML page
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Payment Successful</title>
          <style>
            body {
              font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              background-color: #f9f9f9;
            }
            .payment-success {
              background-color: white;
              padding: 2rem;
              border-radius: 8px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              text-align: center;
              max-width: 500px;
            }
            h1 {
              color: #16a34a;
              margin-bottom: 1rem;
            }
            p {
              margin-bottom: 1.5rem;
              color: #4b5563;
            }
            .button {
              background-color: #2563eb;
              color: white;
              padding: 0.75rem 1.5rem;
              border-radius: 4px;
              text-decoration: none;
              font-weight: 500;
              transition: background-color 0.2s;
            }
            .button:hover {
              background-color: #1d4ed8;
            }
          </style>
        </head>
        <body>
          <div class="payment-success">
            <h1>Payment Successful!</h1>
            <p>Your credit purchase has been completed successfully. Your account has been credited with the purchased amount.</p>
            <a href="/" class="button">Return to Dashboard</a>
          </div>
        </body>
      </html>
    `, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('Error in mock payment endpoint:', error);
    return new Response('Payment processing error', { status: 500 });
  }
} 