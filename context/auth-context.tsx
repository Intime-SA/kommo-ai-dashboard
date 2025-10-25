"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { type User, signInWithEmailAndPassword, signOut, onAuthStateChanged, getIdTokenResult, getIdToken } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useRouter } from "next/navigation"

interface UserData {
  uid: string
  subdomain: string
  pipeline_id: string
  settings_id: string
  api_url: string
  email: string
  kommo_db: string
}

interface AuthContextType {
  user: User | null
  userData: UserData | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshToken: () => Promise<void>
  getTimeUntilExpiration: () => Promise<number | null>
  fetchUserData: (userParam?: User) => Promise<void>
  config: {
    apiUrl: string | undefined
    kommoSubdomain: string | undefined
    mongoSettingsId: string | undefined
    mongoPipelineId: string | undefined
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Función para verificar si el token está vencido
  const checkTokenExpiration = async (user: User): Promise<boolean> => {
    try {
      const tokenResult = await getIdTokenResult(user)
      const issuedAtTime = new Date(tokenResult.issuedAtTime).getTime()
      const currentTime = new Date().getTime()
      const timeSinceIssued = currentTime - issuedAtTime

      // Considerar vencido si han pasado más de 5 minutos desde que se emitió
      // Esto simula tokens que duran solo 5 minutos en lugar de 1 hora
      return timeSinceIssued > 5 * 60 * 1000
    } catch (error) {
      console.error("Error verificando token:", error)
      return true // Considerar vencido si hay error
    }
  }

  // Función para cerrar sesión automáticamente
  const handleAutoLogout = async () => {
    try {
      await signOut(auth)
      setUser(null)
      setUserData(null)
      if (typeof window !== 'undefined') {
        router.push("/login")
      }
    } catch (error) {
      console.error("Error en logout automático:", error)
    }
  }

  useEffect(() => {
    let tokenCheckInterval: NodeJS.Timeout

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const isExpired = await checkTokenExpiration(firebaseUser)

        if (isExpired) {
          console.log("Token vencido, cerrando sesión...")
          await handleAutoLogout()
        } else {
          setUser(firebaseUser)
          // Obtener datos del usuario de la API
          await fetchUserData(firebaseUser)

          // Verificar token cada 1 minuto
          tokenCheckInterval = setInterval(async () => {
            if (firebaseUser) {
              const isExpired = await checkTokenExpiration(firebaseUser)
              if (isExpired) {
                console.log("Token próximo a vencer, cerrando sesión...")
                clearInterval(tokenCheckInterval)
                await handleAutoLogout()
              }
            }
          }, 1 * 60 * 1000) // Cada 1 minuto (para pruebas)
        }
      } else {
        setUser(null)
        setUserData(null)
        if (tokenCheckInterval) {
          clearInterval(tokenCheckInterval)
        }
      }

      setLoading(false)
    })

    return () => {
      unsubscribe()
      if (tokenCheckInterval) {
        clearInterval(tokenCheckInterval)
      }
    }
  }, [router])

  const login = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      // Después del login exitoso, obtener datos del usuario
      await fetchUserData(result.user)
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      setUserData(null)
      if (typeof window !== 'undefined') {
        router.push("/login")
      }
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }

  const refreshToken = async () => {
    if (user) {
      try {
        // Forzar renovación del token obteniendo un nuevo ID token
        await getIdTokenResult(user, true)
        console.log("Token renovado exitosamente")
      } catch (error) {
        console.error("Error renovando token:", error)
        // Si no se puede renovar, cerrar sesión
        await handleAutoLogout()
      }
    }
  }

  const getTimeUntilExpiration = async (): Promise<number | null> => {
    if (!user) return null

    try {
      const tokenResult = await getIdTokenResult(user)
      const issuedAtTime = new Date(tokenResult.issuedAtTime).getTime()
      const currentTime = new Date().getTime()
      const timeSinceIssued = currentTime - issuedAtTime

      // Calcular tiempo restante basado en duración de 5 minutos
      const totalDuration = 5 * 60 * 1000 // 5 minutos
      const timeLeft = Math.max(0, totalDuration - timeSinceIssued)

      return timeLeft
    } catch (error) {
      console.error("Error obteniendo tiempo hasta expiración:", error)
      return null
    }
  }

  const fetchUserData = async (userParam?: User) => {
    const currentUser = userParam || user
    if (!currentUser) return

    try {
      // Obtener token de Firebase
      const firebaseToken = await getIdToken(currentUser)

      // Obtener URL base del servicio de auth
      const authServiceUrl = process.env.NEXT_PUBLIC_AUTH_SERVICE

      if (!authServiceUrl) {
        console.error("NEXT_PUBLIC_AUTH_SERVICE no está configurado")
        return
      }

      // Hacer petición a la API
      const response = await fetch(`${authServiceUrl}/api/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${firebaseToken}`
        },
        body: JSON.stringify({
          uid: currentUser.uid
        })
      })

      if (!response.ok) {
        throw new Error(`Error en la API: ${response.status} ${response.statusText}`)
      }

      const data: UserData = await response.json()
      setUserData(data)
    } catch (error) {
      console.error("Error obteniendo datos del usuario:", error)
      setUserData(null)
    }
  }

  // Funciones para obtener variables dinámicas desde userData

  const config = {
    apiUrl: userData?.api_url,
    kommoSubdomain: userData?.subdomain,
    mongoSettingsId: userData?.settings_id,
    mongoPipelineId: userData?.pipeline_id,
  }

  return <AuthContext.Provider value={{ user, userData, loading, login, logout, refreshToken, getTimeUntilExpiration, fetchUserData, config }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
