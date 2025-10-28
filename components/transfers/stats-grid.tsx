'use client'

import { Activity, Clock, Check, X, UserPlus, Receipt, TrendingUp, DollarSign, Users } from "lucide-react"
import { StatsCard } from "./stats-card"
import { StatsInfo } from "@/service/transfers"

interface StatsGridProps {
  stats: StatsInfo
  totalUsers: number
  isLoading?: boolean
  activeTab?: 'transfers' | 'users'
  totalRegisters?: number
}

export function StatsGrid({ stats, totalUsers, isLoading = false, activeTab = 'transfers', totalRegisters }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Total Registros */}
{/*       <StatsCard
        title="Total Registros"
        value={totalRegisters || totalUsers}
        subtitle="Registros de usuario"
        icon={Activity}
        iconColor="text-gray-500"
        isLoading={isLoading}
      /> */}

      {/* Usuarios Creados */}
{/*       <StatsCard
        title="Usuarios Creados"
        value={totalUsers}
        subtitle="Registros de usuario"
        icon={UserPlus}
        iconColor="text-blue-500"
        isLoading={isLoading}
      /> */}

      {/* Transferencias Totales */}
      <StatsCard
        title="Transferencias"
        value={stats.totalTransfers}
        subtitle={`$${stats.totalAmount.toLocaleString("es-AR")}`}
        icon={Receipt}
        iconColor="text-purple-500"
        isLoading={isLoading}
      />

            {/* Monto Promedio */}
            <StatsCard
        title="Monto Promedio"
        value={`$${stats.averageAmount.toLocaleString("es-AR")}`}
        subtitle="Por transferencia"
        icon={TrendingUp}
        iconColor="text-cyan-500"
        isLoading={isLoading}
      />

      {/* Pendientes de Validación */}
{/*       <StatsCard
        title="Pendientes Validación"
        value={stats.pending}
        subtitle={`$${stats.pendingAmount.toLocaleString("es-AR")}`}
        icon={Clock}
        iconColor="text-yellow-500"
        isLoading={isLoading}
        disabled={true}
      /> */}

      {/* Procesadas */}
      <StatsCard
        title="Procesadas"
        value={stats.processed}
        subtitle={`$${stats.processedAmount.toLocaleString("es-AR")}`}
        icon={Check}
        iconColor="text-green-500"
        isLoading={isLoading}
      />

      {/* Errores */}
      <StatsCard
        title="Errores"
        value={stats.error}
        subtitle={`$${stats.errorAmount.toLocaleString("es-AR")}`}
        icon={X}
        iconColor="text-red-500"
        isLoading={isLoading}
      />



      {/* Tasa de Aprobación */}
    {/*   <StatsCard
        title="Tasa de Aprobación"
        value={`${stats.approvalRate}%`}
        subtitle={`${stats.processed} de ${stats.totalTransfers}`}
        icon={DollarSign}
        iconColor="text-orange-500"
        isLoading={isLoading}
      /> */}
    </div>
  )
}
