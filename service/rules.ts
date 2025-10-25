// Service para consumir el API de Rules
// Archivo: service/rules.ts

// ===== TIPOS E INTERFACES =====

// Interface para las reglas
export interface Rule {
  _id: string
  rule: string
  text: string
  crm: string
  pipeline: string
  priority: number
  status: "active" | "inactive" | "draft"
  createdAt: string
  updatedAt: string
}

// Interface para crear una nueva regla (sin _id, createdAt, updatedAt)
export interface CreateRuleData {
  rule: string
  text: string
  crm: string
  pipeline: string
  priority: number
  status: "active" | "inactive" | "draft"
}

// Interface para actualizar una regla (campos opcionales)
export interface UpdateRuleData {
  rule?: string
  text?: string
  crm?: string
  pipeline?: string
  priority?: number
  status?: "active" | "inactive" | "draft"
}

// Respuesta del API de reglas
export interface RulesResponse {
  rules: Rule[]
}

// Estados de loading y error
export interface RulesLoadingState {
  isLoading: boolean
  error: string | null
}

// ===== CLASE PRINCIPAL DEL SERVICIO =====

export class RulesService {
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

  // Obtener todas las reglas
  async fetchRules(): Promise<{ data: Rule[] | null; error: string | null }> {
    const result = await this.makeRequest<RulesResponse>("")

    if (result.error) {
      return { data: null, error: result.error }
    }

    return { data: result.data?.rules || [], error: null }
  }

  // Crear una nueva regla
  async createRule(ruleData: CreateRuleData): Promise<{ data: Rule | null; error: string | null }> {
    return this.makeRequest<Rule>("", {
      method: "POST",
      body: JSON.stringify(ruleData),
    })
  }

  // Actualizar una regla existente
  async updateRule(ruleId: string, updateData: UpdateRuleData): Promise<{ data: Rule | null; error: string | null }> {
    return this.makeRequest<Rule>(`/${ruleId}`, {
      method: "PUT",
      body: JSON.stringify(updateData),
    })
  }

  // Eliminar una regla
  async deleteRule(ruleId: string): Promise<{ error: string | null }> {
    const result = await this.makeRequest<never>(`/${ruleId}`, {
      method: "DELETE",
    })

    return { error: result.error }
  }
}

// ===== INSTANCIA GLOBAL DEL SERVICIO =====

// Factory function para crear instancia con variables dinámicas
export const createRulesService = (apiUrl: string) => {
  return new RulesService(apiUrl + "/api/rules")
}
