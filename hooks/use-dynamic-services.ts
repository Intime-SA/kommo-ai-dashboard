"use client"

import { useMemo } from "react"
import { useAuth } from "@/context/auth-context"
import { SettingsService, type SystemSettings } from "@/service/settings"
import { KommoService } from "@/service/kommo"
import { StatusService } from "@/service/status"
import { RulesService, type Rule } from "@/service/rules"
import { LogsService, type LogsQueryParams, type LogsResponse } from "@/service/logs"

export function useDynamicServices() {
  const { config } = useAuth()

  const services = useMemo(() => {
    const apiUrl = config.apiUrl || ""
    const settingsId = config.mongoSettingsId || ""
    const pipelineId = config.mongoPipelineId || ""

    return {
      settingsService: new SettingsService(apiUrl + "/api/settings", settingsId),
      kommoService: new KommoService(apiUrl + "/api", pipelineId),
      statusService: new StatusService(apiUrl + "/api/status"),
      rulesService: new RulesService(apiUrl + "/api/rules"),
      logsService: new LogsService(apiUrl + "/api/logs"),
    }
  }, [config])

  return services
}

// Tipos para usar en componentes
export type {
  SystemSettings,
  Rule,
  LogsQueryParams,
  LogsResponse,
}
