import { clsx, type ClassValue } from 'clsx'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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