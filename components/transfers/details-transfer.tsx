"use client";

import type React from "react";
import { useState, useEffect } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Receipt,
  DollarSign,
  User,
  Building2,
  Hash,
  Calendar,
  Clock,
  CreditCard,
  FileText,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Smartphone,
  Mail,
  Phone,
  AtSign,
  Shield,
  Percent,
} from "lucide-react";

interface TransferDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: any;
  formatDate: (date: string) => string;
}

export function TransferDetailsDialog({
  open,
  onOpenChange,
  request,
  formatDate,
}: TransferDetailsDialogProps) {
  const [imageLoading, setImageLoading] = useState(true);

  // Reset loading state when dialog opens or request changes
  useEffect(() => {
    if (open && request) {
      setImageLoading(true);
    }
  }, [open, request]);

  if (!request) return null;

  const receiptUrl = request.receipt.url;

  // Extract transfer data
  const amount = request.extractedData?.amount;
  const currency = request.extractedData?.currency || "ARS";
  const confidence = request.gptAnalysis?.confidence;

  // Check if this is a user or transfer request (legacy logic)
  const isUser = !request.extractedData;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[70vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl font-semibold">
            <Receipt className="w-6 h-6" />
            Comprobante de Transferencia
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-4">
          {/* Left Column - Receipt Image */}
          <div className="lg:col-span-2 space-y-4">
            <div className="border rounded-lg overflow-hidden bg-muted/30">
              <div className="bg-muted px-4 py-3 border-b">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <h3 className="font-semibold text-sm">
                    Comprobante Original
                  </h3>
                </div>
              </div>
              <div className="p-4">
                {receiptUrl ? (
                  <div className="relative">
                    {imageLoading && (
                      <Skeleton className="w-full h-64 rounded object-contain max-h-[500px]" />
                    )}
                    <img
                      src={receiptUrl || "/placeholder.svg"}
                      alt="Comprobante de Transferencia"
                      className={`w-full h-auto rounded object-contain max-h-[500px] transition-opacity duration-300 ${
                        imageLoading ? "opacity-0" : "opacity-100"
                      }`}
                      onLoad={() => {
                        // Dar un pequeño delay para que se vea el skeleton
                        setTimeout(() => setImageLoading(false), 1000);
                      }}
                      onError={() => setImageLoading(false)}
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    <AlertCircle className="w-12 h-12" />
                  </div>
                )}
              </div>
            </div>

            {/* GPT Analysis Status */}
            {request.gptAnalysis && (
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-muted px-4 py-3 border-b">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-muted-foreground" />
                    <h3 className="font-semibold text-sm">
                      Estado del Análisis
                    </h3>
                  </div>
                </div>
                <div className="divide-y">
                  <TableRow
                    label="Estado"
                    value={
                      <Badge
                        variant={
                          request.gptAnalysis.success
                            ? "default"
                            : "destructive"
                        }
                        className="flex items-center gap-1 w-fit"
                      >
                        {request.gptAnalysis.success ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <AlertCircle className="w-3 h-3" />
                        )}
                        {request.gptAnalysis.success ? "Exitoso" : "Error"}
                      </Badge>
                    }
                  />
                  {confidence && (
                    <TableRow
                      icon={<Percent className="w-4 h-4" />}
                      label="Confianza"
                      value={`${confidence}%`}
                    />
                  )}
                  {request.gptAnalysis.note && (
                    <TableRow
                      label="Nota"
                      value={
                        <span className="text-xs text-muted-foreground">
                          {request.gptAnalysis.note}
                        </span>
                      }
                    />
                  )}
                  <TableRow
                    icon={<Clock className="w-4 h-4" />}
                    label="Procesado"
                    value={formatDate(request.gptAnalysis.extractedAt)}
                    mono
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Transfer Details */}
          <div className="lg:col-span-3 space-y-4">
            {/* Amount Display */}
            <div className="border rounded-lg overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-900">
              <div className="px-6 py-4">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-4 h-4 text-green-700 dark:text-green-400" />
                  <span className="text-xs font-medium text-green-700 dark:text-green-400 uppercase tracking-wide">
                    Monto Transferido
                  </span>
                </div>
                <p className="text-3xl font-bold text-green-700 dark:text-green-400">
                  {(() => {
                    return amount?.toLocaleString("es-AR", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }) || "N/A";
                  })()}
                </p>
                <p className="text-xs text-green-600 dark:text-green-500 mt-1">
                  {currency}
                </p>
              </div>
            </div>

            {/* Sender Information */}
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-muted px-4 py-3 border-b">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <h3 className="font-semibold text-sm">Remitente</h3>
                </div>
              </div>
              <div className="divide-y">
                <TableRow
                  icon={<User className="w-4 h-4" />}
                  label="Nombre"
                  value={request.extractedData?.sender?.name || "N/A"}
                />
                <TableRow
                  icon={<Hash className="w-4 h-4" />}
                  label="CUIT"
                  value={request.extractedData?.sender?.cuit || "N/A"}
                  mono
                />
                <TableRow
                  icon={<CreditCard className="w-4 h-4" />}
                  label="CVU"
                  value={request.extractedData?.sender?.cvu || "N/A"}
                  mono
                />
                <TableRow
                  icon={<CreditCard className="w-4 h-4" />}
                  label="CBU"
                  value={request.extractedData?.sender?.cbu || "N/A"}
                  mono
                />
                <TableRow
                  icon={<Smartphone className="w-4 h-4" />}
                  label="Plataforma"
                  value={request.extractedData?.sender?.platform || "N/A"}
                />
              </div>
            </div>

            {/* Receiver Information */}
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-muted px-4 py-3 border-b">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <h3 className="font-semibold text-sm">Destinatario</h3>
                </div>
              </div>
              <div className="divide-y">
                <TableRow
                  icon={<User className="w-4 h-4" />}
                  label="Nombre"
                  value={request.extractedData?.receiver?.name || "N/A"}
                />
                <TableRow
                  icon={<Hash className="w-4 h-4" />}
                  label="CUIT"
                  value={request.extractedData?.receiver?.cuit || "N/A"}
                  mono
                />
                <TableRow
                  icon={<CreditCard className="w-4 h-4" />}
                  label="CVU"
                  value={request.extractedData?.receiver?.cvu || "N/A"}
                  mono
                />
                <TableRow
                  icon={<CreditCard className="w-4 h-4" />}
                  label="CBU"
                  value={request.extractedData?.receiver?.cbu || "N/A"}
                  mono
                />
                <TableRow
                  icon={<Building2 className="w-4 h-4" />}
                  label="Banco"
                  value={request.extractedData?.receiver?.bank || "N/A"}
                />
              </div>
            </div>

            {/* Transaction Information */}
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-muted px-4 py-3 border-b">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  <h3 className="font-semibold text-sm">
                    Información de Transacción
                  </h3>
                </div>
              </div>
              <div className="divide-y">
                <TableRow
                  icon={<Hash className="w-4 h-4" />}
                  label="N° Operación"
                  value={request.extractedData?.operationNumber || "N/A"}
                  mono
                />
                <TableRow
                  icon={<Calendar className="w-4 h-4" />}
                  label="Fecha"
                  value={request.extractedData?.date || "N/A"}
                />
                <TableRow
                  icon={<Clock className="w-4 h-4" />}
                  label="Hora"
                  value={request.extractedData?.time || "N/A"}
                />
                <TableRow
                  icon={<FileText className="w-4 h-4" />}
                  label="Tipo"
                  value={request.extractedData?.transactionType || "N/A"}
                />
                <TableRow
                  icon={<Smartphone className="w-4 h-4" />}
                  label="Plataforma"
                  value={request.extractedData?.platform || "N/A"}
                />
                <TableRow
                  icon={<FileText className="w-4 h-4" />}
                  label="Texto Crudo"
                  value={
                    <span className="text-xs text-muted-foreground truncate max-w-xs block">
                      {request.extractedData?.rawText || "N/A"}
                    </span>
                  }
                />
              </div>
            </div>

            {/* Request Information */}
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-muted px-4 py-3 border-b">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-muted-foreground" />
                  <h3 className="font-semibold text-sm">
                    Información de la Solicitud
                  </h3>
                </div>
              </div>
              <div className="divide-y">
                <TableRow icon={<Hash className="w-4 h-4" />} label="Talk ID" value={request.talkId} mono />
                <TableRow icon={<Hash className="w-4 h-4" />} label="Lead ID" value={request.leadId} mono />
                <TableRow icon={<Hash className="w-4 h-4" />} label="Contact ID" value={request.contactId} mono />
                <TableRow
                  icon={<FileText className="w-4 h-4" />}
                  label="Archivo"
                  value={request.attachment.file_name}
                />
                <TableRow
                  icon={<Calendar className="w-4 h-4" />}
                  label="Creado"
                  value={formatDate(request.createdAt)}
                />
                <TableRow
                  icon={<Clock className="w-4 h-4" />}
                  label="Actualizado"
                  value={formatDate(request.updatedAt)}
                />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TableRow({
  icon,
  label,
  value,
  mono = false,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string | React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="grid grid-cols-3 gap-4 px-4 py-3 hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
        {icon}
        <span>{label}</span>
      </div>
      <div className="col-span-2 flex items-center">
        {typeof value === "string" ? (
          <span
            className={`text-sm ${mono ? "font-mono text-xs" : ""} break-all`}
          >
            {value}
          </span>
        ) : (
          value
        )}
      </div>
    </div>
  );
}
