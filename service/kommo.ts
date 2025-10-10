// Service para consumir el API de pipelines/statuses
// Archivo: service/kommo.ts

// ===== TIPOS E INTERFACES =====

// Interface para los status de la API local
export interface KommoStatus {
  id: number
  name: string
  color: string
  pipeline_id: number
}

// Respuesta del API local de pipelines/statuses
export interface PipelineStatusesResponse {
  success: boolean
  pipeline_id: number
  pipeline_name: string
  statuses: KommoStatus[]
  total_statuses: number
}

// ===== CLASE PRINCIPAL DEL SERVICIO =====

export class KommoService {
  private baseUrl: string

  constructor(baseUrl = `${process.env.NEXT_PUBLIC_API_URL}/api`) {
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

  // Obtener todos los statuses del pipeline específico
  async fetchPipelineStatuses(pipelineId: string): Promise<{ data: KommoStatus[] | null; error: string | null }> {
    const result = await this.makeRequest<PipelineStatusesResponse>(`/pipelines/statuses?pipeline_id=${pipelineId}`)

    if (result.error) {
      return { data: null, error: result.error }
    }

    // Verificar que la respuesta fue exitosa
    if (!result.data?.success) {
      return { data: null, error: "La respuesta de la API no fue exitosa" }
    }

    return { data: result.data.statuses || [], error: null }
  }

  // Obtener todos los statuses (método de compatibilidad)
  async fetchAllStatuses(): Promise<{ data: KommoStatus[] | null; error: string | null }> {
    const pipelineId = process.env.NEXT_PUBLIC_MONGO_PIPELINE_ID
    return this.fetchPipelineStatuses(pipelineId || "")
  }

  // Buscar un status por ID
  async findStatusById(statusId: number): Promise<{ data: KommoStatus | null; error: string | null }> {
    const allStatusesResult = await this.fetchAllStatuses()

    if (allStatusesResult.error || !allStatusesResult.data) {
      return { data: null, error: allStatusesResult.error }
    }

    const status = allStatusesResult.data.find(s => s.id === statusId)

    return { data: status || null, error: null }
  }
}

// ===== INSTANCIA GLOBAL DEL SERVICIO =====

export const kommoService = new KommoService()
