"use client";

import Sidebar from "@/components/Sidebar";
import ServerGalleryHeader from "@/components/gallery/ServerGalleryHeader";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "@phosphor-icons/react";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

// Define the type for credit packages
interface CreditPackage {
  id: string;
  name: string;
  description: string;
  credit_amount: number;
  price: number;
  currency: string;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
}

// Fallback credit packages in case API fails
const fallbackPricingPlans = [
  {
    name: "Starter Package",
    price: "$14.99",
    period: "monthly",
    description: "Perfect for beginners",
    features: [
      "100 AI generations",
      "High-quality results",
      "Access to all templates",
      "Priority processing",
      "Download in multiple formats"
    ],
    buttonText: "Buy 100 Credits",
    isPopular: false,
    disabled: false
  },
  {
    name: "Pro Package",
    price: "$34.99",
    period: "monthly",
    description: "Best value for regular users",
    features: [
      "500 AI generations",
      "High-quality results",
      "Access to all templates",
      "Priority processing",
      "Download in multiple formats"
    ],
    buttonText: "Buy 500 Credits",
    isPopular: true,
    disabled: false
  },
  {
    name: "Business Package",
    price: "$85.99",
    period: "monthly",
    description: "For businesses with higher volume needs",
    features: [
      "1500 AI generations",
      "High-quality results",
      "Access to all templates",
      "Priority processing",
      "Download in multiple formats"
    ],
    buttonText: "Buy 1500 Credits",
    isPopular: false,
    disabled: false
  }
];

export default function PricingPage() {
  const [isMobile, setIsMobile] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [confirmationStatus, setConfirmationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  
  const { data: session } = useSession();
  const { toast } = useToast();

  // Fetch credit packages from API
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/credits/packages');
        if (!response.ok) {
          throw new Error('Failed to fetch packages');
        }
        const data = await response.json();
        if (data.success && data.data.packages) {
          setPackages(data.data.packages);
        }
      } catch (error) {
        console.error('Error fetching packages:', error);
        toast({
          title: "Error",
          description: "Failed to load credit packages. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (isMounted) {
      fetchPackages();
    }
  }, [isMounted, toast]);

  // Check device size to set mobile state
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    setIsMounted(true);
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Handle package purchase
  const handlePurchase = async (packageId: string) => {
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to purchase credits.",
        variant: "destructive"
      });
      return;
    }

    const packageData = packages.find(pkg => pkg.id === packageId);
    if (!packageData) return;

    setSelectedPackage(packageData);
    setPurchaseDialogOpen(true);
  };

  // Confirm the purchase
  const confirmPurchase = async () => {
    if (!selectedPackage || !session) return;

    try {
      setPurchaseLoading(true);
      const response = await fetch('/api/credits/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          packageId: selectedPackage.id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to initiate purchase');
      }

      const data = await response.json();
      if (data.success) {
        // In a real app, we would redirect to a payment provider
        // For now, we'll simulate a successful purchase
        setConfirmationStatus('loading');
        
        // Complete the purchase (mock)
        setTimeout(async () => {
          try {
            const completeResponse = await fetch('/api/credits/purchase/complete', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                paymentSessionId: data.data.paymentSessionId
              })
            });

            if (!completeResponse.ok) {
              throw new Error('Failed to complete purchase');
            }

            const completeData = await completeResponse.json();
            if (completeData.success) {
              setConfirmationStatus('success');
              toast({
                title: "Purchase Successful",
                description: `You've added ${selectedPackage.credit_amount} credits to your account!`,
                variant: "default"
              });
              // Close dialog after short delay
              setTimeout(() => {
                setPurchaseDialogOpen(false);
                setConfirmationStatus('idle');
              }, 2000);
            } else {
              throw new Error('Purchase completion failed');
            }
          } catch (error) {
            console.error('Error completing purchase:', error);
            setConfirmationStatus('error');
          }
        }, 2000); // Simulate payment processing
      }
    } catch (error) {
      console.error('Error purchasing package:', error);
      toast({
        title: "Purchase Failed",
        description: "An error occurred while processing your purchase. Please try again.",
        variant: "destructive"
      });
      setConfirmationStatus('error');
    } finally {
      setPurchaseLoading(false);
    }
  };

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

  // Map API credit packages to the UI format
  const pricingPlans = packages.length > 0 
    ? packages.map(pkg => ({
        id: pkg.id,
        name: pkg.name,
        price: `$${pkg.price}`,
        period: 'monthly',
        description: pkg.description,
        creditAmount: pkg.credit_amount,
        features: [
          `${pkg.credit_amount} AI generations`,
          "High-quality results",
          "Access to all templates",
          "Priority processing",
          "Download in multiple formats"
        ],
        buttonText: `Buy ${pkg.credit_amount} Credits`,
        isPopular: pkg.is_featured,
        disabled: false
      }))
    : fallbackPricingPlans;

  return (
    <main className="min-h-screen bg-app-background">
      <Sidebar />
      <div className={`${isMobile ? '' : 'ml-[240px]'}`}>
        <ServerGalleryHeader />
        <div className="pt-[70px] px-6 md:px-8">
          <div className="text-center max-w-3xl mx-auto py-12">
            <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
            <p className="text-xl text-gray-600">
              Get more from CraftAds with our premium plans. Unlock advanced features and create even better ads.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-lg">Loading available plans...</span>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto pb-16">
              {pricingPlans.map((plan) => (
                <div 
                  key={plan.name} 
                  className={`bg-white rounded-xl overflow-hidden border ${
                    plan.isPopular ? 'border-primary shadow-lg' : 'border-gray-200'
                  }`}
                >
                  {plan.isPopular && (
                    <div className="bg-primary text-white text-center py-2 text-sm font-medium">
                      Most Popular
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-2xl font-bold">{plan.name}</h3>
                    <div className="mt-4 mb-6">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-gray-500">/{plan.period}</span>
                    </div>
                    <p className="text-gray-600 mb-6">{plan.description}</p>
                    <Button 
                      className={`w-full ${plan.disabled ? 'bg-gray-300 hover:bg-gray-300 cursor-not-allowed' : plan.isPopular ? 'bg-primary hover:bg-primary/90' : 'bg-slate-800 hover:bg-slate-700'}`}
                      disabled={plan.disabled}
                      onClick={() => 'id' in plan && typeof plan.id === 'string' && handlePurchase(plan.id)}
                    >
                      {plan.buttonText}
                    </Button>
                  </div>
                  <div className="bg-gray-50 p-6">
                    <h4 className="font-medium mb-4">Features include:</h4>
                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm">
                          <CheckCircle size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Purchase Confirmation Dialog */}
      <Dialog open={purchaseDialogOpen} onOpenChange={setPurchaseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Purchase</DialogTitle>
          </DialogHeader>
          
          {confirmationStatus === 'idle' && selectedPackage && (
            <>
              <div className="py-4">
                <div className="mb-4 text-center">
                  <p className="text-lg font-semibold">{selectedPackage.name}</p>
                  <p className="text-3xl font-bold mt-2">${selectedPackage.price}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    You will receive {selectedPackage.credit_amount} credits
                  </p>
                </div>
                
                <div className="border-t border-b py-4 my-4">
                  <div className="flex justify-between mb-2">
                    <span>Package price:</span>
                    <span>${selectedPackage.price}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Total:</span>
                    <span>${selectedPackage.price}</span>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setPurchaseDialogOpen(false)}>Cancel</Button>
                <Button 
                  onClick={confirmPurchase}
                  disabled={purchaseLoading}
                  className="bg-primary hover:bg-primary/90"
                >
                  {purchaseLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Confirm Purchase'
                  )}
                </Button>
              </DialogFooter>
            </>
          )}

          {confirmationStatus === 'loading' && (
            <div className="py-8 text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-lg">Processing your payment...</p>
              <p className="text-sm text-gray-500 mt-1">Please do not close this window</p>
            </div>
          )}

          {confirmationStatus === 'success' && (
            <div className="py-8 text-center">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={28} weight="bold" />
              </div>
              <p className="text-lg font-medium">Payment Successful!</p>
              <p className="text-sm text-gray-500 mt-1">
                Your credits have been added to your account
              </p>
            </div>
          )}

          {confirmationStatus === 'error' && (
            <div className="py-8 text-center">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold">!</span>
              </div>
              <p className="text-lg font-medium">Payment Failed</p>
              <p className="text-sm text-gray-500 mt-1">
                There was an error processing your payment. Please try again.
              </p>
              <Button 
                onClick={() => setConfirmationStatus('idle')}
                className="mt-4"
                variant="outline"
              >
                Try Again
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
