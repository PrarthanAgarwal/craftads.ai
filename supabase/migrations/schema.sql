-- CraftAds Database Schema for Supabase

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Tables

-- Users
-- Note: Supabase already has auth.users table, but we need our own table to extend it
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    auth_provider VARCHAR(50),
    auth_provider_id VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url VARCHAR(255),
    credits_balance INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    metadata JSONB
);

CREATE UNIQUE INDEX IF NOT EXISTS users_auth_provider_idx ON public.users(auth_provider, auth_provider_id) 
    WHERE auth_provider IS NOT NULL AND auth_provider_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS users_is_active_idx ON public.users(is_active);
CREATE INDEX IF NOT EXISTS users_created_at_idx ON public.users(created_at);

-- User Preferences
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    default_ai_model VARCHAR(50) DEFAULT 'gpt-4o',
    favorite_templates JSONB DEFAULT '[]'::jsonb,
    ui_preferences JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS user_preferences_user_id_idx ON public.user_preferences(user_id);

-- Credit System Tables

-- Credit Packages
CREATE TABLE IF NOT EXISTS public.credit_packages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    credit_amount INTEGER NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS credit_packages_is_active_idx ON public.credit_packages(is_active);
CREATE INDEX IF NOT EXISTS credit_packages_sort_order_idx ON public.credit_packages(sort_order);

-- Credit Transactions
CREATE TABLE IF NOT EXISTS public.credit_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'purchase', 'usage', 'refund', 'promotion', etc.
    reference_id UUID,
    reference_type VARCHAR(50),
    description TEXT,
    balance_after INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS credit_transactions_user_id_idx ON public.credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS credit_transactions_created_at_idx ON public.credit_transactions(created_at);
CREATE INDEX IF NOT EXISTS credit_transactions_type_idx ON public.credit_transactions(type);

-- Payments
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    package_id UUID REFERENCES public.credit_packages(id) ON DELETE SET NULL,
    provider VARCHAR(50) NOT NULL, -- 'stripe', 'paypal', etc.
    provider_payment_id VARCHAR(255),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
    credits_purchased INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS payments_user_id_idx ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS payments_package_id_idx ON public.payments(package_id);
CREATE UNIQUE INDEX IF NOT EXISTS payments_provider_payment_id_idx ON public.payments(provider_payment_id) 
    WHERE provider_payment_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS payments_status_idx ON public.payments(status);
CREATE INDEX IF NOT EXISTS payments_created_at_idx ON public.payments(created_at);

-- Generation History

-- Generations
CREATE TABLE IF NOT EXISTS public.generations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    template_id UUID, -- Initially null until we implement ad templates
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed'
    result_image_url VARCHAR(255),
    ai_model VARCHAR(50) NOT NULL DEFAULT 'gpt-4o',
    prompt_data JSONB DEFAULT '{}'::jsonb,
    customization_data JSONB DEFAULT '{}'::jsonb,
    processing_time INTEGER,
    credits_used INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS generations_user_id_idx ON public.generations(user_id);
CREATE INDEX IF NOT EXISTS generations_template_id_idx ON public.generations(template_id);
CREATE INDEX IF NOT EXISTS generations_status_idx ON public.generations(status);
CREATE INDEX IF NOT EXISTS generations_created_at_idx ON public.generations(created_at);
CREATE INDEX IF NOT EXISTS generations_ai_model_idx ON public.generations(ai_model);

-- Session Handling trigger for auth events
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, auth_provider, auth_provider_id, first_name, last_name, is_verified)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_app_meta_data->>'provider',
    NEW.raw_user_meta_data->>'sub',
    NEW.raw_user_meta_data->>'given_name',
    NEW.raw_user_meta_data->>'family_name',
    NEW.email_confirmed_at IS NOT NULL
  );
  
  -- Insert default preferences
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id);
  
  -- Add 10 free credits for new users
  INSERT INTO public.credit_transactions (
    user_id, 
    amount, 
    type, 
    description, 
    balance_after
  )
  VALUES (
    NEW.id, 
    10, 
    'signup_bonus', 
    'Welcome bonus credits', 
    10
  );
  
  -- Update user's credit balance
  UPDATE public.users
  SET credits_balance = 10
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Trigger function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all tables with updated_at column
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_credit_packages_updated_at
  BEFORE UPDATE ON public.credit_packages
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_generations_updated_at
  BEFORE UPDATE ON public.generations
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Row Level Security Policies

-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own data" ON public.users
  FOR SELECT USING (auth.uid() = id);
  
CREATE POLICY "Users can update their own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- User preferences policies
CREATE POLICY "Users can view their own preferences" ON public.user_preferences
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can update their own preferences" ON public.user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- Credit packages policies (everyone can view, only admins can modify)
CREATE POLICY "Anyone can view credit packages" ON public.credit_packages
  FOR SELECT USING (true);

-- Credit transactions policies
CREATE POLICY "Users can view their own transactions" ON public.credit_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Payments policies
CREATE POLICY "Users can view their own payments" ON public.payments
  FOR SELECT USING (auth.uid() = user_id);

-- Generations policies
CREATE POLICY "Users can view their own generations" ON public.generations
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can create their own generations" ON public.generations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Initial data for credit packages
INSERT INTO public.credit_packages (name, description, credit_amount, price, is_active, is_featured, sort_order)
VALUES
  ('Starter Package', 'Perfect for beginners', 100, 14.99, true, false, 1),
  ('Pro Package', 'Best value for regular users', 500, 34.99, true, true, 2),
  ('Business Package', 'For businesses with higher volume needs', 1500, 85.99, true, false, 3); 