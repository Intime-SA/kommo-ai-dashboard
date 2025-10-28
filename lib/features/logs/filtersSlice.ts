import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface FiltersState {
  activeView: 'users' | 'transfers'
  searchTerm: string
  statusFilter: string
  page: number
  limit: number
}

const initialState: FiltersState = {
  activeView: 'transfers',
  searchTerm: '',
  statusFilter: 'all',
  page: 1,
  limit: 10,
}

export const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setActiveView: (state, action: PayloadAction<'users' | 'transfers'>) => {
      state.activeView = action.payload
      state.page = 1 // Reset page when switching views
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload
      state.page = 1 // Reset page when searching
    },
    setStatusFilter: (state, action: PayloadAction<string>) => {
      state.statusFilter = action.payload
      state.page = 1 // Reset page when filtering
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload
    },
    setLimit: (state, action: PayloadAction<number>) => {
      state.limit = action.payload
      state.page = 1 // Reset page when changing limit
    },
    resetFilters: (state) => {
      state.searchTerm = ''
      state.statusFilter = 'all'
      state.page = 1
    },
  },
})

export const {
  setActiveView,
  setSearchTerm,
  setStatusFilter,
  setPage,
  setLimit,
  resetFilters,
} = filtersSlice.actions

export default filtersSlice.reducer
