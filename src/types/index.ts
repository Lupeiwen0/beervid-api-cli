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

export type TechType = 'sora' | 'veo' | 'sora_azure' | 'sora_h_pro'
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

export interface VideoPublishResult {
  shareId: string
  status: string
  message: string
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
