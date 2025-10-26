"use client"

import { useQuery } from "@tanstack/react-query"
import { useServices } from "@/context/services-context"
import { useAuth } from "@/context/auth-context"
import { type LogEntry, type LogsQueryParams, type LogType } from "@/service/logs"

interface LogsFilters {
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

interface LogsPagination {
  limit: number
  offset: number
  currentPage: number
}

interface LogsSorting {
  sortBy: "timestamp" | "userName" | "contactId" | "type" | "leadId"
  sortOrder: "asc" | "desc"
}

interface UseLogsParams {
  filters: LogsFilters
  pagination: LogsPagination
  sorting: LogsSorting
}

export function useLogs({ filters, pagination, sorting }: UseLogsParams) {
  const { logsService } = useServices()
  const { config } = useAuth()

  // Determinar si las queries deben ejecutarse
  const hasApiUrl = Boolean(config.apiUrl || "http://localhost:3001")

  // Crear query key único basado en todos los parámetros
  const queryKey = [
    "logs",
    {
      filters,
      limit: pagination.limit,
      offset: pagination.offset,
      sortBy: sorting.sortBy,
      sortOrder: sorting.sortOrder,
    },
  ]

  // Query para obtener logs
  const logsQuery = useQuery({
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
    staleTime: 1000 * 60 * 2, // 2 minutos - los logs cambian frecuentemente
    gcTime: 1000 * 60 * 5, // 5 minutos de cache
  })

  return {
    // Datos
    logs: logsQuery.data?.logs || [],
    total: logsQuery.data?.total || 0,
    hasMore: logsQuery.data?.hasMore || false,
    stats: logsQuery.data?.stats || {},

    // Estados
    isLoading: logsQuery.isLoading,
    isError: logsQuery.isError,
    error: logsQuery.error,

    // Métodos
    refetch: logsQuery.refetch,

    // Query info
    queryKey,
  }
}
