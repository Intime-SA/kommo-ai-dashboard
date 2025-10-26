"use client";
import { motion } from "framer-motion";
import { Activity, TrendingUp, Clock, Users } from "lucide-react";
import { SearchFilters } from "@/components/search-filters";
import { LogsTable } from "@/components/logs-table";
import { LogsPagination } from "@/components/logs-pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RouteGuard } from "@/context/auth-guard";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";

export default function Dashboard() {
  // Usar el hook personalizado que combina React Query y Redux
  const dashboardStats = useDashboardStats();

  return (
    <RouteGuard> 
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 border border-border/30 mt-10">
      {/* Main content */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <Card className="border-2 border-border/80 bg-card/50 backdrop-blur-sm shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardStats.total.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {dashboardStats.selected > 0 &&
                  `${dashboardStats.selected} seleccionados`}
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-border/80 bg-card/50 backdrop-blur-sm shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mensajes</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {dashboardStats.messageCount}
              </div>
              <p className="text-xs text-muted-foreground">
                Mensajes recibidos
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-border/80 bg-card/50 backdrop-blur-sm shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Cambios Status
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {dashboardStats.statusChanges}
              </div>
              <p className="text-xs text-muted-foreground">
                Actualizaciones de estado
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-border/80 bg-card/50 backdrop-blur-sm shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Acciones Bot
              </CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {dashboardStats.botActions}
              </div>
              <p className="text-xs text-muted-foreground">Procesadas por IA</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <SearchFilters />
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="space-y-4"
        >
          <LogsTable />
          <LogsPagination />
        </motion.div>
      </main>
    </div>
    </RouteGuard>
  );
}
