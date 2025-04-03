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
    <div className="flex justify-center items-center min-h-screen w-screen bg-[#678e6a] relative">
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
        <div className="bg-[#b5d1c2] w-full md:w-1/2 relative">
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
                  <div className="w-12 h-12 flex items-center justify-center bg-black text-white rounded-md">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M8.5 10C9.32843 10 10 9.32843 10 8.5C10 7.67157 9.32843 7 8.5 7C7.67157 7 7 7.67157 7 8.5C7 9.32843 7.67157 10 8.5 10Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M21 15L16 10L5 21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span className="font-bold text-black text-2xl">CraftAds</span>
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