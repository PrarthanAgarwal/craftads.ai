import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getUserCreditHistory, createUserFromSession } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Initialize Supabase client for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const createSupabaseAdmin = () => {
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

export async function GET(request: Request) {
  try {
    // Get the authenticated user session
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }
    
    // Get the user's ID and email
    const userId = session.user.id;
    const userEmail = session.user.email;
    
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'User email not found in session' } },
        { status: 401 }
      );
    }
    
    // Parse pagination parameters from query
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);
    
    let effectiveUserId = userId;
    
    // If userId is missing, try to find by email
    if (!userId) {
      console.warn('User ID missing from session in credit history, looking up by email');
      const supabase = createSupabaseAdmin();
      
      // First try to find the user by email
      const { data: existingUser, error: lookupError } = await supabase
        .from('users')
        .select('id')
        .eq('email', userEmail)
        .single();
      
      if (existingUser) {
        // User found by email, use their ID
        effectiveUserId = existingUser.id;
        console.log(`Found existing user with ID ${effectiveUserId} for email ${userEmail}`);
      } else {
        // No user found with this email, create a new one
        effectiveUserId = uuidv4();
        console.log(`Creating new user with ID ${effectiveUserId} for email ${userEmail}`);
        
        // Create the user in Supabase
        try {
          await createUserFromSession(
            effectiveUserId,
            userEmail,
            session.user.name,
            session.user.image
          );
        } catch (createError) {
          console.error('Error creating user from session in credit history:', createError);
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'USER_CREATION_FAILED',
                message: 'Failed to create user record'
              }
            },
            { status: 500 }
          );
        }
      }
    }
    
    // Ensure we have a userId before proceeding
    if (!effectiveUserId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'USER_ID_MISSING',
            message: 'Failed to determine user ID'
          }
        },
        { status: 500 }
      );
    }
    
    try {
      // Get the credit transaction history
      console.log(`Fetching credit history for user ${effectiveUserId}`);
      const result = await getUserCreditHistory(effectiveUserId, page, limit);
      
      return NextResponse.json({
        success: true,
        data: {
          transactions: result.transactions,
          pagination: {
            total: result.total,
            page: result.page,
            limit: result.limit,
            pages: result.pages
          }
        }
      });
    } catch (error) {
      console.error(`Error fetching credit history for user ${effectiveUserId}:`, error);
      
      // For history API, it's normal to have no transactions yet
      // Just return an empty list instead of an error
      return NextResponse.json({
        success: true,
        data: {
          transactions: [],
          pagination: {
            total: 0,
            page: page,
            limit: limit,
            pages: 0
          }
        }
      });
    }
  } catch (error) {
    console.error('Error fetching credit transaction history:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'SERVER_ERROR', 
          message: 'Failed to fetch credit transaction history' 
        } 
      },
      { status: 500 }
    );
  }
} 