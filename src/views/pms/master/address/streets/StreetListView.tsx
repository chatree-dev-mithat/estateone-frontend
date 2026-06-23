'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Chip from '@mui/material/Chip'
import Collapse from '@mui/material/Collapse'
import Pagination from '@mui/material/Pagination'
import Select from '@mui/material/Select'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Tooltip from '@mui/material/Tooltip'
import type { TextFieldProps } from '@mui/material/TextField'

import classnames from 'classnames'
import { rankItem } from '@tanstack/match-sorter-utils'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { ColumnDef, FilterFn, SortingState } from '@tanstack/react-table'
import type { RankingInfo } from '@tanstack/match-sorter-utils'

import apiClient from '@/utils/api/axios'
import type { StreetName, ApiListResponse } from '@/types/pms'
import StreetFormDialog from './StreetFormDialog'

import tableStyles from '@core/styles/table.module.css'
import styles from './StreetListView.module.css'

declare module '@tanstack/table-core' {
  interface FilterFns { fuzzy: FilterFn<unknown> }
  interface FilterMeta { itemRank: RankingInfo }
}

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)
  addMeta({ itemRank })
  return itemRank.passed
}

// ─── Debounced Input ──────────────────────────────────────────────────────────

const DebouncedInput = ({
  value: initialValue,
  onChange,
  debounce = 400,
  ...props
}: { value: string; onChange: (v: string) => void; debounce?: number } & Omit<TextFieldProps, 'onChange'>) => {
  const [value, setValue] = useState(initialValue)

  useEffect(() => { setValue(initialValue) }, [initialValue])
  useEffect(() => {
    const t = setTimeout(() => onChange(value), debounce)
    return () => clearTimeout(t)
  }, [value, debounce, onChange])

  return <TextField {...props} value={value} onChange={e => setValue(e.target.value)} size='small' />
}

// ─── Column helper ────────────────────────────────────────────────────────────

const columnHelper = createColumnHelper<StreetName>()

// ─── Main Component ───────────────────────────────────────────────────────────

const StreetListView = () => {
  // list state
  const [rows, setRows]           = useState<StreetName[]>([])
  const [total, setTotal]         = useState(0)
  const [loading, setLoading]     = useState(false)
  const [page, setPage]           = useState(0)
  const [pageSize, setPageSize]   = useState(25)
  const [sorting, setSorting]     = useState<SortingState>([])
  const [search, setSearch]       = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [statusFilter, setStatusFilter] = useState('')

  // form/dialog state
  const [formOpen, setFormOpen]   = useState(false)
  const [editRow, setEditRow]     = useState<StreetName | null>(null)
  const [saving, setSaving]       = useState(false)

  // delete confirm state
  const [deleteTarget, setDeleteTarget] = useState<StreetName | null>(null)
  const [deleting, setDeleting]         = useState(false)

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, unknown> = {
        page: page + 1,
        limit: pageSize,
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
      }
      const res = await apiClient.get<ApiListResponse<StreetName>>('/address/streets', { params })
      setRows(res.data.data ?? [])
      setTotal(res.data.meta?.total ?? 0)
    } catch {
      setRows([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, search, statusFilter])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSearchChange = useCallback((val: string) => { setSearch(val); setPage(0) }, [])
  const handleStatusChange = useCallback((val: string) => { setStatusFilter(val); setPage(0) }, [])
  const handleClear = useCallback(() => { setStatusFilter(''); setPage(0) }, [])

  // ── CRUD handlers ──────────────────────────────────────────────────────────

  const openCreate = () => { setEditRow(null); setFormOpen(true) }
  const openEdit   = (row: StreetName) => { setEditRow(row); setFormOpen(true) }

  const handleFormSubmit = async (values: { code: string; name: string; description?: string; status: 'A' | 'I' }) => {
    setSaving(true)
    try {
      if (editRow) {
        await apiClient.patch(`/address/streets/${editRow.id}`, values)
      } else {
        await apiClient.post('/address/streets', values)
      }
      setFormOpen(false)
      fetchData()
    } catch {
      // error handled by axios interceptor
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await apiClient.delete(`/address/streets/${deleteTarget.id}`)
      setDeleteTarget(null)
      fetchData()
    } catch {
      // error handled by axios interceptor
    } finally {
      setDeleting(false)
    }
  }

  // ── Columns ────────────────────────────────────────────────────────────────

  const columns = useMemo<ColumnDef<StreetName, any>[]>(() => [
    {
      id: 'rowNumber',
      header: '#',
      size: 64,
      cell: ({ row }) => (
        <Typography variant='body2' color='text.secondary'>
          {page * pageSize + row.index + 1}
        </Typography>
      ),
    },
    columnHelper.accessor('code', {
      header: 'รหัส',
      size: 120,
    }),
    columnHelper.accessor('name', {
      header: 'ชื่อถนน',
      cell: ({ getValue }) => (
        <Typography variant='body2' fontWeight={500}>{getValue()}</Typography>
      ),
    }),
    columnHelper.accessor('description', {
      header: 'คำอธิบาย',
      cell: ({ getValue }) => getValue() ?? '-',
    }),
    columnHelper.accessor('status', {
      header: 'สถานะ',
      size: 110,
      cell: ({ getValue }) => (
        <Chip
          label={getValue() === 'A' ? 'ใช้งาน' : 'ไม่ใช้งาน'}
          color={getValue() === 'A' ? 'success' : 'error'}
          variant='tonal'
          size='small'
        />
      ),
    }),
    {
      id: 'actions',
      header: '',
      size: 80,
      cell: ({ row }) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title='แก้ไข'>
            <IconButton size='small' color='primary' onClick={() => openEdit(row.original)}>
              <i className='ri-edit-line text-lg' />
            </IconButton>
          </Tooltip>
          <Tooltip title='ลบ'>
            <IconButton size='small' color='error' onClick={() => setDeleteTarget(row.original)}>
              <i className='ri-delete-bin-7-line text-lg' />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ], [page, pageSize])

  const table = useReactTable({
    data: rows,
    columns,
    filterFns: { fuzzy: fuzzyFilter },
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(total / pageSize),
  })

  const hasAdvancedFilter = !!statusFilter

  return (
    <>
      {/* ── Page Header ── */}
      <Box className={styles.pageHeader}>
        <Typography variant='h5' className={styles.pageTitle}>ชื่อถนน</Typography>
        <Breadcrumbs separator={<i className='ri-arrow-right-s-line text-base' />}>
          <Typography variant='body2' color='text.secondary'>Master Data</Typography>
          <Typography variant='body2' color='text.secondary'>Address Info</Typography>
          <Typography variant='body2' color='text.primary' fontWeight={500}>ชื่อถนน</Typography>
        </Breadcrumbs>
      </Box>

      <Card>
        {/* ── Toolbar ── */}
        <CardContent className={styles.toolbar}>
          <DebouncedInput
            value={search}
            onChange={handleSearchChange}
            placeholder='ค้นหาชื่อถนน หรือรหัส...'
            className={styles.searchInput}
            slotProps={{ input: { startAdornment: <i className='ri-search-line me-2 text-textSecondary' /> } }}
          />
          <Button
            variant={showAdvanced ? 'contained' : 'outlined'}
            color='secondary'
            size='small'
            startIcon={<i className='ri-equalizer-3-line' />}
            onClick={() => setShowAdvanced(v => !v)}
            endIcon={
              hasAdvancedFilter
                ? <Chip label='1' size='small' color='primary' sx={{ height: 16, minWidth: 16, fontSize: '0.6rem' }} />
                : undefined
            }
          >
            ค้นหาขั้นสูง
          </Button>
          <Button
            variant='contained'
            startIcon={<i className='ri-add-line' />}
            onClick={openCreate}
          >
            เพิ่มถนน
          </Button>
        </CardContent>

        {/* ── Advanced Panel ── */}
        <Collapse in={showAdvanced} unmountOnExit>
          <div className={styles.advancedPanel}>
            <div className={styles.advancedGrid}>
              <TextField
                select
                label='สถานะ'
                size='small'
                value={statusFilter}
                onChange={e => handleStatusChange(e.target.value)}
              >
                <MenuItem value=''>ทั้งหมด</MenuItem>
                <MenuItem value='A'>ใช้งาน</MenuItem>
                <MenuItem value='I'>ไม่ใช้งาน</MenuItem>
              </TextField>
            </div>
            {hasAdvancedFilter && (
              <Box mt={1.5}>
                <Button size='small' color='error' variant='text'
                  startIcon={<i className='ri-close-circle-line' />}
                  onClick={handleClear}
                >
                  ล้างตัวกรอง
                </Button>
              </Box>
            )}
          </div>
        </Collapse>

        {/* ── Table ── */}
        <div className='overflow-x-auto'>
          <table className={tableStyles.table}>
            <thead>
              {table.getHeaderGroups().map(hg => (
                <tr key={hg.id}>
                  {hg.headers.map(header => (
                    <th key={header.id} style={{ width: header.getSize() }}>
                      {!header.isPlaceholder && (
                        <div
                          className={classnames({
                            'flex items-center': header.column.getIsSorted(),
                            'cursor-pointer select-none': header.column.getCanSort(),
                          })}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{ asc: <i className='ri-arrow-up-s-line text-xl' />, desc: <i className='ri-arrow-down-s-line text-xl' /> }[header.column.getIsSorted() as string] ?? null}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            {loading ? (
              <tbody>
                <tr>
                  <td colSpan={columns.length} className='text-center pbs-6 pbe-6'>
                    <CircularProgress size={28} />
                  </td>
                </tr>
              </tbody>
            ) : table.getRowModel().rows.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={columns.length} className='text-center pbs-6 pbe-6'>
                    <Typography variant='body2' color='text.secondary'>ไม่พบข้อมูล</Typography>
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {table.getRowModel().rows.map(row => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>

        {/* ── Pagination ── */}
        <div className={styles.paginationBar}>
          <Typography variant='body2' color='text.secondary'>
            {total > 0
              ? `แสดง ${page * pageSize + 1}–${Math.min((page + 1) * pageSize, total)} จาก ${total.toLocaleString()} รายการ`
              : 'ไม่มีข้อมูล'}
          </Typography>
          <Pagination
            count={Math.ceil(total / pageSize) || 1}
            page={page + 1}
            onChange={(_, p) => setPage(p - 1)}
            color='primary'
            shape='rounded'
            showFirstButton
            showLastButton
          />
          <FormControl size='small' className={styles.pageSizeSelect}>
            <InputLabel>ต่อหน้า</InputLabel>
            <Select
              label='ต่อหน้า'
              value={pageSize}
              onChange={e => { setPageSize(Number(e.target.value)); setPage(0) }}
            >
              {[10, 25, 50, 100].map(n => (
                <MenuItem key={n} value={n}>{n}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
      </Card>

      {/* ── Form Dialog ── */}
      <StreetFormDialog
        open={formOpen}
        row={editRow}
        saving={saving}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      {/* ── Delete Confirm ── */}
      <Dialog open={!!deleteTarget} onClose={() => !deleting && setDeleteTarget(null)} maxWidth='xs' fullWidth>
        <DialogTitle>ยืนยันการลบ</DialogTitle>
        <DialogContent>
          <Typography>
            ต้องการลบ <strong>{deleteTarget?.name}</strong> ใช่หรือไม่?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button variant='outlined' color='secondary' onClick={() => setDeleteTarget(null)} disabled={deleting}>
            ยกเลิก
          </Button>
          <Button
            variant='contained'
            color='error'
            onClick={handleDelete}
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} color='inherit' /> : <i className='ri-delete-bin-7-line' />}
          >
            {deleting ? 'กำลังลบ...' : 'ลบ'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default StreetListView
