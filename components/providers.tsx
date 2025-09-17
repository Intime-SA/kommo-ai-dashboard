"use client"

import type React from "react"

import { Provider } from "react-redux"
import { store } from "@/lib/store"
import { ThemeProvider } from "./theme-provider"
import { SnackbarProvider } from "./snackbar-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
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
    </Provider>
  )
}
