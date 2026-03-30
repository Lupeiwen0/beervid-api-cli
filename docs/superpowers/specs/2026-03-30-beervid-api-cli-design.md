# beervid-api-cli 设计文档

> 日期: 2026-03-30
> 状态: 待审核

## 1. 项目定位

beervid-api-cli 是 BeerVid 自身开放 API 的官方 CLI + SDK 工具，发布到 npm。

- **与 beervid-app-cli 的区别**: beervid-app-cli 属于三方应用体系；beervid-api-cli 属于自身开放 API 体系，两者是不同的产品线。
- **双输出**: CLI 命令行工具 + TypeScript SDK 库导出
- **Skill 集成**: 包含 Claude Code Skill，让 AI 助手可以调用 BeerVid 开放 API

## 2. 技术选型

| 类别 | 选择 | 说明 |
|------|------|------|
| 语言 | TypeScript (ESM) | 严格模式，ES2022 target |
| CLI 框架 | Commander.js | 原生子命令分组支持 |
| 构建 | tsup | ESM 输出，自动 d.ts 生成 |
| 测试 | vitest | 快速，TypeScript 原生支持 |
| 开发运行 | tsx | TypeScript 直接执行 |
| Node.js | >= 22.0.0 | 与 beervid-app-cli 一致 |
| 包管理 | npm | 发布到 npm registry |

## 3. 项目结构

```
beervid-api-cli/
├── src/
│   ├── cli.ts                     # CLI 入口 (#!/usr/bin/env node)
│   ├── index.ts                   # SDK 库导出
│   ├── client/
│   │   └── index.ts               # HTTP 客户端 (fetch, auth, error handling)
│   ├── commands/
│   │   ├── auth/
│   │   │   ├── index.ts           # 注册 auth 子命令组
│   │   │   ├── profile.ts         # beervid-api auth profile
│   │   │   └── check.ts           # beervid-api auth check
│   │   ├── video/
│   │   │   ├── index.ts           # 注册 video 子命令组
│   │   │   ├── create.ts          # beervid-api video create
│   │   │   ├── tasks.ts           # beervid-api video tasks
│   │   │   ├── library.ts         # beervid-api video library
│   │   │   ├── publish.ts         # beervid-api video publish
│   │   │   └── upload.ts          # beervid-api video upload
│   │   ├── strategy/
│   │   │   ├── index.ts           # 注册 strategy 子命令组
│   │   │   ├── create.ts          # beervid-api strategy create
│   │   │   ├── list.ts            # beervid-api strategy list
│   │   │   ├── detail.ts          # beervid-api strategy detail <id>
│   │   │   ├── toggle.ts          # beervid-api strategy toggle <id>
│   │   │   └── delete.ts          # beervid-api strategy delete <id>
│   │   ├── account/
│   │   │   ├── index.ts           # 注册 account 子命令组
│   │   │   └── list.ts            # beervid-api account list
│   │   ├── template/
│   │   │   ├── index.ts           # 注册 template 子命令组
│   │   │   ├── list.ts            # beervid-api template list
│   │   │   └── detail.ts          # beervid-api template detail <id>
│   │   ├── label/
│   │   │   ├── index.ts           # 注册 label 子命令组
│   │   │   └── list.ts            # beervid-api label list
│   │   ├── product/
│   │   │   ├── index.ts           # 注册 product 子命令组
│   │   │   └── list.ts            # beervid-api product list
│   │   ├── record/
│   │   │   ├── index.ts           # 注册 record 子命令组
│   │   │   └── list.ts            # beervid-api record list
│   │   ├── analytics/
│   │   │   ├── index.ts           # 注册 analytics 子命令组
│   │   │   └── video.ts           # beervid-api analytics video <id>
│   │   └── config.ts              # beervid-api config <set|get|path>
│   ├── types/
│   │   └── index.ts               # 所有类型定义
│   ├── config.ts                  # 配置管理 (~/.beervid-api/config.json)
│   └── logger.ts                  # 日志工具 (stderr 输出)
├── skills/                        # Claude Code Skill
│   ├── skill.json                 # Skill 元数据
│   ├── SKILL.md                   # Skill 主文件（精简 + 索引）
│   └── references/                # 详细命令参考
│       ├── auth-commands.md
│       ├── video-commands.md
│       ├── strategy-commands.md
│       ├── account-commands.md
│       ├── template-commands.md
│       ├── label-commands.md
│       ├── product-commands.md
│       ├── record-commands.md
│       ├── analytics-commands.md
│       └── config-commands.md
├── tests/                         # Vitest 测试
├── docs/                          # 设计文档
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── vitest.config.ts
├── .gitignore
└── .github/workflows/publish.yml  # npm 自动发布
```

## 4. API 端点覆盖（18 个）

所有端点基于开放 API 文档完整覆盖：

### 认证 (auth)
| 端点 | 方法 | CLI 命令 |
|------|------|----------|
| `/api/v1/beervid/profile` | GET | `beervid-api auth profile` |
| `/api/v1/beervid/check` | GET | `beervid-api auth check` |

### 文件上传 (video upload)
| 端点 | 方法 | CLI 命令 |
|------|------|----------|
| `/api/v1/beervid/video-create/upload` | POST | `beervid-api video upload` |

### 视频 (video)
| 端点 | 方法 | CLI 命令 |
|------|------|----------|
| `/api/v1/beervid/video-create` | POST | `beervid-api video create` |
| `/api/v1/beervid/video-create/tasks` | GET | `beervid-api video tasks` |
| `/api/v1/beervid/videos/library/list` | POST | `beervid-api video library` |
| `/api/v1/beervid/videos/library/publish` | POST | `beervid-api video publish` |

### 发布策略 (strategy)
| 端点 | 方法 | CLI 命令 |
|------|------|----------|
| `/api/v1/beervid/strategies/create` | POST | `beervid-api strategy create` |
| `/api/v1/beervid/strategies/list` | POST | `beervid-api strategy list` |
| `/api/v1/beervid/strategies/{id}` | GET | `beervid-api strategy detail <id>` |
| `/api/v1/beervid/strategies/{id}/toggle` | POST | `beervid-api strategy toggle <id>` |
| `/api/v1/beervid/strategies/{id}` | DELETE | `beervid-api strategy delete <id>` |

### TT 账号 (account)
| 端点 | 方法 | CLI 命令 |
|------|------|----------|
| `/api/v1/beervid/tt-accounts` | GET | `beervid-api account list` |

### 模板 (template)
| 端点 | 方法 | CLI 命令 |
|------|------|----------|
| `/api/v1/beervid/templates/options` | GET | `beervid-api template list` |
| `/api/v1/beervid/templates/{id}` | GET | `beervid-api template detail <id>` |

### 标签 (label)
| 端点 | 方法 | CLI 命令 |
|------|------|----------|
| `/api/v1/beervid/video-create/labels` | GET | `beervid-api label list` |

### 商品 (product)
| 端点 | 方法 | CLI 命令 |
|------|------|----------|
| `/api/v1/beervid/shop-products/list` | POST | `beervid-api product list` |

### 发布记录 (record)
| 端点 | 方法 | CLI 命令 |
|------|------|----------|
| `/api/v1/beervid/send-records/list` | POST | `beervid-api record list` |

### 数据分析 (analytics)
| 端点 | 方法 | CLI 命令 |
|------|------|----------|
| `/api/v1/beervid/video/publish-task/{id}` | GET | `beervid-api analytics video <id>` |

## 5. HTTP 客户端设计 (`src/client/index.ts`)

### 认证与配置
- `getApiKey()`: 从 env `BEERVID_API_KEY` 或 `~/.beervid-api/config.json` 获取
- `getBaseUrl()`: 从 env `BEERVID_API_BASE_URL` 或配置文件，默认 `https://open.beervid.ai`

### 请求方法
```typescript
apiGet<T>(path: string, params?: Record<string, string>): Promise<T>
apiPost<T>(path: string, body?: unknown): Promise<T>
apiDelete<T>(path: string): Promise<T>
apiUpload<T>(path: string, file: File | string, fileType?: string): Promise<T>
```

### 统一行为
- 所有请求自动附加 `X-API-KEY` header
- 统一响应类型 `OpenApiResponse<T>`: `{ code, message, data }`
- `code !== 200` 时抛出 `ApiError`（含 code + message）
- HTTP 5xx 抛出 `HttpError`
- 上传方法支持本地文件路径和 URL

## 6. CLI 命令设计

### 入口

```typescript
// src/cli.ts
import { program } from 'commander'

program.name('beervid-api').version(__PKG_VERSION__).description('BeerVid Open API CLI')

// 注册所有命令组
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

### 命令注册模式

每个命令组的 `index.ts` 创建子命令并注册具体动作：

```typescript
// src/commands/video/index.ts
export function registerVideoCommands(program: Command) {
  const video = program.command('video').description('视频相关操作')
  registerCreate(video)
  registerTasks(video)
  registerLibrary(video)
  registerPublish(video)
  registerUpload(video)
}
```

### 复杂参数处理

对于参数较多的命令（如 `video create`、`strategy create`），支持 `--json` 选项：

```bash
# 方式1: 命令行参数
beervid-api video create --tech-type veo --video-scale 9:16 ...

# 方式2: JSON 文件
beervid-api video create --json ./create-params.json

# 方式3: JSON 字符串
beervid-api video create --json '{"techType":"veo","videoScale":"9:16",...}'

# 方式4: stdin pipe
echo '{"techType":"veo"}' | beervid-api video create --json -
```

### 输出设计

- **进度日志** → `stderr`（不影响 JSON 管道）
  ```
  [INFO] 正在创建视频任务...
  [INFO] 任务创建成功，taskId: abc123
  ```
- **最终结果** → `stdout`，默认 JSON 格式
- 全局选项：
  - `--quiet` / `-q`: 抑制进度日志
  - `--pretty`: 美化 JSON 输出（默认紧凑）

## 7. 配置管理 (`src/config.ts`)

- 配置目录: `~/.beervid-api/`
- 配置文件: `~/.beervid-api/config.json`
- 支持的配置项:
  - `API_KEY`: API 密钥
  - `BASE_URL`: API 基础地址
- 优先级: 环境变量 > 配置文件 > 默认值

CLI 命令:
```bash
beervid-api config set API_KEY your-key-here
beervid-api config set BASE_URL https://custom.api.url
beervid-api config get API_KEY
beervid-api config path    # 显示配置文件路径
```

## 8. 日志模块 (`src/logger.ts`)

```typescript
// 所有日志输出到 stderr
log.info(msg)     // [INFO] msg
log.success(msg)  // [OK] msg
log.warn(msg)     // [WARN] msg
log.error(msg)    // [ERROR] msg
```

- 输出到 `stderr`，不干扰 `stdout` 的 JSON 数据流
- 受 `--quiet` 全局选项控制

## 9. 类型定义 (`src/types/index.ts`)

### 通用类型
```typescript
interface OpenApiResponse<T> {
  code: number
  message: string
  data: T
}

type TechType = 'sora' | 'veo' | 'sora_azure' | 'sora_h_pro' | 'sora_aio'
type VideoScale = '16:9' | '9:16'
type TaskStatus = 0 | 1 | 2  // 0=失败, 1=成功, 2=生成中
type PublishRecordStatus = 0 | 1 | 2 | 3  // 0=发布中, 1=创建失败, 2=发布失败, 3=成功
type ShoppableType = 'TT' | 'TTS' | 'ALL'
type StrategyType = 'TEMPLATE' | 'VIDEO'
```

### 端点类型
每个 API 端点对应：
- `XxxParams` — 请求参数类型
- `XxxResult` — 响应 data 字段类型

## 10. SDK 导出 (`src/index.ts`)

```typescript
// 类型导出
export type { OpenApiResponse, TechType, VideoScale, ... } from './types'

// 客户端底层方法
export { apiGet, apiPost, apiDelete, apiUpload } from './client'

// 高级 API 封装（按功能域）
export { getProfile, checkAuth } from './client'
export { createVideo, getVideoTasks, listVideoLibrary, publishVideo, uploadFile } from './client'
export { createStrategy, listStrategies, getStrategyDetail, toggleStrategy, deleteStrategy } from './client'
export { listAccounts } from './client'
export { listTemplates, getTemplateDetail } from './client'
export { listLabels } from './client'
export { listProducts } from './client'
export { listRecords } from './client'
export { getVideoAnalytics } from './client'
```

程序化使用示例:
```typescript
import { createVideo, getVideoTasks } from 'beervid-api-cli'

const result = await createVideo({ techType: 'veo', videoScale: '9:16', ... })
const tasks = await getVideoTasks({ status: 2, current: 1, size: 10 })
```

## 11. Skill 集成

### 创建方式
使用 `/skill-creator` 工具创建 Skill，确保触发条件、描述、元数据正确。

### 目录结构
```
skills/
├── skill.json                  # Skill 元数据 (name, version, description, trigger)
├── SKILL.md                    # Skill 主文件（精简 + 索引）
└── references/                 # 详细命令参考文档
    ├── auth-commands.md        # auth 命令组参数 + 输出示例
    ├── video-commands.md       # video 命令组参数 + 输出示例
    ├── strategy-commands.md    # strategy 命令组参数 + 输出示例
    ├── account-commands.md     # account 命令组参数 + 输出示例
    ├── template-commands.md    # template 命令组参数 + 输出示例
    ├── label-commands.md       # label 命令组参数 + 输出示例
    ├── product-commands.md     # product 命令组参数 + 输出示例
    ├── record-commands.md      # record 命令组参数 + 输出示例
    ├── analytics-commands.md   # analytics 命令组参数 + 输出示例
    └── config-commands.md      # config 命令参数 + 输出示例
```

### SKILL.md 内容策略
- 精简：触发条件说明、API 认证方式、命令组总览（一行一组）、核心工作流速查
- 索引：详细参数和输出 → `参见 references/xxx-commands.md`
- 避免冗长，让 AI 助手只在需要时读取详细参考

### references/*.md 内容
每个文件包含：
- 命令完整参数说明
- 请求 JSON 示例
- 响应 JSON 示例
- 常见用法场景

## 12. 构建与发布

### package.json
```json
{
  "name": "beervid-api-cli",
  "version": "0.1.0",
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
  }
}
```

### tsup.config.ts
- 入口: `src/cli.ts` + `src/index.ts`
- 输出: ESM (.mjs)
- 类型声明: 自动生成 .d.ts
- Shebang: CLI 入口注入 `#!/usr/bin/env node`
- 版本注入: `__PKG_VERSION__`

### GitHub Actions
- 触发: git tag (v*)
- 步骤: checkout → setup node 22 → npm ci → build → npm publish --provenance

## 13. 测试策略

- 使用 vitest
- 优先测试客户端层（请求构建、错误处理）和类型正确性
- 命令层使用集成测试验证参数解析
- Mock HTTP 请求，不依赖真实 API

## 14. 依赖清单

### dependencies
- `commander` — CLI 框架

### devDependencies
- `@types/node` — Node.js 类型
- `tsup` — 构建工具
- `tsx` — 开发运行
- `typescript` — 类型检查
- `vitest` — 测试框架
