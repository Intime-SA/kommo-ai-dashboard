"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  LucideSettings,
  Save,
  Plus,
  Edit,
  Trash2,
  X,
  Check,
  CreditCard,
  Brain,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Shield,
  Workflow,
  Hash,
  Activity,
  Phone,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/context/auth-context"
import { useSnackbar } from "@/components/snackbar-provider"
import { rulesService, type Rule, type CreateRuleData, type UpdateRuleData } from "@/service/rules"
import { StatusSection } from "@/components/status-section"
import { RouteGuard } from "@/context/auth-guard"
import { useDynamicServices } from "@/hooks/use-dynamic-services"
import { SystemSettings } from "@/service/settings"



export default function SettingsPage() {
  const { toast } = useToast()
  const { showSnackbar } = useSnackbar()
  const { config } = useAuth()
  const { settingsService } = useDynamicServices()
  const [settings, setSettings] = useState<SystemSettings>({
    _id: config.mongoSettingsId || "",
    accountCBU: "",
    context: "",
    message: "",
    accountName: "",
    numbers: [],
  })
  const [rules, setRules] = useState<Rule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingRule, setEditingRule] = useState<string | null>(null)
  const [isContextExpanded, setIsContextExpanded] = useState(false)
  const [newRule, setNewRule] = useState({
    rule: "",
    text: "",
    crm: "kommo",
    pipeline: "sales",
    priority: 1,
    status: "active" as "active" | "inactive" | "draft",
  })
  const [showNewRuleForm, setShowNewRuleForm] = useState(false)

  useEffect(() => {
    fetchRules()
    fetchSettings()
  }, [])

  const fetchRules = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await rulesService.fetchRules()
      if (error) {
        toast({
          title: "Error",
          description: "No se pudieron cargar las reglas",
          variant: "destructive",
        })
      } else {
        setRules(data || [])
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error de conexión al cargar las reglas",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSettings = async () => {
    try {
      const { data, error } = await settingsService.fetchSettings()
      if (error) {
        console.log("No se pudo cargar configuración:", error)
        toast({
          title: "Configuración no encontrada",
          description:
            "No se encontró configuración existente. Complete los campos y guarde para crear una nueva configuración.",
          variant: "default",
        })
      } else if (data) {
        setSettings(data)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error de conexión al cargar la configuración",
        variant: "destructive",
      })
    }
  }

  // Funciones para manejar números de contacto
  const handleAddContactNumber = () => {
    setSettings(prev => ({
      ...prev,
      numbers: [...prev.numbers, { name: "", phone: "" }]
    }))
  }

  const handleUpdateContactNumber = (index: number, field: 'name' | 'phone', value: string) => {
    setSettings(prev => ({
      ...prev,
      numbers: prev.numbers.map((number, i) =>
        i === index ? { ...number, [field]: value } : number
      )
    }))
  }

  const handleRemoveContactNumber = (index: number) => {
    setSettings(prev => ({
      ...prev,
      numbers: prev.numbers.filter((_, i) => i !== index)
    }))
  }

  const handleSaveSettings = async () => {
    try {
      let { data, error } = await settingsService.updateSettings({
        accountCBU: settings.accountCBU,
        context: settings.context,
        message: settings.message,
        accountName: settings.accountName,
        numbers: settings.numbers,
      })

      if (error) {
        console.log("Intentando crear nueva configuración...")
        const createResult = await settingsService.createSettings({
          accountCBU: settings.accountCBU,
          context: settings.context,
          message: settings.message,
          accountName: settings.accountName,
          numbers: settings.numbers,
        })

        if (createResult.error) {
          toast({
            title: "Error",
            description: createResult.error,
            variant: "destructive",
          })
          return
        }
        data = createResult.data
      }

      if (data) {
        setSettings(data)
        showSnackbar({
          type: 'success',
          title: '¡Configuración actualizada!',
          description: 'Los cambios se han guardado correctamente en el sistema',
          duration: 4000,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error de conexión al guardar la configuración",
        variant: "destructive",
      })
    }
  }

  const handleCreateRule = async () => {
    try {
      const { data, error } = await rulesService.createRule(newRule as CreateRuleData)

      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        })
      } else if (data) {
        setRules([...rules, data])
        setNewRule({
          rule: "",
          text: "",
          crm: "kommo",
          pipeline: "sales",
          priority: 1,
          status: "active",
        })
        setShowNewRuleForm(false)
        showSnackbar({
          type: 'success',
          title: '¡Regla creada exitosamente!',
          description: 'La nueva regla ha sido agregada al sistema y está lista para usar',
          duration: 5000,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error de conexión al crear la regla",
        variant: "destructive",
      })
    }
  }

  const handleUpdateRule = async (ruleId: string, updatedData: Partial<Rule>) => {
    try {
      const { data, error } = await rulesService.updateRule(ruleId, updatedData as UpdateRuleData)

      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        })
      } else if (data) {
        setRules(rules.map((rule) => (rule._id === ruleId ? data : rule)))
        setEditingRule(null)
        showSnackbar({
          type: 'success',
          title: '¡Regla actualizada!',
          description: 'Los cambios en la regla se han guardado correctamente',
          duration: 4000,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error de conexión al actualizar la regla",
        variant: "destructive",
      })
    }
  }

  const handleDeleteRule = async (ruleId: string) => {
    try {
      const { error } = await rulesService.deleteRule(ruleId)

      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        })
      } else {
        setRules(rules.filter((rule) => rule._id !== ruleId))
        toast({
          title: "Regla eliminada",
          description: "La regla se ha eliminado correctamente",
        })
        showSnackbar({
          type: 'success',
          title: '¡Regla eliminada!',
          description: 'La regla ha sido removida del sistema correctamente',
          duration: 4000,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error de conexión al eliminar la regla",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-300 border-green-500/50"
      case "inactive":
        return "bg-red-500/20 text-red-300 border-red-500/50"
      case "draft":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/50"
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/50"
    }
  }

  const getTruncatedContext = (text: string, maxLength = 150) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  return (
    <RouteGuard>
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 pt-14">
      <header className="sticky top-0 z-40 w-full border-b-2 border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 border-2 border-primary/30">
                <LucideSettings className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight">Configuración del Sistema</h1>
                <p className="text-sm text-muted-foreground">Gestiona la configuración general y las reglas del CRM</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Card className="border-2 border-border bg-card/50 backdrop-blur-sm shadow-lg">
            <CardHeader className="border-b-2 border-border/50">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5 text-blue-400" />
                Configuración General
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
            <div className="space-y-3 p-4 rounded-lg border-2 border-border/50 bg-background/50">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="accountCBU" className="text-sm font-medium">
                    Nombre de Cuenta
                  </Label>
                </div>
                <Input
                  id="accountName"
                  value={settings.accountName}
                  onChange={(e) => setSettings({ ...settings, accountName: e.target.value })}
                  placeholder="Ingresa el nombre de la cuenta"
                  className="bg-background/50 border-2 border-border/50 focus:border-primary"
                />
              </div>
              <div className="space-y-3 p-4 rounded-lg border-2 border-border/50 bg-background/50">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="accountCBU" className="text-sm font-medium">
                    CBU de Cuenta
                  </Label>
                </div>
                <Input
                  id="accountCBU"
                  value={settings.accountCBU}
                  onChange={(e) => setSettings({ ...settings, accountCBU: e.target.value })}
                  placeholder="Ingresa el CBU de la cuenta"
                  className="bg-background/50 border-2 border-border/50 focus:border-primary"
                />
              </div>


              <div className="space-y-3 p-4 rounded-lg border-2 border-border/50 bg-background/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="context" className="text-sm font-medium">
                      Contexto del Asistente IA
                    </Label>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsContextExpanded(!isContextExpanded)}
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                  >
                    {isContextExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>

                {isContextExpanded ? (
                  <Textarea
                    id="context"
                    value={settings.context}
                    onChange={(e) => setSettings({ ...settings, context: e.target.value })}
                    placeholder="Contexto para el asistente de IA especializado en clasificar mensajes"
                    className="bg-background/50 border-2 border-border/50 focus:border-primary min-h-[120px] text-slate-600 placeholder:text-slate-500"
                  />
                ) : (
                  <div
                    className="p-3 bg-background/30 border-2 border-dashed border-border/30 rounded-md cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => setIsContextExpanded(true)}
                  >
                    <p className="text-sm text-muted-foreground">
                      {settings.context ? getTruncatedContext(settings.context) : "Haz clic para agregar contexto..."}
                    </p>
                    {settings.context && settings.context.length > 150 && (
                      <p className="text-xs text-slate-500 mt-1">Haz clic para expandir y ver todo el texto</p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-3 p-4 rounded-lg border-2 border-border/50 bg-background/50">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="message" className="text-sm font-medium">
                    Mensaje de Ejemplo
                  </Label>
                </div>
                <Textarea
                  id="message"
                  value={settings.message}
                  onChange={(e) => setSettings({ ...settings, message: e.target.value })}
                  placeholder="Mensaje de ejemplo para pruebas"
                  className="bg-background/50 border-2 border-border/50 focus:border-primary min-h-[80px]"
                />
              </div>

              <div className="space-y-3 p-4 rounded-lg border-2 border-border/50 bg-background/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm font-medium">
                      Números de Contacto
                    </Label>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleAddContactNumber}
                    className="h-8 px-2 border-2 border-primary/50 hover:border-primary"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Agregar
                  </Button>
                </div>

                <div className="space-y-3">
                  {settings.numbers.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No hay números de contacto configurados
                    </p>
                  ) : (
                    settings.numbers.map((number, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 rounded-lg border border-border/50 bg-background/30">
                        <div className="flex-1 grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs text-muted-foreground mb-1 block">Nombre</Label>
                            <Input
                              value={number.name}
                              onChange={(e) => handleUpdateContactNumber(index, 'name', e.target.value)}
                              placeholder="Nombre del contacto"
                              className="h-8 bg-background/50 border-border/50"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground mb-1 block">Teléfono</Label>
                            <Input
                              value={number.phone}
                              onChange={(e) => handleUpdateContactNumber(index, 'phone', e.target.value)}
                              placeholder="Número de teléfono"
                              className="h-8 bg-background/50 border-border/50"
                            />
                          </div>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveContactNumber(index)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <Button
                onClick={handleSaveSettings}
                className="w-full md:w-auto border-2 border-primary/50 hover:border-primary"
              >
                <Save className="h-4 w-4 mr-2" />
                Guardar Configuración
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Status Section */}
        <StatusSection />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="border-2 border-border bg-card/50 backdrop-blur-sm shadow-lg">
            <CardHeader className="border-b-2 border-border/50">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Workflow className="h-5 w-5 text-orange-400" />
                  Gestión de Reglas
                  <Badge variant="secondary" className="border-2 border-orange-500/30">
                    {rules.length} reglas
                  </Badge>
                </CardTitle>
                <Button
                  onClick={() => setShowNewRuleForm(true)}
                  disabled={showNewRuleForm}
                  size="sm"
                  className="border-2 border-primary/50 hover:border-primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Regla
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {showNewRuleForm && (
                <Card className="border-2 border-dashed border-primary/50 bg-primary/5">
                  <CardContent className="pt-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Hash className="h-4 w-4 text-muted-foreground" />
                          <Label>Regla</Label>
                        </div>
                        <Textarea
                          value={newRule.rule}
                          onChange={(e) => setNewRule({ ...newRule, rule: e.target.value })}
                          placeholder="Descripción de la regla"
                          className="bg-background/50 border-2 border-border/50 focus:border-primary"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          <Label>Texto</Label>
                        </div>
                        <Input
                          value={newRule.text}
                          onChange={(e) => setNewRule({ ...newRule, text: e.target.value })}
                          placeholder="Texto de la regla"
                          className="bg-background/50 border-2 border-border/50 focus:border-primary"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <LucideSettings className="h-4 w-4 text-muted-foreground" />
                          <Label>CRM</Label>
                        </div>
                        <Input
                          value={newRule.crm}
                          onChange={(e) => setNewRule({ ...newRule, crm: e.target.value })}
                          placeholder="CRM"
                          className="bg-background/50 border-2 border-border/50 focus:border-primary"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Workflow className="h-4 w-4 text-muted-foreground" />
                          <Label>Pipeline</Label>
                        </div>
                        <Input
                          value={newRule.pipeline}
                          onChange={(e) => setNewRule({ ...newRule, pipeline: e.target.value })}
                          placeholder="Pipeline"
                          className="bg-background/50 border-2 border-border/50 focus:border-primary"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Hash className="h-4 w-4 text-muted-foreground" />
                          <Label>Prioridad</Label>
                        </div>
                        <Input
                          type="number"
                          min="0"
                          max="10"
                          value={newRule.priority}
                          onChange={(e) => setNewRule({ ...newRule, priority: Number.parseInt(e.target.value) || 1 })}
                          className="bg-background/50 border-2 border-border/50 focus:border-primary"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-muted-foreground" />
                          <Label>Status</Label>
                        </div>
                        <Select
                          value={newRule.status}
                          onValueChange={(value: "active" | "inactive" | "draft") =>
                            setNewRule({ ...newRule, status: value })
                          }
                        >
                          <SelectTrigger className="bg-background/50 border-2 border-border/50 focus:border-primary">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Activo</SelectItem>
                            <SelectItem value="inactive">Inactivo</SelectItem>
                            <SelectItem value="draft">Borrador</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleCreateRule}
                        size="sm"
                        className="border-2 border-green-500/50 hover:border-green-400"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Crear Regla
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowNewRuleForm(false)}
                        size="sm"
                        className="border-2 border-border/50"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancelar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Cargando reglas...</div>
              ) : rules.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No hay reglas configuradas</div>
              ) : (
                <div className="space-y-3">
                  {rules.map((rule) => (
                    <Card
                      key={rule._id}
                      className="border-2 border-border/50 bg-background/30 hover:border-border transition-colors"
                    >
                      <CardContent className="pt-4">
                        {editingRule === rule._id ? (
                          <EditRuleForm
                            rule={rule}
                            onSave={(updatedData) => handleUpdateRule(rule._id, updatedData)}
                            onCancel={() => setEditingRule(null)}
                          />
                        ) : (
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Badge className={`${getStatusColor(rule.status)} border-2`}>{rule.status}</Badge>
                                  <Badge variant="outline" className="border-2 border-border/50">
                                    <Hash className="h-3 w-3 mr-1" />
                                    Prioridad: {rule.priority}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <LucideSettings className="h-3 w-3" />
                                    {rule.crm} •
                                    <Workflow className="h-3 w-3 ml-1" />
                                    {rule.pipeline}
                                  </span>
                                </div>
                                <p className="text-sm font-medium">{rule.text}</p>
                                <p className="text-sm text-muted-foreground">{rule.rule}</p>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingRule(rule._id)}
                                  className="border border-transparent hover:border-border/50"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteRule(rule._id)}
                                  className="text-destructive hover:text-destructive border border-transparent hover:border-destructive/50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
    </RouteGuard>
  )
}

function EditRuleForm({
  rule,
  onSave,
  onCancel,
}: {
  rule: Rule
  onSave: (data: Partial<Rule>) => void
  onCancel: () => void
}) {
  const [editData, setEditData] = useState({
    rule: rule.rule,
    text: rule.text,
    crm: rule.crm,
    pipeline: rule.pipeline,
    priority: rule.priority,
    status: rule.status,
  })

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <Label>Regla</Label>
          </div>
          <Textarea
            value={editData.rule}
            onChange={(e) => setEditData({ ...editData, rule: e.target.value })}
            className="bg-background/50 border-2 border-border/50 focus:border-primary"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <Label>Texto</Label>
          </div>
          <Input
            value={editData.text}
            onChange={(e) => setEditData({ ...editData, text: e.target.value })}
            className="bg-background/50 border-2 border-border/50 focus:border-primary"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <LucideSettings className="h-4 w-4 text-muted-foreground" />
            <Label>CRM</Label>
          </div>
          <Input
            value={editData.crm}
            onChange={(e) => setEditData({ ...editData, crm: e.target.value })}
            className="bg-background/50 border-2 border-border/50 focus:border-primary"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Workflow className="h-4 w-4 text-muted-foreground" />
            <Label>Pipeline</Label>
          </div>
          <Input
            value={editData.pipeline}
            onChange={(e) => setEditData({ ...editData, pipeline: e.target.value })}
            className="bg-background/50 border-2 border-border/50 focus:border-primary"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <Label>Prioridad</Label>
          </div>
          <Input
            type="number"
            min="0"
            max="10"
            value={editData.priority}
            onChange={(e) => setEditData({ ...editData, priority: Number.parseInt(e.target.value) || 1 })}
            className="bg-background/50 border-2 border-border/50 focus:border-primary"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <Label>Status</Label>
          </div>
          <Select
            value={editData.status}
            onValueChange={(value: "active" | "inactive" | "draft") => setEditData({ ...editData, status: value })}
          >
            <SelectTrigger className="bg-background/50 border-2 border-border/50 focus:border-primary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Activo</SelectItem>
              <SelectItem value="inactive">Inactivo</SelectItem>
              <SelectItem value="draft">Borrador</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          onClick={() => onSave(editData)}
          size="sm"
          className="border-2 border-green-500/50 hover:border-green-400"
        >
          <Check className="h-4 w-4 mr-2" />
          Guardar
        </Button>
        <Button variant="outline" onClick={onCancel} size="sm" className="border-2 border-border/50 bg-transparent">
          <X className="h-4 w-4 mr-2" />
          Cancelar
        </Button>
      </div>
    </div>
  )
}
