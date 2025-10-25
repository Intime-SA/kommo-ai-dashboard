"use client"

import { useQuery } from "@tanstack/react-query"
import { useServices } from "@/context/services-context"
import { useAuth } from "@/context/auth-context"
import { type SystemSettings } from "@/service/settings"
import { type Rule } from "@/service/rules"

interface SettingsData {
  settings: SystemSettings
  rules: Rule[]
}

export function useSettings() {
  const { settingsService, rulesService } = useServices()
  const { config } = useAuth()

  // Determinar si las queries deben ejecutarse
  const hasApiUrl = Boolean(config.apiUrl)

  // Query para obtener settings
  const settingsQuery = useQuery({
    queryKey: ["settings", config.mongoSettingsId],
    queryFn: async () => {
      const { data, error } = await settingsService.fetchSettings()
      if (error) throw error
      return data || {
        _id: config.mongoSettingsId || "",
        accountCBU: "",
        context: "",
        message: "",
        accountName: "",
        numbers: [],
      }
    },
    enabled: hasApiUrl,
    staleTime: 1000 * 60 * 5, // 5 minutos
  })

  // Query para obtener rules
  const rulesQuery = useQuery({
    queryKey: ["rules"],
    queryFn: async () => {
      const { data, error } = await rulesService.fetchRules()
      if (error) throw error
      return data || []
    },
    enabled: hasApiUrl,
    staleTime: 1000 * 60 * 5, // 5 minutos
  })

  // Estado combinado
  const isLoading = settingsQuery.isLoading || rulesQuery.isLoading
  const isError = settingsQuery.isError || rulesQuery.isError
  const error = settingsQuery.error || rulesQuery.error

  return {
    // Datos
    settings: settingsQuery.data,
    rules: rulesQuery.data || [],

    // Estados
    isLoading,
    isError,
    error,

    // Estados individuales
    settingsLoading: settingsQuery.isLoading,
    rulesLoading: rulesQuery.isLoading,
    settingsError: settingsQuery.error,
    rulesError: rulesQuery.error,

    // Métodos de refetch
    refetchSettings: settingsQuery.refetch,
    refetchRules: rulesQuery.refetch,
    refetchAll: () => {
      settingsQuery.refetch()
      rulesQuery.refetch()
    },
  }
}
