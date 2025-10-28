import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronDown, Download, Eye, Receipt, Check, X, Clock, Users } from "lucide-react"
import { formatDateArgentina } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useSelector } from "react-redux"
import { RootState } from "@/lib/store"

interface TransferRequest {
  _id: string
  talkId: string
  leadId: string
  contactId: string
  username: string
  platform: string
  attachment: {
    type: string
    link: string
    file_name: string
  }
  createdAt: string
  updatedAt: string
  status: "pending" | "approved" | "rejected" | "processed" | "error"
  extractedData: {
    amount: number
    currency: string
    date: string
    time: string
    sender: {
      name: string
      cuit: string
      platform: string
      cvu: string
      cbu: string
    }
    receiver: {
      name: string
      cuit: string
      cvu: string
      cbu: string
      bank: string
    }
    operationNumber: string
    transactionType: string
    platform: string
    rawText: string
    confidence: number
  } | null
  gptAnalysis: {
    success: boolean
    extractedAt: string
    partial: boolean
    note: string | null
    confidence: number | null
  } | null
  receipt: {
    url: string
    name: string
  }
}

interface TransfersTableProps {
  transfers: TransferRequest[]
  loading: boolean
  loadingMore?: boolean
  onExport: () => void
  onApprove?: (id: string) => void
  onReject?: (id: string) => void
  onViewImage?: (imageUrl: string) => void
  showActions?: boolean
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "text-yellow-500"
    case "approved":
      return "text-green-500"
    case "rejected":
      return "text-red-500"
    default:
      return "text-muted-foreground"
  }
}

const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case "pending":
      return "secondary"
    case "approved":
      return "default"
    case "rejected":
      return "destructive"
    default:
      return "outline"
  }
}

export function TransfersTable({
  transfers,
  loading,
  loadingMore = false,
  onExport,
  onApprove,
  onReject,
  onViewImage,
  showActions = true
}: TransfersTableProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const { startDate, endDate, isEnabled } = useSelector((state: RootState) => state.date)
  return (
    <Card className="bg-card/50 border-border/40 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Receipt className="w-5 h-5 text-muted-foreground" />
          <div>
            <h2 className="text-sm font-medium">Transferencias Recibidas</h2>
            <p className="text-xs text-muted-foreground">{transfers.length} transferencias totales</p>
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
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Fecha
                </div>
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Usuario
                </div>
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Monto</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Transferencia</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Estado</th>
              <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground w-12">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading && transfers.length === 0 ? (
              Array.from({ length: 8 }).map((_, index) => (
                <tr key={`skeleton-${index}`} className="border-b border-border/40">
                  <td className="py-4 px-4 w-12">
                    <Skeleton className="h-4 w-4 rounded" />
                  </td>
                  <td className="py-4 px-4">
                    <Skeleton className="h-4 w-32" />
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <Skeleton className="h-5 w-20" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1">
                      <Skeleton className="h-3 w-6" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </td>
                  <td className="py-4 px-4 w-12">
                    <div className="flex items-center gap-1">
                      <Skeleton className="h-8 w-8 rounded" />
                    </div>
                  </td>
                </tr>
              ))
            ) : transfers.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-muted-foreground">
                  No se encontraron transferencias
                </td>
              </tr>
            ) : (
              transfers.map((transfer) => (
                <>
                  <tr key={transfer._id} className="border-b border-border/40 hover:bg-muted/20 transition-colors">
                    <td className="py-4 px-4 w-12">
                      <button
                        onClick={() => setExpandedRow(expandedRow === transfer._id ? null : transfer._id)}
                        className="flex items-center justify-center w-4 h-4"
                      >
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${
                            expandedRow === transfer._id ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm">
                        {formatDateArgentina(transfer.createdAt)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="text-sm font-medium">
                          {transfer.username || "Sin username"}
                        </p>
                        <p className="text-xs text-muted-foreground">Lead ID: {transfer.leadId}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm font-semibold text-green-600">
                        ${transfer.extractedData?.amount.toLocaleString("es-AR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm">
                        <div className="flex items-center gap-1 mb-1">
                          <span className="text-xs text-muted-foreground">De:</span>
                          <span className="truncate max-w-[120px]">
                            {transfer.extractedData?.sender?.name || "-"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge
                        variant={getStatusBadgeVariant(transfer.status)}
                        className={getStatusColor(transfer.status)}
                      >
                        {transfer.status === "pending" && "Pendiente"}
                        {transfer.status === "approved" && "Validada"}
                        {transfer.status === "rejected" && "Rechazada"}
                        {transfer.status === "processed" && "Procesada"}
                        {transfer.status === "error" && "Error"}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 w-12">
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onViewImage?.(transfer.receipt.url)}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {showActions && transfer.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onApprove?.(transfer._id)}
                              className="h-8 w-8 p-0 text-green-500 hover:text-green-600 hover:bg-green-500/10"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => onReject?.(transfer._id)}
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                  {expandedRow === transfer._id && (
                    <tr className="bg-muted/10">
                      <td colSpan={7} className="py-4 px-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">N° Operación</p>
                            <p className="font-mono text-xs">
                              {transfer.extractedData?.operationNumber || "-"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Plataforma</p>
                            <p>{transfer.extractedData?.platform || "-"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Tipo de Transacción</p>
                            <p>{transfer.extractedData?.transactionType || "-"}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Fecha/Hora</p>
                            <p className="text-xs">
                              {transfer.extractedData?.date} {transfer.extractedData?.time}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">CUIT Remitente</p>
                            <p className="font-mono text-xs">
                              {transfer.extractedData?.sender?.cuit || "-"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">CUIT Destinatario</p>
                            <p className="font-mono text-xs">
                              {transfer.extractedData?.receiver?.cuit || "-"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">CVU Remitente</p>
                            <p className="font-mono text-xs truncate">
                              {transfer.extractedData?.sender?.cvu || "-"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">CVU Destinatario</p>
                            <p className="font-mono text-xs truncate">
                              {transfer.extractedData?.receiver?.cvu || "-"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Banco Destinatario</p>
                            <p className="text-xs">
                              {transfer.extractedData?.receiver?.bank || "-"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Confianza GPT</p>
                            <p className="text-xs">
                              {transfer.gptAnalysis?.confidence ? `${transfer.gptAnalysis.confidence}%` : "-"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Archivo Adjunto</p>
                            <p className="text-xs truncate">
                              {transfer.attachment.file_name}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Estado GPT</p>
                            <p className="text-xs">
                              {transfer.gptAnalysis?.success ? "Exitoso" : "Error"}
                            </p>
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
                    <div>
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <Skeleton className="h-5 w-20" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1">
                      <Skeleton className="h-3 w-6" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </td>
                  <td className="py-4 px-4 w-12">
                    <div className="flex items-center gap-1">
                      <Skeleton className="h-8 w-8 rounded" />
                    </div>
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
