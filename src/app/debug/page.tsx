"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/Sidebar";

export default function DebugPage() {
  const { data: session, status } = useSession();
  const [databaseInfo, setDatabaseInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    setIsMounted(true);
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const checkDatabaseRecords = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/debug/auth");
      const data = await response.json();
      setDatabaseInfo(data);
    } catch (error) {
      console.error("Error fetching database info:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) {
    return <div>Loading...</div>;
  }

  return (
    <main className="min-h-screen bg-app-background">
      <Sidebar />
      <div className={`${isMobile ? '' : 'ml-[240px]'}`}>
        <div className="pt-8 p-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Auth & Database Debug Page</h1>
            
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
              <h2 className="text-xl font-medium mb-4">NextAuth Session</h2>
              {status === "loading" ? (
                <p>Loading session...</p>
              ) : status === "authenticated" ? (
                <div className="space-y-2">
                  <p className="text-green-600 font-medium">✓ Authenticated</p>
                  <div className="bg-gray-50 p-3 rounded border overflow-x-auto">
                    <pre className="text-sm">
                      {JSON.stringify(
                        {
                          ...session,
                          user: {
                            ...session?.user,
                            email: session?.user?.email 
                              ? `${session.user.email.slice(0, 3)}...${session.user.email.slice(-8)}` 
                              : null,
                          },
                        },
                        null,
                        2
                      )}
                    </pre>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-red-600 font-medium">✗ Not authenticated</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Sign in to see your session information
                  </p>
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
              <h2 className="text-xl font-medium mb-4">Supabase Database Records</h2>
              {status !== "authenticated" ? (
                <p className="text-gray-500">Please sign in to check database records</p>
              ) : (
                <div className="space-y-4">
                  <Button
                    onClick={checkDatabaseRecords}
                    disabled={loading}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {loading ? "Loading..." : "Check Database Records"}
                  </Button>

                  {databaseInfo && (
                    <div className="space-y-4 mt-4">
                      <div>
                        <h3 className="font-medium mb-2">User Record</h3>
                        {databaseInfo.database.user.exists ? (
                          <div className="bg-gray-50 p-3 rounded border overflow-x-auto">
                            <pre className="text-sm">
                              {JSON.stringify(databaseInfo.database.user.data, null, 2)}
                            </pre>
                          </div>
                        ) : (
                          <div className="bg-red-50 text-red-700 p-3 rounded border">
                            <p className="font-medium">Error: User record not found</p>
                            <p className="text-sm mt-1">{databaseInfo.database.user.error}</p>
                          </div>
                        )}
                      </div>

                      <div>
                        <h3 className="font-medium mb-2">User Preferences</h3>
                        {databaseInfo.database.preferences.exists ? (
                          <div className="bg-gray-50 p-3 rounded border overflow-x-auto">
                            <pre className="text-sm">
                              {JSON.stringify(databaseInfo.database.preferences.data, null, 2)}
                            </pre>
                          </div>
                        ) : (
                          <div className="bg-yellow-50 text-yellow-700 p-3 rounded border">
                            <p className="font-medium">Warning: User preferences not found</p>
                            <p className="text-sm mt-1">{databaseInfo.database.preferences.error}</p>
                          </div>
                        )}
                      </div>

                      <div>
                        <h3 className="font-medium mb-2">
                          Credit Transactions ({databaseInfo.database.transactions.count})
                        </h3>
                        {databaseInfo.database.transactions.exists ? (
                          <div className="bg-gray-50 p-3 rounded border overflow-x-auto">
                            <pre className="text-sm">
                              {JSON.stringify(databaseInfo.database.transactions.data, null, 2)}
                            </pre>
                          </div>
                        ) : (
                          <div className="bg-yellow-50 text-yellow-700 p-3 rounded border">
                            <p className="font-medium">Warning: No credit transactions found</p>
                            <p className="text-sm mt-1">{databaseInfo.database.transactions.error}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-medium mb-4">Troubleshooting Steps</h2>
              <ul className="list-disc ml-5 space-y-2">
                <li>Make sure your SQL schema has been applied correctly to Supabase</li>
                <li>Verify that your <code>.env</code> file has the correct Supabase credentials</li>
                <li>If authentication works but database records are missing, the NextAuth-to-Supabase integration may be broken</li>
                <li>Try logging out and logging back in to trigger the signIn callback</li>
                <li>Check server logs for any errors during sign-in</li>
              </ul>
              
              <div className="mt-6 bg-blue-50 p-4 rounded-md border border-blue-200">
                <h3 className="font-medium text-blue-800 mb-2">Important Note About Google Authentication</h3>
                <p className="text-sm text-blue-700 mb-2">
                  Google provides numeric user IDs that are not compatible with Supabase's UUID format. 
                  The authentication system has been updated to:
                </p>
                <ol className="list-decimal ml-5 text-sm text-blue-700 space-y-1">
                  <li>Generate proper UUIDs for new users</li>
                  <li>Store Google's ID in the <code>auth_provider_id</code> field</li>
                  <li>Look up users by email if ID lookup fails</li>
                </ol>
                <p className="text-sm text-blue-700 mt-2">
                  If you were previously signed in, you may need to sign out and sign back in for these changes to take effect.
                </p>
              </div>
              
              <div className="mt-6 bg-yellow-50 p-4 rounded-md border border-yellow-200">
                <h3 className="font-medium text-yellow-800 mb-2">Foreign Key Constraint Issue</h3>
                <p className="text-sm text-yellow-700 mb-2">
                  Your schema requires that users in the <code>public.users</code> table reference IDs in the <code>auth.users</code> table
                  via the foreign key constraint: <code>id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE</code>
                </p>
                <p className="text-sm text-yellow-700 mb-2">
                  This means:
                </p>
                <ol className="list-decimal ml-5 text-sm text-yellow-700 space-y-1">
                  <li>Users must be created in <code>auth.users</code> first (through Supabase Auth)</li>
                  <li>The same UUID must be used in both tables</li>
                  <li>You can't create users directly in <code>public.users</code> with arbitrary UUIDs</li>
                </ol>
                <p className="text-sm text-yellow-700 mt-2">
                  The authentication system has been updated to use Supabase Auth's admin APIs to create users properly. If you're
                  still seeing issues, try clearing your browser cookies and signing in again.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 