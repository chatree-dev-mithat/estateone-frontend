'use client'

import { useEffect } from 'react'

import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import type { StreetName } from '@/types/pms'

// ─── Schema ──────────────────────────────────────────────────────────────────

const schema = z.object({
  code:        z.string().min(1, 'กรุณาระบุรหัส').max(50),
  name:        z.string().min(1, 'กรุณาระบุชื่อถนน').max(255),
  description: z.string().max(500).optional().or(z.literal('')),
  status:      z.enum(['A', 'I']),
})

type FormValues = z.infer<typeof schema>

// ─── Props ────────────────────────────────────────────────────────────────────

type Props = {
  open:     boolean
  row:      StreetName | null    // null = create mode
  saving:   boolean
  onClose:  () => void
  onSubmit: (values: FormValues) => void
}

// ─── Component ───────────────────────────────────────────────────────────────

const StreetFormDialog = ({ open, row, saving, onClose, onSubmit }: Props) => {
  const isEdit = row !== null

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { code: '', name: '', description: '', status: 'A' },
  })

  // Populate form when editing
  useEffect(() => {
    if (open) {
      reset(
        row
          ? { code: row.code ?? '', name: row.name ?? '', description: row.description ?? '', status: (row.status as 'A' | 'I') ?? 'A' }
          : { code: '', name: '', description: '', status: 'A' }
      )
    }
  }, [open, row, reset])

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='sm' disableEscapeKeyDown={saving}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
        {isEdit ? 'แก้ไขชื่อถนน' : 'เพิ่มชื่อถนน'}
        <IconButton size='small' onClick={onClose} disabled={saving}>
          <i className='ri-close-line' />
        </IconButton>
      </DialogTitle>

      <Divider />

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 3 }}>
          {/* Code */}
          <Controller
            name='code'
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label='รหัส'
                required
                fullWidth
                error={!!errors.code}
                helperText={errors.code?.message}
                inputProps={{ maxLength: 50 }}
                placeholder='เช่น 10010001'
              />
            )}
          />

          {/* Name */}
          <Controller
            name='name'
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label='ชื่อถนน'
                required
                fullWidth
                error={!!errors.name}
                helperText={errors.name?.message}
                inputProps={{ maxLength: 255 }}
                placeholder='เช่น ปรินายก'
              />
            )}
          />

          {/* Description */}
          <Controller
            name='description'
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label='คำอธิบาย'
                fullWidth
                multiline
                rows={2}
                error={!!errors.description}
                helperText={errors.description?.message}
                inputProps={{ maxLength: 500 }}
              />
            )}
          />

          {/* Status */}
          <Controller
            name='status'
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label='สถานะ'
                fullWidth
                error={!!errors.status}
                helperText={errors.status?.message}
              >
                <MenuItem value='A'>ใช้งาน</MenuItem>
                <MenuItem value='I'>ไม่ใช้งาน</MenuItem>
              </TextField>
            )}
          />
        </DialogContent>

        <Divider />

        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button variant='outlined' color='secondary' onClick={onClose} disabled={saving}>
            ยกเลิก
          </Button>
          <Button
            type='submit'
            variant='contained'
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} color='inherit' /> : <i className='ri-save-line' />}
          >
            {saving ? 'กำลังบันทึก...' : 'บันทึก'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default StreetFormDialog
