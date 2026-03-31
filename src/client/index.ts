import { readFileSync, existsSync } from 'node:fs'
import { resolve, basename } from 'node:path'
import { loadConfig } from '../config.js'
import type {
  OpenApiResponse, ProfileResult, CheckResult, FileUploadResult,
  VideoCreateParams, VideoTasksParams, VideoTaskItem, PaginatedResult,
  VideoLibraryParams, VideoLibraryItem, VideoPublishParams, VideoPublishResult,
  StrategyCreateParams, StrategyCreateResult, StrategyListParams, StrategyListItem,
  StrategyDetailResult, AccountListParams, AccountItem,
  TemplateOption, TemplateDetail, LabelItem,
  ProductListParams, ProductItem, RecordListParams, RecordItem,
  VideoAnalyticsResult,
} from '../types/index.js'

// ─── Environment ──────────────────────────────────────────────────────

export function getApiKey(): string {
  const key = process.env['BEERVID_API_KEY'] || loadConfig().API_KEY
  if (!key) {
    throw new Error(
      'API_KEY not set. Use: beervid-api config set API_KEY <key> or export BEERVID_API_KEY=<key>'
    )
  }
  return key
}

export function getBaseUrl(): string {
  return process.env['BEERVID_API_BASE_URL'] || loadConfig().BASE_URL || 'https://open.beervid.ai'
}

// ─── Error types ──────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(public code: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

// ─── Response handling ────────────────────────────────────────────────

function isSuccessResponse<T>(json: OpenApiResponse<T>): boolean {
  if (json.error === true) return false
  if (json.success === true) return true
  return json.code === 200 || json.code === 0
}

async function handleResponse<T>(res: Response, path: string): Promise<T> {
  if (res.status >= 500) {
    throw new Error(`HTTP ${res.status} — ${path}`)
  }
  let json: OpenApiResponse<T>
  try {
    json = (await res.json()) as OpenApiResponse<T>
  } catch {
    throw new Error(`HTTP ${res.status} — unexpected response from ${path}`)
  }
  if (!isSuccessResponse(json)) {
    throw new ApiError(json.code, json.message ?? `API error (code: ${json.code})`)
  }
  return json.data
}

// ─── Request helpers ──────────────────────────────────────────────────

export async function apiGet<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(path, getBaseUrl())
  if (params) {
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  }
  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: { 'X-API-KEY': getApiKey(), 'Content-Type': 'application/json' },
  })
  return handleResponse<T>(res, path)
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const url = new URL(path, getBaseUrl())
  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'X-API-KEY': getApiKey(), 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  return handleResponse<T>(res, path)
}

export async function apiDelete<T>(path: string): Promise<T> {
  const url = new URL(path, getBaseUrl())
  const res = await fetch(url.toString(), {
    method: 'DELETE',
    headers: { 'X-API-KEY': getApiKey() },
  })
  return handleResponse<T>(res, path)
}

export async function apiUpload<T>(path: string, formData: FormData): Promise<T> {
  const url = new URL(path, getBaseUrl())
  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'X-API-KEY': getApiKey() },
    body: formData,
  })
  return handleResponse<T>(res, path)
}

// ─── File utilities ───────────────────────────────────────────────────

export function localFileToFile(filePath: string): File {
  const absPath = resolve(filePath)
  if (!existsSync(absPath)) {
    throw new Error(`File not found: ${absPath}`)
  }
  const buffer = readFileSync(absPath)
  const fileName = basename(absPath)
  const ext = fileName.split('.').pop()?.toLowerCase()
  const mimeMap: Record<string, string> = {
    mp4: 'video/mp4', mov: 'video/quicktime',
    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
    mp3: 'audio/mpeg', wav: 'audio/wav',
  }
  const contentType = (ext && mimeMap[ext]) || 'application/octet-stream'
  return new File([buffer], fileName, { type: contentType })
}

// ─── SDK Functions ────────────────────────────────────────────────────

// Auth
export const getProfile = () => apiGet<ProfileResult>('/api/v1/beervid/profile')
export const checkAuth = () => apiGet<CheckResult>('/api/v1/beervid/check')

// File Upload
export async function uploadFile(filePath: string, fileType?: string): Promise<FileUploadResult> {
  const file = localFileToFile(filePath)
  const formData = new FormData()
  formData.append('file', file)
  if (fileType) formData.append('fileType', fileType)
  return apiUpload<FileUploadResult>('/api/v1/beervid/video-create/upload', formData)
}

// Video
export const createVideo = (params: VideoCreateParams) => apiPost<unknown>('/api/v1/beervid/video-create', params)

export function getVideoTasks(params?: VideoTasksParams): Promise<PaginatedResult<VideoTaskItem>> {
  const query: Record<string, string> = {}
  if (params?.current) query['current'] = String(params.current)
  if (params?.size) query['size'] = String(params.size)
  if (params?.status !== undefined) query['status'] = String(params.status)
  return apiGet('/api/v1/beervid/video-create/tasks', query)
}

export const listVideoLibrary = (params: VideoLibraryParams) =>
  apiPost<PaginatedResult<VideoLibraryItem>>('/api/v1/beervid/videos/library/list', params)

export const publishVideo = (params: VideoPublishParams) =>
  apiPost<VideoPublishResult>('/api/v1/beervid/videos/library/publish', params)

// Strategy
export const createStrategy = (params: StrategyCreateParams) =>
  apiPost<StrategyCreateResult>('/api/v1/beervid/strategies/create', params)

export const listStrategies = (params?: StrategyListParams) =>
  apiPost<PaginatedResult<StrategyListItem>>('/api/v1/beervid/strategies/list', params)

export const getStrategyDetail = (id: string) =>
  apiGet<StrategyDetailResult>(`/api/v1/beervid/strategies/${id}`)

export const toggleStrategy = (id: string, enable: boolean) =>
  apiPost<null>(`/api/v1/beervid/strategies/${id}/toggle`, { enable })

export const deleteStrategy = (id: string) =>
  apiDelete<null>(`/api/v1/beervid/strategies/${id}`)

// Account
export function listAccounts(params: AccountListParams): Promise<PaginatedResult<AccountItem>> {
  const query: Record<string, string> = { shoppableType: params.shoppableType }
  if (params.keyword) query['keyword'] = params.keyword
  if (params.current) query['current'] = String(params.current)
  if (params.size) query['size'] = String(params.size)
  return apiGet('/api/v1/beervid/tt-accounts', query)
}

// Template
export const listTemplates = () => apiGet<TemplateOption[]>('/api/v1/beervid/templates/options')
export const getTemplateDetail = (id: string) => apiGet<TemplateDetail>(`/api/v1/beervid/templates/${id}`)

// Label
export const listLabels = () => apiGet<LabelItem[]>('/api/v1/beervid/video-create/labels')

// Product
export const listProducts = (params: ProductListParams) =>
  apiPost<PaginatedResult<ProductItem>>('/api/v1/beervid/shop-products/list', params)

// Record
export const listRecords = (params?: RecordListParams) =>
  apiPost<PaginatedResult<RecordItem>>('/api/v1/beervid/send-records/list', params)

// Analytics
export const getVideoAnalytics = (id: string) =>
  apiGet<VideoAnalyticsResult>(`/api/v1/beervid/video/publish-task/${id}`)

// ─── Output ───────────────────────────────────────────────────────────

let pretty = false
export function setPretty(value: boolean): void { pretty = value }

export function printResult(data: unknown): void {
  console.log(pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data))
}
