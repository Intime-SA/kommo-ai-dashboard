"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Activity, Clock, CheckCircle2, AlertCircle, Info, Edit, Save, X, Plus, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { type Status } from "@/service/status"
import { type KommoStatus } from "@/service/kommo"
import { useToast } from "@/hooks/use-toast"
import { useServices } from "@/context/services-context"
import { formatDate } from "@/lib/utils"

export function StatusSection() {
  const { toast } = useToast()
  const { statusService, kommoService } = useServices()
  const [statuses, setStatuses] = useState<Status[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingStatus, setEditingStatus] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<Status>>({})
  const [isCreatingNew, setIsCreatingNew] = useState(false)
  const [newStatusData, setNewStatusData] = useState<Partial<Status>>({
    name: "",
    statusId: "",
    description: "",
    colors: "#3b82f6",
    kommo_id: null,
  })
  const [kommoStatuses, setKommoStatuses] = useState<KommoStatus[]>([])
  const [isLoadingKommo, setIsLoadingKommo] = useState(false)
  const [deletingStatus, setDeletingStatus] = useState<string | null>(null)

  useEffect(() => {
    fetchStatuses()
    fetchKommoStatuses()
  }, [])

  // Función para cargar los statuses de Kommo
  const fetchKommoStatuses = async () => {
    try {
      setIsLoadingKommo(true)
      const { data, error } = await kommoService.fetchAllStatuses()
      if (error) {
        console.error("Error al cargar statuses de Kommo:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los statuses de Kommo",
          variant: "destructive",
        })
      } else {
        setKommoStatuses(data || [])
      }
    } catch (error) {
      console.error("Error de conexión al cargar statuses de Kommo:", error)
      toast({
        title: "Error",
        description: "Error de conexión al cargar los statuses de Kommo",
        variant: "destructive",
      })
    } finally {
      setIsLoadingKommo(false)
    }
  }

  const fetchStatuses = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await statusService.fetchStatus()
      if (error) {
        toast({
          title: "Error",
          description: "No se pudieron cargar los status",
          variant: "destructive",
        })
      } else {
        setStatuses((data || []).map(status => ({
          ...status,
          // Unificar el campo de color: usar 'colors' como campo principal, pero mapear 'color' de la API
          colors: status.colors || status.color || "#3b82f6"
        })))
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error de conexión al cargar los status",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Función para obtener estilos dinámicos basados en colores de la API
  const getStatusStyles = (status: Status) => {
    const isDisabled = status.statusId === null
    const borderColor = status.colors ? status.colors : "#e5e7eb"
    const opacity = isDisabled ? "opacity-50" : "opacity-100"

    return {
      borderColor: borderColor,
      className: `group relative overflow-hidden rounded-xl border-2 bg-transparent backdrop-blur-sm ${opacity} hover:shadow-lg hover:shadow-black/5 transition-all duration-300 ${isDisabled ? "cursor-not-allowed" : "cursor-pointer hover:-translate-y-1"}`,
    }
  }

  const getStatusIcon = (statusId: string, color?: string) => {
    const iconStyle = { color: color || "#6b7280" }

    // Verificar si statusId existe y es una cadena válida
    if (!statusId || typeof statusId !== 'string') {
      return <Info className="h-5 w-5 drop-shadow-sm" style={iconStyle} />
    }

    if (statusId.includes("Pid")) return <Activity className="h-5 w-5 drop-shadow-sm" style={iconStyle} />
    if (statusId.includes("Revisar")) return <AlertCircle className="h-5 w-5 drop-shadow-sm" style={iconStyle} />
    if (statusId.includes("Pidio")) return <CheckCircle2 className="h-5 w-5 drop-shadow-sm" style={iconStyle} />
    return <Info className="h-5 w-5 drop-shadow-sm" style={iconStyle} />
  }

  // Función para obtener columnas dinámicas del grid
  const getGridColumns = () => {
    const count = statuses.length + (isCreatingNew ? 1 : 0)
    if (count === 0) return "grid-cols-1"
    if (count === 1) return "grid-cols-1"
    if (count === 2) return "grid-cols-1 md:grid-cols-2"
    if (count === 3) return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
    if (count === 4) return "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
    return "grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4"
  }

  // Funciones para manejar la edición
  // Función para manejar la selección de status de Kommo
  const handleKommoStatusSelect = (kommoStatusId: string, isEdit: boolean = false) => {
    const selectedKommoStatus = kommoStatuses.find(s => s.id.toString() === kommoStatusId)

    if (selectedKommoStatus) {
      const updateData = {
        statusId: selectedKommoStatus.id.toString(),
        kommo_id: selectedKommoStatus.id.toString(),
        name: selectedKommoStatus.name,
        colors: selectedKommoStatus.color,
        description: selectedKommoStatus.name,
      }

      if (isEdit) {
        setEditData(prev => ({ ...prev, ...updateData }))
      } else {
        setNewStatusData(prev => ({ ...prev, ...updateData }))
      }
    }
  }

  const handleEditStatus = (status: Status) => {
    if (status.statusId === null) return
    setEditingStatus(status._id)
    setEditData({
      name: status.name,
      statusId: status.statusId,
      description: status.description,
      colors: status.colors,
      kommo_id: status.kommo_id,
    })
  }

  const handleSaveStatus = async (statusId: string) => {
    try {
      // Preparar los datos para la API (mapear colors a color)
      const updateData = {
        ...(editData.name && { name: editData.name }),
        ...(editData.description !== undefined && { description: editData.description }),
        ...(editData.kommo_id !== undefined && { kommo_id: editData.kommo_id }),
        ...(editData.colors && { color: editData.colors }),
      }

      // Hacer la llamada a la API
      const { data, error } = await statusService.updateStatus(statusId, updateData)

      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        })
        return
      }

      // Actualizar el estado local con los datos de la API de manera más robusta
      if (data) {
        setStatuses(prevStatuses =>
          prevStatuses.map((status) => {
            if (status._id === statusId) {
              // Combinar datos existentes con datos actualizados de la API
              const updatedStatus = {
                ...status,
                ...data,
                // Asegurar que colors tenga el valor correcto (API usa 'color', local usa 'colors')
                colors: data.color || data.colors || status.colors,
                // Mantener campos que podrían no venir en la respuesta
                name: data.name || editData.name || status.name,
                description: data.description !== undefined ? data.description : (editData.description || status.description),
                kommo_id: data.kommo_id !== undefined ? data.kommo_id : (editData.kommo_id || status.kommo_id),
              }
              return updatedStatus
            }
            return status
          })
        )
      }

      setEditingStatus(null)
      setEditData({})

      toast({
        title: "Status actualizado",
        description: "Los cambios han sido guardados correctamente",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el status",
        variant: "destructive",
      })
    }
  }

  const handleCancelEdit = () => {
    setEditingStatus(null)
    setEditData({})
  }

  const handleCreateNew = () => {
    setIsCreatingNew(true)
    setNewStatusData({
      name: "",
      statusId: "",
      description: "",
      colors: "#3b82f6",
    })
  }

  const handleSaveNewStatus = async () => {
    try {
      // Preparar los datos para la API
      const createData = {
        statusId: newStatusData.statusId || "",
        name: newStatusData.name || "",
        description: newStatusData.description || "",
        ...(newStatusData.colors && { color: newStatusData.colors }),
      }

      // Hacer la llamada a la API
      const { data, error } = await statusService.createStatus(createData)

      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        })
        return
      }

      // Actualizar el estado local con los datos de la API de manera más robusta
      if (data) {
        const newStatus: Status = {
          ...data,
          // Asegurar que colors tenga el valor correcto (API usa 'color', local usa 'colors')
          colors: data.color || data.colors || newStatusData.colors,
          // Mantener campos que podrían no venir en la respuesta completa
          name: data.name || newStatusData.name || "",
          description: data.description || newStatusData.description || "",
          statusId: data.statusId || newStatusData.statusId || "",
          kommo_id: data.kommo_id !== undefined ? data.kommo_id : null,
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
        }
        setStatuses(prevStatuses => [...prevStatuses, newStatus])
      }

      setIsCreatingNew(false)
      setNewStatusData({
        name: "",
        statusId: "",
        description: "",
        colors: "#3b82f6",
      })

      toast({
        title: "Status creado",
        description: "El nuevo status ha sido creado correctamente",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear el status",
        variant: "destructive",
      })
    }
  }

  const handleCancelNewStatus = () => {
    setIsCreatingNew(false)
    setNewStatusData({
      name: "",
      statusId: "",
      description: "",
      colors: "#3b82f6",
    })
  }

  const handleDeleteStatus = async (statusId: string) => {
    try {
      // Hacer la llamada a la API para eliminar
      const { data, error } = await statusService.deleteStatus(statusId)

      if (error) {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        })
        return
      }

      // Si la eliminación fue exitosa, actualizar el estado local
      if (data) {
        setStatuses(statuses.filter(status => status._id !== statusId))
      }

      setDeletingStatus(null)

      toast({
        title: "Status eliminado",
        description: "El status ha sido eliminado correctamente",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el status",
        variant: "destructive",
      })
    }
  }




  if (isLoading) {
    return (
      <Card className="border-2 border-border/20 bg-card/30 backdrop-blur-md shadow-xl">
        <CardHeader className="border-b border-border/20 bg-gradient-to-r from-background/50 to-background/30">
          <CardTitle className="flex items-center gap-3 text-xl font-bold">
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <Activity className="h-6 w-6 text-blue-500" />
            </div>
            Estados del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-8">
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-lg font-medium">Cargando estados...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
    >
      <Card className="border-2 border-border/20 bg-card/30 backdrop-blur-md shadow-xl">
        <CardHeader className="border-b border-border/20 bg-gradient-to-r from-background/50 to-background/30 p-3 md:p-6">
          {/* Desktop Header */}
          <div className="hidden md:flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-xl font-bold">
              <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <Activity className="h-6 w-6 text-blue-500" />
              </div>
            Estados del Sistema
              <Badge
                variant="secondary"
                className="border border-blue-500/30 bg-blue-500/10 text-blue-700 font-semibold"
              >
              {statuses.length} estados
            </Badge>
          </CardTitle>
            <Button
              onClick={handleCreateNew}
              disabled={isCreatingNew}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Crear Estado
            </Button>
          </div>

          {/* Mobile Header */}
          <div className="flex md:hidden items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <Activity className="h-5 w-5 text-blue-500" />
              </div>
              <Badge
                variant="secondary"
                className="border border-blue-500/30 bg-blue-500/10 text-blue-700 font-semibold text-xs px-2 py-1"
              >
                {statuses.length}
              </Badge>
            </div>
            <Button
              onClick={handleCreateNew}
              disabled={isCreatingNew}
              size="sm"
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 h-8 w-8 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-8">
          {statuses.length === 0 && !isCreatingNew ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <div className="p-4 rounded-full bg-muted/50 mb-4">
                <Activity className="h-8 w-8" />
              </div>
              <p className="text-lg font-medium mb-2">No hay estados configurados</p>
              <p className="text-sm">Crea tu primer estado para comenzar</p>
            </div>
          ) : (
            <div className={`grid ${getGridColumns()} gap-6`}>
              {statuses.map((status, index) => {
                const styles = getStatusStyles(status)
                const isEditing = editingStatus === status._id

                return (
                <motion.div
                  key={status._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                    className={`${styles.className} min-h-[280px]`}
                    style={{
                      borderColor: styles.borderColor,
                    }}
                  >
                    <div
                      className="absolute inset-0 opacity-5 rounded-xl"
                      style={{
                        background: `linear-gradient(135deg, ${status.colors || "#e5e7eb"}, transparent)`,
                      }}
                    />

                    <div className="relative p-6 flex flex-col h-full">
                      {isEditing ? (
                        <div className="space-y-4 flex flex-col h-full">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-lg text-foreground">Editar Status</h3>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleSaveStatus(status._id)}
                                className="bg-green-500 hover:bg-green-600 text-white h-8 px-3"
                              >
                                <Save className="h-3 w-3 mr-1" />
                                Guardar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancelEdit}
                                className="h-8 px-3 bg-transparent"
                              >
                                <X className="h-3 w-3 mr-1" />
                                Cancelar
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-3 flex-1">
                            <div>
                              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                                Status de Kommo *
                              </label>
                              <Select
                                value={editData.statusId || ""}
                                onValueChange={(value) => handleKommoStatusSelect(value, true)}
                              >
                                <SelectTrigger className="bg-background/50 border-border/50">
                                  <SelectValue placeholder="Selecciona un status de Kommo" />
                                </SelectTrigger>
                                <SelectContent>
                                  {isLoadingKommo ? (
                                    <SelectItem value="loading" disabled>
                                      Cargando statuses...
                                    </SelectItem>
                                  ) : (() => {
                                    // Filtrar status de Kommo que ya están asociados
                                    const availableKommoStatuses = kommoStatuses.filter(kommoStatus =>
                                      !statuses.some(status => status.statusId === kommoStatus.id.toString())
                                    )
                                    console.log(statuses, "statuses")
                                    console.log(availableKommoStatuses, "availableKommoStatuses"    )

                                    return availableKommoStatuses.length === 0 ? (
                                      <SelectItem value="empty" disabled>
                                        No hay statuses disponibles (todos ya están asociados)
                                      </SelectItem>
                                    ) : (
                                      availableKommoStatuses.map((kommoStatus) => (
                                        <SelectItem
                                          key={kommoStatus.id}
                                          value={kommoStatus.id.toString()}
                                        >
                                          <div className="flex items-center gap-2">
                                            <div
                                              className="w-3 h-3 rounded-full border"
                                              style={{ backgroundColor: kommoStatus.color, borderColor: kommoStatus.color }}
                                            />
                                            {kommoStatus.name} (ID: {kommoStatus.id})
                                          </div>
                                        </SelectItem>
                                      ))
                                    )
                                  })()}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-muted-foreground mb-1 block">Nombre</label>
                              <Input
                                value={editData.name || ""}
                                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                placeholder="Nombre del status"
                                className="bg-background/50 border-border/50"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                                ID del Status
                              </label>
                              <Input
                                value={editData.statusId || ""}
                                onChange={(e) => setEditData({ ...editData, statusId: e.target.value })}
                                placeholder="ID del status"
                                className="bg-background/50 border-border/50"
                                disabled
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-muted-foreground mb-1 block">Color</label>
                              <div className="flex gap-2">
                                <Input
                                  type="color"
                                  value={editData.colors || "#3b82f6"}
                                  onChange={(e) => setEditData({ ...editData, colors: e.target.value })}
                                  className="w-12 h-10 p-1 bg-background/50 border-border/50"
                                />
                                <Input
                                  value={editData.colors || ""}
                                  onChange={(e) => setEditData({ ...editData, colors: e.target.value })}
                                  placeholder="#3b82f6"
                                  className="flex-1 bg-background/50 border-border/50"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                                Descripción
                              </label>
                              <Textarea
                                value={editData.description || ""}
                                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                                placeholder="Descripción del status"
                                className="bg-background/50 border-border/50 min-h-[80px] resize-none"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Contenido principal con flex-grow para ocupar espacio disponible */}
                          <div className="flex flex-col flex-1">
                            {/* Header del status */}
                            <div className="flex items-start gap-4 mb-4">
                              <div
                                className="p-3 rounded-xl shadow-sm"
                                style={{
                                  backgroundColor: `${status.colors}15`,
                                  border: `1px solid ${status.colors}30`,
                                }}
                              >
                                {getStatusIcon(status.statusId, status.colors)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-lg text-foreground mb-1 truncate">{status.name}</h3>
                                <Badge
                                  variant="outline"
                                  className="text-xs font-medium"
                                  style={{
                                    borderColor: status.colors,
                                    color: status.colors,
                                    backgroundColor: `${status.colors}10`,
                                  }}
                                >
                                  {status.statusId}
                                </Badge>
                              </div>
                            </div>

                            {/* Descripción */}
                            {status.description && (
                              <p className="text-sm text-muted-foreground mb-4 leading-relaxed line-clamp-3 flex-1">
                                {status.description}
                              </p>
                            )}

                            {/* Información de fecha y hora - ahora parte del contenido principal */}
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                              <Clock className="h-3 w-3" />
                              <span>{formatDate(status.createdAt)}</span>
                            </div>
                          </div>

                          {/* Botones al extremo inferior */}
                          <div className="flex items-center justify-between mt-auto">
                            {status.statusId === null && (
                              <Badge
                                variant="secondary"
                                className="text-xs bg-red-500/10 text-red-600 border-red-500/20"
                              >
                                Deshabilitado
                              </Badge>
                            )}
                            <div className="flex gap-1 ml-auto">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditStatus(status)}
                                disabled={status.statusId === null}
                                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-8 w-8 p-0 hover:bg-background/50"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-8 w-8 p-0 hover:bg-red-500/10 hover:text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>¿Eliminar Status?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      ¿Estás seguro de que quieres eliminar el status "{status.name}"? Esta acción no se puede deshacer.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteStatus(status._id)}
                                      className="bg-red-500 hover:bg-red-600 text-white"
                                    >
                                      Eliminar
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>

                          {/* Indicador visual mejorado */}
                          <div
                            className="absolute top-4 right-4 w-3 h-3 rounded-full shadow-sm"
                            style={{
                              backgroundColor: status.colors || "#e5e7eb",
                              boxShadow: `0 0 0 2px ${status.colors}20`,
                            }}
                          />
                        </>
                      )}
                    </div>
                  </motion.div>
                )
              })}

              {isCreatingNew && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="group relative overflow-hidden rounded-xl border-2 border-dashed border-blue-500/50 bg-transparent backdrop-blur-sm hover:border-blue-500 transition-all duration-300 min-h-[280px]"
                >
                  <div className="absolute inset-0 opacity-5 rounded-xl bg-gradient-to-br from-blue-500 to-transparent" />

                  <div className="relative p-6 flex flex-col h-full">
                    <div className="space-y-4 flex flex-col h-full">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-lg text-foreground">Crear Nuevo Status</h3>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={handleSaveNewStatus}
                            disabled={!newStatusData.name || !newStatusData.statusId}
                            className="bg-blue-500 hover:bg-blue-600 text-white h-8 px-3"
                          >
                            <Save className="h-3 w-3 mr-1" />
                            Crear
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelNewStatus}
                            className="h-8 px-3 bg-transparent"
                          >
                            <X className="h-3 w-3 mr-1" />
                            Cancelar
                          </Button>
                        </div>
                      </div>

                       <div className="space-y-3 flex-1">
                         <div>
                           <label className="text-xs font-medium text-muted-foreground mb-1 block">
                             Status de Kommo *
                           </label>
                           <Select
                             value={newStatusData.statusId || ""}
                             onValueChange={(value) => handleKommoStatusSelect(value, false)}
                           >
                             <SelectTrigger className="bg-background/50 border-border/50">
                               <SelectValue placeholder="Selecciona un status de Kommo" />
                             </SelectTrigger>
                             <SelectContent>
                               {isLoadingKommo ? (
                                 <SelectItem value="loading" disabled>
                                   Cargando statuses...
                                 </SelectItem>
                               ) : (() => {
                                 // Filtrar status de Kommo que ya están asociados
                                 const availableKommoStatuses = kommoStatuses.filter(kommoStatus =>
                                   !statuses.some(status => status.statusId === kommoStatus.id.toString())
                                 )

                                 return availableKommoStatuses.length === 0 ? (
                                   <SelectItem value="empty" disabled>
                                     No hay statuses disponibles (todos ya están asociados)
                                   </SelectItem>
                                 ) : (
                                   availableKommoStatuses.map((kommoStatus) => (
                                     <SelectItem
                                       key={kommoStatus.id}
                                       value={kommoStatus.id.toString()}
                                     >
                                       <div className="flex items-center gap-2">
                                         <div
                                           className="w-3 h-3 rounded-full border"
                                           style={{ backgroundColor: kommoStatus.color, borderColor: kommoStatus.color }}
                                         />
                                         {kommoStatus.name} (ID: {kommoStatus.id})
                                       </div>
                                     </SelectItem>
                                   ))
                                 )
                               })()}
                             </SelectContent>
                           </Select>
                         </div>
                         <div>
                           <label className="text-xs font-medium text-muted-foreground mb-1 block">Nombre</label>
                           <Input
                             value={newStatusData.name || ""}
                             onChange={(e) => setNewStatusData({ ...newStatusData, name: e.target.value })}
                             placeholder="Nombre del status"
                             className="bg-background/50 border-border/50"
                           />
                         </div>
                         <div>
                           <label className="text-xs font-medium text-muted-foreground mb-1 block">
                             ID del Status
                           </label>
                           <Input
                             value={newStatusData.statusId || ""}
                             onChange={(e) => setNewStatusData({ ...newStatusData, statusId: e.target.value })}
                             placeholder="ID del status"
                             className="bg-background/50 border-border/50"
                             disabled
                           />
                         </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground mb-1 block">Color</label>
                          <div className="flex gap-2">
                            <Input
                              type="color"
                              value={newStatusData.colors || "#3b82f6"}
                              onChange={(e) => setNewStatusData({ ...newStatusData, colors: e.target.value })}
                              className="w-12 h-10 p-1 bg-background/50 border-border/50"
                            />
                            <Input
                              value={newStatusData.colors || ""}
                              onChange={(e) => setNewStatusData({ ...newStatusData, colors: e.target.value })}
                              placeholder="#3b82f6"
                              className="flex-1 bg-background/50 border-border/50"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground mb-1 block">Descripción</label>
                          <Textarea
                            value={newStatusData.description || ""}
                            onChange={(e) => setNewStatusData({ ...newStatusData, description: e.target.value })}
                            placeholder="Descripción del status"
                            className="bg-background/50 border-border/50 min-h-[80px] resize-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
