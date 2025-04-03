# Authentication and Credit System Fixes

## Overview

This document details the issues we encountered with the user authentication and credit system in our application, and the changes we made to fix them. The primary issues were:

1. Missing user IDs in session data
2. Foreign key constraint errors when creating users
3. Error handling in credit balance and history endpoints
4. Type errors in TypeScript functions

## Problems Identified

### 1. Session User ID Missing

The NextAuth session object sometimes didn't include the user ID, causing API endpoints to fail with authentication errors. This happened because:

- The user was authenticated via OAuth provider (Google)
- The user record existed in the Supabase database
- But the ID wasn't properly propagated to the session object

### 2. Foreign Key Constraint Issues

When trying to create user records, we encountered foreign key constraint errors:

```
insert or update on table "users" violates foreign key constraint "users_id_fkey"
```

This indicated that our `public.users` table required IDs that reference existing records in the `auth.users` table.

### 3. PGRST116 Database Errors

When fetching user credits or transaction history, we encountered errors like:

```
{
  code: 'PGRST116',
  details: 'The result contains 0 rows',
  hint: null,
  message: 'JSON object requested, multiple (or no) rows returned'
}
```

This happened when the user existed but didn't have credit records, or when the lookup methods weren't robust enough.

## Solutions Implemented

### 1. Robust User ID Resolution

We improved the API endpoints to handle missing session user IDs:

```typescript
// If userId is missing, try to find by email
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
    // ...
  }
}
```

### 2. Enhanced User Creation in `createUserFromSession`

We improved the user creation function to:

- Check if users exist by both ID and email
- Handle duplicate records gracefully
- Provide better error reporting
- Respect the foreign key constraint by creating records in the correct order

```typescript
// Check if user exists by email
const { data: existingUserByEmail, error: emailCheckError } = await supabase
  .from('users')
  .select('id')
  .eq('email', email)
  .single();
  
// ...

if (existingUserByEmail) {
  console.log(`User already exists with email ${email}, ID: ${existingUserByEmail.id}`);
  return existingUserByEmail.id;
}
```

### 3. Improved Error Handling in `getUserCredits`

We enhanced the credit balance fetching function to:

- Validate UUID format
- Check if the user exists before trying to get credits
- Handle the case where credits are null by setting defaults
- Provide detailed logging
- Use admin permissions to ensure access

```typescript
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
```

### 4. Robust Credit History Fetching

We implemented similar improvements for the credit history API:

- Lookup users by email if ID is missing
- Return empty arrays instead of errors when no transactions exist
- Better error handling and reporting
- Detailed logging to help with debugging

```typescript
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
```

### 5. Default Credit Allocation

We implemented a system to provide new users with 10 credits by default:

- When creating a new user
- When a user's credit balance is null
- When no credit record is found but the user exists

## Files Modified

1. `src/app/api/credits/balance/route.ts` - Added email-based user lookup and better error handling
2. `src/app/api/credits/history/route.ts` - Applied the same improvements to the history endpoint
3. `src/lib/supabase.ts` - Enhanced several functions:
   - `getUserCredits()` - Improved error handling and default credit assignment
   - `getUserCreditHistory()` - Added better handling for empty results
   - `createUserFromSession()` - Added email-based lookup and better error handling

## Benefits

The changes provide several benefits:

1. **More Robust Authentication** - The system now handles various edge cases in the authentication flow
2. **Better Error Handling** - Detailed error messages and graceful fallbacks
3. **Improved User Experience** - Users won't encounter errors when they have no credit transactions yet
4. **Default Credits System** - New users automatically get 10 credits to start with
5. **Detailed Logging** - Better visibility into what's happening for debugging

## Future Considerations

1. **Session Consistency** - Investigate why NextAuth sometimes doesn't include user IDs in sessions
2. **Credit Management System** - Consider adding a more comprehensive admin interface for credit management
3. **Transaction Monitoring** - Add more detailed logging for credit transactions
4. **User Onboarding** - Consider extending the welcome flow to explain the credit system to new users 