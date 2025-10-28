import { clsx, type ClassValue } from 'clsx'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { twMerge } from 'tailwind-merge'
import * as XLSX from 'xlsx'


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}


export const formatTimestamp = (timestamp: string) => {
  try {
    const date = new Date(timestamp)
    // Restar 3 horas para zona horaria de Argentina (UTC-3)
    date.setHours(date.getHours() + 3)
    return format(date, "dd/MM/yyyy HH:mm:ss", { locale: es })
  } catch {
    return timestamp
  }
}

export const getVisiblePages = (currentPage: number, totalPages: number, isMobile: boolean) => {
  const delta = isMobile ? 1 : 2 // Mostrar menos páginas en móviles
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


// Función para parsear y normalizar montos
const parseAmount = (amount: any): number | string => {
  if (amount === null || amount === undefined || amount === 'N/A') return 'N/A'

  // Si ya es un número, devolverlo
  if (typeof amount === 'number') return amount

  // Si es string, limpiar formato de moneda
  if (typeof amount === 'string') {
    // Remover símbolos de moneda, espacios, puntos (separadores de miles) y convertir coma a punto decimal
    const cleaned = amount
      .replace(/[$\s]/g, '') // Remover $ y espacios
      .replace(/\./g, '') // Remover puntos (separadores de miles)
      .replace(',', '.') // Convertir coma a punto decimal

    // Convertir a número
    const parsed = parseFloat(cleaned)
    return isNaN(parsed) ? 'N/A' : parsed
  }

  return 'N/A'
}

// Función helper para formatear fechas (formato legible sin conversión de zona horaria)
export const formatDateArgentina = (dateString: string | undefined) => {
  if (!dateString) return 'N/A'
  try {
    // Extraer componentes directamente del ISO string para evitar conversión de zona horaria
    const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/)
    if (!match) return dateString

    const [, year, month, day, hours, minutes] = match
    return `${day}/${month}/${year} ${hours}:${minutes}`
  } catch {
    return 'N/A'
  }
}

// Función para exportar usuarios a Excel
export const exportUsersToExcel = (users: any[], filters?: any) => {
  const data = users.map(user => ({
    'Fecha Registro': formatDateArgentina(user.createAt),
    'Nombre': user.name || 'N/A',
    'Usuario': user.username || 'N/A',
    'Teléfono': user.phone || 'N/A',
    'Email': user.email || 'N/A',
    'Canal': user.channel || 'N/A',
    'Estado': user.status || 'N/A',
    'Bot Número': user.botNum || 'N/A',
    'Número Redirección': user.numberRedirect || 'N/A',
    'Agente ID': user.redirectAgentId || 'N/A',
    'URL Bot': user.botUrl || 'N/A',
    'Fecha Actualización': formatDateArgentina(user.updatedAt),
    'Mensaje Error': user.errorMessage || 'N/A'
  }))

  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Usuarios Registrados')

  // Generar nombre del archivo con timestamp y filtros si existen
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
  const filterInfo = filters?.status || filters?.channel ? '_filtrado' : ''
  const filename = `usuarios_registrados_${timestamp}${filterInfo}.xlsx`

  XLSX.writeFile(workbook, filename)
}

// Función para convertir fechas a UTC Argentina (UTC-3) específicamente para usuarios
export const convertToArgentinaUTC = (dateString: string): string => {
  const date = new Date(dateString)
  // Restar 3 horas para convertir a UTC Argentina (UTC-3)
  date.setUTCHours(date.getUTCHours() - 3)
  return date.toISOString()
}

// Función para formatear fechas de usuarios en zona horaria Argentina de manera legible
export const formatDateArgentinaUsers = (dateString: string | undefined) => {
  if (!dateString) return 'N/A'
  try {
    const date = new Date(dateString)
    // Convertir a UTC Argentina (UTC-3)
    const argentinaTime = new Date(date.getTime() - (3 * 60 * 60 * 1000))

    // Formatear de manera legible: DD/MM/YYYY HH:mm
    const day = argentinaTime.getUTCDate().toString().padStart(2, '0')
    const month = (argentinaTime.getUTCMonth() + 1).toString().padStart(2, '0')
    const year = argentinaTime.getUTCFullYear()
    const hours = argentinaTime.getUTCHours().toString().padStart(2, '0')
    const minutes = argentinaTime.getUTCMinutes().toString().padStart(2, '0')

    return `${day}/${month}/${year} ${hours}:${minutes}`
  } catch {
    return 'N/A'
  }
}

// Función para exportar transferencias a Excel
export const exportTransfersToExcel = (transfers: any[], filters?: any) => {
  const data = transfers.map(transfer => ({
    'Fecha Creación': transfer.createdAt || 'N/A',
    'Talk ID': transfer.talkId || 'N/A',
    'Lead ID': transfer.leadId || 'N/A',
    'Contact ID': transfer.contactId || 'N/A',
    'Monto': parseAmount(transfer.extractedData?.amount),
    'Moneda': transfer.extractedData?.currency || 'ARS',
    'Remitente': transfer.extractedData?.sender?.name || 'N/A',
    'CUIT Remitente': transfer.extractedData?.sender?.cuit || 'N/A',
    'Destinatario': transfer.extractedData?.receiver?.name || 'N/A',
    'CUIT Destinatario': transfer.extractedData?.receiver?.cuit || 'N/A',
    'Banco Destinatario': transfer.extractedData?.receiver?.bank || 'N/A',
    'N° Operación': transfer.extractedData?.operationNumber || 'N/A',
    'Plataforma': transfer.extractedData?.platform || 'N/A',
    'Tipo Transacción': transfer.extractedData?.transactionType || 'N/A',
    'Fecha Transacción': transfer.extractedData?.date || 'N/A',
    'Hora Transacción': transfer.extractedData?.time || 'N/A',
    'Estado': transfer.status || 'N/A',
    'Confianza GPT': transfer.gptAnalysis?.confidence ? `${transfer.gptAnalysis.confidence}%` : 'N/A',
    'Archivo': transfer.attachment?.file_name || 'N/A',
  }))

  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Transferencias')

  // Generar nombre del archivo con timestamp y filtros si existen
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
  const filterInfo = filters?.status && filters.status !== 'all' ? `_${filters.status}` : ''
  const filename = `transferencias_${timestamp}${filterInfo}.xlsx`

  XLSX.writeFile(workbook, filename)
}
