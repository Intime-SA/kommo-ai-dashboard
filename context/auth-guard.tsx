"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Navbar } from "@/components/navbar";

interface RouteGuardProps {
  children: React.ReactNode;
}

export function RouteGuard({ children }: RouteGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Si terminó de cargar y no hay usuario, redirigir al login
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white">Cargando...</div>
      </div>
    );
  }

  // Si no hay usuario, no renderizar nada (el useEffect se encargará de redirigir)
  if (!user) {
    return null;
  }

  // Si hay usuario, renderizar los children
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 border border-border/30 mt-10">
      <Navbar />
      {children}
    </div>
  );
}
