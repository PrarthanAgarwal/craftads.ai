"use client";

import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import { formatDistanceToNow } from "date-fns";

interface CreditTransaction {
  id: string;
  amount: number;
  type: string;
  description: string;
  balance_after: number;
  created_at: string;
  reference_id?: string;
  reference_type?: string;
}

export default function CreditsPage() {
  const [isMobile, setIsMobile] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [creditBalance, setCreditBalance] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const { data: session, status } = useSession();
  const { toast } = useToast();

  // Check device size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    setIsMounted(true);
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fetch credit balance and transaction history
  useEffect(() => {
    const fetchCreditData = async () => {
      if (!session?.user) return;
      
      try {
        setLoading(true);
        
        // Fetch credit balance
        const balanceResponse = await fetch('/api/credits/balance');
        if (!balanceResponse.ok) {
          throw new Error('Failed to fetch credit balance');
        }
        const balanceData = await balanceResponse.json();
        if (balanceData.success) {
          setCreditBalance(balanceData.data.credits);
        }
        
        // Fetch transaction history
        const historyResponse = await fetch(`/api/credits/history?page=${page}&limit=10`);
        if (!historyResponse.ok) {
          throw new Error('Failed to fetch transaction history');
        }
        const historyData = await historyResponse.json();
        if (historyData.success) {
          setTransactions(historyData.data.transactions);
          setTotalPages(historyData.data.pagination.pages);
        }
      } catch (error) {
        console.error('Error fetching credit data:', error);
        toast({
          title: "Error",
          description: "Failed to load credit data. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (isMounted && session) {
      fetchCreditData();
    }
  }, [session, isMounted, page, toast]);

  // Return a simpler version during server-side rendering to avoid hydration errors
  if (!isMounted) {
    return (
      <main className="min-h-screen bg-app-background">
        <div className="pt-20 px-4 text-center">
          <p className="text-foreground">Loading...</p>
        </div>
      </main>
    );
  }

  // Function to get type label with appropriate color
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'purchase':
        return <span className="text-green-600 font-medium">Purchase</span>;
      case 'usage':
        return <span className="text-blue-600 font-medium">Usage</span>;
      case 'refund':
        return <span className="text-purple-600 font-medium">Refund</span>;
      case 'signup_bonus':
        return <span className="text-amber-600 font-medium">Signup Bonus</span>;
      default:
        return <span className="text-gray-600 font-medium">{type}</span>;
    }
  };

  return (
    <main className="min-h-screen bg-app-background">
      <Sidebar />
      <div className={`${isMobile ? '' : 'ml-[240px]'}`}>
        <Header />
        <div className="pt-[70px] px-6 md:px-8">
          {/* Page header */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 py-6">
            <div>
              <h1 className="text-3xl font-semibold">Credits & Transactions</h1>
              <p className="text-gray-600">Manage your credit balance and view transaction history</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white shadow-sm rounded-md px-4 py-3 border border-gray-100">
                <p className="text-sm text-gray-500">Current Balance</p>
                <p className="text-2xl font-semibold">{creditBalance} Credits</p>
              </div>
              <Button className="bg-primary hover:bg-primary/90" asChild>
                <Link href="/pricing">Buy Credits</Link>
              </Button>
            </div>
          </div>

          {/* Transaction history section */}
          <div className="bg-white rounded-lg shadow-card border border-gray-100 p-6 mb-10">
            <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
            
            {status === "loading" || loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-lg">Loading transactions...</span>
              </div>
            ) : !session ? (
              <div className="text-center py-10">
                <p className="mb-4">Please sign in to view your transaction history.</p>
                <Button asChild>
                  <Link href="/api/auth/signin">Sign In</Link>
                </Button>
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-10 border rounded-lg bg-gray-50">
                <p className="mb-2 text-gray-500">No transactions found</p>
                <p className="text-sm text-gray-400">Your credit transactions will appear here</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead className="bg-gray-50 border-y">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {transactions.map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4 text-sm text-gray-500">
                            <div>{new Date(transaction.created_at).toLocaleDateString()}</div>
                            <div className="text-xs text-gray-400">
                              {formatDistanceToNow(new Date(transaction.created_at), { addSuffix: true })}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm">
                            {getTypeLabel(transaction.type)}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-700">
                            {transaction.description}
                          </td>
                          <td className={`px-4 py-4 text-sm text-right font-medium ${transaction.amount > 0 ? 'text-green-600' : 'text-blue-600'}`}>
                            {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                          </td>
                          <td className="px-4 py-4 text-sm text-right font-medium">
                            {transaction.balance_after}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination controls */}
                {totalPages > 1 && (
                  <div className="flex justify-between items-center mt-6 pt-6 border-t">
                    <Button 
                      variant="outline" 
                      disabled={page === 1}
                      onClick={() => setPage(prev => Math.max(1, prev - 1))}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-500">
                      Page {page} of {totalPages}
                    </span>
                    <Button 
                      variant="outline" 
                      disabled={page === totalPages}
                      onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
} 