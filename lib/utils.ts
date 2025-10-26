import { clsx, type ClassValue } from 'clsx'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { twMerge } from 'tailwind-merge'

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