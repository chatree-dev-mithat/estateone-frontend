// Third-party Imports
import { configureStore } from '@reduxjs/toolkit'

// Template Slice Imports
import chatReducer from '@/redux-store/slices/chat'
import calendarReducer from '@/redux-store/slices/calendar'
import kanbanReducer from '@/redux-store/slices/kanban'
import emailReducer from '@/redux-store/slices/email'

// PMS Slice Imports
import configReducer from '@/redux-store/slices/pms/configSlice'
import pmsUsersReducer from '@/redux-store/slices/pms/usersSlice'
import masterReducer from '@/redux-store/slices/pms/masterSlice'
import businessReducer from '@/redux-store/slices/pms/businessSlice'

export const store = configureStore({
  reducer: {
    // Template
    chatReducer,
    calendarReducer,
    kanbanReducer,
    emailReducer,
    // PMS
    config: configReducer,
    pmsUsers: pmsUsersReducer,
    master: masterReducer,
    business: businessReducer,
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware({ serializableCheck: false })
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
