// Service para consumir el API de Status
// Archivo: service/status.ts

// ===== TIPOS E INTERFACES =====

// Interface para los status
export interface Status {
  _id: string
  statusId: string
  name: string
  description?: string
  colors?: string
  color?: string // Campo alternativo que puede devolver la API
  kommo_id: string | null // ID numérico del status de Kommo
  createdAt: string
  updatedAt: string
}

// Respuesta del API de status
export interface StatusResponse {
  success: boolean
  data: Status[]
  count: number
}

// ===== CLASE PRINCIPAL DEL SERVICIO =====

export class StatusService {
  private baseUrl: string

  constructor(baseUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/status`) {
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

  // Obtener todos los status
  async fetchStatus(): Promise<{ data: Status[] | null; error: string | null }> {
    const result = await this.makeRequest<StatusResponse>("")

    if (result.error) {
      return { data: null, error: result.error }
    }

    return { data: result.data?.data || [], error: null }
  }

  // Crear un nuevo status
  async createStatus(statusData: {
    statusId: string
    name: string
    description: string
    color?: string
  }): Promise<{ data: Status | null; error: string | null }> {
    const result = await this.makeRequest<Status>("", {
      method: "POST",
      body: JSON.stringify(statusData),
    })

    if (result.error) {
      return { data: null, error: result.error }
    }

    return { data: result.data, error: null }
  }

  // Actualizar un status existente
  async updateStatus(
    id: string,
    statusData: Partial<{
      statusId: string
      name: string
      description: string
      kommo_id: string | null
      color: string
    }>
  ): Promise<{ data: Status | null; error: string | null }> {
    const result = await this.makeRequest<Status>(`/${id}`, {
      method: "PUT",
      body: JSON.stringify(statusData),
    })

    if (result.error) {
      return { data: null, error: result.error }
    }

    return { data: result.data, error: null }
  }

  // Eliminar un status
  async deleteStatus(id: string): Promise<{ data: boolean | null; error: string | null }> {
    const result = await this.makeRequest<{ success: boolean; message: string }>(`/${id}`, {
      method: "DELETE",
    })

    if (result.error) {
      return { data: null, error: result.error }
    }

    return { data: result.data?.success || false, error: null }
  }
}

// ===== INSTANCIA GLOBAL DEL SERVICIO =====

export const statusService = new StatusService()
