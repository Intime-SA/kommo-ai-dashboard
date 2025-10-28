"use client"

import * as React from "react"
import { CalendarIcon, X } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useSelector, useDispatch } from "react-redux"
import type { RootState } from "@/lib/store"
import { setDateRange, setDateEnabled, clearDateFilter } from "@/lib/features/logs/dateSlice"
import { convertFromUTCISOString } from "@/lib/features/logs/dateSlice"

export function DateTimePicker() {
  const dispatch = useDispatch()
  const { startDate, endDate, isEnabled } = useSelector((state: RootState) => state.date)


  // Estados locales para el manejo del calendario
  const [startDateTime, setStartDateTime] = React.useState<Date | undefined>(
    startDate ? convertFromUTCISOString(startDate) : undefined
  )
  const [endDateTime, setEndDateTime] = React.useState<Date | undefined>(
    endDate ? convertFromUTCISOString(endDate) : undefined
  )
  const [startTime, setStartTime] = React.useState<string>("00:00")
  const [endTime, setEndTime] = React.useState<string>("23:59")
  const [isDialogOpen, setIsDialogOpen] = React.useState<boolean>(false)

  // Actualizar estados locales cuando cambian las fechas del store
  React.useEffect(() => {
    if (startDate) {
      const date = convertFromUTCISOString(startDate)
      setStartDateTime(date)
      setStartTime("00:00") // Siempre mostrar 00:00 aunque se envíe como 00:00:00.000Z
    } else {
      setStartDateTime(undefined)
      setStartTime("00:00")
    }

    if (endDate) {
      const date = convertFromUTCISOString(endDate)
      setEndDateTime(date)
      setEndTime("23:59") // Siempre mostrar 23:59 aunque se envíe como 23:59:59.999Z
    } else {
      setEndDateTime(undefined)
      setEndTime("23:59")
    }
  }, [startDate, endDate])

  const handleToggle = (enabled: boolean) => {
    dispatch(setDateEnabled(enabled))
  }

  const handleDateSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (range?.from && range?.to) {
      setStartDateTime(range.from)
      setEndDateTime(range.to)
      if (!startTime) setStartTime("00:00")
      if (!endTime) setEndTime("23:59")
    } else if (range?.from) {
      setStartDateTime(range.from)
      setEndDateTime(undefined)
      if (!startTime) setStartTime("00:00")
    } else {
      setStartDateTime(undefined)
      setEndDateTime(undefined)
    }
  }

  const handleTimeChange = (type: "start" | "end", time: string) => {
    if (type === "start") {
      setStartTime(time)
    } else {
      setEndTime(time)
    }
  }

  const applyDateTimeSelection = () => {
    let finalStartDate: string | null = null
    let finalEndDate: string | null = null

    // Aplicar fecha de inicio siempre a las 03:00:00.000Z
    if (startDateTime) {
      const dateWithTime = new Date(startDateTime)
      dateWithTime.setUTCHours(0, 0, 0, 0)
      finalStartDate = dateWithTime.toISOString()
    }

    // Aplicar fecha de fin siempre a las 23:59:59.999Z
    if (endDateTime) {
      const dateWithTime = new Date(endDateTime)
      dateWithTime.setUTCHours(23, 59, 59, 999)
      finalEndDate = dateWithTime.toISOString()
    }

    dispatch(setDateRange({ startDate: finalStartDate, endDate: finalEndDate }))
    setIsDialogOpen(false)
  }

  const handleClear = () => {
    dispatch(clearDateFilter())
    setStartDateTime(undefined)
    setEndDateTime(undefined)
    setStartTime("00:00")
    setEndTime("23:59")
    setIsDialogOpen(false)
  }

  const formatDateRange = () => {
    if (!startDate && !endDate) return null

    const start = startDate ? format(new Date(convertFromUTCISOString(startDate).getTime() + 3 * 60 * 60 * 1000), "dd/MM/yyyy", { locale: es }) : null
    const end = endDate ? format(new Date(convertFromUTCISOString(endDate).getTime() + 3 * 60 * 60 * 1000), "dd/MM/yyyy", { locale: es }) : null

    if (start && end) {
      return `${start} - ${end}`
    } else if (start) {
      return `Desde ${start}`
    } else if (end) {
      return `Hasta ${end}`
    }

    return null
  }

  return (
    <div className="flex items-center gap-4 p-4 border border-border/40 rounded-lg bg-card/50 backdrop-blur-sm">
      

      {isEnabled && (
        <div className="flex items-center gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[280px] justify-start text-left font-normal border-border/40 bg-background/50 hover:bg-background/80 text-foreground",
                  !startDate && !endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                {startDate || endDate ? (
                  <span className="truncate">{formatDateRange()}</span>
                ) : (
                  <span>Seleccionar rango de fechas</span>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-card border-border/40">
              <DialogHeader>
                <DialogTitle className="text-foreground">Seleccionar rango de fechas</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Calendar
                  mode="range"
                  selected={{
                    from: startDateTime,
                    to: endDateTime,
                  }}
                  onSelect={handleDateSelect}
                  numberOfMonths={2}
                  locale={es}
                  className="rounded-md border-0 bg-transparent"
                />

                <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClear}
                    className="border-border/40"
                  >
                    Limpiar
                  </Button>
                  <Button
                    size="sm"
                    onClick={applyDateTimeSelection}
                    disabled={!startDateTime && !endDateTime}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Aplicar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {(startDate || endDate) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

<div className="flex items-center gap-2">
        <Switch
          id="date-filter"
          checked={isEnabled}
          onCheckedChange={handleToggle}
          className="data-[state=checked]:bg-primary"
        />
        <Label htmlFor="date-filter" className="text-sm font-medium text-foreground">
          Filtrar por rango de fechas
        </Label>
      </div>
    </div>
  )
}
