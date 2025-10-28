"use client"

import { useState } from "react"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { LogOut, Loader2 } from "lucide-react"

export function LogoutButton() {
  const { logout } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    try {
      await logout()
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleLogout}
      disabled={loading}
      variant="outline"
      size="sm"
      className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <LogOut className="w-4 h-4" />
      )}
      <span className="ml-2">Salir</span>
    </Button>
  )
}
