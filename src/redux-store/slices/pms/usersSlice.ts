import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import apiClient from '@/utils/api/axios'

// ---------- Types ----------
export interface PmsUser {
  id: number
  name: string
  email: string
  userPhone: string
  status: string
  lockFlag: string
  effectiveDate: string
  expiredDate: string
  workGroups: WorkGroup[]
}

export interface WorkGroup {
  id: number
  code: string
  name: string
  description: string
  status: string
}

export interface MenuPermission {
  menuId: number
  menuCode: string
  menuName: string
  canRead: boolean
  canWrite: boolean
  canDelete: boolean
}

interface Meta { page: number; limit: number; total: number }

interface UsersState {
  users:       { data: PmsUser[]; meta: Meta; loading: boolean; error: string | null }
  workGroups:  { data: WorkGroup[]; meta: Meta; loading: boolean; error: string | null }
  permissions: { data: MenuPermission[]; loading: boolean; error: string | null }
}

const initialMeta: Meta = { page: 1, limit: 20, total: 0 }

// ---------- Thunks ----------
export const fetchUsers = createAsyncThunk('users/fetchAll', async (params?: Record<string, any>) => {
  const res = await apiClient.get('/users', { params })
  return res.data
})

export const fetchWorkGroups = createAsyncThunk('users/fetchWorkGroups', async (params?: Record<string, any>) => {
  const res = await apiClient.get('/work-groups', { params })
  return res.data
})

export const fetchWorkGroupPermissions = createAsyncThunk('users/fetchPermissions', async (workGroupId: number) => {
  const res = await apiClient.get(`/work-groups/${workGroupId}/permissions`)
  return res.data
})

// ---------- Slice ----------
const usersSlice = createSlice({
  name: 'pmsUsers',
  initialState: {
    users:       { data: [], meta: initialMeta, loading: false, error: null },
    workGroups:  { data: [], meta: initialMeta, loading: false, error: null },
    permissions: { data: [], loading: false, error: null },
  } as UsersState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchUsers.pending,   s => { s.users.loading = true; s.users.error = null })
      .addCase(fetchUsers.fulfilled, (s, a) => { s.users.loading = false; s.users.data = a.payload.data; s.users.meta = a.payload.meta })
      .addCase(fetchUsers.rejected,  (s, a) => { s.users.loading = false; s.users.error = a.error.message ?? 'Error' })

    builder
      .addCase(fetchWorkGroups.pending,   s => { s.workGroups.loading = true; s.workGroups.error = null })
      .addCase(fetchWorkGroups.fulfilled, (s, a) => { s.workGroups.loading = false; s.workGroups.data = a.payload.data; s.workGroups.meta = a.payload.meta })
      .addCase(fetchWorkGroups.rejected,  (s, a) => { s.workGroups.loading = false; s.workGroups.error = a.error.message ?? 'Error' })

    builder
      .addCase(fetchWorkGroupPermissions.pending,   s => { s.permissions.loading = true; s.permissions.error = null })
      .addCase(fetchWorkGroupPermissions.fulfilled, (s, a) => { s.permissions.loading = false; s.permissions.data = a.payload.data })
      .addCase(fetchWorkGroupPermissions.rejected,  (s, a) => { s.permissions.loading = false; s.permissions.error = a.error.message ?? 'Error' })
  },
})

export default usersSlice.reducer
