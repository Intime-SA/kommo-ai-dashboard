"use client"

import { useQuery } from "@tanstack/react-query"
import { useServices } from "@/context/services-context"

/**
 * Hook para obtener estadísticas de reportes para gráficos
 */
export function useReportsStats(params?: {
  campaignId?: string
  startDate?: string
  endDate?: string
  eventName?: string
}) {
  const { reportsService } = useServices()

  return useQuery({
    queryKey: ["reports-stats", params],
    queryFn: async () => {
      const result = await reportsService.getReportsStats(params)
      if (result.error) throw new Error(result.error)
      return result.data
    },
    enabled: true, // Siempre ejecutar ya que por defecto trae las últimas 24hs
  })
}
