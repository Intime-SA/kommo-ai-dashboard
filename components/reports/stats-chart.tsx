"use client"

import { Card } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { format } from "date-fns"
import { BarChart3, MessageSquare, CreditCard } from "lucide-react"
import type { ReportsStatsResponse, StatsDataPoint } from "@/service/reports"

interface StatsChartProps {
  data: ReportsStatsResponse | null
  isLoading: boolean
}

const CHART_COLORS = {
  all: "#3b82f6", // Blue
  event1: "#10b981", // Emerald green
  event2: "#8b5cf6", // Purple
}

const EVENT_CONFIG = {
  all: {
    icon: BarChart3,
    name: "ALL"
  },
  event1: {
    icon: MessageSquare,
    name: "CHAT"
  },
  event2: {
    icon: CreditCard,
    name: "PAY"
  }
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium mb-2">{format(new Date(label), "dd/MM/yyyy")}</p>
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => {
            const eventKey = entry.dataKey as keyof typeof EVENT_CONFIG
            const config = EVENT_CONFIG[eventKey]
            const IconComponent = config?.icon
            return (
              <div key={index} className="flex items-center gap-2 text-sm">
                {IconComponent && <IconComponent className="w-4 h-4" style={{ color: entry.color }} />}
                <span className="text-muted-foreground">{config?.name}:</span>
                <span className="font-semibold">{entry.value}</span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
  return null
}

const CustomLegend = ({ payload }: any) => {
  return (
    <div className="flex flex-wrap gap-4 justify-center mt-4">
      {payload?.map((entry: any, index: number) => {
        const eventKey = entry.dataKey as keyof typeof EVENT_CONFIG
        const config = EVENT_CONFIG[eventKey]
        const IconComponent = config?.icon
        return (
          <div key={index} className="flex items-center gap-2 px-3 py-1 rounded-md bg-muted/50">
            {IconComponent && <IconComponent className="w-4 h-4" style={{ color: entry.color }} />}
            <span className="text-sm font-medium">{config?.name}</span>
          </div>
        )
      })}
    </div>
  )
}

export function StatsChart({ data, isLoading }: StatsChartProps) {
  if (isLoading) {
    return (
      <Card className="bg-card/50 border-border/40 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-[400px] bg-muted rounded"></div>
        </div>
      </Card>
    )
  }

  if (!data?.data) {
    return (
      <Card className="bg-card/50 border-border/40 p-6">
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">No hay datos disponibles para mostrar</p>
        </div>
      </Card>
    )
  }

  // Combinar todos los datos en un solo array para el gráfico
  const chartData = data.data.all.map((point: StatsDataPoint, index: number) => ({
    date: point.x,
    all: point.y,
    event1: data.data.event1[index]?.y || 0,
    event2: data.data.event2[index]?.y || 0,
  }))

  return (
    <Card className="bg-card/50 border-border/40 p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold">Estadísticas de Eventos</h3>
        <p className="text-sm text-muted-foreground mt-1">Evolución temporal de los eventos</p>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid
            strokeDasharray="2 2"
            stroke="hsl(var(--border))"
            opacity={0.4}
            horizontal={true}
            vertical={true}
          />

          <XAxis
            dataKey="date"
            tickFormatter={(value) => format(new Date(value), "dd/MM")}
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: "hsl(var(--border))", strokeWidth: 1, opacity: 0.6 }}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: "hsl(var(--border))", strokeWidth: 1, opacity: 0.6 }}
          />

          <Tooltip content={<CustomTooltip />} />

          <Legend content={<CustomLegend />} />

          <Line
            type="monotone"
            dataKey="all"
            stroke={CHART_COLORS.all}
            strokeWidth={3}
            name={EVENT_CONFIG.all.name}
            dot={false}
            activeDot={{ r: 6, strokeWidth: 2, stroke: CHART_COLORS.all }}
          />
          <Line
            type="monotone"
            dataKey="event1"
            stroke={CHART_COLORS.event1}
            strokeWidth={3}
            name={EVENT_CONFIG.event1.name}
            dot={false}
            activeDot={{ r: 6, strokeWidth: 2, stroke: CHART_COLORS.event1 }}
          />
          <Line
            type="monotone"
            dataKey="event2"
            stroke={CHART_COLORS.event2}
            strokeWidth={3}
            name={EVENT_CONFIG.event2.name}
            dot={false}
            activeDot={{ r: 6, strokeWidth: 2, stroke: CHART_COLORS.event2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  )
}
