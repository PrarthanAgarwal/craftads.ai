import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { Session } from "next-auth";
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Extend the Session type to include the id property
declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    }
  }
}

// Initialize Supabase client
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

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  // Add secure callback URLs
  pages: {
    signIn: "/login",
  },
  // Enable JWT for session handling
  session: {
    strategy: "jwt",
  },
  // Add additional callbacks if needed
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) {
        return false;
      }

      try {
        const supabase = createSupabaseAdmin();
        
        // First check if the user already exists in Supabase auth by email
        // Note: The admin API might have limitations, so we'll check if user exists in public.users table
        const { data: existingPublicUser, error: publicUserQueryError } = await supabase
          .from('users')
          .select('id, email')
          .eq('email', user.email)
          .single();
        
        let supabaseUserId: string;

        // If user does not exist in public.users, create in auth.users first
        if (publicUserQueryError || !existingPublicUser) {
          console.log('Creating new Supabase Auth user for email:', user.email);
          
          // Create a user in Supabase Auth first
          const { data: newAuthUser, error: createAuthError } = await supabase.auth.admin.createUser({
            email: user.email,
            email_confirm: true,
            user_metadata: {
              full_name: user.name,
              avatar_url: user.image,
              provider: account?.provider || 'google',
              provider_id: account?.providerAccountId,
              sub: account?.providerAccountId, // This is what the database trigger expects
              given_name: user.name?.split(' ')[0] || '',
              family_name: user.name?.split(' ').slice(1).join(' ') || '',
            },
            app_metadata: {
              provider: account?.provider || 'google'
            }
          });
          
          if (createAuthError) {
            console.error('Error creating Supabase Auth user:', createAuthError);
            return false;
          }
          
          // Get the new user's ID
          if (!newAuthUser?.user?.id) {
            console.error('Created Supabase Auth user but ID is missing');
            return false;
          }
          
          supabaseUserId = newAuthUser.user.id;
          user.id = supabaseUserId;
          
          // The trigger should have created the public.users record, but let's wait a moment to be sure
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Verify the public.users entry was created
          const { data: publicUser, error: publicUserError } = await supabase
            .from('users')
            .select('id')
            .eq('id', supabaseUserId)
            .single();
            
          if (publicUserError) {
            console.warn('Public user may not have been created yet, will be handled by credits API:', publicUserError);
            
            // Try to manually create the public.users record
            const { error: manualInsertError } = await supabase
              .from('users')
              .insert({
                id: supabaseUserId,
                email: user.email,
                first_name: user.name?.split(' ')[0] || null,
                last_name: user.name?.split(' ').slice(1).join(' ') || null,
                avatar_url: user.image || null,
                auth_provider: account?.provider || 'google',
                auth_provider_id: account?.providerAccountId || null,
                is_verified: true,
                credits_balance: 10,
                last_login: new Date().toISOString()
              });
              
            if (manualInsertError) {
              console.error('Error manually creating public user:', manualInsertError);
              // We'll let the credits API handle it
            } else {
              // Also create preferences and credits transaction
              await supabase
                .from('user_preferences')
                .insert({
                  user_id: supabaseUserId,
                });
                
              await supabase
                .from('credit_transactions')
                .insert({
                  user_id: supabaseUserId,
                  amount: 10,
                  type: 'signup_bonus',
                  description: 'Welcome bonus credits',
                  balance_after: 10
                });
            }
          } else {
            console.log('Successfully created new user with ID:', supabaseUserId);
          }
          
        } else {
          // User exists in public.users
          supabaseUserId = existingPublicUser.id;
          user.id = supabaseUserId;
          
          // Update the user data
          const { error: updateError } = await supabase
            .from('users')
            .update({
              avatar_url: user.image,
              auth_provider: account?.provider || 'google',
              auth_provider_id: account?.providerAccountId,
              last_login: new Date().toISOString()
            })
            .eq('id', supabaseUserId);
            
          if (updateError) {
            console.error('Error updating user:', updateError);
            // Continue anyway
          }
        }
        
        return true;
      } catch (error) {
        console.error('General error in signIn callback:', error);
        return false;
      }
    },
    async jwt({ token, user, account }) {
      // If the user object is present, we're in the sign-in flow
      if (user) {
        // Use the ID we set in the signIn callback
        token.sub = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client, like an access_token and user id from a provider
      if (token && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}; 