"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { PRICING_TIERS, PRICING_VERSION, PricingTier } from "@/constants/pricing";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

interface Discount {
  tier_id: string;
  discount_type: string;
  discount_percentage: number;
  end_date: string;
}

function PricingCard({ 
  tier, 
  isYearly,
  showFreeTrial,
  onPurchase
}: { 
  tier: PricingTier; 
  isYearly: boolean;
  showFreeTrial: boolean;
  onPurchase: (tierId: string) => void;
}) {
  const price = isYearly ? tier.price.yearly : tier.price.monthly;
  const [wholePart, decimalPart] = price.toFixed(2).split('.');
  const yearlyTotal = (price * 12).toFixed(0);
  const savings = ((tier.price.monthly - tier.price.yearly) * 12).toFixed(0);

  return (
    <div className={`relative bg-white rounded-xl p-8 shadow-lg flex flex-col justify-between font-inter
      ${tier.highlight ? 'ring-2 ring-primary ring-offset-4' : 'ring-1 ring-gray-100'}
    `}>
      {isYearly && (
        <div className="absolute top-3 right-3 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-600">
          25% OFF
        </div>
      )}
      <div>
        {/* Tier Name & Badge */}
        <div className="mb-6">
          <div className="flex items-center">
            <h3 className="text-2xl font-bold text-gray-900">{tier.name}</h3>
            {tier.badge && (
              <div className={`ml-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                bg-primary text-white
              `}>
                {tier.badge.text}
              </div>
            )}
          </div>
          <p className="mt-2 text-gray-500 text-sm">{tier.description}</p>
        </div>

        {/* Price */}
        <div className="mb-6">
          <div className="flex items-end">
            <span className="text-5xl font-bold text-gray-900">
              <span className="text-4xl">$</span>
              {wholePart}
              {decimalPart !== '00' && (
                <span className="text-2xl align-top font-medium text-gray-500">.{decimalPart}</span>
              )}
            </span>
            <span className="text-sm text-gray-500 mb-1.5 ml-1">/month</span>
          </div>

          {isYearly && (
            <>
              <p className="mt-1 text-sm text-gray-500">
                Billed as ${yearlyTotal}/year
              </p>
              <p className="mt-1 text-sm text-primary">
                Save ${savings} with yearly pricing (25% off)
              </p>
            </>
          )}
        </div>

        {/* Features */}
        <ul className="space-y-3">
          {tier.features.map((feature, index) => {
            // Capitalize the first letter of each feature
            const text = feature.text.charAt(0).toUpperCase() + feature.text.slice(1);
            
            // Make "X generations" bold and black
            let formattedText = text.includes('generations') 
              ? text.replace(/(\d+\s+generations)/, '<span class="font-bold text-black">$1</span>') 
              : text;
            
            // Format the file types to appear on new line with proper spacing
            if (formattedText.includes('formats')) {
              formattedText = formattedText.replace(/\s+\((png, jpg.+)\)/, '');
              formattedText += '<div class="text-xs text-gray-500 mt-0.5">png, jpg, webp, heic, pdf</div>';
            }
              
            return (
              <li key={index} className="flex items-start gap-3">
                <Check className={`h-5 w-5 flex-shrink-0 mt-0.5 ${feature.included ? 'text-primary' : 'text-gray-300'}`} />
                <div>
                  <span 
                    className={`text-base leading-tight ${feature.highlight ? 'text-primary font-medium' : 'text-gray-800'}`}
                    dangerouslySetInnerHTML={{ __html: formattedText }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* CTA Section */}
      <div className="mt-10">
        <Button 
          className="w-full py-4 text-base font-medium bg-primary hover:bg-primary/90 text-black transition-all"
          onClick={() => onPurchase(tier.id)}
        >
          {showFreeTrial ? "Start 7 day free trial →" : "Get started →"}
        </Button>
        <p className="mt-2 text-center text-xs text-gray-500">
          {showFreeTrial ? "$0.00 due today, cancel anytime" : "7 day money-back guarantee"}
        </p>
      </div>
    </div>
  );
}

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(true);
  const [showFreeTrial, setShowFreeTrial] = useState(true);
  const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [confirmationStatus, setConfirmationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [activeDiscounts, setActiveDiscounts] = useState<Discount[]>([]);
  
  const { data: session } = useSession();
  const { toast } = useToast();

  const handlePurchase = async (tierId: string) => {
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to purchase credits.",
        variant: "destructive"
      });
      return;
    }

    const tier = PRICING_TIERS.find(t => t.id === tierId);
    if (!tier) return;

    setSelectedTier(tier);
    setPurchaseDialogOpen(true);
  };

  const confirmPurchase = async () => {
    if (!selectedTier || !session) return;

    try {
      setPurchaseLoading(true);
      const response = await fetch('/api/credits/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-pricing-version': PRICING_VERSION
        },
        body: JSON.stringify({
          tierId: selectedTier.id,
          expectedPrice: isYearly ? selectedTier.price.yearly : selectedTier.price.monthly
        })
      });

      if (!response.ok) {
        throw new Error('Failed to initiate purchase');
      }

      const data = await response.json();
      if (data.success) {
              setConfirmationStatus('success');
              toast({
                title: "Purchase Successful",
          description: `You've added ${selectedTier.creditAmount} credits to your account!`,
                variant: "default"
              });
              setTimeout(() => {
                setPurchaseDialogOpen(false);
                setConfirmationStatus('idle');
              }, 2000);
            } else {
        throw new Error(data.error || 'Purchase failed');
      }
    } catch (error) {
      console.error('Error purchasing package:', error);
      toast({
        title: "Purchase Failed",
        description: error instanceof Error ? error.message : "An error occurred while processing your purchase.",
        variant: "destructive"
      });
      setConfirmationStatus('error');
    } finally {
      setPurchaseLoading(false);
    }
  };

    return (
    <main className="min-h-screen bg-background font-inter">
      <Navbar />
      
      <div className="container mx-auto px-6 md:px-8">
        {/* Title section */}
        <div className="text-center max-w-3xl mx-auto pt-8 pb-16">
          <h1 className="text-4xl font-bold">Choose Your Plan</h1>
        </div>

        {/* Pricing section */}
        <div className="max-w-6xl mx-auto">
          {/* Toggle section */}
          <div className="text-center mb-12">
            {/* Billing and Free Trial Toggles */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-6 mt-16">
              {/* Billing Toggle */}
              <div className="inline-flex relative items-center rounded-full bg-white p-1 ring-1 ring-gray-200 w-full max-w-xs">
                <button
                  onClick={() => setIsYearly(false)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors w-1/2
                    ${!isYearly 
                      ? 'bg-primary text-white' 
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                    }
                  `}
                >
                  Monthly
                </button>
                <div className="relative w-1/2">
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 rounded-full bg-red-500 px-4 py-0.5 text-xs font-medium text-white animate-bounce whitespace-nowrap">
                    25% OFF
                  </div>
                  <button
                    onClick={() => setIsYearly(true)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors w-full
                      ${isYearly 
                        ? 'bg-primary text-white' 
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                      }
                    `}
                  >
                    Yearly
                  </button>
                </div>
              </div>

              {/* Free Trial Toggle */}
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm font-medium">Free Trial</span>
                <button
                  onClick={() => setShowFreeTrial(!showFreeTrial)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                    showFreeTrial ? 'bg-primary' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition-transform ${
                      showFreeTrial ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {PRICING_TIERS.map((tier) => (
              <PricingCard 
                key={tier.id} 
                tier={tier} 
                isYearly={isYearly}
                showFreeTrial={showFreeTrial}
                onPurchase={handlePurchase}
              />
              ))}
            </div>
        </div>
      </div>

      <Footer />

      {/* Purchase Dialog */}
      <Dialog open={purchaseDialogOpen} onOpenChange={setPurchaseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Purchase</DialogTitle>
          </DialogHeader>
          
          {confirmationStatus === 'idle' && selectedTier && (
            <>
              <div className="py-4">
                <div className="mb-4 text-center">
                  <p className="text-lg font-semibold">{selectedTier.name}</p>
                  <p className="text-3xl font-bold mt-2">
                    ${isYearly ? selectedTier.price.yearly : selectedTier.price.monthly}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    You will receive {selectedTier.creditAmount} credits
                  </p>
                </div>
                
                <div className="border-t border-b py-4 my-4">
                  <div className="flex justify-between mb-2">
                    <span>Package price:</span>
                    <span>${isYearly ? selectedTier.price.yearly : selectedTier.price.monthly}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Total:</span>
                    <span>${isYearly ? selectedTier.price.yearly : selectedTier.price.monthly}</span>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setPurchaseDialogOpen(false)}>
                  Cancel
                </Button>
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
                <Check size={28} />
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
