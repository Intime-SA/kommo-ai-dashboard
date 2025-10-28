import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface DateState {
  startDate: string | null // ISO string en UTC
  endDate: string | null // ISO string en UTC
  isEnabled: boolean
}

const initialState: DateState = {
  startDate: null,
  endDate: null,
  isEnabled: true,
}

// Función helper para convertir fecha a ISO string UTC
export const convertToUTCISOString = (date: Date): string => {
  return date.toISOString()
}

// Función helper para convertir ISO string UTC a fecha local para mostrar
export const convertFromUTCISOString = (isoString: string): Date => {
  return new Date(isoString)
}

export const dateSlice = createSlice({
  name: 'date',
  initialState,
  reducers: {
    setStartDate: (state, action: PayloadAction<string | null>) => {
      state.startDate = action.payload
    },
    setEndDate: (state, action: PayloadAction<string | null>) => {
      state.endDate = action.payload
    },
    setDateRange: (state, action: PayloadAction<{ startDate: string | null, endDate: string | null }>) => {
      state.startDate = action.payload.startDate
      state.endDate = action.payload.endDate
    },
    setDateEnabled: (state, action: PayloadAction<boolean>) => {
      state.isEnabled = action.payload
      if (!action.payload) {
        state.startDate = null
        state.endDate = null
      }
    },
    clearDateFilter: (state) => {
      state.startDate = null
      state.endDate = null
      state.isEnabled = true
    },
  },
})

export const {
  setStartDate,
  setEndDate,
  setDateRange,
  setDateEnabled,
  clearDateFilter,
} = dateSlice.actions

export default dateSlice.reducer
