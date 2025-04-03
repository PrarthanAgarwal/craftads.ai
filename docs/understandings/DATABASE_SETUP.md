# Database Setup Instructions

This document provides step-by-step instructions for setting up the database for the CraftAds application using Supabase.

## Prerequisites

1. A Supabase account - Sign up at [supabase.com](https://supabase.com/) if you don't have one
2. A new or existing Supabase project

## Setup Steps

### 1. Access the SQL Editor

1. Log in to your Supabase dashboard
2. Select your project
3. Navigate to the SQL Editor in the left sidebar

### 2. Create the Database Schema

1. Copy the contents of the `schema.sql` file from this repository
2. Paste it into the SQL Editor
3. Click "Run" to execute the SQL commands

This script will:
- Create all required tables (users, user_preferences, credit_packages, credit_transactions, payments, and generations)
- Set up appropriate indexes for performance optimization
- Configure foreign key constraints for data integrity
- Create triggers for maintaining updated timestamps and handling new user creation
- Define row-level security policies for data access control
- Insert initial credit package data

### 3. Create Transaction Support Functions

1. Copy the contents of the `supabase_functions.sql` file from this repository
2. Paste it into a new SQL Editor tab
3. Click "Run" to execute the SQL commands

This script will create the necessary functions for transaction support:
- `begin_transaction()`
- `commit_transaction()`
- `rollback_transaction()`

### 4. Configure Environment Variables

Update your `.env` file with the correct Supabase credentials:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret
```

You can find these credentials in your Supabase project settings, under the API tab.

### 5. Testing the Setup

After completing the setup, you can test that everything is working correctly by:

1. Using the credit balance API endpoint: `/api/credits/balance`
2. Using the credit packages API endpoint: `/api/credits/packages`

If these endpoints return the expected data, your database setup is complete.

## Database Structure

The database consists of the following tables:

### Users Table
Stores user information and extends the Supabase auth.users table. Each record includes:
- Basic profile information (name, email, etc.)
- Current credit balance
- Authentication details

### User Preferences Table
Stores user-specific application settings, including:
- Default AI model preference
- Favorite templates
- UI preferences

### Credit Packages Table
Defines the available credit packages for purchase, including:
- Package name and description
- Credit amount and price
- Features like sort order and active status

### Credit Transactions Table
Records all credit-related transactions, including:
- Credits purchased
- Credits used for generations
- Transaction type and description
- Balance after the transaction

### Payments Table
Tracks payment information for credit purchases, including:
- Payment provider and status
- Amount and currency
- Associated credit package

### Generations Table
Stores information about image generations, including:
- Generation status and result URL
- AI model used
- Prompt and customization data
- Credits used

## Row-Level Security

Row-level security policies are implemented to ensure users can only access their own data:

- Users can only view and update their own profile and preferences
- Users can only view their own credit transactions and payments
- Users can only view and create their own generations
- Credit packages are publicly accessible (read-only)

## Data Relationships

The database schema implements the following relationships:

- One-to-one: User to User Profile
- One-to-many: User to Preferences, Transactions, Payments, and Generations
- Many-to-one: Payments to Credit Packages

## Credits System

The credit system works as follows:

1. New users receive 10 free credits upon registration
2. Users can purchase credit packages (50, 200, or 500 credits)
3. Each image generation consumes 1 credit
4. Credit transactions are recorded with a reference to the related entity (payment or generation)
5. The user's credit balance is updated atomically with each transaction

## Help and Troubleshooting

If you encounter any issues with the database setup, please:

1. Check that all SQL scripts executed without errors
2. Verify that all tables were created correctly
3. Ensure your environment variables are set correctly
4. Review the Supabase documentation for general troubleshooting 