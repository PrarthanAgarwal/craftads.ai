import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Image from "next/image";
import Link from "next/link";
import LoginForm from "./login-form";

export const metadata: Metadata = {
  title: "Login | CraftAds",
  description: "Login to your CraftAds account",
};

export default async function LoginPage() {
  // Check if user is already logged in
  const session = await getServerSession(authOptions);
  
  // If already logged in, redirect to the dashboard
  if (session) {
    redirect("/");
  }
  
  return (
    <div className="flex justify-center items-center min-h-screen w-screen bg-primary/20 relative">
      {/* Return to home button */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 text-black flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 18L9 12L15 6" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className="font-medium">Back to Home</span>
      </Link>
      
      {/* Modal Card */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden w-full max-w-4xl flex flex-col md:flex-row mx-4 md:h-[600px]">
        {/* Left side with graphic - full image */}
        <div className="bg-primary/10 w-full md:w-1/2 relative">
          <div className="relative w-full h-64 md:h-full">
            <Image 
              src="/login_graphic.webp" 
              alt="Login illustration" 
              fill
              style={{ objectFit: 'cover', objectPosition: 'center' }}
              priority
              className="h-full w-full"
            />
          </div>
        </div>
        
        {/* Right side with login form */}
        <div className="w-full md:w-1/2 p-10 flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="text-center mb-10">
              <Link href="/" className="inline-block mb-6">
                <div className="flex items-center justify-center gap-2">
                  <Image 
                    src="/logo.PNG" 
                    alt="CraftAds Logo" 
                    width={30} 
                    height={30} 
                  />
                  <span className="font-bold text-black text-2xl">craftads</span>
                </div>
              </Link>
              <h1 className="text-xl font-semibold mb-3">Welcome to CraftAds</h1>
              <p className="text-gray-500 text-sm">Sign in to continue to your account</p>
            </div>
            
            <div className="mb-10">
              <LoginForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 