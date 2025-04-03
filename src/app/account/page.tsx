"use client";

import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AccountPage() {
  const [isMobile, setIsMobile] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { data: session, status } = useSession();
  const isLoading = status === "loading";

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

  return (
    <main className="min-h-screen bg-app-background">
      <Sidebar />
      <div className={`${isMobile ? '' : 'ml-[240px]'}`}>
        <Header />
        <div className="pt-[70px] px-6 md:px-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 py-8">
            <div>
              <h1 className="text-3xl font-semibold">Account</h1>
              <p className="text-gray-600">View your account information</p>
            </div>
          </div>

          {isLoading ? (
            <div className="bg-white rounded-lg shadow-card p-8 mb-10 border border-gray-100 animate-pulse">
              <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start">
                <div className="w-24 h-24 rounded-full bg-gray-200"></div>
                <div className="flex-1 space-y-4 text-center sm:text-left">
                  <div className="h-8 bg-gray-200 rounded w-48 mx-auto sm:mx-0"></div>
                  <div className="h-4 bg-gray-200 rounded w-64 mx-auto sm:mx-0"></div>
                  <div className="h-4 bg-gray-200 rounded w-40 mx-auto sm:mx-0"></div>
                </div>
              </div>
            </div>
          ) : !session ? (
            <div className="bg-white rounded-lg shadow-card p-8 mb-10 border border-gray-100 text-center">
              <p className="text-lg">Please sign in to view your account details</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-card p-8 mb-10 border border-gray-100">
              <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start">
                <Avatar className="w-24 h-24 border-2 border-gray-200">
                  <AvatarFallback className="bg-primary/10 text-primary text-3xl font-medium">
                    {session.user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-6 text-center sm:text-left">
                  <div>
                    <h2 className="text-2xl font-semibold mb-1">{session.user?.name || "User"}</h2>
                    <p className="text-gray-500">Free Plan</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-md">
                      <label className="text-sm font-medium text-gray-500 block mb-1">Email Address</label>
                      <p className="font-medium">{session.user?.email || "email@example.com"}</p>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-md">
                      <label className="text-sm font-medium text-gray-500 block mb-1">Member Since</label>
                      <p className="font-medium">June 2023</p>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Button className="bg-primary text-white" asChild>
                      <Link href="/pricing">Change Plan</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
} 