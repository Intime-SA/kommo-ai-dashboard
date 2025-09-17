"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { LucideSettings, Save, Plus, Edit, Trash2, X, Check } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { rulesService, Rule, CreateRuleData, UpdateRuleData } from "@/service/rules"

interface SystemSettings {
  cbu: string
  welcomeMessage: string
  context: string
  status: string
}

export default function SettingsPage() {
  const { toast } = useToast()
  const [settings, setSettings] = useState<SystemSettings>({
    cbu: "",
    welcomeMessage: "",
    context: "",
    status: "active",
  })
  const [rules, setRules] = useState<Rule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingRule, setEditingRule] = useState<string | null>(null)
  const [newRule, setNewRule] = useState({
    rule: "",
    text: "",
    crm: "kommo",
    pipeline: "sales",
    priority: 1,
    status: "active" as "active" | "inactive" | "draft",
  })
  const [showNewRuleForm, setShowNewRuleForm] = useState(false)

  // Cargar rules desde la API
  useEffect(() => {
    fetchRules()
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

  const handleSaveSettings = async () => {
    // Aquí implementarías la llamada a tu API para guardar la configuración general
    toast({
      title: "Configuración guardada",
      description: "Los cambios se han guardado correctamente",
    })
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
        toast({
          title: "Regla creada",
          description: "La nueva regla se ha creado correctamente",
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
        toast({
          title: "Regla actualizada",
          description: "Los cambios se han guardado correctamente",
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
        return "bg-green-500/20 text-green-300 border-green-500/30"
      case "inactive":
        return "bg-red-500/20 text-red-300 border-red-500/30"
      case "draft":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 border border-primary/20">
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

      {/* Main content */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Configuración General */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LucideSettings className="h-5 w-5" />
                Configuración General
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cbu">CBU</Label>
                  <Input
                    id="cbu"
                    value={settings.cbu}
                    onChange={(e) => setSettings({ ...settings, cbu: e.target.value })}
                    placeholder="Ingresa el CBU"
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={settings.status}
                    onValueChange={(value) => setSettings({ ...settings, status: value })}
                  >
                    <SelectTrigger className="bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Activo</SelectItem>
                      <SelectItem value="inactive">Inactivo</SelectItem>
                      <SelectItem value="maintenance">Mantenimiento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="welcomeMessage">Mensaje de Bienvenida</Label>
                <Textarea
                  id="welcomeMessage"
                  value={settings.welcomeMessage}
                  onChange={(e) => setSettings({ ...settings, welcomeMessage: e.target.value })}
                  placeholder="Mensaje que se mostrará a los usuarios"
                  className="bg-background/50 min-h-[80px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="context">Contexto</Label>
                <Textarea
                  id="context"
                  value={settings.context}
                  onChange={(e) => setSettings({ ...settings, context: e.target.value })}
                  placeholder="Contexto adicional para el sistema"
                  className="bg-background/50 min-h-[100px]"
                />
              </div>
              <Button onClick={handleSaveSettings} className="w-full md:w-auto">
                <Save className="h-4 w-4 mr-2" />
                Guardar Configuración
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Gestión de Rules */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  Gestión de Reglas
                  <Badge variant="secondary">{rules.length} reglas</Badge>
                </CardTitle>
                <Button onClick={() => setShowNewRuleForm(true)} disabled={showNewRuleForm} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Regla
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Formulario para nueva regla */}
              {showNewRuleForm && (
                <Card className="border-dashed border-primary/30 bg-primary/5">
                  <CardContent className="pt-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Regla</Label>
                        <Textarea
                          value={newRule.rule}
                          onChange={(e) => setNewRule({ ...newRule, rule: e.target.value })}
                          placeholder="Descripción de la regla"
                          className="bg-background/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Texto</Label>
                        <Input
                          value={newRule.text}
                          onChange={(e) => setNewRule({ ...newRule, text: e.target.value })}
                          placeholder="Texto de la regla"
                          className="bg-background/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>CRM</Label>
                        <Input
                          value={newRule.crm}
                          onChange={(e) => setNewRule({ ...newRule, crm: e.target.value })}
                          placeholder="CRM"
                          className="bg-background/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Pipeline</Label>
                        <Input
                          value={newRule.pipeline}
                          onChange={(e) => setNewRule({ ...newRule, pipeline: e.target.value })}
                          placeholder="Pipeline"
                          className="bg-background/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Prioridad</Label>
                        <Input
                          type="number"
                          min="0"
                          max="10"
                          value={newRule.priority}
                          onChange={(e) => setNewRule({ ...newRule, priority: Number.parseInt(e.target.value) || 1 })}
                          className="bg-background/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Status</Label>
                        <Select
                          value={newRule.status}
                          onValueChange={(value: "active" | "inactive" | "draft") =>
                            setNewRule({ ...newRule, status: value })
                          }
                        >
                          <SelectTrigger className="bg-background/50">
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
                      <Button onClick={handleCreateRule} size="sm">
                        <Check className="h-4 w-4 mr-2" />
                        Crear Regla
                      </Button>
                      <Button variant="outline" onClick={() => setShowNewRuleForm(false)} size="sm">
                        <X className="h-4 w-4 mr-2" />
                        Cancelar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Lista de reglas */}
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Cargando reglas...</div>
              ) : rules.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No hay reglas configuradas</div>
              ) : (
                <div className="space-y-3">
                  {rules.map((rule) => (
                    <Card key={rule._id} className="border-border/30 bg-background/30">
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
                                <div className="flex items-center gap-2">
                                  <Badge className={getStatusColor(rule.status)}>{rule.status}</Badge>
                                  <Badge variant="outline">Prioridad: {rule.priority}</Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {rule.crm} • {rule.pipeline}
                                  </span>
                                </div>
                                <p className="text-sm font-medium">{rule.text}</p>
                                <p className="text-sm text-muted-foreground">{rule.rule}</p>
                              </div>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="sm" onClick={() => setEditingRule(rule._id)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteRule(rule._id)}
                                  className="text-destructive hover:text-destructive"
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
  )
}

// Componente para editar reglas
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
          <Label>Regla</Label>
          <Textarea
            value={editData.rule}
            onChange={(e) => setEditData({ ...editData, rule: e.target.value })}
            className="bg-background/50"
          />
        </div>
        <div className="space-y-2">
          <Label>Texto</Label>
          <Input
            value={editData.text}
            onChange={(e) => setEditData({ ...editData, text: e.target.value })}
            className="bg-background/50"
          />
        </div>
        <div className="space-y-2">
          <Label>CRM</Label>
          <Input
            value={editData.crm}
            onChange={(e) => setEditData({ ...editData, crm: e.target.value })}
            className="bg-background/50"
          />
        </div>
        <div className="space-y-2">
          <Label>Pipeline</Label>
          <Input
            value={editData.pipeline}
            onChange={(e) => setEditData({ ...editData, pipeline: e.target.value })}
            className="bg-background/50"
          />
        </div>
        <div className="space-y-2">
          <Label>Prioridad</Label>
          <Input
            type="number"
            min="0"
            max="10"
            value={editData.priority}
            onChange={(e) => setEditData({ ...editData, priority: Number.parseInt(e.target.value) || 1 })}
            className="bg-background/50"
          />
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={editData.status}
            onValueChange={(value: "active" | "inactive" | "draft") => setEditData({ ...editData, status: value })}
          >
            <SelectTrigger className="bg-background/50">
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
        <Button onClick={() => onSave(editData)} size="sm">
          <Check className="h-4 w-4 mr-2" />
          Guardar
        </Button>
        <Button variant="outline" onClick={onCancel} size="sm">
          <X className="h-4 w-4 mr-2" />
          Cancelar
        </Button>
      </div>
    </div>
  )
}
