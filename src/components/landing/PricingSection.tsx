import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface PricingPlanProps {
  title: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  ctaText: string;
  isPopular?: boolean;
}

const PricingPlan = ({ title, price, period, description, features, ctaText, isPopular = false }: PricingPlanProps) => {
  return (
    <div className={`rounded-lg border ${isPopular ? 'border-primary shadow-lg' : 'border-border'} overflow-hidden bg-card`}>
      {isPopular && (
        <div className="bg-primary text-primary-foreground text-center py-1 text-sm font-medium">
          Most Popular
        </div>
      )}
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <div className="mb-4">
          <span className="text-3xl font-bold">{price}</span>
          <span className="text-muted-foreground ml-1">/{period}</span>
        </div>
        <p className="text-muted-foreground mb-6">{description}</p>
        
        <ul className="space-y-3 mb-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <span className="mr-2 text-green-500 mt-1">
                <Check size={16} />
              </span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        
        <Button 
          asChild 
          variant={isPopular ? "default" : "outline"} 
          className={`w-full rounded-md ${isPopular ? 'bg-primary hover:bg-primary/90' : ''}`}
        >
          <Link href="/gallery">{ctaText}</Link>
        </Button>
      </div>
    </div>
  );
};

const PricingSection = () => {
  const pricingPlans = [
    {
      title: "Starter Package",
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
      ctaText: "Buy 100 Credits",
      isPopular: false
    },
    {
      title: "Pro Package",
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
      ctaText: "Buy 500 Credits",
      isPopular: true
    },
    {
      title: "Business Package",
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
      ctaText: "Buy 1500 Credits",
      isPopular: false
    }
  ];

  return (
    <div id="pricing" className="py-16 bg-muted">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Choose Your Plan
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get more from CraftAds with our premium plans. Unlock advanced features and create even better ads.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <PricingPlan 
              key={index}
              title={plan.title}
              price={plan.price}
              period={plan.period}
              description={plan.description}
              features={plan.features}
              ctaText={plan.ctaText}
              isPopular={plan.isPopular}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingSection; 