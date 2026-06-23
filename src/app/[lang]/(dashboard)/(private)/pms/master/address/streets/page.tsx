import type { Metadata } from 'next'

import StreetListView from '@/views/pms/master/address/streets/StreetListView'

export const metadata: Metadata = {
  title: 'ชื่อถนน | Estateone PMS',
}

const StreetListPage = () => {
  return <StreetListView />
}

export default StreetListPage
