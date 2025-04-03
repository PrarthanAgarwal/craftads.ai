"use client";

import { SessionProvider } from "next-auth/react";
import { PropsWithChildren } from "react";
import { Toaster } from "@/components/ui/toaster";

export function Providers({ children }: PropsWithChildren) {
  return (
    <SessionProvider>
      {children}
      <Toaster />
    </SessionProvider>
  );
} 