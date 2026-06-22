// ============================================================
// Number Formatters
// ============================================================

const CURRENCY_FORMATTER = new Intl.NumberFormat('th-TH', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

const INTEGER_FORMATTER = new Intl.NumberFormat('th-TH', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

/** 12500.5 → "12,500.50" */
export const formatCurrency = (value: number | null | undefined): string => {
  if (value == null) return '-'
  return CURRENCY_FORMATTER.format(value)
}

/** 12500 → "12,500" */
export const formatNumber = (value: number | null | undefined): string => {
  if (value == null) return '-'
  return INTEGER_FORMATTER.format(value)
}

// ============================================================
// Date Formatters — Thai locale (พ.ศ.)
// ============================================================

const DATE_FORMATTER = new Intl.DateTimeFormat('th-TH', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

const DATE_SHORT_FORMATTER = new Intl.DateTimeFormat('th-TH', {
  year: '2-digit',
  month: '2-digit',
  day: '2-digit',
})

const MONTH_YEAR_FORMATTER = new Intl.DateTimeFormat('th-TH', {
  year: 'numeric',
  month: 'long',
})

const DATETIME_FORMATTER = new Intl.DateTimeFormat('th-TH', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

/** "2026-06-15" → "15 มิถุนายน 2569" */
export const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '-'
  return DATE_FORMATTER.format(date)
}

/** "2026-06-15" → "15/06/69" */
export const formatDateShort = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '-'
  return DATE_SHORT_FORMATTER.format(date)
}

/** "2026-06-01" → "มิถุนายน 2569" (สำหรับ billing) */
export const formatBillingMonth = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '-'
  return MONTH_YEAR_FORMATTER.format(date)
}

/** "2026-06-15T10:30:00" → "15 มิ.ย. 2569 10:30" */
export const formatDateTime = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '-'
  return DATETIME_FORMATTER.format(date)
}
