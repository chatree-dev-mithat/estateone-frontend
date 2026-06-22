'use client'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'

import { useSession } from 'next-auth/react'

import styles from './DashboardView.module.css'

const DashboardView = () => {
  const { data: session } = useSession()

  return (
    <Box className={styles.root}>
      {/* Welcome Header */}
      <Box className={styles.header}>
        <Typography variant='h4' className={styles.title}>
          Welcome to Estateone
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          {session?.user?.name ? `สวัสดี, ${session.user.name}` : 'ระบบบริหารจัดการอสังหาริมทรัพย์'}
        </Typography>
      </Box>

      {/* KPI Cards — placeholder สำหรับ Phase 6 */}
      <Grid container spacing={6}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard icon='ri-building-2-line' label='ยูนิตทั้งหมด' value='-' color='primary' />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard icon='ri-group-line' label='ผู้เช่าปัจจุบัน' value='-' color='success' />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard icon='ri-bill-line' label='ใบแจ้งหนี้ค้างชำระ' value='-' color='warning' />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <KpiCard icon='ri-file-text-line' label='สัญญาใกล้หมดอายุ' value='-' color='error' />
        </Grid>
      </Grid>
    </Box>
  )
}

// ─── KPI Card Component ───────────────────────────────────────────────────────

type KpiCardProps = {
  icon: string
  label: string
  value: string | number
  color: 'primary' | 'success' | 'warning' | 'error'
}

const KpiCard = ({ icon, label, value, color }: KpiCardProps) => (
  <Card className={styles.kpiCard}>
    <CardContent className={styles.kpiContent}>
      <Box className={styles.kpiIconWrapper} data-color={color}>
        <i className={`${icon} ${styles.kpiIcon}`} />
      </Box>
      <Box>
        <Typography variant='h5' fontWeight={600}>
          {value}
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          {label}
        </Typography>
      </Box>
    </CardContent>
  </Card>
)

export default DashboardView
