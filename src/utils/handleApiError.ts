import type { ApiError } from '@/types/pms'

// ความหมายของ error code จาก backend
const ERROR_MESSAGES: Record<string, string> = {
  // Auth
  UNAUTHORIZED:              'กรุณาเข้าสู่ระบบใหม่',
  FORBIDDEN:                 'ไม่มีสิทธิ์ดำเนินการนี้',
  // Generic
  NOT_FOUND:                 'ไม่พบข้อมูลที่ต้องการ',
  BAD_REQUEST:               'ข้อมูลไม่ถูกต้อง',
  CONFLICT:                  'ข้อมูลซ้ำกับที่มีอยู่แล้ว',
  INTERNAL_SERVER_ERROR:     'เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่อีกครั้ง',
  // Business
  SALES_ORDER_NOT_FOUND:     'ไม่พบใบแจ้งหนี้',
  RECEIPT_NOT_FOUND:         'ไม่พบใบเสร็จ',
  CONTRACT_NOT_FOUND:        'ไม่พบสัญญาเช่า',
  BUSINESS_PARTNER_NOT_FOUND:'ไม่พบข้อมูลผู้เช่า',
  USER_NOT_FOUND:            'ไม่พบผู้ใช้งาน',
  INVALID_CREDENTIALS:       'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
  ACCOUNT_LOCKED:            'บัญชีถูกล็อค กรุณาติดต่อผู้ดูแลระบบ',
  ACCOUNT_INACTIVE:          'บัญชีไม่ได้ใช้งาน',
}

export type NotifyFn = (message: string, variant: 'error' | 'warning' | 'info' | 'success') => void

/**
 * แปลง backend ApiError เป็น message ภาษาไทย แล้วแสดงผ่าน notify callback
 *
 * ใช้ร่วมกับ notistack:
 *   const { enqueueSnackbar } = useSnackbar()
 *   const notify: NotifyFn = (msg, variant) => enqueueSnackbar(msg, { variant })
 */
export const handleApiError = (error: unknown, notify: NotifyFn): void => {
  // error จาก axios interceptor (มี .code และ .statusCode)
  if (isAxiosStyleError(error)) {
    const msg = ERROR_MESSAGES[error.code] ?? error.message ?? 'เกิดข้อผิดพลาด'
    notify(msg, error.statusCode === 403 ? 'warning' : 'error')
    return
  }

  // error จาก backend ApiError format
  if (isApiError(error)) {
    const msg = ERROR_MESSAGES[error.error.code] ?? error.error.message ?? 'เกิดข้อผิดพลาด'
    notify(msg, error.error.statusCode === 403 ? 'warning' : 'error')
    return
  }

  // Error ทั่วไป
  if (error instanceof Error) {
    notify(error.message, 'error')
    return
  }

  notify('เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ', 'error')
}

// ============================================================
// Type guards
// ============================================================

interface AxiosStyleError {
  code: string
  message: string
  statusCode: number
}

function isAxiosStyleError(err: unknown): err is AxiosStyleError {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    'statusCode' in err
  )
}

function isApiError(err: unknown): err is ApiError {
  return (
    typeof err === 'object' &&
    err !== null &&
    'success' in err &&
    (err as any).success === false &&
    'error' in err
  )
}
