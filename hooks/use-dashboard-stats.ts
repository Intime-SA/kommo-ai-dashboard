"use client"

import { useAppSelector } from "@/lib/hooks"
import { useLogs } from "./use-logs"

export function useDashboardStats() {
  const { total: reduxTotal, selectedIds } = useAppSelector((state) => state.logs)
  const { total: queryTotal, stats: queryStats } = useLogs({
    filters: {},
    pagination: { limit: 10, offset: 0, currentPage: 1 },
    sorting: { sortBy: "timestamp", sortOrder: "desc" }
  })

  // Usar las estadísticas de React Query si están disponibles, sino usar Redux
  const stats = queryStats && Object.keys(queryStats).length > 0 ? queryStats : {}

  return {
    total: queryTotal || reduxTotal,
    selected: selectedIds.length,
    messageCount: stats.received_messages || 0,
    statusChanges: stats.change_status || 0,
    botActions: stats.bot_actions || 0,
  }
}
