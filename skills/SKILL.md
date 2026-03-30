---
name: beervid-api-cli
description: "Use this skill whenever the user mentions 'BeerVid', 'beervid-api', or 'beervid' in any form. Also use this skill for TikTok-specific operational tasks that imply a managed platform: publishing a video from a video library to TikTok (especially with product IDs or 商品挂车), querying TikTok Shop products available for anchoring (挂车), checking TikTok video analytics (播放量/点赞/互动率) by video ID, listing bound TikTok accounts and their shoppable capabilities, configuring API keys for a video platform, creating AI video generation tasks (veo/sora models), managing auto-publish strategies, or viewing publish records. The distinguishing signal is platform-managed TikTok operations (publish, analytics, accounts, products) rather than raw scraping or coding. Do NOT trigger for TikTok crawling/scraping, URL parsing, ffmpeg transcoding, Stripe/Shopify, or multi-platform social media posting scripts."
---

# BeerVid Open API CLI

通过 `beervid-api` 命令行工具和 TypeScript SDK 调用 BeerVid 开放 API。

## 认证配置

```bash
beervid-api config set API_KEY your-api-key-here
# 或: export BEERVID_API_KEY=your-api-key-here
```

基础地址: `https://open.beervid.ai`，认证方式: `X-API-KEY` header。

## 命令总览

| 命令组 | 说明 | 何时读取详细参考 |
|--------|------|------------------|
| `beervid-api auth` | 认证验证 (profile, check) | 需要验证 API Key 或获取用户信息时 → [references/auth-commands.md](references/auth-commands.md) |
| `beervid-api video` | 视频生成/任务/库/发布/上传 | 需要创建视频、查询任务状态、管理视频库、发布到 TikTok 或上传文件时 → [references/video-commands.md](references/video-commands.md) |
| `beervid-api strategy` | 发布策略 CRUD + 启停 | 需要创建/查询/开关/删除自动发布策略时 → [references/strategy-commands.md](references/strategy-commands.md) |
| `beervid-api account` | TikTok 账号列表 | 需要查看已绑定的 TikTok 账号时 → [references/account-commands.md](references/account-commands.md) |
| `beervid-api template` | 视频内容模板 | 需要查看或使用视频模板时 → [references/template-commands.md](references/template-commands.md) |
| `beervid-api label` | 视频标签 | 需要获取标签列表用于视频分类时 → [references/label-commands.md](references/label-commands.md) |
| `beervid-api product` | TikTok Shop 商品 | 需要查询可挂车商品时 → [references/product-commands.md](references/product-commands.md) |
| `beervid-api record` | 发布记录 | 需要查看视频发布历史和状态时 → [references/record-commands.md](references/record-commands.md) |
| `beervid-api analytics` | 视频数据分析 | 需要查看已发布视频的播放/互动数据时 → [references/analytics-commands.md](references/analytics-commands.md) |
| `beervid-api config` | 配置管理 | 需要设置/查看 API Key 或基础地址时 → [references/config-commands.md](references/config-commands.md) |

**references 使用原则**: 仅在需要具体命令参数和输出格式时读取对应的 reference 文件，不要一次性读取所有文件。

## 全局选项

- `-q, --quiet` — 抑制进度日志 (stderr)
- `--pretty` — 美化 JSON 输出

输出规则: 进度日志 → stderr，最终结果 → stdout (JSON)。

## 核心工作流

### 视频生成 → 轮询 → 获取结果

```bash
# 1. 创建视频任务 (必须用 --json)
beervid-api video create --json '{"techType":"veo","videoScale":"9:16","dialogueLanguage":"English (American accent)","showTitle":false,"showSubtitle":false,"noBgmMusic":false,"hdEnhancement":false,"fragmentList":[{"videoContent":"A cat playing","segmentCount":1,"spliceMethod":"SPLICE","useCoverFrame":false}]}'

# 2. 查询任务状态 (status: 0=失败, 1=成功, 2=生成中)
beervid-api video tasks --status 2

# 3. 任务成功后查看视频库
beervid-api video library --current 1 --size 10
```

### 发布视频到 TikTok

```bash
# 1. 查看可用账号
beervid-api account list --shoppable-type ALL

# 2. 发布 (不挂车)
beervid-api video publish --video-id <id> --business-id <id>

# 3. 发布 (挂车商品)
beervid-api video publish --video-id <id> --business-id <id> --product-anchor --product-id <pid> --product-anchor-title "BUY NOW"
```

### 自动发布策略

```bash
# 用 JSON 文件或字符串创建策略
beervid-api strategy create --json ./strategy.json

# 启用策略
beervid-api strategy toggle <id> --enable

# 查看发布记录
beervid-api record list --strategy-id <id>
```

## SDK 用法

```typescript
import { createVideo, getVideoTasks, listAccounts } from 'beervid-api-cli'

// API Key 通过环境变量或 ~/.beervid-api/config.json 自动读取
const tasks = await getVideoTasks({ status: 1, current: 1, size: 10 })
const accounts = await listAccounts({ shoppableType: 'ALL' })
```

## 关键参数速查

| 参数 | 可选值 |
|------|--------|
| techType | `sora`, `veo`, `sora_azure`, `sora_h_pro`, `sora_aio` |
| videoScale | `16:9` (仅 veo), `9:16` |
| status (任务) | `0` 失败, `1` 成功, `2` 生成中 |
| status (发布) | `0` 发布中, `1` 创建失败, `2` 发布失败, `3` 成功 |
| shoppableType | `TT`, `TTS`, `ALL` |
| strategyType | `TEMPLATE`, `VIDEO` |
