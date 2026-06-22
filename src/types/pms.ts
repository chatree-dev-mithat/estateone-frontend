// ============================================================
// Shared
// ============================================================

export interface PaginationMeta {
  page: number
  limit: number
  total: number
}

export interface ApiListResponse<T> {
  success: boolean
  data: T[]
  meta: PaginationMeta
}

export interface ApiResponse<T> {
  success: boolean
  data: T
}

export interface ApiError {
  success: false
  error: {
    code: string
    message: string
    statusCode: number
  }
}

export interface AuditFields {
  createdAt: string
  createdBy: number | null
  createdByName: string | null
  updatedAt: string | null
  updatedBy: number | null
  updatedByName: string | null
  deletedAt: string | null
}

// ============================================================
// Auth
// ============================================================

export interface CurrentUser {
  userId: number
  name: string
  email: string
  companyId: number
  branchId: number
  role: string
}

// ============================================================
// Config — c_ tables
// ============================================================

export interface ParameterType extends AuditFields {
  id: number
  code: string
  name: string
  description: string | null
  status: string
}

export interface ParameterValue extends AuditFields {
  id: number
  parameterTypeId: number
  code: string
  name: string
  value: string | null
  seq: number
  status: string
}

export interface DocumentTypeControl extends AuditFields {
  id: number
  code: string
  prefix: string
  format: string
  runningLength: number
  resetType: string        // 'yearly' | 'monthly' | 'never'
  currentRunning: number
  status: string
}

// ============================================================
// Company & Branch — m_ tables
// ============================================================

export interface Company extends AuditFields {
  id: number
  code: string
  name: string
  taxId: string | null
  type: string | null
  logo: string | null
  status: string
}

export interface Branch extends AuditFields {
  id: number
  mCompanyMasterId: number
  code: string
  name: string
  vatRate: number
  isHq: boolean
  status: string
}

// ============================================================
// User Access — users tables
// ============================================================

export interface PmsUser extends AuditFields {
  id: number
  name: string
  email: string
  userPhone: string | null
  status: string
  lockFlag: string
  effectiveDate: string | null
  expiredDate: string | null
  workGroups?: WorkGroup[]
}

export interface WorkGroup extends AuditFields {
  id: number
  code: string
  name: string
  description: string | null
  status: string
  userCount?: number
}

export interface MenuPermission {
  menuId: number
  menuCode: string
  menuName: string
  canRead: boolean
  canWrite: boolean
  canDelete: boolean
}

// ============================================================
// Master Data — m_ tables
// ============================================================

export interface MaterialCategory extends AuditFields {
  id: number
  code: string
  name: string
  parentId: number | null
  status: string
}

export interface Material extends AuditFields {
  id: number
  code: string
  name: string
  mMaterialCategoryId: number | null
  categoryName: string | null
  type: string               // 'Product' | 'Service'
  price: number
  mUomId: number | null
  uomName: string | null
  status: string
}

export interface Uom extends AuditFields {
  id: number
  code: string
  name: string
  status: string
}

export interface Bank extends AuditFields {
  id: number
  code: string
  name: string
  status: string
}

export interface Province {
  id: number
  nameTh: string
  nameEn: string
}

export interface Amphur {
  id: number
  mProvinceId: number
  nameTh: string
  nameEn: string
}

export interface Tambon {
  id: number
  mAmphurId: number
  nameTh: string
  nameEn: string
  postCode: string
}

// ============================================================
// Business — a_ / m_ tables
// ============================================================

export interface Tenant extends AuditFields {
  id: number
  mCompanyMasterId: number
  mBranchId: number
  code: string
  name: string
  taxId: string | null
  businessPartnerType: string   // 'tenant'
  lineUserId: string | null
  status: string
  statusName: string | null
  person?: Person
  addresses?: TenantAddress[]
}

export interface Person {
  id: number
  titleId: number | null
  titleName: string | null
  firstName: string | null
  lastName: string | null
  phone: string | null
  email: string | null
  idCardNo: string | null
  idCardFrontUrl: string | null
  idCardBackUrl: string | null
}

export interface TenantAddress {
  id: number
  mBusinessPartnerId: number
  addressText1: string | null
  addressText2: string | null
  mTambonId: number | null
  mTambonName: string | null
  mAmphurId: number | null
  mAmphurName: string | null
  mProvinceId: number | null
  mProvinceName: string | null
  mPostalCode: string | null
  isDefault: boolean
}

export type InvoiceStatus = 'draft' | 'submitted' | 'approved' | 'overdue' | 'paid' | 'cancelled'

export interface Invoice extends AuditFields {
  id: number
  mCompanyMasterId: number
  mBranchId: number
  documentType: string
  documentNo: string
  documentDate: string
  documentValidUntil: string | null
  customerId: number
  customerName: string
  totalAmount: number
  vatAmount: number
  vatRate: number
  netAmount: number
  status: InvoiceStatus
  statusName: string
  remark: string | null
  details?: InvoiceDetail[]
}

export interface InvoiceDetail {
  id: number
  aSalesOrderId: number
  mMaterialId: number | null
  mMaterialName: string | null
  mUomId: number | null
  mUomName: string | null
  qty: number
  priceAmt: number
  lineAmount: number
  totalAmount: number
  vatAmount: number
  netAmount: number
  remark: string | null
  seq: number
}

export type ReceiptStatus = 'draft' | 'paid' | 'partially_paid' | 'cancelled'

export interface Receipt extends AuditFields {
  id: number
  mCompanyMasterId: number
  mBranchId: number
  aSalesOrderId: number | null
  aSalesOrderDocNo: string | null
  documentType: string
  documentNo: string
  documentDate: string
  customerId: number
  customerName: string
  netAmount: number
  status: ReceiptStatus
  statusName: string
  remark: string | null
  details?: ReceiptDetail[]
}

export interface ReceiptDetail {
  id: number
  aReceiptId: number
  aSalesOrderDetailId: number | null
  mMaterialId: number | null
  mMaterialName: string | null
  qty: number
  priceAmt: number
  netAmount: number
  seq: number
}
