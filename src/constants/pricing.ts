export const PRICING_VERSION = '2024-04';

export interface PricingFeature {
  text: string;
  included: boolean;
  highlight?: boolean;
}

export interface PricingTier {
  id: string;
  name: string;
  badge?: {
    text: string;
    variant: 'popular' | 'deal' | 'special'
  };
  description: string;
  price: {
    monthly: number;
    yearly: number;
  };
  creditAmount: number;
  features: PricingFeature[];
  highlight?: boolean;
}

export const YEARLY_DISCOUNT = 0.25; // 25% off

export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'starter',
    name: "Starter",
    description: "Best for beginner creators",
    price: {
      monthly: 15,
      yearly: 11.25,
    },
    creditAmount: 100,
    features: [
      { text: "100 generations", included: true },
      { text: "all template access", included: true },
      { text: "bookmark templates", included: true },
      { text: "custom prompt support", included: true },
    ],
  },
  {
    id: 'pro',
    name: "Pro",
    badge: {
      text: "Most popular",
      variant: "popular"
    },
    description: "Best for growing creators",
    price: {
      monthly: 45,
      yearly: 33.50,
    },
    creditAmount: 500,
    features: [
      { text: "500 generations", included: true },
      { text: "all template access", included: true },
      { text: "bookmark templates", included: true },
      { text: "custom prompt support", included: true },
      { text: "upload custom templates", included: true },
      { text: "download in multiple formats (png, jpg, webp, heic, pdf)", included: true },
    ],
    highlight: true,
  },
  {
    id: 'business',
    name: "Business",
    badge: {
      text: "Best deal",
      variant: "deal"
    },
    description: "Best for scaling brands",
    price: {
      monthly: 95,
      yearly: 71.25,
    },
    creditAmount: 1500,
    features: [
      { text: "1500 generations", included: true, highlight: true },
      { text: "all template access", included: true },
      { text: "bookmark templates", included: true },
      { text: "custom prompt support", included: true },
      { text: "upload custom templates", included: true },
      { text: "download in multiple formats (png, jpg, webp, heic, pdf)", included: true },
    ],
  },
];

export const calculateYearlyPrice = (monthlyPrice: number): number => {
  return Number((monthlyPrice * (1 - YEARLY_DISCOUNT)).toFixed(2));
};

export const formatPrice = (price: number): string => {
  return price.toFixed(2);
}; 