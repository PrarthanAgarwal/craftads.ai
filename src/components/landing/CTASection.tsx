import React from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";

const CTASection = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="py-16 bg-primary/5">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to transform your ad creation process?
          </h2>
          
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start with our free plan today and experience the power of AI-driven ad generation. 
            No credit card required.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild size="lg" className="rounded-md px-8 py-4 bg-primary hover:bg-primary/90">
              <Link href="/gallery">Get started for free</Link>
            </Button>
            
            <Button 
              asChild 
              variant="outline" 
              size="lg" 
              className="rounded-md px-8 py-4"
            >
              <a 
                href="#pricing"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('pricing');
                  // Update URL with hash
                  window.history.pushState({}, '', '#pricing');
                }}
              >
                View pricing
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CTASection; 