import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import apiClient from '@/utils/api/axios'

// ---------- Types ----------
export interface Property {
  id: number
  name: string
  type: string
  address: string
  unitCount: number
  status: string
}

export interface Unit {
  id: number
  propertyId: number
  unitNo: string
  floor: number
  type: string
  size: number
  price: number
  status: string  // 'Available' | 'Occupied' | 'Maintenance' | 'Reserved'
}

export interface Tenant {
  id: number
  name: string
  phone: string
  email: string
  lineUserId: string
  idCardNo: string
  status: string
}

export interface Contract {
  id: number
  documentNo: string
  unitId: number
  tenantId: number
  tenantName: string
  startDate: string
  endDate: string
  rentAmount: number
  deposit: number
  status: string  // 'active' | 'expired' | 'terminated'
}

export interface Invoice {
  id: number
  documentNo: string
  documentDate: string
  contractId: number
  tenantName: string
  netAmount: number
  status: string  // 'draft' | 'submitted' | 'approved' | 'paid' | 'overdue' | 'cancelled'
  statusName: string
}

export interface Receipt {
  id: number
  documentNo: string
  documentDate: string
  invoiceId: number
  tenantName: string
  amount: number
  paymentMethod: string
  status: string
}

interface Meta { page: number; limit: number; total: number }

const createListState = () => ({ data: [] as any[], meta: { page: 1, limit: 20, total: 0 } as Meta, loading: false, error: null as string | null })

interface BusinessState {
  properties: ReturnType<typeof createListState>
  units:      ReturnType<typeof createListState>
  tenants:    ReturnType<typeof createListState>
  contracts:  ReturnType<typeof createListState>
  invoices:   ReturnType<typeof createListState>
  receipts:   ReturnType<typeof createListState>
}

// ---------- Thunks ----------
export const fetchProperties = createAsyncThunk('business/fetchProperties', async (params?: Record<string, any>) => (await apiClient.get('/companies', { params })).data)
export const fetchUnits      = createAsyncThunk('business/fetchUnits',      async (params?: Record<string, any>) => (await apiClient.get('/units', { params })).data)
export const fetchTenants    = createAsyncThunk('business/fetchTenants',    async (params?: Record<string, any>) => (await apiClient.get('/business-partners', { params })).data)
export const fetchContracts  = createAsyncThunk('business/fetchContracts',  async (params?: Record<string, any>) => (await apiClient.get('/contracts', { params })).data)
export const fetchInvoices   = createAsyncThunk('business/fetchInvoices',   async (params?: Record<string, any>) => (await apiClient.get('/sales-orders', { params })).data)
export const fetchReceipts   = createAsyncThunk('business/fetchReceipts',   async (params?: Record<string, any>) => (await apiClient.get('/receipts', { params })).data)

// ---------- Slice ----------
const businessSlice = createSlice({
  name: 'business',
  initialState: {
    properties: createListState(),
    units:      createListState(),
    tenants:    createListState(),
    contracts:  createListState(),
    invoices:   createListState(),
    receipts:   createListState(),
  } as BusinessState,
  reducers: {},
  extraReducers: builder => {
    const thunks: [any, keyof BusinessState][] = [
      [fetchProperties, 'properties'],
      [fetchUnits,      'units'],
      [fetchTenants,    'tenants'],
      [fetchContracts,  'contracts'],
      [fetchInvoices,   'invoices'],
      [fetchReceipts,   'receipts'],
    ]

    for (const [thunk, field] of thunks) {
      builder
        .addCase(thunk.pending,   (s: BusinessState) => { s[field].loading = true; s[field].error = null })
        .addCase(thunk.fulfilled, (s: BusinessState, a: any) => { s[field].loading = false; s[field].data = a.payload.data; s[field].meta = a.payload.meta })
        .addCase(thunk.rejected,  (s: BusinessState, a: any) => { s[field].loading = false; s[field].error = a.error.message ?? 'Error' })
    }
  },
})

export default businessSlice.reducer
