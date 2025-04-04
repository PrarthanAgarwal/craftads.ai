"use client";

import Link from "next/link";
import { 
  House,
  Backpack,
  Plus,
  ListBullets,
  Clock,
  Plugs,
  FileText,
  User,
  Users,
  Coin,
  Image,
  SignOut,
  SignIn,
  CaretRight,
  Receipt
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
}

// Main navigation items
const navItems: NavItem[] = [
  { 
    icon: House, 
    label: "Home", 
    href: "/" 
  },
];

// Create section items
const createItems: NavItem[] = [
  {
    icon: Plus,
    label: "New Print Ad",
    href: "/new-ad"
  },
  {
    icon: Backpack,
    label: "Your Generations",
    href: "/generations"
  },
];

// Integrations section items
const integrationItems: NavItem[] = [
  {
    icon: Plugs,
    label: "Connected Accounts",
    href: "/accounts"
  },
];

export default function Sidebar() {
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  // Replace mock credits with state for actual credits
  const [credits, setCredits] = useState(0);
  const [totalCredits, setTotalCredits] = useState(100);
  const [isLoadingCredits, setIsLoadingCredits] = useState(false);
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // Fetch credit balance from API when user is logged in
  useEffect(() => {
    const fetchCreditBalance = async () => {
      if (session?.user) {
        try {
          setIsLoadingCredits(true);
          const response = await fetch('/api/credits/balance');
          if (!response.ok) {
            throw new Error('Failed to fetch credit balance');
          }
          const data = await response.json();
          if (data.success) {
            setCredits(data.data.credits);
          }
        } catch (error) {
          console.error('Error fetching credit balance:', error);
        } finally {
          setIsLoadingCredits(false);
        }
      }
    };

    fetchCreditBalance();
  }, [session]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const Logo = () => (
    <div className="px-6">
      <Link href="/">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded-md">
            <Image size={18} weight="bold" />
          </div>
          <span className="font-semibold text-black text-lg">CraftAds</span>
        </div>
      </Link>
    </div>
  );

  // Navigation section with title and items
  const NavSection = ({ title, items }: { title: string, items: NavItem[] }) => (
    <div className="mb-6">
      {title && (
        <div className="px-6 mb-2">
          <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">{title}</span>
        </div>
      )}
      <div className="w-full flex flex-col">
        {items.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <div className="px-6 py-1" key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-2 flex items-center gap-3 transition-colors",
                  isActive 
                    ? "text-primary font-medium bg-gray-100" 
                    : "text-gray-800 hover:bg-gray-200"
                )}
              >
                <Icon 
                  size={20} 
                  weight={isActive ? "fill" : "regular"} 
                />
                <span className={cn(
                  "font-normal text-sm",
                  isActive && "font-medium"
                )}>
                  {item.label}
                </span>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );

  const CreditsCounter = () => (
    <div className="w-full px-6 py-3">
      <div className="flex items-center gap-2 mb-1">
        <div className="relative">
          <Coin size={20} weight="fill" className="text-amber-500" />
          <Coin size={20} weight="regular" className="text-gray-800 absolute inset-0" />
        </div>
        <span className="text-sm font-medium">Credits</span>
        {isLoadingCredits ? (
          <span className="ml-auto text-sm font-medium">Loading...</span>
        ) : (
          <span className="ml-auto text-sm font-medium">{credits}/{totalCredits}</span>
        )}
      </div>
      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full shadow-inner" 
          style={{ width: `${Math.min((credits / totalCredits) * 100, 100)}%` }}
        />
      </div>
      {credits < 10 && (
        <div className="mt-1 text-xs text-amber-600 flex items-center gap-1">
          <span>Low credits</span>
          <Link href="/pricing" className="underline">Buy more</Link>
        </div>
      )}
    </div>
  );

  const ProfileSection = () => {
    if (isLoading) {
      return (
        <div className="w-full px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse" />
            <div className="flex flex-col gap-1">
              <div className="h-4 w-20 bg-gray-200 animate-pulse rounded" />
              <div className="h-3 w-32 bg-gray-200 animate-pulse rounded" />
            </div>
          </div>
        </div>
      );
    }
    
    if (!session) {
      return (
        <div className="w-full px-6 py-4">
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center gap-2 py-2.5"
            asChild
          >
            <Link href="/login">
              <SignIn size={18} />
              <span>Sign In</span>
            </Link>
          </Button>
        </div>
      );
    }

    return (
      <Popover open={profileMenuOpen} onOpenChange={setProfileMenuOpen}>
        <PopoverTrigger asChild>
          <div className="w-full px-6 py-4 cursor-pointer hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 flex-shrink-0 border border-gray-200">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {session.user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
                <span className="font-medium text-sm truncate">{session.user?.name || "User"}</span>
                <span className="text-xs text-gray-500 opacity-75 truncate">Free Plan</span>
              </div>
              <CaretRight 
                size={16} 
                className={`ml-auto text-gray-500 transition-transform ${profileMenuOpen ? 'rotate-90' : ''}`} 
              />
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-0 rounded-md border shadow-md" align="end" side="top">
          <div className="py-1">
            <Link href="/account" className="w-full px-4 py-2 text-sm text-left hover:bg-gray-100 flex items-center gap-2">
              <User size={16} />
              <span>Account</span>
            </Link>
            <Link href="/credits" className="w-full px-4 py-2 text-sm text-left hover:bg-gray-100 flex items-center gap-2">
              <Receipt size={16} />
              <span>Credits & Transactions</span>
            </Link>
            <Link href="/pricing" className="w-full px-4 py-2 text-sm text-left hover:bg-gray-100 flex items-center gap-2">
              <FileText size={16} />
              <span>Pricing Plans</span>
            </Link>
            <div className="border-t my-1"></div>
            <button 
              onClick={() => signOut({ callbackUrl: '/' })}
              className="w-full px-4 py-2 text-sm text-left text-red-500 hover:bg-gray-100 flex items-center gap-2"
            >
              <SignOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  // Mobile sidebar
  if (isMobile) {
    return (
      <>
        <div className="fixed top-0 left-0 z-20 p-3">
          <Sheet>
            <SheetTrigger asChild>
              <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-card active:scale-95 transition-transform duration-150">
                <ListBullets size={20} />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-6 flex flex-col">
              <Logo />
              <div className="w-full h-px bg-gray-50 my-4"></div>
              <div className="flex-1 flex flex-col overflow-y-auto mt-6">
                <NavSection title="" items={navItems} />
                <NavSection title="Create" items={createItems} />
                <NavSection title="Integrations" items={integrationItems} />
                <div className="flex-grow"></div>
                {session && <CreditsCounter />}
              </div>
              <ProfileSection />
            </SheetContent>
          </Sheet>
        </div>
      </>
    );
  }

  // Desktop sidebar
  return (
    <div className="fixed left-0 top-0 bottom-0 w-[240px] flex flex-col bg-white z-10 border-r border-gray-200">
      <div className="h-16 flex items-center">
        <Logo />
      </div>
      
      <div className="w-full h-px bg-gray-50"></div>

      <div className="flex-1 flex flex-col overflow-y-auto mt-6">
        <NavSection title="" items={navItems} />
        <NavSection title="Create" items={createItems} />
        <NavSection title="Integrations" items={integrationItems} />
        <div className="flex-grow"></div>
        {session && <CreditsCounter />}
      </div>
      <ProfileSection />
    </div>
  );
}
