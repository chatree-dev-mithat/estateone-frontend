import type { Metadata } from 'next'

import DashboardView from '@/views/pms/dashboard/DashboardView'

export const metadata: Metadata = {
  title: 'Dashboard | Estateone PMS',
}

const DashboardPage = () => {
  return <DashboardView />
}

export default DashboardPage
