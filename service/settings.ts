// Service para consumir el API de Settings
// Archivo: service/settings.ts

// ===== TIPOS E INTERFACES =====

// Interface para la configuración del sistema
export interface SystemSettings {
  _id: string
  accountCBU: string
  context: string
  message: string
}

// Interface para actualizar la configuración (campos opcionales)
export interface UpdateSettingsData {
  accountCBU?: string
  context?: string
  message?: string
}

// Respuesta del API de settings
export interface SettingsResponse {
  success: boolean
  data: SystemSettings
}

// Estados de loading y error
export interface SettingsLoadingState {
  isLoading: boolean
  error: string | null
}

// ===== CLASE PRINCIPAL DEL SERVICIO =====

export class SettingsService {
  private baseUrl: string
  private settingsId: string = "68cc2e745128f9ce1830bfec" // ID específico del documento settings

  constructor(baseUrl = process.env.NEXT_PUBLIC_API_URL + "/api/settings") {
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

  // Obtener la configuración del sistema
  async fetchSettings(): Promise<{ data: SystemSettings | null; error: string | null }> {
    const result = await this.makeRequest<SettingsResponse>(`/${this.settingsId}`)

    if (result.error) {
      return { data: null, error: result.error }
    }

    return { data: result.data?.data || null, error: null }
  }

  // Actualizar la configuración del sistema
  async updateSettings(updateData: UpdateSettingsData): Promise<{ data: SystemSettings | null; error: string | null }> {
    const result = await this.makeRequest<SettingsResponse>(`/${this.settingsId}`, {
      method: "PUT",
      body: JSON.stringify(updateData),
    })

    if (result.error) {
      return { data: null, error: result.error }
    }

    return { data: result.data?.data || null, error: null }
  }

  // Crear configuración inicial (si no existe)
  async createSettings(settingsData: Omit<SystemSettings, '_id'>): Promise<{ data: SystemSettings | null; error: string | null }> {
    const result = await this.makeRequest<SettingsResponse>("", {
      method: "POST",
      body: JSON.stringify(settingsData),
    })

    if (result.error) {
      return { data: null, error: result.error }
    }

    return { data: result.data?.data || null, error: null }
  }
}

// ===== INSTANCIA GLOBAL DEL SERVICIO =====

export const settingsService = new SettingsService()
