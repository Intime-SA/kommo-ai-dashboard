"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, Search, Clock } from "lucide-react"
import { ReportsStatsGrid } from "@/components/reports/stats-grid"
import { StatsChart } from "@/components/reports/stats-chart"
import { useReports } from "@/hooks/use-reports"
import { useReportsStats } from "@/hooks/use-stats"
import { RouteGuard } from "@/context/auth-guard"

export default function ReportsPage() {
  const [filters, setFilters] = useState({
    campaignId: "",
    eventName: "all",
    startDate: "",
    endDate: "",
  })

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [localCampaignId, setLocalCampaignId] = useState<string>("")

  // Limpiar timeout al desmontar el componente
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [])

  // Sincronizar estado local cuando cambie el campaignId de filtros
  useEffect(() => {
    setLocalCampaignId(filters.campaignId)
  }, [filters.campaignId])

  // Función debounced para actualizar el campaignId
  const debouncedSetCampaignId = useCallback((value: string) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    debounceTimeoutRef.current = setTimeout(() => {
      setFilters((prev) => ({
        ...prev,
        campaignId: value,
      }))
    }, 500) // 500ms de delay
  }, [])

  // Hook para obtener reportes
  const reportsQuery = useReports({
    campaignId: filters.campaignId || undefined,
    eventName: filters.eventName === "all" ? undefined : filters.eventName || undefined,
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined,
  })

  const statsQuery = useReportsStats({
    campaignId: filters.campaignId || undefined,
    eventName: filters.eventName === "all" ? undefined : filters.eventName || undefined,
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined,
  })

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  // Función para manejar el cambio del input de campaignId
  const handleCampaignIdChange = (value: string) => {
    setLocalCampaignId(value)
    debouncedSetCampaignId(value)
  }

  const clearFilters = () => {
    setLocalCampaignId("")
    setFilters({
      campaignId: "",
      eventName: "all",
      startDate: "",
      endDate: "",
    })
  }

  // Datos por defecto si no hay respuesta
  const defaultReportsData = {
    totalEvents: 0,
    eventTypes: [],
    event1Count: 0,
    event2Count: 0,
  }

  const reportsData = reportsQuery.data?.data || defaultReportsData

  return (
    <RouteGuard>
      <main className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="w-6 h-6 text-muted-foreground" />
          <div>
            <h1 className="text-2xl font-bold">Reportes</h1>
            <p className="text-sm text-muted-foreground">Estadísticas y análisis de eventos</p>
          </div>
        </div>

        {/* Stats Cards */}
        <ReportsStatsGrid reportsData={reportsData} isLoading={reportsQuery.isLoading} />

        {/* Filters */}
        <Card className="bg-card/50 border-border/40 p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Search className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-sm font-medium">Filtros de búsqueda</h2>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="text-xs text-muted-foreground">
                {filters.campaignId ||
                (filters.eventName && filters.eventName !== "all") ||
                filters.startDate ||
                filters.endDate
                  ? "Filtros aplicados"
                  : "últimas 24hs"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">ID de Campaña</label>
              <Input
                placeholder="Ej: testRama"
                value={localCampaignId}
                onChange={(e) => handleCampaignIdChange(e.target.value)}
                className="bg-background/50 border-border/40"
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Nombre del Evento</label>
              <Select value={filters.eventName} onValueChange={(value) => handleFilterChange("eventName", value)}>
                <SelectTrigger className="bg-background/50 border-border/40">
                  <SelectValue placeholder="Todos los eventos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los eventos</SelectItem>
                  <SelectItem value="ConversacionCRM1">ConversacionCRM1</SelectItem>
                  <SelectItem value="CargoCRM1">CargoCRM1</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Fecha Inicio</label>
              <Input
                type="datetime-local"
                value={filters.startDate}
                onChange={(e) => handleFilterChange("startDate", e.target.value)}
                className="bg-background/50 border-border/40"
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Fecha Fin</label>
              <Input
                type="datetime-local"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
                className="bg-background/50 border-border/40"
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={clearFilters} className="border-border/40 bg-transparent">
              Limpiar Filtros
            </Button>
          </div>
        </Card>

        <StatsChart data={statsQuery.data || null} isLoading={statsQuery.isLoading} />
      </main>
    </RouteGuard>
  )
}
