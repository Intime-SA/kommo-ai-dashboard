"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export type SnackbarType = 'success' | 'error' | 'warning' | 'info'

export interface SnackbarMessage {
  id: string
  type: SnackbarType
  title: string
  description?: string
  duration?: number
}

interface SnackbarContextType {
  showSnackbar: (message: Omit<SnackbarMessage, 'id'>) => void
  hideSnackbar: (id: string) => void
  clearAll: () => void
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined)

export const useSnackbar = () => {
  const context = useContext(SnackbarContext)
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider')
  }
  return context
}

const getSnackbarStyles = (type: SnackbarType) => {
  switch (type) {
    case 'success':
      return {
        container: 'bg-green-500/10 border-green-500/20 text-green-100',
        icon: <CheckCircle className="h-5 w-5 text-green-400" />,
        progress: 'bg-green-400'
      }
    case 'error':
      return {
        container: 'bg-red-500/10 border-red-500/20 text-red-100',
        icon: <XCircle className="h-5 w-5 text-red-400" />,
        progress: 'bg-red-400'
      }
    case 'warning':
      return {
        container: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-100',
        icon: <AlertCircle className="h-5 w-5 text-yellow-400" />,
        progress: 'bg-yellow-400'
      }
    case 'info':
      return {
        container: 'bg-blue-500/10 border-blue-500/20 text-blue-100',
        icon: <Info className="h-5 w-5 text-blue-400" />,
        progress: 'bg-blue-400'
      }
  }
}

interface SnackbarItemProps {
  message: SnackbarMessage
  onClose: (id: string) => void
}

function SnackbarItem({ message, onClose }: SnackbarItemProps) {
  const styles = getSnackbarStyles(message.type)
  const [isVisible, setIsVisible] = useState(true)
  const [progress, setProgress] = useState(100)

  React.useEffect(() => {
    const duration = message.duration || 5000
    const interval = 50
    const steps = duration / interval
    const decrement = 100 / steps

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          setIsVisible(false)
          setTimeout(() => onClose(message.id), 300)
          return 0
        }
        return prev - decrement
      })
    }, interval)

    return () => clearInterval(timer)
  }, [message.id, message.duration, onClose])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => onClose(message.id), 300)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={cn(
            'fixed top-4 right-4 z-50 min-w-[320px] max-w-[480px] p-4 rounded-lg border-2 shadow-lg backdrop-blur-sm',
            styles.container
          )}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {styles.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold leading-tight">{message.title}</h4>
              {message.description && (
                <p className="mt-1 text-sm opacity-90 leading-relaxed">
                  {message.description}
                </p>
              )}
            </div>
            <button
              onClick={handleClose}
              className="flex-shrink-0 p-1 rounded-md hover:bg-black/10 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="mt-3 h-1 bg-black/10 rounded-full overflow-hidden">
            <motion.div
              className={cn('h-full rounded-full', styles.progress)}
              initial={{ width: '100%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

interface SnackbarProviderProps {
  children: ReactNode
}

export function SnackbarProvider({ children }: SnackbarProviderProps) {
  const [messages, setMessages] = useState<SnackbarMessage[]>([])

  const showSnackbar = (message: Omit<SnackbarMessage, 'id'>) => {
    const id = `snackbar-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newMessage: SnackbarMessage = {
      id,
      ...message,
    }

    setMessages((prev) => [...prev, newMessage])

    // Auto-remove after duration
    const duration = message.duration || 5000
    setTimeout(() => {
      hideSnackbar(id)
    }, duration)
  }

  const hideSnackbar = (id: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== id))
  }

  const clearAll = () => {
    setMessages([])
  }

  const value: SnackbarContextType = {
    showSnackbar,
    hideSnackbar,
    clearAll,
  }

  return (
    <SnackbarContext.Provider value={value}>
      {children}
      <div className="fixed top-0 right-0 z-50 pointer-events-none">
        <AnimatePresence>
          {messages.map((message, index) => (
            <div
              key={message.id}
              className="pointer-events-auto"
              style={{
                transform: `translateY(${index * 80}px)`,
                transition: 'transform 0.3s ease-out',
              }}
            >
              <SnackbarItem message={message} onClose={hideSnackbar} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </SnackbarContext.Provider>
  )
}
