"use client"

import { useQuery } from "@tanstack/react-query"
import { useServices } from '@/context/services-context'

// Hook para obtener reportes usando useQuery
export function useReports(params?: {
  campaignId?: string
  startDate?: string
  endDate?: string
  eventName?: string
}) {
  const { reportsService } = useServices()

  return useQuery({
    queryKey: ["reports", params],
    queryFn: async () => {
      const result = await reportsService.getReports(params)
      if (result.error) throw new Error(result.error)
      return result.data
    },
    enabled: true, // Siempre ejecutar ya que por defecto trae las últimas 24hs
  })
}
