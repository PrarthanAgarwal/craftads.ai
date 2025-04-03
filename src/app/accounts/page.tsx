"use client";

import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { 
  InstagramLogo, 
  TwitterLogo, 
  TiktokLogo, 
  FacebookLogo, 
  LinkedinLogo, 
  PinterestLogo
} from "@phosphor-icons/react";

// Social media platform icons and connection options
const socialPlatforms = [
  { 
    id: "instagram", 
    name: "Instagram", 
    icon: InstagramLogo 
  },
  { 
    id: "twitter", 
    name: "Twitter", 
    icon: TwitterLogo 
  },
  { 
    id: "tiktok", 
    name: "Tiktok", 
    icon: TiktokLogo 
  },
  { 
    id: "facebook", 
    name: "Facebook", 
    icon: FacebookLogo 
  },
  { 
    id: "linkedin", 
    name: "Linkedin", 
    icon: LinkedinLogo 
  },
  { 
    id: "pinterest", 
    name: "Pinterest", 
    icon: PinterestLogo 
  }
];

export default function AccountsPage() {
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

  const handleConnect = (platform: string) => {
    // In a real app, this would redirect to OAuth flow
    alert(`Connecting to ${platform}... (This is a demo)`);
  };

  return (
    <main className="min-h-screen bg-app-background">
      <Sidebar />
      <div className={`${isMobile ? '' : 'ml-[240px]'}`}>
        <Header />
        <div className="pt-[70px] px-6 md:px-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 py-6">
            <div>
              <h1 className="text-3xl font-semibold">Connected Accounts</h1>
              <p className="text-gray-600">Manage your social media platform connections</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm bg-amber-100 text-amber-800 py-1 px-3 rounded-full">
                Feature Coming Soon
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-card p-6 mb-10 border border-gray-100 max-w-3xl">
            <div className="mb-5">
              <h2 className="text-xl font-semibold mb-2">Social Media Platforms</h2>
              <p className="text-gray-600">Connect your social media accounts to publish your ads directly</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {socialPlatforms.map((platform) => {
                const Icon = platform.icon;
                return (
                  <div key={platform.id} className="flex items-center justify-between border border-gray-100 rounded-md p-4 hover:border-gray-200 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 flex items-center justify-center bg-gray-50 rounded-md">
                        <Icon size={22} weight="fill" />
                      </div>
                      <span className="font-medium">{platform.name}</span>
                    </div>
                    <Button 
                      variant="secondary" 
                      size="sm"
                      className="bg-slate-800 text-white hover:bg-slate-700 px-3"
                      onClick={() => handleConnect(platform.name)}
                    >
                      Connect
                    </Button>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Note:</span> Connecting your accounts allows CraftAds to post content on your behalf. You can disconnect any platform at any time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 