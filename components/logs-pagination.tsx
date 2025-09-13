"use client"

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { setPage, setPageSize, fetchLogs } from "@/lib/features/logs/logsSlice"

export function LogsPagination() {
  const dispatch = useAppDispatch()
  const { total, pagination, sorting, filters, isLoading } = useAppSelector((state) => state.logs)

  const totalPages = Math.ceil(total / pagination.limit)
  const currentPage = pagination.currentPage
  const hasNextPage = currentPage < totalPages
  const hasPrevPage = currentPage > 1

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      dispatch(setPage(page))
    }
  }

  const handlePageSizeChange = (newPageSize: string) => {
    const size = Number.parseInt(newPageSize)
    dispatch(setPageSize(size))
    dispatch(
      fetchLogs({
        ...filters,
        limit: size,
        offset: 0,
        sortBy: sorting.sortBy,
        sortOrder: sorting.sortOrder,
      }),
    )
  }

  const getVisiblePages = () => {
    const delta = 2
    const range = []
    const rangeWithDots = []

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...")
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages)
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }

  if (total === 0) return null

  const startItem = (currentPage - 1) * pagination.limit + 1
  const endItem = Math.min(currentPage * pagination.limit, total)

  return (
    <div className="flex items-center justify-between px-2 py-4">
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <div>
          Mostrando {startItem.toLocaleString()} a {endItem.toLocaleString()} de {total.toLocaleString()} registros
        </div>
        <div className="flex items-center gap-2">
          <span>Filas por página:</span>
          <Select value={pagination.limit.toString()} onValueChange={handlePageSizeChange} disabled={isLoading}>
            <SelectTrigger className="h-8 w-16 text-xs">
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

      <div className="flex items-center gap-2">
        {/* First page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(1)}
          disabled={!hasPrevPage || isLoading}
          className="h-8 w-8 p-0"
        >
          <ChevronsLeft className="h-3 w-3" />
        </Button>

        {/* Previous page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={!hasPrevPage || isLoading}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-3 w-3" />
        </Button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {getVisiblePages().map((page, index) => (
            <div key={index}>
              {page === "..." ? (
                <span className="px-2 py-1 text-sm text-muted-foreground">...</span>
              ) : (
                <Button
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page as number)}
                  disabled={isLoading}
                  className="h-8 w-8 p-0 text-xs"
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
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={!hasNextPage || isLoading}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-3 w-3" />
        </Button>

        {/* Last page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(totalPages)}
          disabled={!hasNextPage || isLoading}
          className="h-8 w-8 p-0"
        >
          <ChevronsRight className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}
