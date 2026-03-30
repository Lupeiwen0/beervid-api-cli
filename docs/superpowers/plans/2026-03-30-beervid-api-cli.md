# beervid-api-cli Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a CLI + SDK tool (`beervid-api-cli`) covering all 18 BeerVid Open API endpoints, with Claude Code Skill integration, published to npm.

**Architecture:** Three-layer design: types → client (HTTP + SDK functions) → commands (CLI). Commander.js for CLI with subcommand groups. stderr for progress logs, stdout for JSON output. Skill files with SKILL.md index + references/ for detailed docs.

**Tech Stack:** TypeScript (ESM, strict), Commander.js, tsup, vitest, tsx, Node >= 22

**Reference Docs:**
- Design spec: `docs/superpowers/specs/2026-03-30-beervid-api-cli-design.md`
- API docs: `/Users/lu_xi/Downloads/beervid-doc/content/docs/zh/api/` (14 .mdx files)
- Reference project: `/Users/lu_xi/Project/beervid-app-cli/`

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tsup.config.ts`
- Create: `vitest.config.ts`
- Create: `.gitignore`
- Create: `.github/workflows/publish.yml`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "beervid-api-cli",
  "version": "0.1.0",
  "description": "BeerVid Open API CLI & SDK",
  "type": "module",
  "engines": { "node": ">=22.0.0" },
  "bin": { "beervid-api": "dist/cli.mjs" },
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs"
    }
  },
  "files": ["dist/", "skills/", "README.md"],
  "scripts": {
    "build": "tsup",
    "dev": "tsx src/cli.ts",
    "test": "vitest run",
    "typecheck": "tsc --noEmit",
    "prepublishOnly": "npm run build"
  },
  "keywords": ["beervid", "tiktok", "video", "api", "cli"],
  "license": "MIT",
  "dependencies": {
    "commander": "^13.1.0"
  },
  "devDependencies": {
    "@types/node": "^22.14.0",
    "tsup": "^8.5.1",
    "tsx": "^4.21.0",
    "typescript": "^5.9.3",
    "vitest": "^4.1.1"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "verbatimModuleSyntax": true,
    "skipLibCheck": true,
    "outDir": "dist"
  },
  "include": ["src", "tests", "vitest.config.ts"]
}
```

- [ ] **Step 3: Create tsup.config.ts**

```typescript
import { defineConfig } from 'tsup'
import pkg from './package.json' with { type: 'json' }

export default defineConfig({
  entry: ['src/cli.ts', 'src/index.ts'],
  format: ['esm'],
  outDir: 'dist',
  outExtension: () => ({ js: '.mjs' }),
  dts: true,
  shims: true,
  splitting: false,
  clean: true,
  banner: { js: '#!/usr/bin/env node' },
  define: {
    __PKG_VERSION__: JSON.stringify(pkg.version),
  },
})
```

- [ ] **Step 4: Create vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    clearMocks: true,
    mockReset: true,
    restoreMocks: true,
    unstubGlobals: true,
  },
})
```

- [ ] **Step 5: Create .gitignore**

```
.DS_Store
node_modules/
dist/
*.log
.npm-cache/
```

- [ ] **Step 6: Create .github/workflows/publish.yml**

```yaml
name: Publish to npm

on:
  push:
    tags:
      - '*'

jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      id-token: write
    steps:
      - uses: actions/checkout@v5

      - uses: actions/setup-node@v5
        with:
          node-version: 22
          registry-url: https://registry.npmjs.org

      - run: npm ci

      - name: Set version from tag
        run: |
          VERSION="${GITHUB_REF_NAME#v}"
          npm version "$VERSION" --no-git-tag-version

      - run: npm run build

      - run: npm publish --provenance --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

- [ ] **Step 7: Install dependencies and verify**

Run: `npm install`
Expected: node_modules created, no errors

- [ ] **Step 8: Commit**

```bash
git add package.json tsconfig.json tsup.config.ts vitest.config.ts .gitignore .github/
git commit -m "chore: scaffold project with typescript, tsup, vitest, commander"
```

---

## Task 2: Types, Logger, Config

**Files:**
- Create: `src/types/index.ts`
- Create: `src/logger.ts`
- Create: `src/config.ts`
- Test: `tests/config.test.ts`
- Test: `tests/logger.test.ts`

- [ ] **Step 1: Write tests for logger**

```typescript
// tests/logger.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('logger', () => {
  beforeEach(() => {
    vi.spyOn(process.stderr, 'write').mockImplementation(() => true)
  })

  it('info writes to stderr with [INFO] prefix', async () => {
    const { log } = await import('../src/logger.js')
    log.info('test message')
    expect(process.stderr.write).toHaveBeenCalledWith(
      expect.stringContaining('[INFO] test message')
    )
  })

  it('respects quiet mode', async () => {
    const { log, setQuiet } = await import('../src/logger.js')
    setQuiet(true)
    log.info('should not appear')
    expect(process.stderr.write).not.toHaveBeenCalled()
    setQuiet(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/logger.test.ts`
Expected: FAIL - module not found

- [ ] **Step 3: Create src/types/index.ts**

```typescript
// ─── Response envelope ────────────────────────────────────────────────

export interface OpenApiResponse<T> {
  code: number
  message: string
  data: T
  error?: boolean
  success?: boolean
}

// ─── Pagination ───────────────────────────────────────────────────────

export interface PaginatedResult<T> {
  records: T[]
  total: number
  current: number
  size: number
  pages?: number
}

// ─── Enums / Union types ──────────────────────────────────────────────

export type TechType = 'sora' | 'veo' | 'sora_azure' | 'sora_h_pro' | 'sora_aio'
export type VideoScale = '16:9' | '9:16'
export type TaskStatus = 0 | 1 | 2
export type PublishRecordStatus = 0 | 1 | 2 | 3
export type ShoppableType = 'TT' | 'TTS' | 'ALL'
export type StrategyType = 'TEMPLATE' | 'VIDEO'
export type SourceType = 'VIDEO_GENERATION' | 'STRATEGY'
export type TaskMode = 'smart' | 'expert'
export type SpliceMethod = 'SPLICE' | 'LONG_TAKE'
export type FileType = 'video' | 'image' | 'audio'
export type WorkType = 'SHORT_VIDEO' | 'IMAGE_TEXT'
export type ExecType = 'LONG_TERM' | 'FIXED_PERIOD'
export type Frequency = 'daily' | 'weekly' | 'monthly'

// ─── Auth ─────────────────────────────────────────────────────────────

export interface ProfileResult {
  userId: string
  username: string
  email: string
  avatarUrl: string
  membershipTierCode: string
  apiKeyName: string
  createdAt: string
}

export interface CheckResult {
  status: string
  username: string
  message: string
}

// ─── File Upload ──────────────────────────────────────────────────────

export interface FileUploadResult {
  fileUrl: string
  fileName: string
  fileSize: number
  contentType: string
}

// ─── Video Creation ───────────────────────────────────────────────────

export interface TitleStyleConfig {
  fontFamily?: string
  fontSize?: number
  color?: string
  offset?: number
}

export interface BgmItem {
  name: string
  url: string
  duration: number
}

export interface ChapterCreationDto {
  uid?: string
  videoContent: string
  videoContentFill?: string
  positivePrompt?: string
  negativePrompt?: string
  productReferenceImages?: string[]
  nineGridImages?: string[]
  productReferenceDescription?: string
  useCoverFrame: boolean
  segmentCount: number
  spliceMethod: SpliceMethod
  contentLib?: string[]
  portraitImages?: string[]
}

export interface VideoCreateParams {
  name?: string
  techType: TechType
  globalControl?: string
  headVideo?: string
  endVideo?: string
  videoScale: VideoScale
  titleStyleConfig?: TitleStyleConfig
  subtitleStyleConfig?: TitleStyleConfig
  bgmList?: BgmItem[]
  showTitle: boolean
  showSubtitle: boolean
  noBgmMusic: boolean
  generatedQuantity?: number
  fragmentList: ChapterCreationDto[]
  videoTitlePrompt?: string
  dialogueLanguage: string
  hdEnhancement: boolean
  labelIds?: string[]
}

// ─── Video Tasks ──────────────────────────────────────────────────────

export interface VideoTasksParams {
  current?: number
  size?: number
  status?: TaskStatus
}

export interface VideoTaskItem {
  taskId: string
  coverUrl: string
  taskName: string
  videoTitle: string
  videoContent: string
  generatedAt: string
  videoUrl: string
  status: TaskStatus
  contentData: unknown
  taskMode: string
  labelInfos: Array<{ id: string; name: string }>
  displayFailedMessage: string | null
  sourceType: string
}

// ─── Video Library ────────────────────────────────────────────────────

export interface VideoLibraryParams {
  current: number
  size: number
  name?: string
  sourceType?: SourceType
  taskIds?: string[]
  strategyIds?: string[]
  businessIds?: string[]
  dateRange?: string[]
  taskMode?: TaskMode
  auditStatus?: number[]
  labelIds?: string[]
}

export interface VideoLibraryItem {
  id: string
  name: string
  url: string
  coverUrl: string
  duration: number
  sourceType: string
  sourceTask: string
  taskId: string
  generatedDate: string
  useable: number
  type: number
  auditStatus: number
  rejectionReason: string | null
  tiktokAccounts: Array<{ businessId: string; displayName: string }>
  labelInfos: Array<{ id: string; name: string }>
}

// ─── Video Publish ────────────────────────────────────────────────────

export interface VideoPublishParams {
  videoId: string
  businessId: string
  productAnchorStatus?: boolean
  productLinkInfo?: {
    productId: string
    productAnchorTitle?: string
  }
}

// ─── Strategy ─────────────────────────────────────────────────────────

export interface BatchExecutedAt {
  date: string
  times: string[]
}

export interface ProductLinkInfo {
  productId: string
  title?: string
  productAnchorTitle?: string
}

export interface PushConfig {
  productAnchorStatus: boolean
  productLinkInfo?: ProductLinkInfo
  execType: ExecType
  frequency: Frequency
  range?: string[]
  bestTimes?: string[]
  monthlySchedule?: number[]
  weeklySchedule?: string[]
  batchExecutedAt?: BatchExecutedAt[]
}

export interface VideoInfo {
  id: string
  coverUrl: string
}

export interface StrategyCreateParams {
  name: string
  businessId: string
  strategyType: StrategyType
  pushMode: 0 | 1
  pushTimeType: 0 | 1
  pushConfig?: PushConfig
  contentTemplates?: string[]
  videoInfo?: VideoInfo[]
}

export interface StrategyListParams {
  current?: number
  size?: number
  name?: string
  status?: 0 | 1
  dateRange?: string[]
  sort?: string
  order?: 'asc' | 'desc'
  businessId?: string
}

export interface StrategyListItem {
  id: string
  name: string
  status: number
  pushTimeType: number
  durationRange: string[]
  createdAt: string
  usageEnough: boolean
}

export interface StrategyDetailResult {
  id: string
  name: string
  businessId: string
  platform: string
  strategyType: StrategyType
  pushMode: number
  pushTimeType: number
  pushConfig: PushConfig
  videoInfo?: VideoInfo[]
  contentTemplates?: string[]
  status: number
}

export interface StrategyCreateResult {
  id: string
  name: string
  businessId: string
  platform: string
  strategyType: StrategyType
  pushMode: number
  pushTimeType: number
  status: number
}

// ─── TikTok Accounts ─────────────────────────────────────────────────

export interface AccountListParams {
  shoppableType: ShoppableType
  keyword?: string
  current?: number
  size?: number
}

export interface AccountItem {
  id: string
  businessId: string
  displayName: string
  username: string
  creatorUserOpenId: string
  profileImage: string
  profileUrl: string
  followersCount: number
  country: string
  timezone: string
}

// ─── Templates ────────────────────────────────────────────────────────

export interface TemplateOption {
  value: string
  label: string
  previewVideoUrl: string
  retain: number
}

export interface TemplateDetail {
  id: string
  name: string
  status: number
  techType: string
  videoScale: string
  dialogueLanguage: string
  videoContent: string
  globalControl: string
  fragmentList: ChapterCreationDto[]
  headVideo: string
  endVideo: string
  bgmList: BgmItem[]
  showTitle: boolean
  showSubtitle: boolean
  noBgmMusic: boolean
  hdEnhancement: boolean
  titleStyleConfig: TitleStyleConfig
  subtitleStyleConfig: TitleStyleConfig
  productReferenceImages: string[]
  productReferenceDescription: string
  positivePrompt: string
  negativePrompt: string
  labels: string[]
  segmentCount: number
  spliceMethod: string
  videoType: string
  previewVideoUrl: string
  retain: number
  createdAt: string
  updatedAt: string
}

// ─── Labels ───────────────────────────────────────────────────────────

export interface LabelItem {
  id: string
  userId: string
  labelName: string
  createdAt: string
  updatedAt: string
}

// ─── Products ─────────────────────────────────────────────────────────

export interface ProductListParams {
  creatorUserOpenId: string
  current?: number
  size?: number
}

export interface ProductItem {
  id: string
  title: string
  price: { amount: string; currency: string }
  addedStatus: string
  brandName: string
  images: string[] | null
  salesCount: number
  createdAt: string
}

// ─── Send Records ─────────────────────────────────────────────────────

export interface RecordListParams {
  current?: number
  size?: number
  strategyId?: string
  businessId?: string
  status?: PublishRecordStatus
  workType?: WorkType[]
  sort?: string
  order?: 'asc' | 'desc'
  startTime?: string
  endTime?: string
}

export interface RecordItem {
  id: string
  strategyId: string | null
  strategyName: string | null
  videoId: string
  videoName: string
  videoUrl: string
  coverUrl: string
  businessId: string
  businessName: string
  workType: string
  status: number
  publishedAt: string
  errorMessage: string | null
  createdAt: string
  updatedAt: string
}

// ─── Analytics ────────────────────────────────────────────────────────

export interface VideoAnalyticsResult {
  videoId: string
  shareUrl: string
  businessName: string
  businessAvatarUrl: string
  totalFollowers: number
  newFollowers: number
  videoViews: number
  likes: number
  likeRate: number
  comments: number
  commentRate: number
  shares: number
  shareRate: number
  interactionRate: number
  reach: number
  videoDuration: number
  fullVideoWatchedRate: number
  totalTimeWatched: number
  averageTimeWatched: number
  publishedAt: string
}
```

- [ ] **Step 4: Create src/logger.ts**

```typescript
let quiet = false

export function setQuiet(value: boolean): void {
  quiet = value
}

export const log = {
  info(msg: string): void {
    if (!quiet) process.stderr.write(`[INFO] ${msg}\n`)
  },
  success(msg: string): void {
    if (!quiet) process.stderr.write(`[OK] ${msg}\n`)
  },
  warn(msg: string): void {
    if (!quiet) process.stderr.write(`[WARN] ${msg}\n`)
  },
  error(msg: string): void {
    process.stderr.write(`[ERROR] ${msg}\n`)
  },
}
```

- [ ] **Step 5: Create src/config.ts**

```typescript
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'

const CONFIG_DIR = join(homedir(), '.beervid-api')
const CONFIG_FILE = join(CONFIG_DIR, 'config.json')

interface Config {
  API_KEY?: string
  BASE_URL?: string
}

export function loadConfig(): Config {
  if (!existsSync(CONFIG_FILE)) return {}
  try {
    return JSON.parse(readFileSync(CONFIG_FILE, 'utf-8')) as Config
  } catch {
    return {}
  }
}

export function saveConfig(config: Config): void {
  mkdirSync(CONFIG_DIR, { recursive: true })
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2) + '\n', 'utf-8')
}

export function getConfigPath(): string {
  return CONFIG_FILE
}
```

- [ ] **Step 6: Write config tests**

```typescript
// tests/config.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'

vi.mock('node:fs')

describe('config', () => {
  beforeEach(() => {
    vi.mocked(existsSync).mockReturnValue(false)
  })

  it('loadConfig returns empty object when no file', async () => {
    const { loadConfig } = await import('../src/config.js')
    expect(loadConfig()).toEqual({})
  })

  it('loadConfig reads existing file', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFileSync).mockReturnValue('{"API_KEY":"test-key"}')
    const { loadConfig } = await import('../src/config.js')
    expect(loadConfig()).toEqual({ API_KEY: 'test-key' })
  })

  it('saveConfig creates directory and writes file', async () => {
    const { saveConfig } = await import('../src/config.js')
    saveConfig({ API_KEY: 'abc' })
    expect(mkdirSync).toHaveBeenCalled()
    expect(writeFileSync).toHaveBeenCalled()
  })
})
```

- [ ] **Step 7: Run tests**

Run: `npx vitest run`
Expected: All tests PASS

- [ ] **Step 8: Commit**

```bash
git add src/types/ src/logger.ts src/config.ts tests/
git commit -m "feat: add types, logger, and config modules"
```

---

## Task 3: HTTP Client + SDK Functions

**Files:**
- Create: `src/client/index.ts`
- Test: `tests/client.test.ts`

- [ ] **Step 1: Write client tests**

```typescript
// tests/client.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('client', () => {
  beforeEach(() => {
    vi.stubEnv('BEERVID_API_KEY', 'test-key-123')
    vi.stubGlobal('fetch', vi.fn())
  })

  it('apiGet sends GET with X-API-KEY header', async () => {
    const mockResponse = { code: 200, message: 'success', data: { userId: '123' } }
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify(mockResponse)))

    const { apiGet } = await import('../src/client/index.js')
    const result = await apiGet<{ userId: string }>('/api/v1/beervid/profile')
    expect(result).toEqual({ userId: '123' })
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/beervid/profile'),
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({ 'X-API-KEY': 'test-key-123' }),
      })
    )
  })

  it('apiPost sends POST with JSON body', async () => {
    const mockResponse = { code: 200, message: 'success', data: { total: 10 } }
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify(mockResponse)))

    const { apiPost } = await import('../src/client/index.js')
    const result = await apiPost<{ total: number }>('/api/v1/beervid/strategies/list', { current: 1, size: 10 })
    expect(result).toEqual({ total: 10 })
  })

  it('throws ApiError when code !== 200', async () => {
    const mockResponse = { code: 401, message: 'Unauthorized' }
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify(mockResponse)))

    const { apiGet } = await import('../src/client/index.js')
    await expect(apiGet('/api/v1/beervid/profile')).rejects.toThrow('Unauthorized')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/client.test.ts`
Expected: FAIL - module not found

- [ ] **Step 3: Create src/client/index.ts**

```typescript
import { readFileSync, existsSync } from 'node:fs'
import { resolve, basename } from 'node:path'
import { loadConfig } from '../config.js'
import type {
  OpenApiResponse, ProfileResult, CheckResult, FileUploadResult,
  VideoCreateParams, VideoTasksParams, VideoTaskItem, PaginatedResult,
  VideoLibraryParams, VideoLibraryItem, VideoPublishParams,
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
    console.error('Error: API_KEY not set. Use one of:')
    console.error('  1. beervid-api config set API_KEY <your-key>')
    console.error('  2. export BEERVID_API_KEY=<your-key>')
    process.exit(1)
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

async function handleResponse<T>(res: Response, path: string): Promise<T> {
  if (res.status >= 500) {
    throw new Error(`HTTP ${res.status} — ${path}`)
  }
  const json = (await res.json()) as OpenApiResponse<T>
  if (json.code !== 200) {
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
export const createVideo = (params: VideoCreateParams) => apiPost<null>('/api/v1/beervid/video-create', params)

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
  apiPost<Record<string, never>>('/api/v1/beervid/videos/library/publish', params)

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
```

- [ ] **Step 4: Run tests**

Run: `npx vitest run`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/client/ tests/client.test.ts
git commit -m "feat: add HTTP client and all 18 SDK functions"
```

---

## Task 4: SDK Export + CLI Entry + Config Command

**Files:**
- Create: `src/index.ts`
- Create: `src/cli.ts`
- Create: `src/commands/config.ts`

- [ ] **Step 1: Create src/index.ts**

```typescript
export type * from './types/index.js'
export {
  apiGet, apiPost, apiDelete, apiUpload, ApiError,
  getProfile, checkAuth, uploadFile,
  createVideo, getVideoTasks, listVideoLibrary, publishVideo,
  createStrategy, listStrategies, getStrategyDetail, toggleStrategy, deleteStrategy,
  listAccounts, listTemplates, getTemplateDetail,
  listLabels, listProducts, listRecords, getVideoAnalytics,
  printResult,
} from './client/index.js'
```

- [ ] **Step 2: Create src/commands/config.ts**

```typescript
import type { Command } from 'commander'
import { loadConfig, saveConfig, getConfigPath } from '../config.js'
import { printResult } from '../client/index.js'

export function registerConfigCommand(program: Command): void {
  const config = program.command('config').description('Manage CLI configuration')

  config
    .command('set <key> <value>')
    .description('Set a config value (API_KEY, BASE_URL)')
    .action((key: string, value: string) => {
      const cfg = loadConfig()
      if (key !== 'API_KEY' && key !== 'BASE_URL') {
        console.error(`[ERROR] Unknown config key: ${key}. Valid keys: API_KEY, BASE_URL`)
        process.exit(1)
      }
      ;(cfg as Record<string, string>)[key] = value
      saveConfig(cfg)
      printResult({ key, value: key === 'API_KEY' ? '***' : value })
    })

  config
    .command('get <key>')
    .description('Get a config value')
    .action((key: string) => {
      const cfg = loadConfig()
      const value = (cfg as Record<string, string | undefined>)[key]
      printResult({ key, value: key === 'API_KEY' && value ? '***' : value ?? null })
    })

  config
    .command('path')
    .description('Show config file path')
    .action(() => {
      printResult({ path: getConfigPath() })
    })
}
```

- [ ] **Step 3: Create src/cli.ts (skeleton with config only)**

```typescript
declare const __PKG_VERSION__: string

import { program } from 'commander'
import { setQuiet } from './logger.js'
import { setPretty } from './client/index.js'
import { registerConfigCommand } from './commands/config.js'

program
  .name('beervid-api')
  .version(__PKG_VERSION__ ?? '0.0.0')
  .description('BeerVid Open API CLI & SDK')
  .option('-q, --quiet', 'Suppress progress logs')
  .option('--pretty', 'Pretty-print JSON output')
  .hook('preAction', () => {
    if (program.opts()['quiet']) setQuiet(true)
    if (program.opts()['pretty']) setPretty(true)
  })

registerConfigCommand(program)

program.parse()
```

- [ ] **Step 4: Verify build works**

Run: `npx tsup`
Expected: Build succeeds, dist/cli.mjs and dist/index.mjs created

- [ ] **Step 5: Verify CLI runs**

Run: `npx tsx src/cli.ts --help`
Expected: Shows help with `config` command listed

- [ ] **Step 6: Commit**

```bash
git add src/index.ts src/cli.ts src/commands/config.ts
git commit -m "feat: add CLI entry, SDK export, and config command"
```

---

## Task 5: All CLI Command Groups

**Files:**
- Create: `src/commands/auth/index.ts`, `src/commands/auth/profile.ts`, `src/commands/auth/check.ts`
- Create: `src/commands/video/index.ts`, `src/commands/video/create.ts`, `src/commands/video/tasks.ts`, `src/commands/video/library.ts`, `src/commands/video/publish.ts`, `src/commands/video/upload.ts`
- Create: `src/commands/strategy/index.ts`, `src/commands/strategy/create.ts`, `src/commands/strategy/list.ts`, `src/commands/strategy/detail.ts`, `src/commands/strategy/toggle.ts`, `src/commands/strategy/delete.ts`
- Create: `src/commands/account/index.ts`, `src/commands/account/list.ts`
- Create: `src/commands/template/index.ts`, `src/commands/template/list.ts`, `src/commands/template/detail.ts`
- Create: `src/commands/label/index.ts`, `src/commands/label/list.ts`
- Create: `src/commands/product/index.ts`, `src/commands/product/list.ts`
- Create: `src/commands/record/index.ts`, `src/commands/record/list.ts`
- Create: `src/commands/analytics/index.ts`, `src/commands/analytics/video.ts`
- Modify: `src/cli.ts`

Each command file follows this exact pattern:

```typescript
// src/commands/{group}/{action}.ts
import type { Command } from 'commander'
import { sdkFunction } from '../../client/index.js'
import { log } from '../../logger.js'
import { printResult } from '../../client/index.js'

export function register(parent: Command): void {
  parent
    .command('action-name')
    .description('...')
    .option('--param <value>', '...')
    .action(async (opts) => {
      log.info('Doing action...')
      try {
        const result = await sdkFunction(opts)
        printResult(result)
      } catch (err) {
        log.error((err as Error).message)
        process.exit(1)
      }
    })
}
```

- [ ] **Step 1: Create all auth commands**

`src/commands/auth/profile.ts`:
```typescript
import type { Command } from 'commander'
import { getProfile, printResult } from '../../client/index.js'
import { log } from '../../logger.js'

export function register(parent: Command): void {
  parent
    .command('profile')
    .description('Get current user profile')
    .action(async () => {
      log.info('Fetching profile...')
      try {
        const result = await getProfile()
        printResult(result)
      } catch (err) {
        log.error((err as Error).message)
        process.exit(1)
      }
    })
}
```

`src/commands/auth/check.ts`:
```typescript
import type { Command } from 'commander'
import { checkAuth, printResult } from '../../client/index.js'
import { log } from '../../logger.js'

export function register(parent: Command): void {
  parent
    .command('check')
    .description('Check authentication status')
    .action(async () => {
      log.info('Checking auth...')
      try {
        const result = await checkAuth()
        printResult(result)
      } catch (err) {
        log.error((err as Error).message)
        process.exit(1)
      }
    })
}
```

`src/commands/auth/index.ts`:
```typescript
import type { Command } from 'commander'
import { register as registerProfile } from './profile.js'
import { register as registerCheck } from './check.js'

export function registerAuthCommands(program: Command): void {
  const auth = program.command('auth').description('Authentication operations')
  registerProfile(auth)
  registerCheck(auth)
}
```

- [ ] **Step 2: Create all video commands**

`src/commands/video/upload.ts`:
```typescript
import type { Command } from 'commander'
import { uploadFile, printResult } from '../../client/index.js'
import { log } from '../../logger.js'

export function register(parent: Command): void {
  parent
    .command('upload <file>')
    .description('Upload a file (video/image/audio)')
    .option('--file-type <type>', 'File type: video, image, audio')
    .action(async (file: string, opts: { fileType?: string }) => {
      log.info(`Uploading ${file}...`)
      try {
        const result = await uploadFile(file, opts.fileType)
        log.success(`Uploaded: ${result.fileUrl}`)
        printResult(result)
      } catch (err) {
        log.error((err as Error).message)
        process.exit(1)
      }
    })
}
```

`src/commands/video/create.ts`:
```typescript
import { readFileSync } from 'node:fs'
import type { Command } from 'commander'
import { createVideo, printResult } from '../../client/index.js'
import { log } from '../../logger.js'
import type { VideoCreateParams } from '../../types/index.js'

function parseJsonInput(input: string): VideoCreateParams {
  if (input === '-') {
    const stdin = readFileSync(0, 'utf-8')
    return JSON.parse(stdin) as VideoCreateParams
  }
  try {
    return JSON.parse(input) as VideoCreateParams
  } catch {
    return JSON.parse(readFileSync(input, 'utf-8')) as VideoCreateParams
  }
}

export function register(parent: Command): void {
  parent
    .command('create')
    .description('Create a video generation task')
    .option('--json <json>', 'JSON params (string, file path, or - for stdin)')
    .option('--tech-type <type>', 'Tech type: sora, veo, sora_azure, sora_h_pro, sora_aio')
    .option('--video-scale <scale>', 'Video scale: 16:9 or 9:16')
    .option('--language <lang>', 'Dialogue language', 'English (American accent)')
    .option('--name <name>', 'Video name')
    .action(async (opts: Record<string, string | undefined>) => {
      let params: VideoCreateParams
      if (opts['json']) {
        params = parseJsonInput(opts['json'])
      } else {
        if (!opts['techType'] || !opts['videoScale']) {
          console.error('[ERROR] --tech-type and --video-scale are required, or use --json')
          process.exit(1)
        }
        params = {
          techType: opts['techType'] as VideoCreateParams['techType'],
          videoScale: opts['videoScale'] as VideoCreateParams['videoScale'],
          dialogueLanguage: opts['language'] ?? 'English (American accent)',
          name: opts['name'],
          showTitle: false,
          showSubtitle: false,
          noBgmMusic: false,
          hdEnhancement: false,
          fragmentList: [],
        }
      }
      log.info('Creating video task...')
      try {
        const result = await createVideo(params)
        log.success('Video task created')
        printResult(result)
      } catch (err) {
        log.error((err as Error).message)
        process.exit(1)
      }
    })
}
```

`src/commands/video/tasks.ts`:
```typescript
import type { Command } from 'commander'
import { getVideoTasks, printResult } from '../../client/index.js'
import { log } from '../../logger.js'

export function register(parent: Command): void {
  parent
    .command('tasks')
    .description('Query video generation tasks')
    .option('--current <n>', 'Page number', '1')
    .option('--size <n>', 'Page size', '10')
    .option('--status <n>', 'Status filter: 0=failed, 1=success, 2=generating')
    .action(async (opts: { current: string; size: string; status?: string }) => {
      log.info('Fetching video tasks...')
      try {
        const result = await getVideoTasks({
          current: parseInt(opts.current),
          size: parseInt(opts.size),
          status: opts.status !== undefined ? parseInt(opts.status) as 0 | 1 | 2 : undefined,
        })
        printResult(result)
      } catch (err) {
        log.error((err as Error).message)
        process.exit(1)
      }
    })
}
```

`src/commands/video/library.ts`:
```typescript
import { readFileSync } from 'node:fs'
import type { Command } from 'commander'
import { listVideoLibrary, printResult } from '../../client/index.js'
import { log } from '../../logger.js'
import type { VideoLibraryParams } from '../../types/index.js'

export function register(parent: Command): void {
  parent
    .command('library')
    .description('Query video library')
    .option('--current <n>', 'Page number', '1')
    .option('--size <n>', 'Page size', '10')
    .option('--name <name>', 'Fuzzy search by name')
    .option('--source-type <type>', 'VIDEO_GENERATION or STRATEGY')
    .option('--task-mode <mode>', 'smart or expert')
    .option('--json <json>', 'Full JSON params')
    .action(async (opts: Record<string, string | undefined>) => {
      let params: VideoLibraryParams
      if (opts['json']) {
        params = opts['json'] === '-'
          ? JSON.parse(readFileSync(0, 'utf-8'))
          : JSON.parse(opts['json']!) as VideoLibraryParams
      } else {
        params = {
          current: parseInt(opts['current'] ?? '1'),
          size: parseInt(opts['size'] ?? '10'),
          name: opts['name'],
          sourceType: opts['sourceType'] as VideoLibraryParams['sourceType'],
          taskMode: opts['taskMode'] as VideoLibraryParams['taskMode'],
        }
      }
      log.info('Fetching video library...')
      try {
        const result = await listVideoLibrary(params)
        printResult(result)
      } catch (err) {
        log.error((err as Error).message)
        process.exit(1)
      }
    })
}
```

`src/commands/video/publish.ts`:
```typescript
import type { Command } from 'commander'
import { publishVideo, printResult } from '../../client/index.js'
import { log } from '../../logger.js'

export function register(parent: Command): void {
  parent
    .command('publish')
    .description('Publish a video to TikTok')
    .requiredOption('--video-id <id>', 'Video ID')
    .requiredOption('--business-id <id>', 'TikTok account business ID')
    .option('--product-anchor', 'Enable product anchor')
    .option('--product-id <id>', 'Product ID for anchor')
    .option('--product-anchor-title <title>', 'Product anchor title')
    .action(async (opts: Record<string, string | boolean | undefined>) => {
      log.info('Publishing video...')
      try {
        const result = await publishVideo({
          videoId: opts['videoId'] as string,
          businessId: opts['businessId'] as string,
          productAnchorStatus: opts['productAnchor'] === true,
          productLinkInfo: opts['productId'] ? {
            productId: opts['productId'] as string,
            productAnchorTitle: opts['productAnchorTitle'] as string | undefined,
          } : undefined,
        })
        log.success('Video published')
        printResult(result)
      } catch (err) {
        log.error((err as Error).message)
        process.exit(1)
      }
    })
}
```

`src/commands/video/index.ts`:
```typescript
import type { Command } from 'commander'
import { register as registerCreate } from './create.js'
import { register as registerTasks } from './tasks.js'
import { register as registerLibrary } from './library.js'
import { register as registerPublish } from './publish.js'
import { register as registerUpload } from './upload.js'

export function registerVideoCommands(program: Command): void {
  const video = program.command('video').description('Video operations')
  registerCreate(video)
  registerTasks(video)
  registerLibrary(video)
  registerPublish(video)
  registerUpload(video)
}
```

- [ ] **Step 3: Create all strategy commands**

Follow same pattern. `create` uses `--json` for complex params. `list` has pagination + filter options. `detail <id>`, `toggle <id> --enable/--disable`, `delete <id>`.

Each file in `src/commands/strategy/`: `create.ts`, `list.ts`, `detail.ts`, `toggle.ts`, `delete.ts`, `index.ts`.

- [ ] **Step 4: Create remaining simple command groups**

Each group follows the same pattern — one index.ts and one or two action files:

- `account/index.ts` + `account/list.ts`: `--shoppable-type`, `--keyword`, `--current`, `--size`
- `template/index.ts` + `template/list.ts` + `template/detail.ts`: list (no params), detail `<id>`
- `label/index.ts` + `label/list.ts`: no params
- `product/index.ts` + `product/list.ts`: `--creator-user-open-id`, `--current`, `--size`
- `record/index.ts` + `record/list.ts`: `--current`, `--size`, `--strategy-id`, `--business-id`, `--status`, `--json`
- `analytics/index.ts` + `analytics/video.ts`: `<id>` argument

- [ ] **Step 5: Update src/cli.ts to register all commands**

```typescript
declare const __PKG_VERSION__: string

import { program } from 'commander'
import { setQuiet } from './logger.js'
import { setPretty } from './client/index.js'
import { registerAuthCommands } from './commands/auth/index.js'
import { registerVideoCommands } from './commands/video/index.js'
import { registerStrategyCommands } from './commands/strategy/index.js'
import { registerAccountCommands } from './commands/account/index.js'
import { registerTemplateCommands } from './commands/template/index.js'
import { registerLabelCommands } from './commands/label/index.js'
import { registerProductCommands } from './commands/product/index.js'
import { registerRecordCommands } from './commands/record/index.js'
import { registerAnalyticsCommands } from './commands/analytics/index.js'
import { registerConfigCommand } from './commands/config.js'

program
  .name('beervid-api')
  .version(__PKG_VERSION__ ?? '0.0.0')
  .description('BeerVid Open API CLI & SDK')
  .option('-q, --quiet', 'Suppress progress logs')
  .option('--pretty', 'Pretty-print JSON output')
  .hook('preAction', () => {
    if (program.opts()['quiet']) setQuiet(true)
    if (program.opts()['pretty']) setPretty(true)
  })

registerAuthCommands(program)
registerVideoCommands(program)
registerStrategyCommands(program)
registerAccountCommands(program)
registerTemplateCommands(program)
registerLabelCommands(program)
registerProductCommands(program)
registerRecordCommands(program)
registerAnalyticsCommands(program)
registerConfigCommand(program)

program.parse()
```

- [ ] **Step 6: Verify build and CLI help**

Run: `npx tsx src/cli.ts --help`
Expected: All 10 command groups listed

Run: `npx tsx src/cli.ts video --help`
Expected: Shows create, tasks, library, publish, upload sub-commands

- [ ] **Step 7: Verify typecheck passes**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 8: Commit**

```bash
git add src/commands/ src/cli.ts
git commit -m "feat: add all CLI command groups (18 endpoints)"
```

---

## Task 6: Build Verification + Tests

**Files:**
- Test: `tests/cli.test.ts`

- [ ] **Step 1: Write CLI integration test**

```typescript
// tests/cli.test.ts
import { describe, it, expect } from 'vitest'
import { execSync } from 'node:child_process'

describe('CLI', () => {
  it('shows help', () => {
    const output = execSync('npx tsx src/cli.ts --help', { encoding: 'utf-8' })
    expect(output).toContain('beervid-api')
    expect(output).toContain('auth')
    expect(output).toContain('video')
    expect(output).toContain('strategy')
    expect(output).toContain('config')
  })

  it('shows version', () => {
    const output = execSync('npx tsx src/cli.ts --version', { encoding: 'utf-8' })
    expect(output.trim()).toMatch(/\d+\.\d+\.\d+/)
  })

  it('config path works', () => {
    const output = execSync('npx tsx src/cli.ts config path', { encoding: 'utf-8' })
    expect(output).toContain('.beervid-api')
    expect(output).toContain('config.json')
  })
})
```

- [ ] **Step 2: Run all tests**

Run: `npx vitest run`
Expected: All tests PASS

- [ ] **Step 3: Build and verify dist**

Run: `npx tsup`
Expected: dist/cli.mjs and dist/index.mjs created with no errors

- [ ] **Step 4: Commit**

```bash
git add tests/cli.test.ts
git commit -m "test: add CLI integration tests"
```

---

## Task 7: Skill Integration (via /skill-creator)

**Files:**
- Create: `skills/skill.json`
- Create: `skills/SKILL.md`
- Create: `skills/references/*.md` (10 files)

- [ ] **Step 1: Use /skill-creator to create the Skill**

Invoke `/skill-creator` with context about beervid-api-cli. The Skill should:
- Trigger when the user mentions BeerVid Open API, video generation, publishing strategy, or TikTok video management
- SKILL.md: concise overview + command group index + workflow examples
- references/: one file per command group with full parameter docs and JSON examples

- [ ] **Step 2: Create skills/skill.json**

```json
{
  "name": "beervid-api-cli",
  "version": "0.1.0",
  "description": "BeerVid 开放 API CLI & SDK - 视频生成、发布策略、TikTok 账号管理、数据分析",
  "author": "BeerVid",
  "license": "MIT",
  "main": "SKILL.md",
  "files": ["SKILL.md", "references/"],
  "dependencies": {
    "beervid-api-cli": "^0.1.0"
  },
  "skillMetadata": {
    "category": "api-integration",
    "platform": "beervid",
    "apiVersion": "v1",
    "requiresAuth": true,
    "authType": "api-key"
  }
}
```

- [ ] **Step 3: Create skills/SKILL.md (concise + indexed)**

Content: API overview, auth method, command group table (one line per group), core workflow examples (video create → poll → library), index links to references/*.

- [ ] **Step 4: Create all 10 references files**

Each file: command parameters table, example CLI invocations, example JSON request/response.

Source the exact field names and examples from the API docs at:
`/Users/lu_xi/Downloads/beervid-doc/content/docs/zh/api/`

- [ ] **Step 5: Commit**

```bash
git add skills/
git commit -m "feat: add Claude Code Skill with references"
```

---

## Task 8: GitHub Actions + README + Final Verification

**Files:**
- Create: `README.md`

- [ ] **Step 1: Create README.md**

Basic README with: installation, quick start (config + first command), command reference table, SDK usage example.

- [ ] **Step 2: Full build verification**

Run: `npm run build && npm run typecheck && npm run test`
Expected: All pass

- [ ] **Step 3: Verify CLI end-to-end**

Run: `npx tsx src/cli.ts --help`
Run: `npx tsx src/cli.ts video --help`
Run: `npx tsx src/cli.ts strategy --help`
Run: `npx tsx src/cli.ts config path`
Expected: All commands show correct help and output

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: add README"
```

---

## Task 9: Codex Review

- [ ] **Step 1: Run Codex review with gpt-5.4**

Use `codex` to review the entire codebase for:
- Code quality and consistency
- Type safety
- Error handling
- Missing edge cases

- [ ] **Step 2: Fix any issues found**

Address each issue from the Codex review.

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "fix: address codex review feedback"
```
