import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import type { LogEntry, LogsQueryParams, LogType } from "@/service/logs"

// Async thunk for fetching logs
export const fetchLogs = createAsyncThunk("logs/fetchLogs", async (params: LogsQueryParams, { rejectWithValue }) => {
  try {
    const { logsService } = await import("@/service/logs")
    const result = await logsService.getLogs(params)

    if (result.error) {
      return rejectWithValue(result.error)
    }

    return result.data
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : "Unknown error")
  }
})

// Async thunk for fetching next page (infinite scroll)
export const fetchNextPage = createAsyncThunk("logs/fetchNextPage", async (_, { getState, rejectWithValue }) => {
  try {
    const state = getState() as { logs: LogsState }
    const { filters, pagination, sorting } = state.logs

    const params: LogsQueryParams = {
      ...filters,
      limit: pagination.limit,
      offset: pagination.offset + pagination.limit,
      sortBy: sorting.sortBy,
      sortOrder: sorting.sortOrder,
    }

    const { logsService } = await import("@/service/logs")
    const result = await logsService.getLogs(params)

    if (result.error) {
      return rejectWithValue(result.error)
    }

    return result.data
  } catch (error) {
    return rejectWithValue(error instanceof Error ? error.message : "Unknown error")
  }
})

interface LogsState {
  logs: LogEntry[]
  total: number
  isLoading: boolean
  error: string | null
  hasMore: boolean
  selectedIds: number[] // Changed from string[] to number[] to use API index
  idMap: Record<number, string> // Maps index to database id for traceability

  // Filters
  filters: {
    logType?: LogType
    contactId?: string
    leadId?: string
    userName?: string
    clientId?: string
    sourceName?: string
    status?: string
    changedBy?: "bot" | "manual" | "system"
    startDate?: string
    endDate?: string
    searchTerm?: string
  }

  // Pagination
  pagination: {
    limit: number
    offset: number
    currentPage: number
  }

  // Sorting
  sorting: {
    sortBy: "timestamp" | "userName" | "contactId" | "type" | "leadId"
    sortOrder: "asc" | "desc"
  }

  // Search
  searchTerm: string
}

const initialState: LogsState = {
  logs: [],
  total: 0,
  isLoading: false,
  error: null,
  hasMore: false,
  selectedIds: [], // Now number[] instead of string[]
  idMap: {}, // Maps index to database id for traceability

  filters: {},

  pagination: {
    limit: 50,
    offset: 0,
    currentPage: 1,
  },

  sorting: {
    sortBy: "timestamp",
    sortOrder: "desc",
  },

  searchTerm: "",
}

const logsSlice = createSlice({
  name: "logs",
  initialState,
  reducers: {
    // Filter actions
    setLogTypeFilter: (state, action: PayloadAction<LogType | undefined>) => {
      state.filters.logType = action.payload
      state.pagination.offset = 0
      state.pagination.currentPage = 1
    },

    setContactIdFilter: (state, action: PayloadAction<string>) => {
      state.filters.contactId = action.payload || undefined
      state.pagination.offset = 0
      state.pagination.currentPage = 1
    },

    setLeadIdFilter: (state, action: PayloadAction<string>) => {
      state.filters.leadId = action.payload || undefined
      state.pagination.offset = 0
      state.pagination.currentPage = 1
    },

    setUserNameFilter: (state, action: PayloadAction<string>) => {
      state.filters.userName = action.payload || undefined
      state.pagination.offset = 0
      state.pagination.currentPage = 1
    },

    setClientIdFilter: (state, action: PayloadAction<string>) => {
      state.filters.clientId = action.payload || undefined
      state.pagination.offset = 0
      state.pagination.currentPage = 1
    },

    setSearchTermFilter: (state, action: PayloadAction<string>) => {
      state.filters.searchTerm = action.payload || undefined
      state.pagination.offset = 0
      state.pagination.currentPage = 1
    },

    setDateRangeFilter: (state, action: PayloadAction<{ startDate?: string; endDate?: string }>) => {
      state.filters.startDate = action.payload.startDate
      state.filters.endDate = action.payload.endDate
      state.pagination.offset = 0
      state.pagination.currentPage = 1
    },

    clearFilters: (state) => {
      state.filters = {}
      state.pagination.offset = 0
      state.pagination.currentPage = 1
    },

    // Pagination actions
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.currentPage = action.payload
      state.pagination.offset = (action.payload - 1) * state.pagination.limit
    },

    setPageSize: (state, action: PayloadAction<number>) => {
      state.pagination.limit = action.payload
      state.pagination.offset = 0
      state.pagination.currentPage = 1
    },

    // Sorting actions
    setSorting: (
      state,
      action: PayloadAction<{ sortBy: LogsState["sorting"]["sortBy"]; sortOrder: LogsState["sorting"]["sortOrder"] }>,
    ) => {
      state.sorting = action.payload
      state.pagination.offset = 0
      state.pagination.currentPage = 1
    },

    // Selection actions
    toggleSelection: (state, action: PayloadAction<number>) => {
      const index = action.payload
      const selectedIndex = state.selectedIds.indexOf(index)
      if (selectedIndex > -1) {
        state.selectedIds.splice(selectedIndex, 1)
      } else {
        state.selectedIds.push(index)
      }
    },

    selectAll: (state) => {
      state.selectedIds = state.logs.map((log) => log.index)
      // Update idMap for traceability
      state.idMap = {}
      state.logs.forEach((log) => {
        state.idMap[log.index] = log.id
      })
    },

    clearSelection: (state) => {
      state.selectedIds = []
    },

    // Helper to get database ID from index (this is not a reducer, just a utility)
    // Note: This should be used with useSelector or called directly from the store

    // Search
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload
    },

    // Clear error
    clearError: (state) => {
      state.error = null
    },
  },

  extraReducers: (builder) => {
    builder
      // Fetch logs
      .addCase(fetchLogs.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchLogs.fulfilled, (state, action) => {
        state.isLoading = false
        if (action.payload) {
          state.logs = action.payload.logs
          state.total = action.payload.total
          state.hasMore = action.payload.hasMore
          // Update idMap for traceability
          state.idMap = {}
          action.payload.logs.forEach((log) => {
            state.idMap[log.index] = log.id
          })
        }
      })
      .addCase(fetchLogs.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      // Fetch next page
      .addCase(fetchNextPage.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchNextPage.fulfilled, (state, action) => {
        state.isLoading = false
        if (action.payload) {
          state.logs = [...state.logs, ...action.payload.logs]
          state.total = action.payload.total
          state.hasMore = action.payload.hasMore
          state.pagination.offset += state.pagination.limit
          // Update idMap for new logs
          action.payload.logs.forEach((log) => {
            state.idMap[log.index] = log.id
          })
        }
      })
      .addCase(fetchNextPage.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const {
  setLogTypeFilter,
  setContactIdFilter,
  setLeadIdFilter,
  setUserNameFilter,
  setClientIdFilter,
  setDateRangeFilter,
  clearFilters,
  setPage,
  setSorting,
  toggleSelection,
  selectAll,
  clearSelection,
  setSearchTerm,
  clearError,
  setPageSize,
  setSearchTermFilter,
} = logsSlice.actions

export default logsSlice.reducer

// Helper function to get database ID from index
export const getIdFromIndex = (idMap: Record<number, string>, index: number): string => {
  return idMap[index] || ""
}
