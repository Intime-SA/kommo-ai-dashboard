"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/auth-context"
import { Badge } from "@/components/ui/badge"
import { Clock, Shield, AlertTriangle, Loader2 } from "lucide-react"

export function TokenStatus() {
  const { user, getTimeUntilExpiration, refreshToken } = useAuth()
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      const updateTimeLeft = async () => {
        const time = await getTimeUntilExpiration()
        setTimeLeft(time)
      }

      updateTimeLeft()

      // Actualizar cada 30 segundos para pruebas
      const interval = setInterval(updateTimeLeft, 30000)

      return () => clearInterval(interval)
    } else {
      setTimeLeft(null)
    }
  }, [user, getTimeUntilExpiration])

  const formatTime = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60

    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`
    }
    return `${minutes}m`
  }

  const getStatusColor = () => {
    if (!timeLeft) return "secondary"
    if (timeLeft < 2 * 60 * 1000) return "destructive" // Menos de 2 minutos restantes
    if (timeLeft < 5 * 60 * 1000) return "yellow" // Menos de 5 minutos restantes
    return "default"
  }

  const getStatusIcon = () => {
    if (!timeLeft || timeLeft > 5 * 60 * 1000) return <Shield className="w-3 h-3" />
    if (timeLeft < 2 * 60 * 1000) return <AlertTriangle className="w-3 h-3" />
    return <Clock className="w-3 h-3" />
  }

  const handleRefresh = async () => {
    setLoading(true)
    try {
      await refreshToken()
      // Actualizar tiempo inmediatamente después de refresh
      const newTime = await getTimeUntilExpiration()
      setTimeLeft(newTime)
    } catch (error) {
      console.error("Error refrescando token:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="flex items-center gap-2">
      <Badge
        variant={getStatusColor() as any}
        className="flex items-center gap-1 text-xs"
      >
        {getStatusIcon()}
        {timeLeft ? formatTime(timeLeft) : "Verificando..."}
      </Badge>

      {timeLeft && timeLeft < 5 * 60 * 1000 && (
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="text-xs text-blue-400 hover:text-blue-300 disabled:opacity-50 flex items-center gap-1"
        >
          {loading && <Loader2 className="w-3 h-3 animate-spin" />}
          {loading ? "" : "Renovar"}
        </button>
      )}
    </div>
  )
}
