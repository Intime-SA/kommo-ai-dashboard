import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface RegisteredUser {
  _id: string
  name: string
  username: string
  phone: string
  email: string
  channel: string
  password: string
  status: string
  botNum: number
  botUrl: string
  createAt: string
  updatedAt?: string
  numberRedirect?: string
  redirectAgentId?: number
  errorMessage?: string
}

export interface UsersPagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface UsersFilters {
  status?: string
  channel?: string
}

export interface UsersState {
  users: RegisteredUser[]
  pagination: UsersPagination | null
  filters: UsersFilters
  loading: boolean
  error: string | null
  initialized: boolean
}

const initialState: UsersState = {
  users: [],
  pagination: null,
  filters: {},
  loading: false,
  error: null,
  initialized: false,
}

export const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setUsers: (state, action: PayloadAction<{ users: RegisteredUser[], pagination: UsersPagination }>) => {
      state.users = action.payload.users
      state.pagination = action.payload.pagination
      state.loading = false
      state.error = null
      state.initialized = true
    },
    setUsersLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
      if (action.payload) {
        state.error = null
      }
    },
    setUsersError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
      state.loading = false
    },
    setUsersPage: (state, action: PayloadAction<number>) => {
      if (state.pagination) {
        state.pagination.page = action.payload
      }
    },
    setUsersLimit: (state, action: PayloadAction<number>) => {
      if (state.pagination) {
        state.pagination.limit = action.payload
        state.pagination.page = 1 // Reset to first page when changing limit
      }
    },
    setUsersFilters: (state, action: PayloadAction<UsersFilters>) => {
      state.filters = { ...state.filters, ...action.payload }
      if (state.pagination) {
        state.pagination.page = 1 // Reset to first page when applying filters
      }
    },
    clearUsersFilters: (state) => {
      state.filters = {}
      if (state.pagination) {
        state.pagination.page = 1
      }
    },
    resetUsersState: (state) => {
      state.users = []
      state.pagination = null
      state.filters = {}
      state.loading = false
      state.error = null
      state.initialized = false
    },
  },
})

export const {
  setUsers,
  setUsersLoading,
  setUsersError,
  setUsersPage,
  setUsersLimit,
  setUsersFilters,
  clearUsersFilters,
  resetUsersState,
} = usersSlice.actions

export default usersSlice.reducer
