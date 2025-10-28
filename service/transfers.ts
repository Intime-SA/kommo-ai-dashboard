
// Types
export interface TransferRequest {
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

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface FiltersInfo {
  applied: Record<string, any>
  availableStatuses: string[]
  availableChannels: string[]
}

export interface StatsInfo {
  totalTransfers: number
  totalAmount: number
  pending: number
  pendingAmount: number
  processed: number
  processedAmount: number
  error: number
  errorAmount: number
  averageAmount: number
  approvalRate: number
}

export interface RegisteredUser {
  _id: string
  name: string
  username: string
  phone: string
  email: string
  channel: string
  password: string
  status: string
  botNum: number
  botUrl: string
  createAt: string
  updatedAt?: string
  numberRedirect?: string
  redirectAgentId?: number
  errorMessage?: string
}

export interface UsersApiResponse {
  users: RegisteredUser[]
  pagination: PaginationInfo
  message: string
}

export interface ApiResponse {
  requests: TransferRequest[]
  pagination: PaginationInfo
  filters: FiltersInfo
  stats: StatsInfo
  totalUsers: number
}

// ===== CLASE PRINCIPAL DEL SERVICIO =====

export class TransfersService {
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
   * Obtener solicitudes de transferencia con filtros opcionales
   */
  async getTransferRequests(params?: {
    page?: number
    limit?: number
    status?: string
    search?: string
    startDate?: string
    endDate?: string
  }): Promise<{ data: ApiResponse | null; error: string | null }> {
    const searchParams = new URLSearchParams()

    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.status && params.status !== 'all') searchParams.append('status', params.status)
    if (params?.search) searchParams.append('search', params.search)
    if (params?.startDate) searchParams.append('startDate', params.startDate)
    if (params?.endDate) searchParams.append('endDate', params.endDate)

    const queryString = searchParams.toString()
    const endpoint = `/request_image${queryString ? `?${queryString}` : ''}`

    const result = await this.makeRequest<ApiResponse>(endpoint)
    return result
  }

  /**
   * Aprobar solicitud de transferencia
   */
  async approveTransferRequest(id: string): Promise<{ data: null; error: string | null }> {
    const result = await this.makeRequest<null>(`/request_image/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status: 'approved' }),
    })
    return result
  }

  /**
   * Rechazar solicitud de transferencia
   */
  async rejectTransferRequest(id: string): Promise<{ data: null; error: string | null }> {
    const result = await this.makeRequest<null>(`/request_image/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status: 'rejected' }),
    })
    return result
  }

  /**
   * Obtener usuarios registrados con filtros opcionales
   */
  async getRegisteredUsers(params?: {
    page?: number
    limit?: number
    status?: string
    channel?: string
    startDate?: string
    endDate?: string
  }): Promise<{ data: UsersApiResponse | null; error: string | null }> {
    const searchParams = new URLSearchParams()

    if (params?.page) searchParams.append('page', params.page.toString())
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.status) searchParams.append('status', params.status)
    if (params?.channel) searchParams.append('channel', params.channel)
    if (params?.startDate) searchParams.append('startDate', params.startDate)
    if (params?.endDate) searchParams.append('endDate', params.endDate)

    const queryString = searchParams.toString()
    const endpoint = `/request_register/${queryString ? `?${queryString}` : ''}`

    const result = await this.makeRequest<UsersApiResponse>(endpoint)
    return result
  }

  /**
   * Obtener estadísticas de transferencias
   */
  async getStats(): Promise<{ data: StatsInfo | null; error: string | null }> {
    const result = await this.makeRequest<StatsInfo>('/request_image/stats')
    return result
  }

  /**
   * Activar/desactivar automatización
   */
  async toggleAutomation(status: boolean): Promise<{ data: null; error: string | null }> {
    const result = await this.makeRequest<null>('/request_register/automatization', {
      method: "PUT",
      body: JSON.stringify({ status }),
    })
    return result
  }
}

// ===== INSTANCIA GLOBAL DEL SERVICIO =====

// Factory function para crear instancia con variables dinámicas
export const createTransfersService = (apiUrl: string) => {
  return new TransfersService(apiUrl + "")
}

// Funciones de conveniencia que requieren instancia del servicio
export const getTransferRequests = (service: TransfersService, params?: {
  page?: number
  limit?: number
  status?: string
  search?: string
  startDate?: string
  endDate?: string
}) => service.getTransferRequests(params)

export const approveTransferRequest = (service: TransfersService, id: string) => service.approveTransferRequest(id)
export const rejectTransferRequest = (service: TransfersService, id: string) => service.rejectTransferRequest(id)

export const getRegisteredUsers = (service: TransfersService, params?: {
  page?: number
  limit?: number
  status?: string
  channel?: string
  startDate?: string
  endDate?: string
}) => service.getRegisteredUsers(params)

export const getStats = (service: TransfersService) => service.getStats()
export const toggleAutomation = (service: TransfersService, status: boolean) => service.toggleAutomation(status)

export interface HealthBotsResponse {
  mainInstance: {
    instanceId: string
    state: string
    publicIp: string
    instanceType: string
    found: boolean
    healthCheck: {
      status: string
      timestamp: string
      service: string
      message: string
      uptime: number
      port: number
      browser: {
        initialized: boolean
        pages: number
        functional: boolean
      }
      apiBotReachable: boolean
      awsState: string
      reachable: boolean
    }
  }
  secondaryInstance: {
    instanceId: string
    state: string
    publicIp: string
    instanceType: string
    found: boolean
    healthCheck: {
      status: string
      timestamp: string
      service: string
      message: string
      uptime: number
      port: number
      browser: {
        initialized: boolean
        pages: number
        functional: boolean
      }
      apiBotReachable: boolean
      awsState: string
      reachable: boolean
    }
  }
  checkedAt: string
}