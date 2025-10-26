"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { setPage, setPageSize } from "@/lib/features/logs/logsSlice"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { getVisiblePages } from "@/lib/utils"
import { useLogs } from "@/hooks/use-logs"

export function LogsPagination() {
  const dispatch = useAppDispatch()
  const isMobile = useIsMobile()
  
  // REDUX: Obtener el estado de la paginación y los filtros de los logs
  const { pagination, sorting, filters } = useAppSelector((state) => state.logs)
  // REACT QUERY: Usar React Query para obtener el estado de carga, total y refetch
  const { isLoading: logsLoading, refetch: refetchLogs, total, logs } = useLogs({ filters, pagination, sorting })

  // Calcular el total de páginas
  const totalPages = Math.ceil(total / pagination.limit)
  const currentPage = pagination.currentPage
  const hasNextPage = currentPage < totalPages
  const hasPrevPage = currentPage > 1

  // Manejar el cambio de página
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      dispatch(setPage(page))
    }
  }

  // Manejar el cambio de tamaño de página
  const handlePageSizeChange = (newPageSize: string) => {
    const size = Number.parseInt(newPageSize)
    dispatch(setPageSize(size))
    refetchLogs()
  }

  // Solo ocultar si no hay datos y no hay total esperado
  if (total === 0 && logs.length === 0) return null

  // Calcular el índice del primer y último registro mostrado
  const startItem = (currentPage - 1) * pagination.limit + 1
  const endItem = Math.min(currentPage * pagination.limit, total)

  // Renderizar el componente
  return (
    <div className={`${isMobile ? 'flex flex-col gap-4 px-2 py-4' : 'flex items-center justify-between px-2 py-4'}`}>
      {/* Información y selector de filas por página */}
      <div className={`${isMobile ? 'flex flex-col gap-3' : 'flex items-center gap-4'} text-sm text-muted-foreground`}>
        <div className={`${isMobile ? 'text-center' : ''}`}>
          {isMobile ? (
            // Texto simplificado para móviles
            <span>
              {startItem.toLocaleString()}-{endItem.toLocaleString()} de {total.toLocaleString()}
            </span>
          ) : (
            // Texto completo para desktop
            <span>
              Mostrando {startItem.toLocaleString()} a {endItem.toLocaleString()} de {total.toLocaleString()} registros
            </span>
          )}
        </div>
        <div className={`flex items-center gap-2 ${isMobile ? 'justify-center' : ''}`}>
          <span className={isMobile ? 'text-xs' : ''}>Filas:</span>
          <Select value={pagination.limit.toString()} onValueChange={handlePageSizeChange} disabled={logsLoading}>
            <SelectTrigger className={`${isMobile ? 'h-9 w-20 text-sm' : 'h-8 w-16 text-xs'}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
              <SelectItem value="200">200</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Controles de paginación */}
      <div className={`flex items-center gap-1 ${isMobile ? 'justify-center flex-wrap' : ''}`}>
        {/* First page */}
        <Button
          variant="outline"
          size={isMobile ? "default" : "sm"}
          onClick={() => handlePageChange(1)}
          disabled={!hasPrevPage || logsLoading}
          className={`${isMobile ? 'h-10 w-10' : 'h-8 w-8 p-0'} cursor-pointer`}
        >
          <ChevronsLeft className={isMobile ? 'h-4 w-4' : 'h-3 w-3'} />
        </Button>

        {/* Previous page */}
        <Button
          variant="outline"
          size={isMobile ? "default" : "sm"}
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={!hasPrevPage || logsLoading}
          className={`${isMobile ? 'h-10 w-10' : 'h-8 w-8 p-0'} cursor-pointer`}
        >
          <ChevronLeft className={isMobile ? 'h-4 w-4' : 'h-3 w-3'} />
        </Button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {getVisiblePages(currentPage, totalPages, isMobile).map((page, index) => (
            <div key={index}>
              {page === "..." ? (
                <span className="px-2 py-1 text-sm text-muted-foreground">...</span>
              ) : (
                <Button
                  variant={currentPage === page ? "default" : "outline"}
                  size={isMobile ? "default" : "sm"}
                  onClick={() => handlePageChange(page as number)}
                  disabled={logsLoading}
                  className={`${isMobile ? 'h-10 w-10 text-sm' : 'h-8 w-8 p-0 text-xs'} cursor-pointer`}
                >
                  {page}
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Next page */}
        <Button
          variant="outline"
          size={isMobile ? "default" : "sm"}
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={!hasNextPage || logsLoading}
          className={`${isMobile ? 'h-10 w-10' : 'h-8 w-8 p-0'} cursor-pointer`}
        >
          <ChevronRight className={isMobile ? 'h-4 w-4' : 'h-3 w-3'} />
        </Button>

        {/* Last page */}
        <Button
          variant="outline"
          size={isMobile ? "default" : "sm"}
          onClick={() => handlePageChange(totalPages)}
          disabled={!hasNextPage || logsLoading}
          className={`${isMobile ? 'h-10 w-10' : 'h-8 w-8 p-0'} cursor-pointer`}
        >
          <ChevronsRight className={isMobile ? 'h-4 w-4' : 'h-3 w-3'} />
        </Button>
      </div>
    </div>
  )
}
