import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import apiClient from '@/utils/api/axios'

// ---------- Types ----------
export interface Parameter {
  id: number
  code: string
  name: string
  description: string
  status: string
}

export interface ParameterValue {
  id: number
  parameterTypeId: number
  code: string
  name: string
  value: string
  seq: number
  status: string
}

export interface DocumentType {
  id: number
  code: string
  prefix: string
  format: string
  runningLength: number
  resetType: string
  currentRunning: number
  status: string
}

export interface Company {
  id: number
  name: string
  taxId: string
  type: string
  logo: string
  status: string
}

export interface Branch {
  id: number
  companyId: number
  code: string
  name: string
  vatRate: number
  isHq: boolean
  status: string
}

interface Meta { page: number; limit: number; total: number }

interface ConfigState {
  parameters: { data: Parameter[]; meta: Meta; loading: boolean; error: string | null }
  documentTypes: { data: DocumentType[]; loading: boolean; error: string | null }
  companies: { data: Company[]; loading: boolean; error: string | null }
  branches: { data: Branch[]; loading: boolean; error: string | null }
}

const initialMeta: Meta = { page: 1, limit: 20, total: 0 }

// ---------- Thunks ----------
export const fetchParameters = createAsyncThunk('config/fetchParameters', async (params?: Record<string, any>) => {
  const res = await apiClient.get('/parameters', { params })
  return res.data
})

export const fetchDocumentTypes = createAsyncThunk('config/fetchDocumentTypes', async () => {
  const res = await apiClient.get('/document-types')
  return res.data
})

export const fetchCompanies = createAsyncThunk('config/fetchCompanies', async () => {
  const res = await apiClient.get('/companies')
  return res.data
})

export const fetchBranches = createAsyncThunk('config/fetchBranches', async (companyId: number) => {
  const res = await apiClient.get(`/companies/${companyId}/branches`)
  return res.data
})

// ---------- Slice ----------
const configSlice = createSlice({
  name: 'config',
  initialState: {
    parameters:    { data: [], meta: initialMeta, loading: false, error: null },
    documentTypes: { data: [], loading: false, error: null },
    companies:     { data: [], loading: false, error: null },
    branches:      { data: [], loading: false, error: null },
  } as ConfigState,
  reducers: {},
  extraReducers: builder => {
    // parameters
    builder
      .addCase(fetchParameters.pending,   s => { s.parameters.loading = true; s.parameters.error = null })
      .addCase(fetchParameters.fulfilled, (s, a) => { s.parameters.loading = false; s.parameters.data = a.payload.data; s.parameters.meta = a.payload.meta })
      .addCase(fetchParameters.rejected,  (s, a) => { s.parameters.loading = false; s.parameters.error = a.error.message ?? 'Error' })
    // documentTypes
    builder
      .addCase(fetchDocumentTypes.pending,   s => { s.documentTypes.loading = true; s.documentTypes.error = null })
      .addCase(fetchDocumentTypes.fulfilled, (s, a) => { s.documentTypes.loading = false; s.documentTypes.data = a.payload.data })
      .addCase(fetchDocumentTypes.rejected,  (s, a) => { s.documentTypes.loading = false; s.documentTypes.error = a.error.message ?? 'Error' })
    // companies
    builder
      .addCase(fetchCompanies.pending,   s => { s.companies.loading = true; s.companies.error = null })
      .addCase(fetchCompanies.fulfilled, (s, a) => { s.companies.loading = false; s.companies.data = a.payload.data })
      .addCase(fetchCompanies.rejected,  (s, a) => { s.companies.loading = false; s.companies.error = a.error.message ?? 'Error' })
    // branches
    builder
      .addCase(fetchBranches.pending,   s => { s.branches.loading = true; s.branches.error = null })
      .addCase(fetchBranches.fulfilled, (s, a) => { s.branches.loading = false; s.branches.data = a.payload.data })
      .addCase(fetchBranches.rejected,  (s, a) => { s.branches.loading = false; s.branches.error = a.error.message ?? 'Error' })
  },
})

export default configSlice.reducer
