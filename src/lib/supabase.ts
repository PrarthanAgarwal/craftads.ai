import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';
import { v4 as uuidv4 } from 'uuid';

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Create a server-side admin client (with more privileges)
export const createAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase service role credentials');
  }
  
  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

// Helper functions for common database operations

// User related operations
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*, user_preferences(*)')
    .eq('id', userId)
    .single();
    
  if (error) throw error;
  return data;
}

// Credit related operations
export async function getUserCredits(userId: string) {
  console.log(`Fetching credits for user ${userId}`);
  
  // First, validate the userId is in UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(userId)) {
    console.error(`Invalid user ID format: ${userId}`);
    throw new Error('Invalid user ID format');
  }
  
  // Use the admin client to ensure we have sufficient permissions
  const supabaseAdmin = createAdminClient();
  
  // Check if user exists at all
  const { data: userExists, error: existsError } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('id', userId);
    
  if (existsError) {
    console.error(`Error checking if user exists: ${existsError.message}`, existsError);
    throw existsError;
  }
  
  if (!userExists || userExists.length === 0) {
    console.error(`User with ID ${userId} does not exist`);
    throw new Error(`User with ID ${userId} not found`);
  }
  
  // Now get the credits
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('credits_balance')
    .eq('id', userId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned - handle this specific case
      console.warn(`No credit record found for user ${userId}, creating default`);
      
      // Try to update the user with a default credit balance
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({ credits_balance: 10 })
        .eq('id', userId);
        
      if (updateError) {
        console.error(`Failed to set default credits: ${updateError.message}`);
        throw updateError;
      }
      
      return 10; // Return default credits
    }
    
    console.error(`Error fetching credits: ${error.message}`, error);
    throw error;
  }
  
  if (!data || data.credits_balance === null || data.credits_balance === undefined) {
    console.warn(`User ${userId} has null credits, setting default`);
    
    // Try to update with default value
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ credits_balance: 10 })
      .eq('id', userId);
      
    if (updateError) {
      console.error(`Failed to set default credits: ${updateError.message}`);
      throw updateError;
    }
    
    return 10; // Return default credits
  }
  
  return data.credits_balance;
}

export async function getCreditPackages() {
  const { data, error } = await supabase
    .from('credit_packages')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });
    
  if (error) throw error;
  return data;
}

export async function getCreditPackageById(packageId: string) {
  const { data, error } = await supabase
    .from('credit_packages')
    .select('*')
    .eq('id', packageId)
    .eq('is_active', true)
    .single();
    
  if (error) throw error;
  return data;
}

export async function getUserCreditHistory(userId: string, page = 1, limit = 20) {
  console.log(`Fetching credit history for user ${userId}`);
  
  // First, validate the userId is in UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(userId)) {
    console.error(`Invalid user ID format: ${userId}`);
    throw new Error('Invalid user ID format');
  }
  
  // Use the admin client to ensure we have sufficient permissions
  const supabaseAdmin = createAdminClient();
  
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  
  // Check if user exists first
  const { data: userExists, error: userExistsError } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('id', userId)
    .single();
    
  if (userExistsError && userExistsError.code !== 'PGRST116') {
    console.error(`Error checking if user exists: ${userExistsError.message}`);
    throw userExistsError;
  }
  
  if (!userExists && userExistsError?.code === 'PGRST116') {
    console.warn(`User with ID ${userId} not found for credit history`);
    // Return empty results rather than error
    return { 
      transactions: [], 
      total: 0,
      page,
      limit,
      pages: 0
    };
  }
  
  // Get transactions for the user
  const { data, error, count } = await supabaseAdmin
    .from('credit_transactions')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(from, to);
    
  if (error) {
    // If no transactions found, return empty array
    if (error.code === 'PGRST116') {
      console.log(`No credit transactions found for user ${userId}`);
      return { 
        transactions: [], 
        total: 0,
        page,
        limit,
        pages: 0
      };
    }
    
    console.error(`Error fetching credit history: ${error.message}`);
    throw error;
  }
  
  return { 
    transactions: data, 
    total: count || 0,
    page,
    limit,
    pages: count ? Math.ceil(count / limit) : 0
  };
}

// Payment related operations
export async function createPayment(
  userId: string,
  packageId: string,
  provider: string,
  providerPaymentId?: string
) {
  // Get the package details
  const packageDetails = await getCreditPackageById(packageId);
  
  // Create a payment record
  const { data, error } = await supabase
    .from('payments')
    .insert({
      user_id: userId,
      package_id: packageId,
      provider,
      provider_payment_id: providerPaymentId,
      amount: packageDetails.price,
      currency: packageDetails.currency,
      status: 'pending',
      credits_purchased: packageDetails.credit_amount
    })
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function completePayment(
  paymentId: string,
  providerPaymentId: string,
  status: 'completed' | 'failed'
) {
  const supabaseAdmin = createAdminClient();
  
  // Get the payment details
  const { data: paymentData, error: paymentError } = await supabaseAdmin
    .from('payments')
    .select('*, credit_packages(*)')
    .eq('id', paymentId)
    .single();
    
  if (paymentError) throw paymentError;
  
  // Update the payment status
  const { error: updateError } = await supabaseAdmin
    .from('payments')
    .update({ 
      status, 
      provider_payment_id: providerPaymentId,
      updated_at: new Date().toISOString()
    })
    .eq('id', paymentId);
    
  if (updateError) throw updateError;
  
  // If payment was successful, add credits to the user
  if (status === 'completed') {
    // Get package name for the transaction description
    let packageName = 'Credit Package';
    if (paymentData.credit_packages) {
      packageName = paymentData.credit_packages.name;
    }
    
    await addCreditsToUser(
      paymentData.user_id,
      paymentData.credits_purchased,
      'purchase',
      `Purchased ${packageName}`,
      paymentId,
      'payment'
    );
  }
  
  return paymentData;
}

// Generation related operations
export async function getUserGenerations(userId: string, page = 1, limit = 20) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  
  const { data, error, count } = await supabase
    .from('generations')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(from, to);
    
  if (error) throw error;
  return { 
    generations: data, 
    total: count || 0,
    page,
    limit,
    pages: count ? Math.ceil(count / limit) : 0
  };
}

// Transaction utilities for complex operations that need to be atomic
export async function recordCreditUsage(
  userId: string, 
  creditsUsed: number, 
  description: string,
  referenceId?: string,
  referenceType?: string
) {
  // This should be done in a transaction to ensure data consistency
  const supabaseAdmin = createAdminClient();
  
  // Get the current credit balance
  const { data: userData, error: userError } = await supabaseAdmin
    .from('users')
    .select('credits_balance')
    .eq('id', userId)
    .single();
    
  if (userError) throw userError;
  
  const currentBalance = userData.credits_balance;
  const newBalance = currentBalance - creditsUsed;
  
  // Check if user has enough credits
  if (newBalance < 0) {
    throw new Error('Insufficient credits');
  }
  
  // Begin transaction
  const { error: transactionError } = await supabaseAdmin.rpc('begin_transaction');
  if (transactionError) throw transactionError;
  
  try {
    // 1. Update user's credit balance
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ credits_balance: newBalance })
      .eq('id', userId);
      
    if (updateError) throw updateError;
    
    // 2. Record the transaction
    const { error: insertError } = await supabaseAdmin
      .from('credit_transactions')
      .insert({
        user_id: userId,
        amount: -creditsUsed,
        type: 'usage',
        reference_id: referenceId,
        reference_type: referenceType,
        description,
        balance_after: newBalance
      });
      
    if (insertError) throw insertError;
    
    // Commit transaction
    const { error: commitError } = await supabaseAdmin.rpc('commit_transaction');
    if (commitError) throw commitError;
    
    return newBalance;
  } catch (error) {
    // Rollback transaction on error
    await supabaseAdmin.rpc('rollback_transaction');
    throw error;
  }
}

export async function addCreditsToUser(
  userId: string, 
  creditsAmount: number, 
  type: string,
  description: string,
  referenceId?: string,
  referenceType?: string
) {
  const supabaseAdmin = createAdminClient();
  
  // Get the current credit balance
  const { data: userData, error: userError } = await supabaseAdmin
    .from('users')
    .select('credits_balance')
    .eq('id', userId)
    .single();
    
  if (userError) throw userError;
  
  const currentBalance = userData.credits_balance;
  const newBalance = currentBalance + creditsAmount;
  
  // Begin transaction
  const { error: transactionError } = await supabaseAdmin.rpc('begin_transaction');
  if (transactionError) throw transactionError;
  
  try {
    // 1. Update user's credit balance
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ credits_balance: newBalance })
      .eq('id', userId);
      
    if (updateError) throw updateError;
    
    // 2. Record the transaction
    const { error: insertError } = await supabaseAdmin
      .from('credit_transactions')
      .insert({
        user_id: userId,
        amount: creditsAmount,
        type,
        reference_id: referenceId,
        reference_type: referenceType,
        description,
        balance_after: newBalance
      });
      
    if (insertError) throw insertError;
    
    // Commit transaction
    const { error: commitError } = await supabaseAdmin.rpc('commit_transaction');
    if (commitError) throw commitError;
    
    return newBalance;
  } catch (error) {
    // Rollback transaction on error
    await supabaseAdmin.rpc('rollback_transaction');
    throw error;
  }
}

// Helper to create a user from a NextAuth session
export async function createUserFromSession(
  userId: string | undefined,
  email: string,
  name?: string | null,
  image?: string | null,
  provider: string = 'google'
) {
  const supabase = createAdminClient();
  
  // If userId is undefined, generate a new one
  const effectiveUserId = userId || uuidv4();
  
  // Check if user exists in public.users by ID
  const { data: existingUserById, error: checkError } = await supabase
    .from('users')
    .select('id')
    .eq('id', effectiveUserId)
    .single();
    
  if (checkError && checkError.code !== 'PGRST116') {
    // Real error, not just "no rows returned"
    console.error('Error checking if user exists by ID:', checkError);
    throw new Error(`Failed to check if user exists: ${checkError.message}`);
  }
  
  // User already exists with this ID
  if (existingUserById) {
    console.log(`User already exists with ID ${effectiveUserId}`);
    return existingUserById.id;
  }
  
  // Check if user exists by email
  const { data: existingUserByEmail, error: emailCheckError } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();
    
  if (emailCheckError && emailCheckError.code !== 'PGRST116') {
    // Real error, not just "no rows returned"
    console.error('Error checking if user exists by email:', emailCheckError);
    throw new Error(`Failed to check if user exists by email: ${emailCheckError.message}`);
  }
  
  // User already exists with this email
  if (existingUserByEmail) {
    console.log(`User already exists with email ${email}, ID: ${existingUserByEmail.id}`);
    return existingUserByEmail.id;
  }
  
  console.log(`Creating new user with ID ${effectiveUserId} and email ${email}`);
  
  try {
    // Create a new user
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: effectiveUserId,
        email: email,
        first_name: name?.split(' ')[0] || null,
        last_name: name?.split(' ').slice(1).join(' ') || null,
        avatar_url: image || null,
        auth_provider: provider,
        is_verified: true,
        credits_balance: 10, // Default credits for new users
        last_login: new Date().toISOString()
      });
      
    if (insertError) {
      console.error('Error creating user in database:', insertError);
      throw new Error(`Failed to create user: ${insertError.message}`);
    }
    
    // Create default user preferences
    const { error: prefError } = await supabase
      .from('user_preferences')
      .insert({
        user_id: effectiveUserId,
      });
      
    if (prefError) {
      console.error('Error creating user preferences:', prefError);
      // Continue anyway, not critical
    }
    
    // Add welcome credits
    const { error: txnError } = await supabase
      .from('credit_transactions')
      .insert({
        user_id: effectiveUserId,
        amount: 10,
        type: 'signup_bonus',
        description: 'Welcome bonus credits',
        balance_after: 10
      });
      
    if (txnError) {
      console.error('Error creating credit transaction:', txnError);
      // Continue anyway, not critical
    }
    
    return effectiveUserId;
  } catch (error) {
    console.error('Error in createUserFromSession:', error);
    throw error;
  }
} 