import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getUserCredits, createUserFromSession } from '@/lib/supabase';
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

export async function GET() {
  try {
    // Get the authenticated user session
    const session = await getServerSession();
    
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }
    
    // Get the user ID and email
    const userId = session.user.id;
    const userEmail = session.user.email;
    
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'User email not found in session' } },
        { status: 401 }
      );
    }
    
    try {
      let credits: number;
      let effectiveUserId = userId;
      
      // If we don't have a userId in the session, try to find the user by email first
      if (!userId) {
        console.warn('User ID missing from session, looking up by email');
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
            // If this is a duplicate key error, try to find the user again
            console.error('Error creating user from session:', createError);
            
            if (createError instanceof Error && createError.message.includes('duplicate key value')) {
              // Try one more time to find the user by email (race condition might have created it)
              const { data: retryUser, error: retryError } = await supabase
                .from('users')
                .select('id')
                .eq('email', userEmail)
                .single();
              
              if (retryUser) {
                effectiveUserId = retryUser.id;
                console.log(`Found user on retry with ID ${effectiveUserId} for email ${userEmail}`);
              } else {
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
            } else {
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
      
      // Try to get credits using the user ID
      try {
        console.log(`Attempting to get credits for user ${effectiveUserId}`);
        credits = await getUserCredits(effectiveUserId);
        
        console.log(`Successfully fetched credits: ${credits} for user ${effectiveUserId}`);
        return NextResponse.json({
          success: true,
          data: {
            credits,
            userId: effectiveUserId,
            lastUpdated: new Date().toISOString()
          }
        });
      } catch (idError) {
        // If getting credits fails, try to ensure the user exists
        console.warn(`Error fetching credits for user ${effectiveUserId}:`, idError);
        
        // Verify effectiveUserId is defined before using it again
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
          console.log(`Attempting to create/update user with ID ${effectiveUserId}`);
          // Use the admin client for direct database access
          const supabase = createSupabaseAdmin();
          
          // Check if user actually exists in the auth.users table (the foreign key source)
          const { data: authUser, error: authUserError } = await supabase.auth.admin.getUserById(effectiveUserId);
          
          if (authUserError) {
            console.error(`Error checking auth user: ${authUserError.message}`);
            // Continue anyway, the user might still exist in the public.users table
          } else if (!authUser.user) {
            console.warn(`User ${effectiveUserId} does not exist in auth.users table`);
            // This could explain foreign key constraint issues
          }
          
          // Try to directly insert/update the user record
          const { data: existingUser, error: getUserError } = await supabase
            .from('users')
            .select('id, credits_balance')
            .eq('id', effectiveUserId)
            .maybeSingle();
          
          if (getUserError && getUserError.code !== 'PGRST116') {
            console.error(`Error checking for existing user: ${getUserError.message}`);
          }
          
          if (existingUser) {
            // User exists, update if needed
            console.log(`User ${effectiveUserId} exists, updating properties`);
            
            // Only update if credits_balance is null
            if (existingUser.credits_balance === null) {
              const { error: updateError } = await supabase
                .from('users')
                .update({ 
                  credits_balance: 10,
                  last_login: new Date().toISOString(),
                  avatar_url: session.user.image || null
                })
                .eq('id', effectiveUserId);
                
              if (updateError) {
                console.error(`Error updating user: ${updateError.message}`);
                // Continue anyway
              }
            }
            
            credits = existingUser.credits_balance || 10;
          } else {
            // Try the helper function to create a user
            try {
              await createUserFromSession(
                effectiveUserId,
                userEmail,
                session.user.name,
                session.user.image
              );
              credits = 10; // Default value for new users
            } catch (createError) {
              console.error(`Error creating user from session again: ${createError}`);
              
              // Last resort: get user by email and return that
              const { data: emailUser, error: emailError } = await supabase
                .from('users')
                .select('id, credits_balance')
                .eq('email', userEmail)
                .maybeSingle();
                
              if (emailError && emailError.code !== 'PGRST116') {
                console.error(`Error looking up user by email: ${emailError.message}`);
                throw createError; // Re-throw the original error
              }
              
              if (emailUser) {
                effectiveUserId = emailUser.id;
                credits = emailUser.credits_balance || 10;
              } else {
                throw new Error('Could not create or find user record');
              }
            }
          }
          
          console.log(`Successfully determined credits: ${credits} for user ${effectiveUserId}`);
          return NextResponse.json({
            success: true,
            data: {
              credits,
              userId: effectiveUserId,
              lastUpdated: new Date().toISOString()
            }
          });
        } catch (ensureError) {
          console.error(`Error ensuring user exists: ${ensureError}`);
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'CREDITS_FETCH_FAILED',
                message: 'Failed to fetch or create user credits',
                details: ensureError instanceof Error ? ensureError.message : String(ensureError)
              }
            },
            { status: 500 }
          );
        }
      }
    } catch (userError) {
      console.error('Error in credit balance:', userError);
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'SERVER_ERROR', 
            message: 'Failed to process credit balance request' 
          } 
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error fetching credit balance:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'SERVER_ERROR', 
          message: 'Failed to fetch credit balance' 
        } 
      },
      { status: 500 }
    );
  }
} 