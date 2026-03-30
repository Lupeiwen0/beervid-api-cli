# BeerVid Open API CLI

BeerVid 开放 API 的 CLI 命令行工具和 TypeScript SDK。

## 认证配置

```bash
# 设置 API Key
beervid-api config set API_KEY your-api-key-here

# 或使用环境变量
export BEERVID_API_KEY=your-api-key-here
```

API 基础地址: `https://open.beervid.ai`，所有请求通过 `X-API-KEY` header 认证。

## 命令总览

| 命令组 | 说明 | 详细参考 |
|--------|------|----------|
| `beervid-api auth` | 认证验证 (profile, check) | [references/auth-commands.md](references/auth-commands.md) |
| `beervid-api video` | 视频操作 (create, tasks, library, publish, upload) | [references/video-commands.md](references/video-commands.md) |
| `beervid-api strategy` | 发布策略 (create, list, detail, toggle, delete) | [references/strategy-commands.md](references/strategy-commands.md) |
| `beervid-api account` | TikTok 账号 (list) | [references/account-commands.md](references/account-commands.md) |
| `beervid-api template` | 视频模板 (list, detail) | [references/template-commands.md](references/template-commands.md) |
| `beervid-api label` | 标签 (list) | [references/label-commands.md](references/label-commands.md) |
| `beervid-api product` | TikTok Shop 商品 (list) | [references/product-commands.md](references/product-commands.md) |
| `beervid-api record` | 发布记录 (list) | [references/record-commands.md](references/record-commands.md) |
| `beervid-api analytics` | 视频数据分析 (video) | [references/analytics-commands.md](references/analytics-commands.md) |
| `beervid-api config` | 配置管理 (set, get, path) | [references/config-commands.md](references/config-commands.md) |

## 全局选项

- `-q, --quiet` — 抑制进度日志
- `--pretty` — 美化 JSON 输出

## 输出格式

- 进度日志 → stderr（不影响管道）
- 最终结果 → stdout，JSON 格式

## 核心工作流

### 创建视频 → 轮询状态 → 获取结果

```bash
# 1. 创建视频任务
beervid-api video create --json '{"techType":"veo","videoScale":"9:16","dialogueLanguage":"English (American accent)","showTitle":false,"showSubtitle":false,"noBgmMusic":false,"hdEnhancement":false,"fragmentList":[{"videoContent":"A cat playing","segmentCount":1,"spliceMethod":"SPLICE","useCoverFrame":false}]}'

# 2. 查询任务状态 (status: 0=pending, 1=processing, 2=done)
beervid-api video tasks --status 2

# 3. 查看视频库
beervid-api video library --current 1 --size 10
```

### 发布视频到 TikTok

```bash
# 1. 查看可用账号
beervid-api account list --shoppable-type ALL

# 2. 发布视频
beervid-api video publish --video-id <id> --business-id <id>
```

### 创建发布策略

```bash
# 使用 --json 传入完整策略配置
beervid-api strategy create --json ./strategy.json
```

## SDK 用法

```typescript
import { createVideo, getVideoTasks } from 'beervid-api-cli'

const result = await createVideo({ techType: 'veo', videoScale: '9:16', ... })
const tasks = await getVideoTasks({ status: 2 })
```
