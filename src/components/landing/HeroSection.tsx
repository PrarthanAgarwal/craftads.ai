import React from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <div className="container mx-auto px-6 md:px-12 py-16 md:py-24 flex flex-col md:flex-row items-center max-w-7xl">
      {/* Left Section - Text Content */}
      <div className="w-full md:w-1/2 md:pr-12 mb-10 md:mb-0">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
          Craft stunning print Ads <span className="text-primary">in seconds.</span>
        </h1>
        
        <p className="text-lg mb-8 text-muted-foreground">
          The simple way to create stunning print ads. Built for agencies, brands, and creators 
          with a focus on speed and quality.
        </p>
        
        <div className="space-y-4 mb-10">
          <p className="font-medium">With craftads, you can:</p>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✅</span>
              <span>Generate viral ads with just 3 clicks</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✅</span>
              <span>Remix over 1000 ads across 10+ industries</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✅</span>
              <span>Customize your own ads in seconds</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✅</span>
              <span>Spike your brand's reach and engagement in minutes</span>
            </li>
          </ul>
        </div>
        
        <p className="font-medium mb-8">All this for less than $1.</p>
        
        <Button asChild size="lg" className="rounded-md px-8 py-4 text-lg bg-primary hover:bg-primary/90">
          <Link href="/gallery">Try for free</Link>
        </Button>
      </div>
      
      {/* Right Section - Video */}
      <div className="w-full md:w-1/2 md:pl-4">
        <div className="bg-muted rounded-lg overflow-hidden shadow-xl">
          {/* Replace with your actual video component */}
          <div className="aspect-video bg-gray-800 flex items-center justify-center">
            <p className="text-gray-300">Autoplaying demo video</p>
            {/* Uncomment and use this for actual video
            <video 
              autoPlay 
              loop 
              muted 
              playsInline
              className="w-full h-full object-cover"
            >
              <source src="/demo-video.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection; 