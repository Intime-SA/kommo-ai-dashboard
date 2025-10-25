"use client"

import { useMemo } from "react"
import { useAuth } from "@/context/auth-context"
import { createSettingsService, type SettingsService } from "@/service/settings"
import { createKommoService, type KommoService } from "@/service/kommo"
import { createStatusService, type StatusService } from "@/service/status"
import { createRulesService, type RulesService } from "@/service/rules"
import { createLogsService, type LogsService } from "@/service/logs"

export function useDynamicServices() {
  const { config } = useAuth()
  
  const services = useMemo(() => {

    const apiUrl = config.apiUrl || ""
    const settingsId = config.mongoSettingsId || ""
    const pipelineId = config.mongoPipelineId || ""

    return {
      settingsService: createSettingsService(apiUrl, settingsId) as SettingsService,
      kommoService: createKommoService(apiUrl, pipelineId) as KommoService,
      statusService: createStatusService(apiUrl) as StatusService,
      rulesService: createRulesService(apiUrl) as RulesService,
      logsService: createLogsService(apiUrl) as LogsService,
    }
  }, [config])

  return services
}
