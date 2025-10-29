'use client'

import { useEffect, useState } from 'react'
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  iconColor: string
  isLoading?: boolean
  disabled?: boolean
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor,
  isLoading = false,
  disabled = false,
}: StatsCardProps) {
  return (
    <Card className={`bg-card/50 border-border/40 p-6 transition-colors border border-border/40 ${
      disabled
        ? 'opacity-50 cursor-not-allowed'
        : 'hover:bg-card/70'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {isLoading ? (
            <>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16 mb-1" />
              {subtitle && <Skeleton className="h-3 w-32" />}
            </>
          ) : disabled ? (
            <>
              <p className="text-sm text-muted-foreground mb-2">{title}</p>
              <p className="text-lg font-semibold text-muted-foreground mb-1">Próximamente</p>
              <p className="text-xs text-muted-foreground">Función en desarrollo</p>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-2">{title}</p>
              <p className="text-3xl font-bold mb-1">{value}</p>
              {subtitle && (
                <p className="text-xs text-muted-foreground">{subtitle}</p>
              )}
            </>
          )}
        </div>
        <div className={`p-2 rounded-lg ${iconColor.replace('text-', 'bg-').replace('-500', '-500/10')} border border-current/20 ${
          disabled ? 'opacity-50' : ''
        }`}>
          <Icon className={`w-5 h-5 ${iconColor} ${disabled ? 'opacity-50' : ''}`} />
        </div>
      </div>
    </Card>
  )
}
