import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { PRICING_TIERS, PricingTier } from '@/constants/pricing';

function PricingCard({ 
  tier, 
  isYearly,
  showFreeTrial
}: { 
  tier: PricingTier; 
  isYearly: boolean;
  showFreeTrial: boolean;
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
          asChild
          className="w-full py-4 text-base font-medium bg-primary hover:bg-primary/90 text-black transition-all"
        >
          <Link href="/login">
            {showFreeTrial ? "Start 7 day free trial →" : "Get started →"}
          </Link>
        </Button>
        <p className="mt-2 text-center text-xs text-gray-500">
          {showFreeTrial ? "$0.00 due today, cancel anytime" : "7 day money-back guarantee"}
        </p>
      </div>
    </div>
  );
}

const PricingSection = () => {
  const [isYearly, setIsYearly] = useState(true);
  const [showFreeTrial, setShowFreeTrial] = useState(true);

  return (
    <div id="pricing" className="py-16 bg-gray-100">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Choose Your Plan
          </h2>

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
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {PRICING_TIERS.map((tier) => (
            <PricingCard 
              key={tier.id} 
              tier={tier} 
              isYearly={isYearly}
              showFreeTrial={showFreeTrial}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingSection; 