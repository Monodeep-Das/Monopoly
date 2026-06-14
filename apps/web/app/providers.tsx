"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { authApi } from "@/features/auth/api";
import { useAuthStore } from "@/lib/store/auth";

function AuthSync() {
  const { isLoaded, isSignedIn } = useAuth();
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.logout);

  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn) {
        authApi.getProfile()
          .then((user) => {
            // Store Prisma user in Zustand without overriding token (Clerk manages token)
            setAuth(user, "");
          })
          .catch((err) => {
            console.error("Failed to sync Prisma user profile:", err);
          });
      } else {
        clearAuth();
      }
    }
  }, [isLoaded, isSignedIn, setAuth, clearAuth]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthSync />
      {children}
    </QueryClientProvider>
  );
}
