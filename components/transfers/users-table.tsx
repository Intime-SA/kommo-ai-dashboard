import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ChevronDown, Download, Eye, UserPlus } from "lucide-react"
import { formatDateArgentinaUsers } from "@/lib/utils"
import { useSelector } from "react-redux"
import { RootState } from "@/lib/redux/store"

interface RegisteredUser {
  _id: string
  name?: string
  username: string
  phone?: string
  email?: string
  channel?: string
  status?: string
  botNum?: number
  numberRedirect?: string
  redirectAgentId?: number
  createAt: string
}

interface UsersTableProps {
  users: RegisteredUser[]
  loading: boolean
  loadingMore?: boolean
  onExport: () => void
  totalUsers: number
  onUserClick?: (userId: string) => void
}

export function UsersTable({ users, loading, loadingMore = false, onExport, totalUsers, onUserClick }: UsersTableProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const { startDate, endDate, isEnabled } = useSelector((state: RootState) => state.date)
  return (
    <Card className="bg-card/50 border-border/40 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <UserPlus className="w-5 h-5 text-muted-foreground" />
          <div>
            <h2 className="text-sm font-medium">Usuarios Registrados</h2>
            <p className="text-xs text-muted-foreground">{totalUsers} usuarios registrados</p>
          </div>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Button
                  onClick={onExport}
                  variant="outline"
                  size="sm"
                  className="border-border/40"
                  disabled={(!startDate || !endDate)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar Excel
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Hay que seleccionar una fecha para exportar los resultados</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/40">
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground w-12"></th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">
                Fecha Registro
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">
                Usuario
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Teléfono</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Email</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Canal</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Bot</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Número Redirección</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Agente</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground w-12">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading && users.length === 0 ? (
              Array.from({ length: 8 }).map((_, index) => (
                <tr key={`skeleton-${index}`} className="border-b border-border/40">
                  <td className="py-4 px-4 w-12">
                    <Skeleton className="h-4 w-4 rounded" />
                  </td>
                  <td className="py-4 px-4">
                    <Skeleton className="h-4 w-32" />
                  </td>
                  <td className="py-4 px-4">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="py-4 px-4">
                    <Skeleton className="h-4 w-28" />
                  </td>
                  <td className="py-4 px-4">
                    <Skeleton className="h-4 w-40" />
                  </td>
                  <td className="py-4 px-4">
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </td>
                  <td className="py-4 px-4">
                    <Skeleton className="h-4 w-8" />
                  </td>
                  <td className="py-4 px-4">
                    <Skeleton className="h-4 w-16" />
                  </td>
                  <td className="py-4 px-4">
                    <Skeleton className="h-4 w-12" />
                  </td>
                  <td className="py-4 px-4 w-12">
                    <Skeleton className="h-8 w-8 rounded" />
                  </td>
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-8 text-muted-foreground">
                  No se encontraron usuarios
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <>
                  <tr key={user._id} className="border-b border-border/40 hover:bg-muted/20 transition-colors">
                    <td className="py-4 px-4 w-12">
                      <button
                        onClick={() => setExpandedRow(expandedRow === user._id ? null : user._id)}
                        className="flex items-center justify-center w-4 h-4"
                      >
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${
                            expandedRow === user._id ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm">
                        {formatDateArgentinaUsers(user.createAt)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="text-sm font-medium">
                          {user.username}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm font-mono">
                      {user.phone || 'N/A'}
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm font-mono text-xs truncate max-w-[200px]">
                        {user.email || 'N/A'}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant="outline" className="text-xs">
                        {user.channel || 'N/A'}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-sm font-mono">
                      {user.botNum || 'N/A'}
                    </td>
                    <td className="py-4 px-4 text-sm font-mono">
                      {user.numberRedirect || 'N/A'}
                    </td>
                    <td className="py-4 px-4 text-sm font-mono">
                      {user.redirectAgentId || 'N/A'}
                    </td>
                    <td className="py-4 px-4 w-12">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onUserClick?.(user._id)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                  {expandedRow === user._id && (
                    <tr className="bg-muted/10">
                      <td colSpan={10} className="py-4 px-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Estado</p>
                            <p>{user.status || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Canal</p>
                            <p>{user.channel || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">ID Usuario</p>
                            <p className="font-mono text-xs truncate">{user._id}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Fecha Registro</p>
                            <p>{formatDateArgentinaUsers(user.createAt)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Bot Número</p>
                            <p className="font-mono">{user.botNum || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Número Redirección</p>
                            <p className="font-mono">{user.numberRedirect || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Agente ID</p>
                            <p className="font-mono">{user.redirectAgentId || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))
            )}

            {/* Loading more skeletons */}
            {loadingMore && (
              Array.from({ length: 3 }).map((_, index) => (
                <tr key={`loading-more-${index}`} className="border-b border-border/40">
                  <td className="py-4 px-4 w-12">
                    <Skeleton className="h-4 w-4 rounded" />
                  </td>
                  <td className="py-4 px-4">
                    <Skeleton className="h-4 w-32" />
                  </td>
                  <td className="py-4 px-4">
                    <Skeleton className="h-4 w-24" />
                  </td>
                  <td className="py-4 px-4">
                    <Skeleton className="h-4 w-28" />
                  </td>
                  <td className="py-4 px-4">
                    <Skeleton className="h-4 w-40" />
                  </td>
                  <td className="py-4 px-4">
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </td>
                  <td className="py-4 px-4">
                    <Skeleton className="h-4 w-8" />
                  </td>
                  <td className="py-4 px-4">
                    <Skeleton className="h-4 w-16" />
                  </td>
                  <td className="py-4 px-4">
                    <Skeleton className="h-4 w-12" />
                  </td>
                  <td className="py-4 px-4 w-12">
                    <Skeleton className="h-8 w-8 rounded" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
