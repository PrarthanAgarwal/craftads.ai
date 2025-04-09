import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session } = useSession();
  
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    // Don't prevent default here to allow URL hash update
    const element = document.getElementById(id);
    if (element) {
      // Use scrollIntoView for smooth scrolling
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <nav className="bg-background py-5 border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center pl-2 md:pl-4">
            <Link href="/" className="flex items-center">
              <Image 
                src="/logo.PNG" 
                alt="CraftAds Logo" 
                width={30} 
                height={30} 
                className="mr-2"
              />
              <span className="text-2xl font-bold mr-1">craftads</span>
            </Link>
          </div>
          
          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex items-center space-x-10">
            <a 
              href="#pricing" 
              onClick={(e) => handleNavClick(e, 'pricing')}
              className="text-lg text-foreground hover:underline transition-colors"
            >
              Pricing
            </a>
            <a 
              href="#features" 
              onClick={(e) => handleNavClick(e, 'features')}
              className="text-lg text-foreground hover:underline transition-colors"
            >
              Features
            </a>
            <a 
              href="#faq" 
              onClick={(e) => handleNavClick(e, 'faq')}
              className="text-lg text-foreground hover:underline transition-colors"
            >
              FAQ
            </a>
          </div>
          
          {/* CTA Button or User Profile - Desktop */}
          <div className="hidden md:block pr-2 md:pr-4">
            {session ? (
              <Link href="/gallery" className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary hover:bg-primary/90 transition-colors">
                <Avatar className="h-8 w-8 border border-white/30">
                  <AvatarFallback className="bg-white/30 text-black">
                    {session.user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium text-black">{session.user?.name}</span>
              </Link>
            ) : (
              <Button asChild size="lg" className="rounded-md px-8 py-4 text-lg bg-primary hover:bg-primary/90 text-black">
                <Link href="/login">Login</Link>
              </Button>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center pr-2">
            {session ? (
              <Link href="/gallery" className="flex items-center gap-1.5 mr-4 px-2.5 py-1 rounded-md bg-primary hover:bg-primary/90 transition-colors">
                <Avatar className="h-7 w-7 border border-white/30">
                  <AvatarFallback className="bg-white/30 text-black text-sm">
                    {session.user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium text-sm text-black">Dashboard</span>
              </Link>
            ) : (
              <Button asChild size="lg" className="rounded-md px-6 py-3 text-base mr-4 bg-primary hover:bg-primary/90 text-black">
                <Link href="/login">Login</Link>
              </Button>
            )}
            
            <button
              className="text-foreground p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-background border-b border-border animate-fadeIn">
          <div className="container mx-auto px-4 py-3">
            <div className="flex flex-col space-y-3 animate-slideDown">
              <a 
                href="#pricing" 
                onClick={(e) => handleNavClick(e, 'pricing')}
                className="text-lg font-medium text-foreground hover:underline transition-colors py-1"
              >
                Pricing
              </a>
              <a 
                href="#features" 
                onClick={(e) => handleNavClick(e, 'features')}
                className="text-lg font-medium text-foreground hover:underline transition-colors py-1"
              >
                Features
              </a>
              <a 
                href="#faq" 
                onClick={(e) => handleNavClick(e, 'faq')}
                className="text-lg font-medium text-foreground hover:underline transition-colors py-1"
              >
                FAQ
              </a>
              {session && (
                <>
                  <div className="w-full h-px bg-gray-200 my-1"></div>
                  <Link 
                    href="/account"
                    className="text-lg font-medium text-foreground hover:underline transition-colors py-1"
                  >
                    My Account
                  </Link>
                  <Link 
                    href="/generations"
                    className="text-lg font-medium text-foreground hover:underline transition-colors py-1"
                  >
                    My Generations
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 