"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Filter, X, Calendar, ChevronDown, MessageCircle, RefreshCw, Bot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import {
  setLogTypeFilter,
  setContactIdFilter,
  setLeadIdFilter,
  setUserNameFilter,
  setClientIdFilter,
  setDateRangeFilter,
  clearFilters,
  setSearchTermFilter,
  fetchLogs,
} from "@/lib/features/logs/logsSlice"
import { useServices } from "@/context/services-context"
import type { LogType } from "@/service/logs"

export function SearchFilters() {
  const dispatch = useAppDispatch()
  const { filters, pagination, sorting } = useAppSelector((state) => state.logs)
  const { logsService } = useServices()
  const [isExpanded, setIsExpanded] = useState(false)
  const [localFilters, setLocalFilters] = useState({
    userName: filters.userName || "",
    contactId: filters.contactId || "",
    leadId: filters.leadId || "",
    clientId: filters.clientId || "",
    startDate: filters.startDate || "",
    endDate: filters.endDate || "",
    searchTerm: filters.searchTerm || "",
  })

  const handleApplyFilters = () => {
    // Apply all local filters to Redux
    dispatch(setUserNameFilter(localFilters.userName))
    dispatch(setContactIdFilter(localFilters.contactId))
    dispatch(setLeadIdFilter(localFilters.leadId))
    dispatch(setClientIdFilter(localFilters.clientId))
    dispatch(setSearchTermFilter(localFilters.searchTerm))
    dispatch(
      setDateRangeFilter({
        startDate: localFilters.startDate || undefined,
        endDate: localFilters.endDate || undefined,
      }),
    )

    // Fetch logs with new filters
    dispatch(
      fetchLogs({
        params: {
          ...filters,
          userName: localFilters.userName || undefined,
          contactId: localFilters.contactId || undefined,
          leadId: localFilters.leadId || undefined,
          clientId: localFilters.clientId || undefined,
          startDate: localFilters.startDate || undefined,
          endDate: localFilters.endDate || undefined,
          limit: pagination.limit,
          offset: 0,
          sortBy: sorting.sortBy,
          sortOrder: sorting.sortOrder,
          searchTerm: localFilters.searchTerm || undefined,
        },
        logsService,
      }),
    )
  }

  const handleClearFilters = () => {
    setLocalFilters({
      userName: "",
      contactId: "",
      leadId: "",
      clientId: "",
      startDate: "",
      endDate: "",
      searchTerm: "",
    })
    dispatch(clearFilters())
    dispatch(
      fetchLogs({
        params: {
          limit: pagination.limit,
          offset: 0,
          sortBy: sorting.sortBy,
          sortOrder: sorting.sortOrder,
        },
        logsService,
      }),
    )
  }

  const handleLogTypeChange = (value: string) => {
    const logType = value === "all" ? undefined : (value as LogType)
    dispatch(setLogTypeFilter(logType))
    dispatch(
      fetchLogs({
        params: {
          ...filters,
          logType,
          limit: pagination.limit,
          offset: 0,
          sortBy: sorting.sortBy,
          sortOrder: sorting.sortOrder,
        },
        logsService,
      }),
    )
  }

  const activeFiltersCount = Object.values(filters).filter(Boolean).length

  return (
    <Card className="border-2 border-border/80 bg-card/50 backdrop-blur-sm shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-medium text-sm">Filtros de búsqueda</h3>
            </div>
            <div className="flex items-center gap-2">
              {!filters.startDate && !filters.endDate && (
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                  últimas 24hs
                </Badge>
              )}
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {activeFiltersCount} activo{activeFiltersCount !== 1 ? "s" : ""}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="text-xs cursor-pointer">
              <Filter className="h-3 w-3 mr-1" />
              {isExpanded ? "Ocultar" : "Mas filtros"}
              <ChevronDown className={`h-3 w-3 ml-1 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
            </Button>
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-3 w-3 mr-1" />
                Limpiar
              </Button>
            )}
          </div>
        </div>

        {/* Quick filters row - always visible */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar por nombre, contacto, lead, etc..."
              value={localFilters.searchTerm}
              onChange={(e) => setLocalFilters((prev) => ({ ...prev, searchTerm: e.target.value }))}
              className="h-8 text-sm"
            />
          </div>
          <div className="w-48">
            <Select value={filters.logType || "all"} onValueChange={handleLogTypeChange}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Tipo de log" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="received_messages">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Mensajes
                  </div>
                </SelectItem>
                <SelectItem value="change_status">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Cambios Status
                  </div>
                </SelectItem>
                <SelectItem value="bot_actions">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4" />
                    Acciones Bot
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleApplyFilters} size="sm" className="h-8 px-3 text-xs cursor-pointer">
            Buscar
          </Button>
        </div>

        {/* Expanded filters */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="border-t border-border/80 pt-4 space-y-4">
                {/* Search fields */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactId" className="text-xs font-medium">
                      Contact ID
                    </Label>
                    <Input
                      id="contactId"
                      placeholder="Buscar por contact ID..."
                      value={localFilters.contactId}
                      onChange={(e) => setLocalFilters((prev) => ({ ...prev, contactId: e.target.value }))}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="leadId" className="text-xs font-medium">
                      Lead ID
                    </Label>
                    <Input
                      id="leadId"
                      placeholder="Buscar por lead ID..."
                      value={localFilters.leadId}
                      onChange={(e) => setLocalFilters((prev) => ({ ...prev, leadId: e.target.value }))}
                      className="h-8 text-sm"
                    />
                  </div>
{/*                   <div className="space-y-2">
                    <Label htmlFor="clientId" className="text-xs font-medium">
                      Client ID
                    </Label>
                    <Input
                      id="clientId"
                      placeholder="Buscar por client ID..."
                      value={localFilters.clientId}
                      onChange={(e) => setLocalFilters((prev) => ({ ...prev, clientId: e.target.value }))}
                      className="h-8 text-sm"
                    />
                  </div> */}
                   <div className="space-y-2">
                    <Label htmlFor="startDate" className="text-xs font-medium flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Fecha inicio
                    </Label>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      value={localFilters.startDate}
                      onChange={(e) => setLocalFilters((prev) => ({ ...prev, startDate: e.target.value }))}
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate" className="text-xs font-medium flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Fecha fin
                    </Label>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      value={localFilters.endDate}
                      onChange={(e) => setLocalFilters((prev) => ({ ...prev, endDate: e.target.value }))}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearFilters}
                    className="h-8 px-3 text-xs bg-transparent cursor-pointer"
                  >
                    Limpiar todo
                  </Button>
                  <Button onClick={handleApplyFilters} size="sm" className="h-8 px-3 text-xs cursor-pointer">
                    Aplicar filtros
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
