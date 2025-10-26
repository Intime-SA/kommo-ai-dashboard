"use client"

import { useQuery } from "@tanstack/react-query"
import { useServices } from "@/context/services-context"
import { useAuth } from "@/context/auth-context"
import { type LogEntry, type LogsQueryParams, type LogType } from "@/service/logs"

interface SearchFilters {
  logType?: LogType
  contactId?: string
  leadId?: string
  userName?: string
  clientId?: string
  sourceName?: string
  status?: string
  changedBy?: "bot" | "manual" | "system"
  startDate?: string
  endDate?: string
  searchTerm?: string
}

interface SearchParams {
  filters: SearchFilters
  pagination: {
    limit: number
    offset: number
  }
  sorting: {
    sortBy: "timestamp" | "userName" | "contactId" | "type" | "leadId"
    sortOrder: "asc" | "desc"
  }
}

export function useSearchTerm({ filters, pagination, sorting }: SearchParams) {
  const { logsService } = useServices()
  const { config } = useAuth()

  // Determinar si las queries deben ejecutarse
  const hasApiUrl = Boolean(config.apiUrl || "http://localhost:3001")

  // Crear query key único basado en todos los parámetros de búsqueda
  const queryKey = [
    "search-logs",
    {
      filters,
      limit: pagination.limit,
      offset: pagination.offset,
      sortBy: sorting.sortBy,
      sortOrder: sorting.sortOrder,
    },
  ]

  // Query para buscar logs con filtros
  const searchQuery = useQuery({
    queryKey,
    queryFn: async (): Promise<{
      logs: LogEntry[]
      total: number
      hasMore: boolean
      stats: any
    }> => {
      const params: LogsQueryParams = {
        ...filters,
        limit: pagination.limit,
        offset: pagination.offset,
        sortBy: sorting.sortBy,
        sortOrder: sorting.sortOrder,
      }

      const result = await logsService.getLogs(params)

      if (result.error) {
        throw new Error(result.error)
      }

      return {
        logs: result.data?.logs || [],
        total: result.data?.total || 0,
        hasMore: result.data?.hasMore || false,
        stats: result.data?.stats || {},
      }
    },
    enabled: hasApiUrl,
    staleTime: 1000 * 60 * 2, // 2 minutos - las búsquedas cambian frecuentemente
    gcTime: 1000 * 60 * 5, // 5 minutos de cache
  })

  return {
    // Datos
    logs: searchQuery.data?.logs || [],
    total: searchQuery.data?.total || 0,
    hasMore: searchQuery.data?.hasMore || false,
    stats: searchQuery.data?.stats || {},

    // Estados
    isLoading: searchQuery.isLoading,
    isError: searchQuery.isError,
    error: searchQuery.error,

    // Métodos
    refetch: searchQuery.refetch,

    // Query info
    queryKey,

    // Utilidades
    hasApiUrl,
  }
}
