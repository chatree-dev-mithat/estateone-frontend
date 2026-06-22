import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import apiClient from '@/utils/api/axios'

// ---------- Types ----------
export interface Material {
  id: number
  code: string
  name: string
  categoryId: number
  categoryName: string
  type: string  // 'Product' | 'Service'
  price: number
  uomId: number
  uomName: string
  status: string
}

export interface MaterialCategory {
  id: number
  code: string
  name: string
  parentId: number | null
  status: string
}

export interface Uom {
  id: number
  code: string
  name: string
  status: string
}

export interface Bank {
  id: number
  code: string
  name: string
  status: string
}

export interface Province { id: number; nameEn: string; nameTh: string }
export interface Amphur   { id: number; provinceId: number; nameEn: string; nameTh: string }
export interface Tambon   { id: number; amphurId: number; nameEn: string; nameTh: string; postCode: string }

interface Meta { page: number; limit: number; total: number }

interface MasterState {
  materials:   { data: Material[]; meta: Meta; loading: boolean; error: string | null }
  categories:  { data: MaterialCategory[]; loading: boolean; error: string | null }
  uoms:        { data: Uom[]; loading: boolean; error: string | null }
  banks:       { data: Bank[]; loading: boolean; error: string | null }
  provinces:   { data: Province[]; loading: boolean; error: string | null }
  amphurs:     { data: Amphur[]; loading: boolean; error: string | null }
  tambons:     { data: Tambon[]; loading: boolean; error: string | null }
}

const initialMeta: Meta = { page: 1, limit: 20, total: 0 }

// ---------- Thunks ----------
export const fetchMaterials       = createAsyncThunk('master/fetchMaterials',   async (params?: Record<string, any>) => (await apiClient.get('/materials', { params })).data)
export const fetchMaterialCategories = createAsyncThunk('master/fetchCategories', async () => (await apiClient.get('/material-categories')).data)
export const fetchUoms            = createAsyncThunk('master/fetchUoms',         async () => (await apiClient.get('/uom')).data)
export const fetchBanks           = createAsyncThunk('master/fetchBanks',        async () => (await apiClient.get('/banks')).data)
export const fetchProvinces       = createAsyncThunk('master/fetchProvinces',    async () => (await apiClient.get('/address/provinces')).data)
export const fetchAmphurs         = createAsyncThunk('master/fetchAmphurs',      async (provinceId: number) => (await apiClient.get('/address/amphurs', { params: { provinceId } })).data)
export const fetchTambons         = createAsyncThunk('master/fetchTambons',      async (amphurId: number) => (await apiClient.get('/address/tambons', { params: { amphurId } })).data)

// ---------- Slice ----------
const masterSlice = createSlice({
  name: 'master',
  initialState: {
    materials:  { data: [], meta: initialMeta, loading: false, error: null },
    categories: { data: [], loading: false, error: null },
    uoms:       { data: [], loading: false, error: null },
    banks:      { data: [], loading: false, error: null },
    provinces:  { data: [], loading: false, error: null },
    amphurs:    { data: [], loading: false, error: null },
    tambons:    { data: [], loading: false, error: null },
  } as MasterState,
  reducers: {
    clearAmphurs: s => { s.amphurs.data = [] },
    clearTambons: s => { s.tambons.data = [] },
  },
  extraReducers: builder => {
    const addListCase = <T>(thunk: any, field: keyof MasterState, hasMeta = false) => {
      builder
        .addCase(thunk.pending,   (s: any) => { s[field].loading = true; s[field].error = null })
        .addCase(thunk.fulfilled, (s: any, a: any) => {
          s[field].loading = false
          s[field].data = a.payload.data
          if (hasMeta) s[field].meta = a.payload.meta
        })
        .addCase(thunk.rejected,  (s: any, a: any) => { s[field].loading = false; s[field].error = a.error.message ?? 'Error' })
    }

    addListCase(fetchMaterials, 'materials', true)
    addListCase(fetchMaterialCategories, 'categories')
    addListCase(fetchUoms, 'uoms')
    addListCase(fetchBanks, 'banks')
    addListCase(fetchProvinces, 'provinces')
    addListCase(fetchAmphurs, 'amphurs')
    addListCase(fetchTambons, 'tambons')
  },
})

export const { clearAmphurs, clearTambons } = masterSlice.actions
export default masterSlice.reducer
