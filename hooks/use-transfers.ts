"use client"

import { useQuery, useInfiniteQuery, useMutation } from "@tanstack/react-query"
import { useServices } from '@/context/services-context'
import { convertToArgentinaUTC } from '@/lib/utils'

// Hook para obtener transferencias usando useQuery
export function useTransferRequests(params?: {
  page?: number
  limit?: number
  status?: string
  search?: string
  startDate?: string
  endDate?: string
}) {
  const { transfersService } = useServices()

  return useQuery({
    queryKey: ["transfer-requestsss", params],
    queryFn: async () => {
      const result = await transfersService.getTransferRequests(params)
      if (result.error) throw new Error(result.error)
      return result.data
    },
    enabled: !!params, // Solo ejecutar si hay parámetros
  })
}

// Hook para aprobar transferencias usando useMutation
export function useApproveTransfer() {
  const { transfersService } = useServices()

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await transfersService.approveTransferRequest(id)
      if (result.error) throw new Error(result.error)
      return result.data
    },
  })
}

// Hook para rechazar transferencias usando useMutation
export function useRejectTransfer() {
  const { transfersService } = useServices()

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await transfersService.rejectTransferRequest(id)
      if (result.error) throw new Error(result.error)
      return result.data
    },
  })
}

// Hook para toggle de automation usando useMutation
export function useToggleAutomation() {
  const { transfersService } = useServices()

  return useMutation({
    mutationFn: async (status: boolean) => {
      const result = await transfersService.toggleAutomation(status)
      if (result.error) throw new Error(result.error)
      return result.data
    },
  })
}

export interface AutomationStatus {
  isFunctional: boolean
  isStarting: boolean
  isRunning: boolean
  isHealthy: boolean
  status: 'off' | 'starting' | 'on' | 'error'
}

// Hook para obtener usuarios registrados usando useQuery
export function useRegisteredUsers(params?: {
  page?: number
  limit?: number
  status?: string
  channel?: string
  startDate?: string
  endDate?: string
}) {
  const { transfersService } = useServices()

  // Convertir fechas a UTC Argentina solo para usuarios
  const convertedParams = params ? {
    ...params,
    startDate: params.startDate ? convertToArgentinaUTC(params.startDate) : undefined,
    endDate: params.endDate ? convertToArgentinaUTC(params.endDate) : undefined,
  } : undefined

  return useQuery({
    queryKey: ["registered-users", convertedParams],
    queryFn: async () => {
      const result = await transfersService.getRegisteredUsers(convertedParams)
      if (result.error) throw new Error(result.error)
      return result.data
    },
    enabled: !!params, // Solo ejecutar si hay parámetros
  })
}

// Hook para obtener estadísticas usando useQuery
export function useStats() {
  const { transfersService } = useServices()

  return useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const result = await transfersService.getStats()
      if (result.error) throw new Error(result.error)
      return result.data
    },
  })
}

// Hook para obtener transferencias usando infinite query (sin filtros)
export function useTransferRequestsInfinite(params?: {
  page?: number
  limit?: number
  status?: string
  search?: string
  startDate?: string
  endDate?: string
}) {
  const { transfersService } = useServices()

  return useInfiniteQuery({
    queryKey: ["transfer-requests-infinite", params],
    queryFn: async ({ pageParam = 1 }) => {
      const result = await transfersService.getTransferRequests({
        ...params,
        page: pageParam,
        limit: params?.limit || 20
      })
      if (result.error) throw new Error(result.error)
      return result.data
    },
    enabled: !!params, // Solo ejecutar si hay parámetros
    getNextPageParam: (lastPage) => {
      return lastPage?.pagination?.hasNext ? lastPage.pagination.page + 1 : undefined
    },
    initialPageParam: 1,
  })
}

// Hook para obtener usuarios registrados usando infinite query (sin filtros)
export function useRegisteredUsersInfinite(params?: {
  page?: number
  limit?: number
  status?: string
  channel?: string
  startDate?: string
  endDate?: string
}) {
  const { transfersService } = useServices()

  // Convertir fechas a UTC Argentina solo para usuarios
  const convertedParams = params ? {
    ...params,
    startDate: params.startDate ? convertToArgentinaUTC(params.startDate) : undefined,
    endDate: params.endDate ? convertToArgentinaUTC(params.endDate) : undefined,
  } : undefined

  return useInfiniteQuery({
    queryKey: ["registered-users-infinite", convertedParams],
    queryFn: async ({ pageParam = 1 }) => {
      const result = await transfersService.getRegisteredUsers({
        ...convertedParams,
        page: pageParam,
        limit: params?.limit || 20
      })
      if (result.error) throw new Error(result.error)
      return result.data
    },
    enabled: !!params, // Solo ejecutar si hay parámetros
    getNextPageParam: (lastPage) => {
      return lastPage?.pagination?.hasNext ? lastPage.pagination.page + 1 : undefined
    },
    initialPageParam: 1,
  })
}

// Helper function para determinar si usar infinite query
export const shouldUseInfiniteQuery = (params?: {
  search?: string
  status?: string
  startDate?: string
  endDate?: string
  channel?: string
}) => {
  // Usar infinite query solo cuando NO hay filtros aplicados
  return !params?.search &&
         (!params?.status || params.status === 'all') &&
         !params?.startDate &&
         !params?.endDate &&
         !params?.channel
}
