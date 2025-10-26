import { LogEntry, LogType } from "@/service/logs";
import {
  Bot,
  Facebook,
  RefreshCcw,
  MessageCircle,
  HelpCircle,
  FacebookIcon,
  MessageSquare,
  Tag,
  User,
  Hash,
  ArrowUpRight,
  RefreshCw,
  UserCheck,
  FileText,
  BarChart3,
  CheckCircle,
  XCircle,
  Zap,
  Brain,
  Settings,
  AlertTriangle,
  Clock,
  Send,
  Target,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Función helper para obtener el color/tipo de badge según el tipo de log
export function getLogTypeInfo(logType: LogType): {
  label: string;
  color: "blue" | "green" | "orange" | "red" | "gray" | "purple";
  icon: React.ReactNode;
} {
  switch (logType) {
    case "received_messages":
      return {
        label: "Mensaje",
        color: "blue",
        icon: <MessageCircle className="h-3 w-3 text-blue-500" />,
      };
    case "change_status":
      return {
        label: "Cambio Status",
        color: "green",
        icon: <RefreshCcw className="h-3 w-3 text-green-500" />,
      };
    case "bot_actions":
      return {
        label: "Acción Bot",
        color: "orange",
        icon: <Bot className="h-3 w-3 text-orange-500" />,
      };
    case "send_meta":
      return {
        label: "Envío Meta",
        color: "purple",
        icon: <FacebookIcon className="h-3 w-3 text-purple-500" />,
      };
    default:
      return {
        label: "Desconocido",
        color: "gray",
        icon: <HelpCircle className="h-3 w-3 text-gray-500" />,
      };
  }
}

// Helper function to render key-value pairs with icons
export const renderKeyValue = (
  label: string,
  value: React.ReactNode,
  icon: React.ReactNode,
  isCode: boolean = false,
  alignTop: boolean = false
) => (
  <div
    className={`flex gap-3 py-1 ${alignTop ? "items-start" : "items-center"}`}
  >
    <div
      className={`flex gap-2 min-w-0 flex-shrink-0 ${
        alignTop ? "items-start pt-0.5" : "items-center"
      }`}
      style={{ minWidth: "120px" }}
    >
      {icon}
      <strong className="text-xs font-medium whitespace-nowrap">
        {label}:
      </strong>
    </div>
    <div className="min-w-0 flex-1">
      {isCode ? (
        <code className="text-xs bg-muted/60 px-2 py-1 rounded-md break-words overflow-hidden text-ellipsis whitespace-normal max-w-full font-mono">
          {value}
        </code>
      ) : (
        <span className="text-xs break-words overflow-hidden text-ellipsis whitespace-normal max-w-full leading-relaxed">
          {value}
        </span>
      )}
    </div>
  </div>
);


export const renderLogDetails = (log: LogEntry) => {
    switch (log.type) {
      case "received_messages":
        return (
          <div className="space-y-1">
            {renderKeyValue("Mensaje", log.messageText, <MessageSquare className="h-3 w-3 text-white" />)}
            {renderKeyValue("Tipo", log.messageType, <Tag className="h-3 w-3 text-white" />)}
            {renderKeyValue("Autor", log.authorName, <User className="h-3 w-3 text-white" />)}
            {renderKeyValue("Chat ID", log.chatId, <MessageCircle className="h-3 w-3 text-white" />, true)}
            {renderKeyValue("Message ID", log.messageId, <Hash className="h-3 w-3 text-white" />, true)}
          </div>
        )
      case "change_status":
        return (
          <div className="space-y-1">
            {renderKeyValue("Status anterior", log.oldStatus || "N/A", <ArrowUpRight className="h-3 w-3 text-white" />)}
            {renderKeyValue("Nuevo status", log.newStatus, <RefreshCw className="h-3 w-3 text-white" />)}
            {renderKeyValue("Cambiado por", log.changedBy, <UserCheck className="h-3 w-3 text-white" />)}
            {renderKeyValue("Razón", log.reason || "N/A", <FileText className="h-3 w-3 text-white" />)}
            {renderKeyValue("Confianza", log.confidence ? `${log.confidence}%` : "N/A", <BarChart3 className="h-3 w-3 text-white" />)}
            {renderKeyValue("Éxito", log.success ? <CheckCircle className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-red-500" />, <Zap className="h-3 w-3 text-white" />)}
          </div>
        )
      case "bot_actions":
        return (
          <div className="space-y-1">
            {renderKeyValue("Mensaje", log.messageText, <MessageSquare className="h-3 w-3 text-white" />)}
            <div className="space-y-1 border border-cyan-300/10 rounded-md">
              <div className="flex items-center gap-2 py-1 bg-cyan-300/10 text-white rounded-t-md">
                <Brain className="h-3 w-3 text-white ml-2" />
                <strong className="text-xs font-medium text-white">Decisión IA:</strong>
              </div>
              <div className="ml-4 space-y-1 max-w-full  rounded-md p-2 flex flex-col gap-1 ">
                {renderKeyValue("Status actual", log.aiDecision.currentStatus, <Settings className="h-3 w-3 text-white" />)}
                {renderKeyValue("Nuevo status", log.aiDecision.newStatus, <RefreshCw className="h-3 w-3 text-white" />)}
                {renderKeyValue("Debe cambiar", log.aiDecision.shouldChange ? <CheckCircle className="h-3 w-3 text-green-500  " /> : <XCircle className="h-3 w-3 text-red-500" />, <ArrowUpRight className="h-3 w-3 text-white" />)}
                {renderKeyValue("Razonamiento", log.aiDecision.reasoning, <FileText className="h-3 w-3 text-white" />, false, true)}
                {renderKeyValue("Confianza", `${log.aiDecision.confidence}%`, <BarChart3 className="h-3 w-3 text-white" />)}
              </div>
            </div>
            {renderKeyValue("Resultado", log.statusUpdateResult.success ? <CheckCircle className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-red-500" />, <Zap className="h-3 w-3 text-white" />)}
            {log.statusUpdateResult.error && renderKeyValue("Error", log.statusUpdateResult.error, <AlertTriangle className="h-3 w-3 text-white" />)}
          </div>
        )
      case "send_meta":
        return (
          <div className="space-y-1">
            {renderKeyValue("Código extraído", log.extractedCode, <Hash className="h-3 w-3 text-white" />, true)}
            {renderKeyValue("Tipos de evento", (() => {
              // Extraer tipos de evento de conversionData si eventType no existe
              const eventTypes = log.eventType && log.eventType.length > 0
                ? log.eventType
                : log.conversionData?.flatMap(conversion =>
                    conversion.data?.map(event => event.event_name) || []
                  ) || []
              return eventTypes.length > 0 ? eventTypes.join(", ") : "Sin tipos"
            })(), <Tag className="h-3 w-3 text-white" />)}

            {/* Conversion Data Section */}
            {log.conversionData && log.conversionData.length > 0 && (
              <div className="space-y-1 border border-purple-300/10 rounded-md">
                <div className="flex items-center gap-2 py-1 bg-purple-300/10 text-white rounded-t-md">
                  <Facebook className="h-3 w-3 text-white ml-2" />
                  <strong className="text-xs font-medium text-white">Datos de Conversión:</strong>
                </div>
                <div className="ml-4 space-y-2 max-w-full rounded-md p-2">
                  {log.conversionData.map((conversion, index) => (
                    <div key={index} className="space-y-1">
                      <h6 className="text-xs font-medium text-purple-300">Conversión {index + 1}:</h6>
                      <div className="ml-2 space-y-1">
                        {conversion.data && conversion.data.length > 0 && (
                          conversion.data.map((event, eventIndex) => (
                            <div key={eventIndex} className="space-y-1 border border-purple-200/20 rounded p-2">
                              <h6 className="text-xs font-medium text-purple-200">Evento {eventIndex + 1}:</h6>
                              <div className="ml-2 space-y-1">
                                {renderKeyValue("Nombre evento", event.event_name, <Tag className="h-3 w-3 text-white" />)}
                                {renderKeyValue("Timestamp", new Date(event.event_time * 1000).toLocaleString('es-AR'), <Clock className="h-3 w-3 text-white" />)}
                                {renderKeyValue("Fuente acción", event.action_source, <Send className="h-3 w-3 text-white" />)}
                                {renderKeyValue("URL fuente", event.event_source_url, <ArrowUpRight className="h-3 w-3 text-white" />, true)}

                                {/* User Data Section */}
                                <div className="space-y-1 border border-purple-200/10 rounded p-1">
                                  <h6 className="text-xs font-medium text-purple-200 ml-1">Datos de usuario:</h6>
                                  <div className="ml-2 space-y-1">
                                    {renderKeyValue("IP cliente", event.user_data.client_ip_address, <Target className="h-3 w-3 text-white" />, true)}
                                    {renderKeyValue("User Agent", event.user_data.client_user_agent, <User className="h-3 w-3 text-white" />, false, true)}
                                    {renderKeyValue("FBP", event.user_data.fbp, <Facebook className="h-3 w-3 text-white" />, true)}
                                    {renderKeyValue("FBC", event.user_data.fbc, <Facebook className="h-3 w-3 text-white" />, true)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      default:
        return null
    }
  }


  export const getLogTypeDisplay = (logType: LogType) => {
    const info = getLogTypeInfo(logType)
    return (
      <Badge
        className={`text-xs font-medium bg-transparent hover:bg-gray-50/30 ${
          info.color === "blue"
            ? "text-blue-700"
            : info.color === "green"
              ? "text-green-700"
              : info.color === "orange"
                ? "text-orange-700"
                : info.color === "purple"
                  ? "text-purple-700"
                  : "text-gray-700"
        }`}
      >
        <span className="mr-1">{info.icon}</span>
        {info.label}
      </Badge>
    )
  }