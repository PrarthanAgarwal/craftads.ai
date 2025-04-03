import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { createClient } from '@supabase/supabase-js';

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
        { success: false, error: 'Not authenticated', session: null },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const userEmail = session.user.email;
    
    if (!userEmail) {
      return NextResponse.json(
        { success: false, error: 'No user email in session', session },
        { status: 400 }
      );
    }
    
    // Check Supabase for user records
    const supabase = createSupabaseAdmin();
    
    // Check auth.users table (requires admin access)
    let authUserData = null;
    let authUserError: Error | null = null;
    
    try {
      // Get auth.users record if it exists
      const authData = await supabase.auth.admin.listUsers({
        perPage: 1,
        page: 1,
      });
      
      // Find the user with matching email
      const authUser = authData.data.users.find(u => u.email === userEmail);
      
      if (authUser) {
        authUserData = {
          id: authUser.id,
          email: authUser.email,
          emailConfirmed: authUser.email_confirmed_at !== null,
          lastSignIn: authUser.last_sign_in_at,
          userMetadata: authUser.user_metadata,
          appMetadata: authUser.app_metadata,
        };
      }
    } catch (error) {
      authUserError = error instanceof Error ? error : new Error('Unknown error');
      console.error('Error checking auth.users:', error);
    }
    
    // First try to check users table by ID if available
    let userData = null;
    let userError = null;
    let userLookupMethod = 'id';
    
    if (userId) {
      const result = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
        
      userData = result.data;
      userError = result.error;
    }
    
    // If ID lookup failed, try by email
    if (!userData && userEmail) {
      userLookupMethod = 'email';
      const result = await supabase
        .from('users')
        .select('*')
        .eq('email', userEmail)
        .single();
        
      userData = result.data;
      userError = result.error;
    }
    
    // Check for foreign key constraint issues
    let foreignKeyIssue = false;
    if (userData && authUserData && userData.id !== authUserData.id) {
      foreignKeyIssue = true;
    }
    
    // If we found a user, check related records
    let prefsData = null;
    let prefsError = null;
    let txnData = null;
    let txnError = null;
    
    if (userData) {
      // Check user_preferences table
      const prefsResult = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userData.id)
        .single();
        
      prefsData = prefsResult.data;
      prefsError = prefsResult.error;
        
      // Check credit_transactions table
      const txnResult = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('user_id', userData.id)
        .order('created_at', { ascending: false })
        .limit(5);
        
      txnData = txnResult.data;
      txnError = txnResult.error;
    }
    
    return NextResponse.json({
      success: true,
      auth: {
        session: {
          user: {
            ...session.user,
            // Redact email for security
            email: session.user.email ? `${session.user.email.slice(0, 3)}...${session.user.email.slice(-8)}` : null,
          }
        },
        supabaseAuth: {
          exists: !!authUserData,
          error: authUserError ? authUserError.message : null,
          data: authUserData,
        }
      },
      database: {
        foreignKeyIssue,
        user: {
          exists: !!userData,
          lookupMethod: userLookupMethod,
          error: userError ? `${userError.code}: ${userError.message}` : null,
          // Only include non-sensitive data
          data: userData ? {
            id: userData.id,
            email: userData.email ? `${userData.email.slice(0, 3)}...${userData.email.slice(-8)}` : null,
            auth_provider: userData.auth_provider,
            credits_balance: userData.credits_balance,
            is_verified: userData.is_verified,
            created_at: userData.created_at,
            updated_at: userData.updated_at,
            last_login: userData.last_login,
          } : null,
        },
        preferences: {
          exists: !!prefsData,
          error: prefsError ? `${prefsError.code}: ${prefsError.message}` : null,
          data: prefsData || null,
        },
        transactions: {
          exists: !!txnData && txnData.length > 0,
          error: txnError ? `${txnError.code}: ${txnError.message}` : null,
          count: txnData?.length || 0,
          data: txnData || null,
        }
      }
    });
  } catch (error) {
    console.error('Error in auth debug endpoint:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
      },
      { status: 500 }
    );
  }
} 