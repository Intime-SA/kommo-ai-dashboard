"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useInView } from "react-intersection-observer"
import { useSelector, useDispatch } from "react-redux"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Home, Search, Eye, Check, X, UserPlus, Receipt, Activity, Users, Clock, DollarSign, TrendingUp, Download } from "lucide-react"
import { StatsGrid } from "@/components/transfers/stats-grid"
import { DateTimePicker } from "@/components/transfers/date-picker"
import { useTransferRequests, useApproveTransfer, useRejectTransfer, useRegisteredUsers, useTransferRequestsInfinite, useRegisteredUsersInfinite, shouldUseInfiniteQuery } from "@/hooks/use-transfers"
import { RootState } from "@/lib/store"
import type { FiltersState } from "@/lib/features/logs/filtersSlice"
import type { UsersState } from "@/lib/features/logs/usersSlice"
import type { DateState } from "@/lib/features/logs/dateSlice"
import {
  setActiveView,
  setSearchTerm,
  setStatusFilter,
  setPage,
} from "@/lib/features/logs/filtersSlice"
import {
  setUsers,
  setUsersLoading,
  setUsersError,
  setUsersPage,
} from "@/lib/features/logs/usersSlice"
import { TransferRequest } from "@/service/transfers"
import { formatDateArgentina, exportUsersToExcel, exportTransfersToExcel } from "@/lib/utils"
import { TransferDetailsDialog } from "@/components/transfers/details-transfer"
import { UsersTable } from "@/components/transfers/users-table"
import { TransfersTable } from "@/components/transfers/transfers-table"
import { RouteGuard } from "@/context/auth-guard"


export default function Dashboard() {
  const dispatch = useDispatch()
  const { activeView, searchTerm, statusFilter, page, limit } = useSelector(
    (state: RootState) => state.filters as FiltersState
  )
  const usersState = useSelector((state: RootState) => state.users as UsersState)
  const { users: registeredUsers, pagination: usersPagination, loading: usersLoading, error: usersError, filters: usersFilters } = usersState
  const { startDate, endDate, isEnabled: dateEnabled } = useSelector((state: RootState) => state.date as DateState)

  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [localSearchTerm, setLocalSearchTerm] = useState<string>(searchTerm)
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Parámetros para las queries
  const transferParams = {
    page: activeView === "transfers" ? page : 1,
    limit,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    search: searchTerm || undefined,
    startDate: dateEnabled && startDate ? startDate : undefined,
    endDate: dateEnabled && endDate ? endDate : undefined,
  }

  const usersParams = {
      page: usersPagination?.page || 1,
      limit: usersPagination?.limit || 10,
      status: usersFilters.status,
      channel: usersFilters.channel,
      startDate: dateEnabled && startDate ? startDate : undefined,
      endDate: dateEnabled && endDate ? endDate : undefined,
  }

  // Determinar si usar infinite query
  const useInfiniteForTransfers = shouldUseInfiniteQuery(transferParams)
  const useInfiniteForUsers = shouldUseInfiniteQuery(usersParams)

  // Sincronizar estado local cuando cambie el searchTerm de Redux
  useEffect(() => {
    setLocalSearchTerm(searchTerm)
  }, [searchTerm])

  // Limpiar timeout al desmontar el componente
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [])

  // API hooks - condicional para usar infinite query o normal
  const transferQuery = useTransferRequests(
    !useInfiniteForTransfers ? transferParams : undefined
  )

  // Infinite query para transferencias cuando no hay filtros
  const transferInfiniteQuery = useTransferRequestsInfinite(useInfiniteForTransfers ? transferParams : undefined)

  // Hook for registered users
  const usersQuery = useRegisteredUsers(
    activeView === "users" && !useInfiniteForUsers ? usersParams : undefined
  )

  // Infinite query para usuarios cuando no hay filtros
  const usersInfiniteQuery = useRegisteredUsersInfinite(activeView === "users" && useInfiniteForUsers ? usersParams : undefined)

  // Update users state when data changes
  useEffect(() => {
    if (usersQuery.data && activeView === "users") {
      dispatch(setUsers({
        users: usersQuery.data.users,
        pagination: usersQuery.data.pagination
      }))
    }
  }, [usersQuery.data, activeView, dispatch])

  // Update loading and error states
  useEffect(() => {
    if (activeView === "users") {
      dispatch(setUsersLoading(usersQuery.isLoading))
      if (usersQuery.error) {
        dispatch(setUsersError((usersQuery.error as Error).message))
      }
    }
  }, [usersQuery.isLoading, usersQuery.error, activeView, dispatch])

  // Función debounced para actualizar el search term en Redux
  const debouncedSetSearchTerm = useCallback((value: string) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    debounceTimeoutRef.current = setTimeout(() => {
      dispatch(setSearchTerm(value))
    }, 500) // 500ms de delay
  }, [dispatch])

  const approveMutation = useApproveTransfer()
  const rejectMutation = useRejectTransfer()

  // Preparar datos para renderizado
  const transfersData = useInfiniteForTransfers ? transferInfiniteQuery.data : transferQuery.data
  const usersDataFinal = useInfiniteForUsers ? usersInfiniteQuery.data : usersQuery.data

  // Estado de carga combinado
  const transfersLoading = useInfiniteForTransfers ? transferInfiniteQuery.isLoading : transferQuery.isLoading
  const usersLoadingFinal = useInfiniteForUsers ? usersInfiniteQuery.isLoading : usersQuery.isLoading

  // Flatten infinite query data (solo cuando se usa infinite query)
  const flattenedTransfers = useInfiniteForTransfers ? (transfersData as any)?.pages?.flatMap((page: any) => page.requests) || [] : []
  const flattenedUsers = useInfiniteForUsers ? (usersDataFinal as any)?.pages?.flatMap((page: any) => page.users) || [] : []

  // Helper functions para acceder a datos de infinite query vs regular query
  const getTransfersStats = () => {
    if (useInfiniteForTransfers) {
      const pages = (transfersData as any)?.pages
      return pages?.[pages.length - 1]?.stats
    }
    return (transfersData as any)?.stats
  }

  const getTransfersTotalUsers = () => {
    if (useInfiniteForTransfers) {
      const pages = (transfersData as any)?.pages
      return pages?.[pages.length - 1]?.totalUsers
    }
    return (transfersData as any)?.totalUsers
  }

  const getTransfersPagination = () => {
    if (useInfiniteForTransfers) {
      const pages = (transfersData as any)?.pages
      return pages?.[pages.length - 1]?.pagination
    }
    return (transfersData as any)?.pagination
  }

  // Intersection observer para infinite scroll
  const { ref: transfersLoadMoreRef, inView: transfersInView } = useInView({
    threshold: 0,
  })
  const { ref: usersLoadMoreRef, inView: usersInView } = useInView({
    threshold: 0,
  })

  // Cargar más datos cuando el usuario llegue al final
  useEffect(() => {
    if (transfersInView && transferInfiniteQuery.hasNextPage && !transferInfiniteQuery.isFetchingNextPage) {
      transferInfiniteQuery.fetchNextPage()
    }
  }, [transfersInView, transferInfiniteQuery.hasNextPage, transferInfiniteQuery.isFetchingNextPage, transferInfiniteQuery.fetchNextPage])

  useEffect(() => {
    if (usersInView && usersInfiniteQuery.hasNextPage && !usersInfiniteQuery.isFetchingNextPage) {
      usersInfiniteQuery.fetchNextPage()
    }
  }, [usersInView, usersInfiniteQuery.hasNextPage, usersInfiniteQuery.isFetchingNextPage, usersInfiniteQuery.fetchNextPage])

  // Separate users and transfers - usar datos de infinite query cuando corresponda
  // Nota: La nueva estructura no distingue entre usuarios y transferencias de la misma manera
  // Todas las transferencias tienen gptAnalysis, así que esta lógica puede simplificarse
  const transfers = useInfiniteForTransfers
    ? flattenedTransfers || []
    : (transfersData as any)?.requests || []
  const users: TransferRequest[] = [] // No hay más distinción de usuarios en la nueva estructura

  // Filter based on active view - usar datos de infinite query cuando corresponda
  const currentRequests = activeView === "users"
    ? (useInfiniteForUsers ? flattenedUsers : registeredUsers)
    : transfers
  const currentLoading = activeView === "users"
    ? usersLoadingFinal
    : transfersLoading
  const currentPagination = activeView === "users"
    ? (useInfiniteForUsers ? (usersDataFinal as any)?.pages?.[(usersDataFinal as any).pages.length - 1]?.pagination : usersPagination)
    : (useInfiniteForTransfers ? (transfersData as any)?.pages?.[(transfersData as any).pages.length - 1]?.pagination : transferQuery.data?.pagination)

  const filteredRequests = currentRequests.filter((request: any) => {
    if (!searchTerm) return true

    const searchLower = searchTerm.toLowerCase()

    if (activeView === "users") {
      // Filter for registered users
      return (
        (request.name || "").toLowerCase().includes(searchLower) ||
        (request.username || "").toLowerCase().includes(searchLower) ||
        (request.email || "").toLowerCase().includes(searchLower) ||
        (request.phone || "").includes(searchTerm) ||
        (request.channel || "").toLowerCase().includes(searchLower) ||
        (request.status || "").toLowerCase().includes(searchLower) ||
        (request.botNum?.toString() || "").includes(searchTerm) ||
        (request.numberRedirect || "").includes(searchTerm) ||
        (request.redirectAgentId?.toString() || "").includes(searchTerm)
      )
    } else {
      // Filter for transfers
      const matchesSearch =
        // IDs - Username principal, Lead ID secundario, Talk ID oculto
        (request.username || "").toLowerCase().includes(searchLower) ||
        request.leadId.toLowerCase().includes(searchLower) ||
        request.contactId.toLowerCase().includes(searchLower) ||
        // Transfer amounts
        (request.extractedData?.amount?.toString() || "").includes(searchTerm) ||
        // Sender info
        (request.extractedData?.sender?.name || "").toLowerCase().includes(searchLower) ||
        (request.extractedData?.sender?.cuit || "").includes(searchTerm) ||
        (request.extractedData?.sender?.platform || "").toLowerCase().includes(searchLower) ||
        // Receiver info
        (request.extractedData?.receiver?.name || "").toLowerCase().includes(searchLower) ||
        (request.extractedData?.receiver?.cuit || "").includes(searchTerm) ||
        (request.extractedData?.receiver?.bank || "").toLowerCase().includes(searchLower) ||
        // Transaction info
        (request.extractedData?.operationNumber || "").includes(searchTerm) ||
        (request.extractedData?.platform || "").toLowerCase().includes(searchLower) ||
        (request.extractedData?.transactionType || "").toLowerCase().includes(searchLower) ||
        (request.extractedData?.currency || "").toLowerCase().includes(searchLower) ||
        // Attachment
        (request.attachment?.file_name || "").toLowerCase().includes(searchLower)

      return matchesSearch
    }
  })

  const handleApprove = (id: string) => {
    approveMutation.mutate(id)
  }

  const handleReject = (id: string) => {
    rejectMutation.mutate(id)
  }

  const handleBotAction = (id: string) => {
    console.log('logica futura para bot', id)
  }

  // Función para manejar el cambio del input de búsqueda
  const handleSearchChange = (value: string) => {
    setLocalSearchTerm(value)
    debouncedSetSearchTerm(value)
  }

  // Funciones de exportación
  const handleExportUsers = async () => {
    try {
      // Si hay filtros aplicados, exportar con filtros
      if (searchTerm || (statusFilter !== 'all') || usersFilters.status || usersFilters.channel || (dateEnabled && (startDate || endDate))) {
        const filters = {
          page: 1,
          limit: 1000000, // Exportar muchos registros cuando hay filtros
          status: usersFilters.status,
          channel: usersFilters.channel,
          search: searchTerm || undefined,
          startDate: dateEnabled && startDate ? startDate : undefined,
          endDate: dateEnabled && endDate ? endDate : undefined
        }

        // Construir URL con todos los parámetros
        const searchParams = new URLSearchParams()
        searchParams.append('page', '1')
        searchParams.append('limit', '10000')
        if (filters.status) searchParams.append('status', filters.status)
        if (filters.channel) searchParams.append('channel', filters.channel)
        if (filters.startDate) searchParams.append('startDate', filters.startDate)
        if (filters.endDate) searchParams.append('endDate', filters.endDate)

        // Hacer una petición adicional con todos los datos filtrados
        const { default: axios } = await import('axios')
        const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/webhook/register-maldivas/users?${searchParams.toString()}`)

        exportUsersToExcel(data.users || [], filters)
      } else {
        // Exportar todos los usuarios de la página actual
        exportUsersToExcel(registeredUsers, { page: usersPagination?.page, limit: usersPagination?.limit })
      }
    } catch (error) {
      console.error('Error exportando usuarios:', error)
    }
  }

  const handleExportTransfers = async () => {
    try {
      // Función para filtrar solo comprobantes válidos con amount


      // Si hay filtros aplicados, exportar con filtros
      if (searchTerm || (statusFilter !== 'all') || (dateEnabled && (startDate || endDate))) {
        const filters = {
          page: 1,
          limit: 10000, // Exportar muchos registros cuando hay filtros
          status: statusFilter !== 'all' ? statusFilter : undefined,
          search: searchTerm || undefined,
          startDate: dateEnabled && startDate ? startDate : undefined,
          endDate: dateEnabled && endDate ? endDate : undefined
        }

        // Hacer una petición adicional con todos los datos filtrados
        const searchParams = new URLSearchParams()
        searchParams.append('page', '1')
        searchParams.append('limit', '10000')
        if (filters.status) searchParams.append('status', filters.status)
        if (filters.search) searchParams.append('search', filters.search)
        if (filters.startDate) searchParams.append('startDate', filters.startDate)
        if (filters.endDate) searchParams.append('endDate', filters.endDate)

        const { default: axios } = await import('axios')
        const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/webhook/image-maldivas?${searchParams.toString()}`)

        // Filtrar solo comprobantes válidos con amount
        exportTransfersToExcel(data.requests, filters)
      } else {
        // Exportar todas las transferencias válidas de la página actual
        exportTransfersToExcel((transfersData as any)?.requests || [], { page, limit })
      }
    } catch (error) {
      console.error('Error exportando transferencias:', error)
    }
  }

  console.log(getTransfersStats(), 'stats')

  return (
    <RouteGuard>
      <main className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <StatsGrid
          stats={getTransfersStats() || {
            totalTransfers: 0,
            totalAmount: 0,
            pending: 0,
            pendingAmount: 0,
            processed: 0,
            processedAmount: 0,
            error: 0,
            errorAmount: 0,
            averageAmount: 0,
            approvalRate: 0
          }}
          totalUsers={getTransfersTotalUsers() || 0}
          isLoading={transferQuery.isLoading || transferInfiniteQuery.isLoading}
          activeTab={activeView}
        />

        {/* Filters */}
        <Card className="bg-card/50 border-border/40 p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Search className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-sm font-medium">Filtros de búsqueda</h2>
            <Badge variant="secondary" className="text-xs">
              últimas 24hs
            </Badge>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder={
                  activeView === "users"
                    ? "Buscar por nombre, usuario, teléfono, email, bot, redirección..."
                    : "Buscar por username, lead ID, nombre, teléfono, email, monto, remitente, destinatario..."
                }
                value={localSearchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="bg-background/50 border-border/40"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value) => dispatch(setStatusFilter(value))}>
              <SelectTrigger className="w-full md:w-[200px] bg-background/50 border-border/40">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="processed">Procesadas</SelectItem>
                <SelectItem value="error">Rechazadas</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="border-border/40 bg-transparent">
              Buscar
            </Button>
          </div>
        </Card>

        {/* Date Filter */}
        <DateTimePicker />

        {/* Tabs */}
        <Tabs value={activeView} onValueChange={(value) => dispatch(setActiveView(value as "users" | "transfers"))} className="mb-6">
          <TabsList className="grid w-full grid-cols-2 bg-card/50 border-border/40">
            {/* <TabsTrigger value="users" className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Usuarios Registrados ({getTransfersTotalUsers() || currentPagination?.total || 0})
            </TabsTrigger>
            <TabsTrigger value="transfers" className="flex items-center gap-2">
              <Receipt className="w-4 h-4" />
              Transferencias ({getTransfersStats()?.totalTransfers || 0})
            </TabsTrigger> */}
          </TabsList>

          <TabsContent value="users">
            <UsersTable
              users={currentRequests}
              loading={currentLoading}
              loadingMore={useInfiniteForUsers && usersInfiniteQuery.isFetchingNextPage}
              onExport={handleExportUsers}
              totalUsers={getTransfersTotalUsers() || currentPagination?.total || 0}
              onUserClick={(userId) => {
                // Handle user click if needed
              }}
            />

            {/* Infinite scroll trigger - invisible element */}
            {useInfiniteForUsers && usersInfiniteQuery.hasNextPage && !usersInfiniteQuery.isFetchingNextPage && (
              <div ref={usersLoadMoreRef} className="h-4" />
            )}

          {/* Pagination for Users - solo mostrar cuando NO se usa infinite query */}
          {(currentPagination?.totalPages || 0) > 1 && !useInfiniteForUsers && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-border/40">
              <p className="text-sm text-muted-foreground">
                Página {currentPagination?.page || 1} de {currentPagination?.totalPages || 0}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => dispatch(setUsersPage((currentPagination?.page || 1) - 1))}
                  disabled={!currentPagination?.hasPrev}
                  className="border-border/40"
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => dispatch(setUsersPage((currentPagination?.page || 1) + 1))}
                  disabled={!currentPagination?.hasNext}
                  className="border-border/40"
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
      </TabsContent>

      <TabsContent value="transfers">
        <TransfersTable
          transfers={currentRequests}
          loading={transfersLoading}
          loadingMore={useInfiniteForTransfers && transferInfiniteQuery.isFetchingNextPage}
          onExport={handleExportTransfers}
          onApprove={handleApprove}
          onReject={handleReject}
          onBotAction={handleBotAction}
          onViewImage={(imageUrl) => setSelectedImage(imageUrl)}
          showActions={true}
        />

        {/* Infinite scroll trigger - invisible element */}
        {useInfiniteForTransfers && transferInfiniteQuery.hasNextPage && !transferInfiniteQuery.isFetchingNextPage && (
          <div ref={transfersLoadMoreRef} className="h-4" />
        )}

        {/* Pagination for Transfers - solo mostrar cuando NO se usa infinite query */}
        {(getTransfersPagination()?.totalPages || 0) > 1 && !useInfiniteForTransfers && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-border/40">
              <p className="text-sm text-muted-foreground">
                Página {page} de {getTransfersPagination()?.totalPages || 0}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => dispatch(setPage(page - 1))}
                  disabled={!getTransfersPagination()?.hasPrev}
                  className="border-border/40"
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => dispatch(setPage(page + 1))}
                  disabled={!getTransfersPagination()?.hasNext}
                  className="border-border/40"
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
      </TabsContent>
    </Tabs>
      </main>

      {/* Details Dialog */}
      <TransferDetailsDialog
        open={!!selectedImage}
        onOpenChange={(open) => !open && setSelectedImage(null)}
        request={[...users, ...transfers].find(r => (r.receipt?.url || r.data) === selectedImage) || null}
        formatDate={formatDateArgentina}
      />
     
    </RouteGuard>
  )
}
    