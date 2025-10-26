"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Settings, LogOut, LogIn, Home, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

export function Navbar() {
  // hooks y variables
  const router = useRouter()
  const { logout } = useAuth()

  // Estado para abrir y cerrar el menú
  const [isOpen, setIsOpen] = useState(false)

  // Funciones para navegar y cerrar el menú
  const handleNavigation = (path: string) => {
    router.push(path)
    setIsOpen(false) // Cerrar el menú después de navegar
  }

  // Función para cerrar sesión
  const handleLogout = () => {
    logout()
    setIsOpen(false)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b-2 border-border/80 shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo/Home */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/")}
              className="flex items-center gap-2 cursor-pointer hover:bg-primary/10"
            >
              <Home className="h-4 w-4" />
              <span className="font-semibold">Dashboard</span>
            </Button>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/settings")}
              className="flex items-center gap-2 cursor-pointer border-2 border-border/80 hover:border-primary/50"
            >
              <Settings className="h-4 w-4" />
              Configuraciones
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2 cursor-pointer border-2 border-border/80 hover:border-destructive/50 hover:text-destructive bg-transparent"
            >
              <LogOut className="h-4 w-4 text-red-500" />
              Cerrar Sesión
            </Button>

            {/*   <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/login')}
              className="flex items-center gap-2 cursor-pointer border-2 border-border/80 hover:border-primary/50"
            >
              <LogIn className="h-4 w-4" />
              Iniciar Sesión
            </Button> */}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2 cursor-pointer bg-transparent">
                  <Menu className="h-4 w-4" />
                  <span className="sr-only">Abrir menú</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle>Menú de Navegación</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-4 mt-6">
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={() => handleNavigation("/")}
                    className="flex items-center gap-3 justify-start h-12 px-4"
                  >
                    <Home className="h-5 w-5" />
                    Dashboard
                  </Button>

                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={() => handleNavigation("/settings")}
                    className="flex items-center gap-3 justify-start h-12 px-4"
                  >
                    <Settings className="h-5 w-5" />
                    Configuraciones
                  </Button>

                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={handleLogout}
                    className="flex items-center gap-3 justify-start h-12 px-4 text-destructive hover:text-destructive"
                  >
                    <LogOut className="h-5 w-5 text-red-500" />
                    Cerrar Sesión
                  </Button>

                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={() => handleNavigation("/login")}
                    className="flex items-center gap-3 justify-start h-12 px-4"
                  >
                    <LogIn className="h-5 w-5" />
                    Iniciar Sesión
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
