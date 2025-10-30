// Types
export interface ReportsResponse {
  success: boolean
  data: {
    totalEvents: number
    eventTypes: string[]
    event1Count: number
    event2Count: number
  }
}

export interface StatsDataPoint {
  x: string
  y: number
}

export interface ReportsStatsResponse {
  data: {
    all: StatsDataPoint[]
    event1: StatsDataPoint[]
    event2: StatsDataPoint[]
  }
  status: number
}


// ===== CLASE PRINCIPAL DEL SERVICIO =====

export class ReportsService {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  // Método privado para hacer las llamadas HTTP
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<{ data: T | null; error: string | null }> {
    try {
      const url = `${this.baseUrl}${endpoint}`

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Error desconocido" }))
        return {
          data: null,
          error: errorData.error || `Error HTTP ${response.status}: ${response.statusText}`,
        }
      }

      const data: T = await response.json()

      return {
        data,
        error: null,
      }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Error de conexión",
      }
    }
  }

  // ===== MÉTODOS PÚBLICOS =====

  /**
   * Obtener reportes con filtros opcionales
   */
  async getReports(params?: {
    campaignId?: string
    startDate?: string
    endDate?: string
    eventName?: string
  }): Promise<{ data: ReportsResponse | null; error: string | null }> {
    const searchParams = new URLSearchParams()

    if (params?.campaignId) searchParams.append('campaignId', params.campaignId)
    if (params?.startDate) searchParams.append('startDate', params.startDate)
    if (params?.endDate) searchParams.append('endDate', params.endDate)
    if (params?.eventName) searchParams.append('eventName', params.eventName)

    const queryString = searchParams.toString()
    const endpoint = `/reports${queryString ? `?${queryString}` : ''}`

    const result = await this.makeRequest<ReportsResponse>(endpoint)
    return result
  }

    /**
   * Obtener estadísticas de reportes para gráficos
   */
    async getReportsStats(params?: {
      campaignId?: string
      startDate?: string
      endDate?: string
      eventName?: string
    }): Promise<{ data: ReportsStatsResponse | null; error: string | null }> {
      const searchParams = new URLSearchParams()
  
      if (params?.campaignId) searchParams.append("campaignId", params.campaignId)
      if (params?.startDate) searchParams.append("startDate", params.startDate)
      if (params?.endDate) searchParams.append("endDate", params.endDate)
      if (params?.eventName) searchParams.append("eventName", params.eventName)
  
      const queryString = searchParams.toString()
      const endpoint = `/reports/stats${queryString ? `?${queryString}` : ""}`
  
      const result = await this.makeRequest<ReportsStatsResponse>(endpoint)
      return result
    }
  }


// ===== INSTANCIA GLOBAL DEL SERVICIO =====

// Factory function para crear instancia con variables dinámicas
export const createReportsService = (apiUrl: string) => {
  return new ReportsService(apiUrl)
}

// Funciones de conveniencia que requieren instancia del servicio
export const getReports = (service: ReportsService, params?: {
  campaignId?: string
  startDate?: string
  endDate?: string
  eventName?: string
}) => service.getReports(params)


