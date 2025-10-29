"use client"

import type React from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import { Provider } from "react-redux"
import { store } from "@/lib/store"
import { ThemeProvider } from "./theme-provider"
import { SnackbarProvider } from "./snackbar-provider"
import { TooltipProvider } from "@/components/ui/tooltip"

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
})

// Componente Providers para envolver la aplicación
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <TooltipProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            forcedTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            <SnackbarProvider>
              {children}
            </SnackbarProvider>
          </ThemeProvider>
        </TooltipProvider>
      </Provider>
    </QueryClientProvider>
  )
}
