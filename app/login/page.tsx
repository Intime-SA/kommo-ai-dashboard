"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { VantaBackgroundLayout } from "@/components/layout/vanta";

declare global {
  interface Window {
    VANTA: any;
    THREE: any;
  }
}

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const vantaRef = useRef<HTMLDivElement>(null);
  const vantaEffect = useRef<any>(null);

  useEffect(() => {
    if (!loading && user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <VantaBackgroundLayout>
      <div ref={vantaRef} className="relative h-screen w-full overflow-hidden">
        {/* Content overlay */}
        <div className="relative z-10 flex h-full w-full items-center justify-center px-6 md:px-12 lg:px-24">
          <LoginForm />
        </div>

        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/30 via-transparent to-black/40 pointer-events-none" />
      </div>
    </VantaBackgroundLayout>
  );
}
