'use client'

import { Activity, BarChart3, TrendingUp, Zap } from "lucide-react"
import { StatsCard } from "./stats-card"

interface ReportsData {
  totalEvents: number
  eventTypes: string[]
  event1Count: number
  event2Count: number
}

interface ReportsStatsGridProps {
  reportsData: ReportsData
  isLoading?: boolean
}

export function ReportsStatsGrid({ reportsData, isLoading = false }: ReportsStatsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Total de Eventos */}
      <StatsCard
        title="Total de Eventos"
        value={reportsData.totalEvents}
        subtitle="Eventos registrados"
        icon={Activity}
        iconColor="text-blue-500"
        isLoading={isLoading}
      />

      {/* Tipos de Eventos */}
      <StatsCard
        title="Tipos de Eventos"
        value={reportsData.eventTypes.length}
        subtitle={`${reportsData.eventTypes.join(', ')}`}
        icon={BarChart3}
        iconColor="text-purple-500"
        isLoading={isLoading}
      />

      {/* Evento 1 */}
      <StatsCard
        title="Evento 1"
        value={reportsData.event1Count}
        subtitle={reportsData.eventTypes[0] || "ConversacionCRM1"}
        icon={TrendingUp}
        iconColor="text-green-500"
        isLoading={isLoading}
      />

      {/* Evento 2 */}
      <StatsCard
        title="Evento 2"
        value={reportsData.event2Count}
        subtitle={reportsData.eventTypes[1] || "CargoCRM1"}
        icon={Zap}
        iconColor="text-orange-500"
        isLoading={isLoading}
      />
    </div>
  )
}
