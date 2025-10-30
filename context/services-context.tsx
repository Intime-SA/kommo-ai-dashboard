"use client"

import { createContext, useContext, ReactNode, useMemo } from "react"
import { useAuth } from "./auth-context"
import { SettingsService, type SystemSettings } from "@/service/settings"
import { KommoService } from "@/service/kommo"
import { StatusService } from "@/service/status"
import { RulesService, type Rule } from "@/service/rules"
import { LogsService, type LogsQueryParams, type LogsResponse } from "@/service/logs"
import { TransfersService } from "@/service/transfers"
import { ReportsService } from "@/service/reports"

interface ServicesContextType {
  // Servicios
  settingsService: SettingsService
  kommoService: KommoService
  statusService: StatusService
  rulesService: RulesService
  logsService: LogsService
  transfersService: TransfersService
  reportsService: ReportsService

  // Tipos
  SystemSettings: SystemSettings
  Rule: Rule
  LogsQueryParams: LogsQueryParams
  LogsResponse: LogsResponse
}

const ServicesContext = createContext<ServicesContextType | undefined>(undefined)

export function ServicesProvider({ children }: { children: ReactNode }) {
  const { config } = useAuth()

  const services = useMemo(() => {
    
    const apiUrl = config.apiUrl || "http://localhost:3002"
    const settingsId = config.mongoSettingsId || ""
    const pipelineId = config.mongoPipelineId || ""

    const settingsService = new SettingsService(apiUrl + "/api/settings", settingsId)
    const kommoService = new KommoService(apiUrl + "/api", pipelineId)
    const statusService = new StatusService(apiUrl + "/api/status")
    const rulesService = new RulesService(apiUrl + "/api/rules")
    const logsService = new LogsService(apiUrl + "/api/logs")
    const transfersService = new TransfersService(apiUrl + "/api")
    const reportsService = new ReportsService(apiUrl + "/api")

    return {
      settingsService,
      kommoService,
      statusService,
      rulesService,
      logsService,
      transfersService,
      reportsService,
    }
  }, [config])

  const contextValue: ServicesContextType = {
    ...services,
    SystemSettings: {} as SystemSettings,
    Rule: {} as Rule,
    LogsQueryParams: {} as LogsQueryParams,
    LogsResponse: {} as LogsResponse,
  }

  return (
    <ServicesContext.Provider value={contextValue}>
      {children}
    </ServicesContext.Provider>
  )
}

export function useServices() {
  const context = useContext(ServicesContext)
  if (context === undefined) {
    throw new Error("useServices must be used within a ServicesProvider")
  }
  return context
}
