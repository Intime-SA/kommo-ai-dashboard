"use client"

import { useEffect, useRef } from "react"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { LoginForm } from "@/components/login-form"

declare global {
  interface Window {
    VANTA: any
    THREE: any
  }
}

export default function LoginPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const vantaRef = useRef<HTMLDivElement>(null)
  const vantaEffect = useRef<any>(null)

  useEffect(() => {
    if (!loading && user) {
      router.push("/")
    }
  }, [user, loading, router])

  useEffect(() => {
    // Load Three.js
    const threeScript = document.createElement("script")
    threeScript.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js"
    threeScript.async = true
    document.body.appendChild(threeScript)

    threeScript.onload = () => {
      // Load Vanta.js NET effect
      const vantaScript = document.createElement("script")
      vantaScript.src = "https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.net.min.js"
      vantaScript.async = true
      document.body.appendChild(vantaScript)

      vantaScript.onload = () => {
        if (vantaRef.current && !vantaEffect.current) {
          vantaEffect.current = window.VANTA.NET({
            el: vantaRef.current,
            THREE: window.THREE,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.0,
            minWidth: 200.0,
            scale: 1.5,
            scaleMobile: 1.5,
            color: 0x00d9ff,
            backgroundColor: 0x0a0a0a,
            points: 25.0,
            maxDistance: 35.0,
            spacing: 20.0,
            showDots: true,
            mouseCoeffX: 2.5,
            mouseCoeffY: 2.5,
          })
        }
      }
    }

    return () => {
      if (vantaEffect.current) {
        vantaEffect.current.destroy()
      }
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  if (user) {
    return null
  }

  return (
    <div ref={vantaRef} className="relative h-screen w-full overflow-hidden">
      {/* Content overlay */}
      <div className="relative z-10 flex h-full w-full items-center justify-center px-6 md:px-12 lg:px-24">
        <LoginForm />
      </div>

      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/20 via-transparent to-slate-950/30 pointer-events-none" />
    </div>
  )
}
