"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { LogOut, ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    // Simular proceso de logout
    const timer = setTimeout(() => {
      router.push('/login')
    }, 2000)

    return () => clearTimeout(timer)
  }, [router])

  const handleLogout = () => {
    router.push('/login')
  }

  const handleCancel = () => {
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-2 border-border/80 shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
            <LogOut className="h-6 w-6" />
            Cerrar Sesión
          </CardTitle>
          <CardDescription>
            ¿Estás seguro de que quieres cerrar tu sesión?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Cerrando sesión...</span>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex-1 cursor-pointer border-2 border-border/80"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button
              onClick={handleLogout}
              className="flex-1 cursor-pointer bg-destructive hover:bg-destructive/90"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Confirmar
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Serás redirigido automáticamente en unos segundos...
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
