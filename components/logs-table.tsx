"use client"

import React, { Fragment } from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronUp, ChevronDown, AlertCircle, Database, ArrowUpRight, Calendar, Tag, User, Target, Hash, BarChart3, MessageSquare, Facebook, Loader2, Eye } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { setSorting, toggleSelection, selectAll, clearSelection, getIdFromIndex } from "@/lib/features/logs/logsSlice"
import { formatTimestamp } from "@/lib/utils"
import { useAuth } from "@/context/auth-context"
import { useLogs } from "@/hooks/use-logs"
import { getLogTypeDisplay, renderKeyValue, renderLogDetails } from "@/lib/utils-rendex"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip"

interface LogsTableProps {
  className?: string
}

export function LogsTable({ className }: LogsTableProps) {

  // Obtener el dispatch para poder usar los reducers de Redux
  const dispatch = useAppDispatch()
  const { selectedIds, idMap, filters, pagination, sorting } = useAppSelector(
    (state) => state.logs,
  )
  // Estado para expandir las filas
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())
  
  // Obtener la configuración de la API
  const { config } = useAuth()
  
  // Usar React Query para obtener los logs
  const {
    logs,
    total,
    isLoading: logsLoading,
    isError: logsError,
    error: logsErrorMessage,
    refetch: refetchLogs,
  } = useLogs({ filters, pagination, sorting })


  const handleSort = (column: "timestamp" | "userName" | "contactId" | "type" | "leadId") => {
    const newOrder = sorting.sortBy === column && sorting.sortOrder === "desc" ? "asc" : "desc"
    dispatch(setSorting({ sortBy: column, sortOrder: newOrder }))
  }

  const handleSelectAll = () => {
    if (selectedIds.length === logs.length) {
      dispatch(clearSelection())
    } else {
      dispatch(selectAll())
    }
  }

  const handleRowSelect = (index: number) => {
    dispatch(toggleSelection(index))
  }

  const toggleRowExpansion = (index: number) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedRows(newExpanded)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }


  const SortButton = ({
    column,
    children,
    icon,
  }: {
    column: "timestamp" | "userName" | "contactId" | "type" | "leadId"
    children: React.ReactNode
    icon?: React.ReactNode
  }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleSort(column)}
      className="h-8 px-2 text-xs font-medium hover:bg-muted/50 cursor-pointer"
    >
      {icon && <span className="mr-1">{icon}</span>}
      {children}
      {sorting.sortBy === column &&
        (sorting.sortOrder === "desc" ? (
          <ChevronDown className="ml-1 h-3 w-3" />
        ) : (
          <ChevronUp className="ml-1 h-3 w-3" />
        ))}
    </Button>
  )

  if (logsError) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-400 mb-2">Error al cargar logs</h3>
          <p className="text-sm text-muted-foreground mb-4">{logsErrorMessage?.message || 'Error desconocido'}</p>
          <Button
            onClick={() => refetchLogs()}
            variant="outline"
            size="sm"
            className="cursor-pointer"
          >
            Reintentar
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={className}>
      <Card className="border-2 border-border/80 bg-card/50 backdrop-blur-sm shadow-lg">
        <CardContent className="p-0">
          {/* Table header with selection info */}
          <div className="flex items-center justify-between p-4 border-b border-border/80">
            <div className="flex items-center gap-3">
              <Database className="h-4 w-4 text-muted-foreground" />
              <div>
                <h3 className="font-medium text-sm">Logs del sistema</h3>
                <p className="text-xs text-muted-foreground">
                  {total} registros total{total !== 1 ? "es" : ""}
                  {selectedIds.length > 0 &&
                    ` • ${selectedIds.length} seleccionado${selectedIds.length !== 1 ? "s" : ""}`}
                </p>
              </div>
            </div>
            {selectedIds.length > 0 && (
              <Button variant="outline" size="sm" onClick={() => dispatch(clearSelection())} className="text-xs cursor-pointer">
                Limpiar selección
              </Button>
            )}
          </div>

          {/* Table */}
          <div className="relative overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-2 border-border/80 hover:bg-muted/30">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={logs.length > 0 && selectedIds.length === logs.length}
                      onCheckedChange={handleSelectAll}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                  </TableHead>
                  <TableHead className="w-12"></TableHead>
                  <TableHead className="min-w-[250px]">
                    <SortButton column="timestamp" icon={<Calendar className="h-3 w-3" />}>Fecha</SortButton>
                  </TableHead>
                  <TableHead className="min-w-[200px]">
                    <SortButton column="type" icon={<Tag className="h-3 w-3" />}>Tipo</SortButton>
                  </TableHead>
                  <TableHead className="min-w-[200px]">
                    <SortButton column="contactId" icon={<User className="h-3 w-3" />}>Contact</SortButton>
                  </TableHead>
                  <TableHead className="min-w-[200px]">
                    <SortButton column="leadId" icon={<Target className="h-3 w-3" />}>Lead</SortButton>
                  </TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence  >
                  {logsLoading && logs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="h-32 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm text-muted-foreground">Cargando logs...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : logs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="h-32 text-center">
                        <div className="text-sm text-muted-foreground">
                          No se encontraron logs con los filtros aplicados
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    logs.map((log, index) => (
                      <Fragment key={log.index}>
                        <motion.tr
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.2, delay: index * 0.02 }}
                          className={`border-border/80 transition-colors ${
                            index % 2 === 0
                              ? 'hover:bg-slate-800/40'
                              : 'bg-slate-900/30 hover:bg-slate-800/60'
                          }`}
                        >
                          <TableCell>
                            <Checkbox
                              checked={selectedIds.includes(log.index)}
                              onCheckedChange={() => handleRowSelect(log.index)}
                              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleRowExpansion(log.index)}
                              className="h-6 w-6 p-0 cursor-pointer"
                            >
                              {expandedRows.has(log.index) ? (
                                <ChevronUp className="h-3 w-3" />
                              ) : (
                                <ChevronDown className="h-3 w-3" />
                              )}
                            </Button>
                          </TableCell>
                          <TableCell className="font-mono text-xs">{formatTimestamp(log.timestamp)}</TableCell>
                          <TableCell>{getLogTypeDisplay(log.type)}</TableCell>
                          <TableCell className="font-mono text-xs">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyToClipboard(log.contactId)}
                                    className="h-6 px-2 text-xs font-mono hover:bg-muted/50 cursor-pointer"
                                  >
                                    {log.contactId}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Click para copiar: {log.contactId}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {log.leadId ? (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => copyToClipboard(log.leadId!)}
                                      className="h-6 px-2 text-xs font-mono hover:bg-muted/50 cursor-pointer"
                                    >
                                        {log.leadId}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Click para copiar: {log.leadId}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
{/*                           <TableCell className="text-sm">{log.clientId}</TableCell>
                          <TableCell className="text-sm">{log.sourceName}</TableCell> */}
                          <TableCell>
                            <TooltipProvider>
                              <div className="flex items-center gap-1">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => toggleRowExpansion(log.index)}
                                      className="h-6 w-6 p-0 cursor-pointer"
                                    >
                                      <Eye className="h-3 w-3" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Ver detalles</p>
                                  </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => window.open(`https://${config.kommoSubdomain}.kommo.com/chats/${log.talkId}/leads/detail/${log.leadId}`, "_blank")}
                                      className="h-6 w-6 p-0"
                                    >
                                      <ArrowUpRight className="h-3 w-3" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Ver conversación</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </TooltipProvider>
                          </TableCell>
                        </motion.tr>
                        {expandedRows.has(log.index) && (
                          <motion.tr
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="border-border/80"
                          >
                            <TableCell colSpan={10} className="p-0 bg-muted/20">
                              <div className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="font-medium text-sm">Detalles del log</h4>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleRowExpansion(log.index)}
                                    className="h-6 w-6 p-0 cursor-pointer"
                                  >
                                    <ChevronUp className="h-3 w-3" />
                                  </Button>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                  <div>
                                    <h5 className="font-medium text-xs text-muted-foreground mb-3 uppercase tracking-wide">INFORMACIÓN BÁSICA</h5>
                                    <div className="space-y-1">
                                      {renderKeyValue("ID", getIdFromIndex(idMap, log.index) || log.id, <Hash className="h-3 w-3 text-white" />, true)}
                                      {renderKeyValue("Index", log.index, <BarChart3 className="h-3 w-3 text-white" />, true)}
                                      {renderKeyValue("Timestamp", formatTimestamp(log.timestamp), <Calendar className="h-3 w-3 text-white" />)}
                                      {renderKeyValue("Talk ID", log.talkId || "N/A", <MessageSquare className="h-3 w-3 text-white" />, true)}
                                    </div>
                                  </div>
                                  <div>
                                    <h5 className="font-medium text-xs text-muted-foreground mb-3 uppercase tracking-wide">DETALLES ESPECÍFICOS</h5>
                                    <div className="space-y-1">
                                      {renderLogDetails(log)}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                          </motion.tr>
                        )}
                      </Fragment>
                    ))
                  )}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>


          {/* Loading overlay for pagination */}
          {logsLoading && logs.length > 0 && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center">
              <div className="flex items-center gap-2 bg-card border-2 border-border/80 rounded-lg px-4 py-2 shadow-lg">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Actualizando...</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
