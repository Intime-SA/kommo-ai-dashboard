"use client"

import React, { Fragment } from "react"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronUp, ChevronDown, MoreHorizontal, Eye, Copy, Loader2, AlertCircle, Database, ChartArea, ArrowUpRight, MessageCircle, RefreshCw, Bot, HelpCircle, Calendar, Tag, User, Target, Hash, BarChart3, MessageSquare, UserCheck, FileText, Zap, Clock, CheckCircle, XCircle, Brain, Settings, Timer, AlertTriangle } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Card, CardContent } from "@/components/ui/card"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { fetchLogs, setSorting, toggleSelection, selectAll, clearSelection, getIdFromIndex } from "@/lib/features/logs/logsSlice"
import { type LogEntry, type LogType } from "@/service/logs"
import { formatTimestamp } from "@/lib/utils"

interface LogsTableProps {
  className?: string
}


// Función helper para obtener el color/tipo de badge según el tipo de log
export function getLogTypeInfo(logType: LogType): {
  label: string
  color: "blue" | "green" | "orange" | "red" | "gray"
  icon: React.ReactNode
} {
  switch (logType) {
    case "received_messages":
      return { label: "Mensaje", color: "blue", icon: <MessageCircle className="h-3 w-3 text-blue-500" /> }
    case "change_status":
      return { label: "Cambio Status", color: "green", icon: <RefreshCw className="h-3 w-3 text-green-500" /> }
    case "bot_actions":
      return { label: "Acción Bot", color: "orange", icon: <Bot className="h-3 w-3 text-orange-500" /> }
    default:
      return { label: "Desconocido", color: "gray", icon: <HelpCircle className="h-3 w-3 text-gray-500" /> }
  }
}

export function LogsTable({ className }: LogsTableProps) {
  const dispatch = useAppDispatch()
  const { logs, total, isLoading, error, selectedIds, idMap, filters, pagination, sorting } = useAppSelector(
    (state) => state.logs,
  )

  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())

  // Helper function to render key-value pairs with icons
  const renderKeyValue = (
    label: string,
    value: React.ReactNode,
    icon: React.ReactNode,
    isCode: boolean = false,
    alignTop: boolean = false
  ) => (
    <div className={`flex gap-3 py-1 ${alignTop ? 'items-start' : 'items-center'}`}>
      <div className={`flex gap-2 min-w-0 flex-shrink-0 ${alignTop ? 'items-start pt-0.5' : 'items-center'}`} style={{ minWidth: '120px' }}>
        {icon}
        <strong className="text-xs font-medium whitespace-nowrap">{label}:</strong>
      </div>
      <div className="min-w-0 flex-1">
        {isCode ? (
          <code className="text-xs bg-muted/60 px-2 py-1 rounded-md break-words overflow-hidden text-ellipsis whitespace-normal max-w-full font-mono">
            {value}
          </code>
        ) : (
          <span className="text-xs break-words overflow-hidden text-ellipsis whitespace-normal max-w-full leading-relaxed">
            {value}
          </span>
        )}
      </div>
    </div>
  )

  console.log(expandedRows, "expandedRows")

  // Load initial data
  useEffect(() => {
    dispatch(
      fetchLogs({
        ...filters,
        limit: pagination.limit,
        offset: pagination.offset,
        sortBy: sorting.sortBy,
        sortOrder: sorting.sortOrder,
      }),
    )
  }, [dispatch, filters, pagination.limit, pagination.offset, sorting.sortBy, sorting.sortOrder])

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

  const getLogTypeDisplay = (logType: LogType) => {
    const info = getLogTypeInfo(logType)
    return (
      <Badge
        className={`text-xs font-medium bg-transparent hover:bg-gray-50/30 ${
          info.color === "blue"
            ? "text-blue-700"
            : info.color === "green"
              ? "text-green-700"
              : info.color === "orange"
                ? "text-orange-700"
                : "text-gray-700"
        }`}
      >
        <span className="mr-1">{info.icon}</span>
        {info.label}
      </Badge>
    )
  }


  const renderLogDetails = (log: LogEntry) => {
    switch (log.type) {
      case "received_messages":
        return (
          <div className="space-y-1">
            {renderKeyValue("Mensaje", log.messageText, <MessageSquare className="h-3 w-3 text-white" />)}
            {renderKeyValue("Tipo", log.messageType, <Tag className="h-3 w-3 text-white" />)}
            {renderKeyValue("Autor", log.authorName, <User className="h-3 w-3 text-white" />)}
            {renderKeyValue("Chat ID", log.chatId, <MessageCircle className="h-3 w-3 text-white" />, true)}
            {renderKeyValue("Message ID", log.messageId, <Hash className="h-3 w-3 text-white" />, true)}
          </div>
        )
      case "change_status":
        return (
          <div className="space-y-1">
            {renderKeyValue("Status anterior", log.oldStatus || "N/A", <ArrowUpRight className="h-3 w-3 text-white" />)}
            {renderKeyValue("Nuevo status", log.newStatus, <RefreshCw className="h-3 w-3 text-white" />)}
            {renderKeyValue("Cambiado por", log.changedBy, <UserCheck className="h-3 w-3 text-white" />)}
            {renderKeyValue("Razón", log.reason || "N/A", <FileText className="h-3 w-3 text-white" />)}
            {renderKeyValue("Confianza", log.confidence ? `${log.confidence}%` : "N/A", <BarChart3 className="h-3 w-3 text-white" />)}
            {renderKeyValue("Éxito", log.success ? <CheckCircle className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-red-500" />, <Zap className="h-3 w-3 text-white" />)}
          </div>
        )
      case "bot_actions":
        return (
          <div className="space-y-1">
            {renderKeyValue("Mensaje", log.messageText, <MessageSquare className="h-3 w-3 text-white" />)}
            <div className="space-y-1 border border-cyan-300/10 rounded-md">
              <div className="flex items-center gap-2 py-1 bg-cyan-300/10 text-white rounded-t-md">
                <Brain className="h-3 w-3 text-white ml-2" />
                <strong className="text-xs font-medium text-white">Decisión IA:</strong>
              </div>
              <div className="ml-4 space-y-1 max-w-full  rounded-md p-2 flex flex-col gap-1 ">
                {renderKeyValue("Status actual", log.aiDecision.currentStatus, <Settings className="h-3 w-3 text-white" />)}
                {renderKeyValue("Nuevo status", log.aiDecision.newStatus, <RefreshCw className="h-3 w-3 text-white" />)}
                {renderKeyValue("Debe cambiar", log.aiDecision.shouldChange ? <CheckCircle className="h-3 w-3 text-green-500  " /> : <XCircle className="h-3 w-3 text-red-500" />, <ArrowUpRight className="h-3 w-3 text-white" />)}
                {renderKeyValue("Razonamiento", log.aiDecision.reasoning, <FileText className="h-3 w-3 text-white" />, false, true)}
                {renderKeyValue("Confianza", `${log.aiDecision.confidence}%`, <BarChart3 className="h-3 w-3 text-white" />)}
              </div>
            </div>
            {renderKeyValue("Resultado", log.statusUpdateResult.success ? <CheckCircle className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-red-500" />, <Zap className="h-3 w-3 text-white" />)}
            {log.statusUpdateResult.error && renderKeyValue("Error", log.statusUpdateResult.error, <AlertTriangle className="h-3 w-3 text-white" />)}
          </div>
        )
      default:
        return null
    }
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
      className="h-8 px-2 text-xs font-medium hover:bg-muted/50"
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

  if (error) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-400 mb-2">Error al cargar logs</h3>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button
            onClick={() =>
              dispatch(
                fetchLogs({
                  ...filters,
                  limit: pagination.limit,
                  offset: pagination.offset,
                  sortBy: sorting.sortBy,
                  sortOrder: sorting.sortOrder,
                }),
              )
            }
            variant="outline"
            size="sm"
          >
            Reintentar
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={className}>
      <Card className="border-border/80 bg-card/50 backdrop-blur-sm shadow-sm">
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
              <Button variant="outline" size="sm" onClick={() => dispatch(clearSelection())} className="text-xs">
                Limpiar selección
              </Button>
            )}
          </div>

          {/* Table */}
          <div className="relative overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/80 hover:bg-muted/30">
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
                  {isLoading && logs.length === 0 ? (
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
                              className="h-6 w-6 p-0"
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
                                    className="h-6 px-2 text-xs font-mono hover:bg-muted/50"
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
                                      className="h-6 px-2 text-xs font-mono hover:bg-muted/50"
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
                                      className="h-6 w-6 p-0"
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
                                      onClick={() => window.open(`https://${process.env.NEXT_PUBLIC_KOMMO_SUBDOMAIN}.kommo.com/chats/${log.talkId}/leads/detail/${log.leadId}`, "_blank")}
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
                                    className="h-6 w-6 p-0"
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
          {isLoading && logs.length > 0 && (
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
