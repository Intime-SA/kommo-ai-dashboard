import { configureStore } from "@reduxjs/toolkit"
import logsReducer from "./features/logs/logsSlice"
import filtersReducer from "./features/logs/filtersSlice"
import usersReducer from "./features/logs/usersSlice"
import dateReducer from "./features/logs/dateSlice"

export const store = configureStore({
  reducer: {
    logs: logsReducer,
    filters: filtersReducer,
    users: usersReducer,
    date: dateReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
