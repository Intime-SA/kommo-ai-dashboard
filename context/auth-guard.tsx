"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"

interface RouteGuardProps {
  children: React.ReactNode
}

export function RouteGuard({ children }: RouteGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Si terminó de cargar y no hay usuario, redirigir al login
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white">Cargando...</div>
      </div>
    )
  }

  // Si no hay usuario, no renderizar nada (el useEffect se encargará de redirigir)
  if (!user) {
    return null
  }

  // Si hay usuario, renderizar los children
  return <>{children}</>
}
