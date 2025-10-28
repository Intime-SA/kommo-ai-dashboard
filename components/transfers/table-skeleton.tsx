import { Skeleton } from "@/components/ui/skeleton"

interface TableSkeletonProps {
  rows?: number
  columns?: number
}

export function TableSkeleton({ rows = 5, columns = 6 }: TableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex} className="border-b border-border/40">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <td key={colIndex} className="py-4 px-4">
              <Skeleton className="h-4 w-full" />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

// Skeleton específico para usuarios (10 columnas incluyendo chevron)
export function UsersTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex} className="border-b border-border/40">
          {/* Chevron column */}
          <td className="py-4 px-4 w-12">
            <Skeleton className="h-4 w-4 rounded" />
          </td>

          {/* Date column */}
          <td className="py-4 px-4">
            <Skeleton className="h-4 w-32" />
          </td>

          {/* Username column */}
          <td className="py-4 px-4">
            <Skeleton className="h-4 w-24" />
          </td>

          {/* Phone column */}
          <td className="py-4 px-4">
            <Skeleton className="h-4 w-28" />
          </td>

          {/* Email column */}
          <td className="py-4 px-4">
            <Skeleton className="h-4 w-40" />
          </td>

          {/* Channel badge column */}
          <td className="py-4 px-4">
            <Skeleton className="h-6 w-16 rounded-full" />
          </td>

          {/* Bot column */}
          <td className="py-4 px-4">
            <Skeleton className="h-4 w-8" />
          </td>

          {/* Redirect number column */}
          <td className="py-4 px-4">
            <Skeleton className="h-4 w-16" />
          </td>

          {/* Agent column */}
          <td className="py-4 px-4">
            <Skeleton className="h-4 w-12" />
          </td>

          {/* Actions column */}
          <td className="py-4 px-4 w-12">
            <Skeleton className="h-8 w-8 rounded" />
          </td>
        </tr>
      ))}
    </>
  )
}

// Skeleton específico para transferencias (7 columnas incluyendo chevron)
export function TransfersTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex} className="border-b border-border/40">
          {/* Chevron column */}
          <td className="py-4 px-4 w-12">
            <Skeleton className="h-4 w-4 rounded" />
          </td>

          {/* Date column */}
          <td className="py-4 px-4">
            <Skeleton className="h-4 w-32" />
          </td>

          {/* Username column */}
          <td className="py-4 px-4">
            <div>
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="h-3 w-16" />
            </div>
          </td>

          {/* Amount column */}
          <td className="py-4 px-4">
            <Skeleton className="h-5 w-20" />
          </td>

          {/* From (De:) column */}
          <td className="py-4 px-4">
            <div className="flex items-center gap-1">
              <Skeleton className="h-3 w-6" />
              <Skeleton className="h-4 w-20" />
            </div>
          </td>

          {/* Status badge column */}
          <td className="py-4 px-4">
            <Skeleton className="h-6 w-20 rounded-full" />
          </td>

          {/* Actions column */}
          <td className="py-4 px-4 w-12">
            <div className="flex items-center gap-1">
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          </td>
        </tr>
      ))}
    </>
  )
}
