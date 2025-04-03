"use client";

import Sidebar from "@/components/Sidebar";
import { useEffect, useState } from "react";
import ServerGalleryGrid from "@/components/gallery/ServerGalleryGrid";
import ServerGalleryHeader from "@/components/gallery/ServerGalleryHeader";

export default function Home() {
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
          <p className="text-foreground">Loading CraftAds...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-app-background">
      <Sidebar />
      <div className={`${isMobile ? '' : 'ml-[240px]'}`}>
        <ServerGalleryHeader />
        <div className="pt-[70px]">
          <ServerGalleryGrid />
        </div>
      </div>
    </main>
  );
}
