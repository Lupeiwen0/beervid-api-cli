# BeerVid API CLI Best Practices & Examples

> This document provides tested, production-verified examples for every CLI command.
> All examples reflect the actual API behavior validated on 2026-03-31.

## Table of Contents

1. [Global Conventions](#global-conventions)
2. [Config](#config)
3. [Auth](#auth)
4. [Account](#account)
5. [Video Create](#video-create)
6. [Video Tasks](#video-tasks)
7. [Video Library](#video-library)
8. [Video Upload](#video-upload)
9. [Video Publish](#video-publish)
10. [Strategy Create](#strategy-create)
11. [Strategy List / Detail](#strategy-list--detail)
12. [Strategy Toggle / Delete](#strategy-toggle--delete)
13. [Template](#template)
14. [Label](#label)
15. [Product](#product)
16. [Record](#record)
17. [Analytics](#analytics)
18. [Common Workflows](#common-workflows)

---

## Global Conventions

### Output Control

```bash
# Quiet mode: suppress stderr progress logs, stdout outputs JSON only
beervid-api account list -q

# Pretty print: indented JSON output
beervid-api account list --pretty

# Combine both
beervid-api account list -q --pretty
```

### JSON Input Modes (for commands with `--json`)

Three ways to pass JSON to commands that accept `--json`:

```bash
# 1. Inline JSON string (best for simple payloads)
beervid-api video create --json '{"techType":"veo",...}'

# 2. File path (best for complex/reusable payloads)
beervid-api video create --json ./params.json

# 3. Stdin pipe (best for programmatic use)
cat params.json | beervid-api video create --json -
```

### Parameter Required/Optional Legend

In the examples below:
- **(required)** — command will error without this parameter
- **(optional)** — can be omitted, has default or is not needed
- **(conditional)** — required only when a related flag is set

---

## Config

### `config set <key> <value>`

| Parameter | Required | Values |
|-----------|----------|--------|
| `<key>` | **required** | `API_KEY` or `BASE_URL` only |
| `<value>` | **required** | The value to set |

```bash
# Set API Key
beervid-api config set API_KEY 019d0a8b-5ac4-70ec-a3d7-541ab6c9a774
# → {"key":"API_KEY","value":"***"}

# Set base URL
beervid-api config set BASE_URL https://open.beervid.ai
# → {"key":"BASE_URL","value":"https://open.beervid.ai"}

# Invalid key name → error
beervid-api config set INVALID_KEY xxx
# → error: only API_KEY and BASE_URL are supported
```

### `config get <key>`

```bash
beervid-api config get API_KEY
# → {"key":"API_KEY","value":"***"}  (API_KEY is always masked)

beervid-api config get BASE_URL
# → {"key":"BASE_URL","value":"https://open.beervid.ai"}

beervid-api config get UNKNOWN
# → {"key":"UNKNOWN","value":null}
```

### `config path`

```bash
beervid-api config path
# → {"path":"/Users/<user>/.config/beervid-api/config.json"}
```

### Environment Variable Override

```bash
# Env var takes priority over config file
BEERVID_API_KEY=your-key beervid-api auth check
```

---

## Auth

### `auth check`

No parameters required.

```bash
beervid-api auth check
# → {"message":"认证成功","status":"authenticated","username":"yang xiaolei"}

# With invalid key
BEERVID_API_KEY=invalid beervid-api auth check -q
# → {"error":true,"code":401,"message":"Invalid API Key"}  (exit code 1)
```

### `auth profile`

No parameters required.

```bash
beervid-api auth profile
# → {
#     "userId": "...",
#     "username": "yang xiaolei",
#     "email": "...",
#     "membershipTierCode": "...",
#     "apiKeyName": "..."
#   }
```

---

## Account

### `account list`

| Parameter | Required | Type | Default | Values |
|-----------|----------|------|---------|--------|
| `--shoppable-type` | optional | string | `ALL` | `TT`, `TTS`, `ALL` |
| `--keyword` | optional | string | — | Search keyword |
| `--current` | optional | number | — | Page number |
| `--size` | optional | number | — | Page size |

```bash
# List all accounts (default: ALL)
beervid-api account list
# → {records: [...], total: 7, current: 1, size: 20}

# Filter TikTok only
beervid-api account list --shoppable-type TT

# Filter TikTok Shop only
beervid-api account list --shoppable-type TTS
# → {records: [], total: 0, ...}  (if no Shop accounts)

# Search by keyword
beervid-api account list --keyword steve72920
# → Returns matching account with businessId and creatorUserOpenId

# Pagination
beervid-api account list --current 1 --size 2

# Page beyond range returns empty
beervid-api account list --current 999
# → {records: [], total: 7, current: 999, size: 20}
```

**Key response fields per account:**
- `id` — account UUID
- `businessId` — used for publishing and strategy creation
- `username` — TikTok handle
- `displayName` — display name
- `creatorUserOpenId` — needed for product queries (null if no TikTok Shop binding)
- `followersCount` — follower count

---

## Video Create

### `video create` (JSON input — recommended)

**JSON body fields:**

| Field | Required | Type | Values / Notes |
|-------|----------|------|----------------|
| `techType` | **required** | string | `sora`, `veo`, `sora_azure`, `sora_h_pro` |
| `videoScale` | **required** | string | `9:16` (all models), `16:9` (veo only) |
| `dialogueLanguage` | **required** | string | e.g. `"English (American accent)"` |
| `showTitle` | **required** | boolean | Show title overlay |
| `showSubtitle` | **required** | boolean | Show subtitles |
| `noBgmMusic` | **required** | boolean | `true` = no background music |
| `hdEnhancement` | **required** | boolean | HD upscale (sora/sora_azure/sora_h_pro only, NOT veo) |
| `fragmentList` | **required** | array | At least 1 fragment |
| `fragmentList[].videoContent` | **required** | string | Scene description text |
| `fragmentList[].segmentCount` | **required** | number | Number of segments (usually 1) |
| `fragmentList[].spliceMethod` | **required** | string | `SPLICE` or `LONG_TAKE` |
| `fragmentList[].useCoverFrame` | optional | boolean | Use cover frame |
| `fragmentList[].positivePrompt` | optional | string | Positive prompt for generation |
| `fragmentList[].negativePrompt` | optional | string | Negative prompt |
| `fragmentList[].productReferenceImages` | optional | string[] | Product reference image URLs |
| `fragmentList[].contentLib` | optional | string[] | Content library references |
| `name` | optional | string | Custom video name |
| `generatedQuantity` | optional | number | Number of videos to generate |
| `labelIds` | optional | string[] | Label IDs for categorization |
| `bgmList` | optional | array | Background music list |
| `bgmList[].name` | optional | string | Music name |
| `bgmList[].url` | optional | string | Music URL |
| `bgmList[].duration` | optional | number | Duration in seconds |
| `titleStyleConfig` | optional | object | `{fontFamily, fontSize, color, offset}` |
| `subtitleStyleConfig` | optional | object | Same as titleStyleConfig |
| `globalControl` | optional | string | Global control prompt |
| `headVideo` | optional | string | Head video URL |
| `endVideo` | optional | string | End video URL |
| `videoTitlePrompt` | optional | string | Video title generation prompt |

#### Example 1: Minimal — veo 9:16

```bash
beervid-api video create --json '{
  "techType": "veo",
  "videoScale": "9:16",
  "dialogueLanguage": "English (American accent)",
  "showTitle": false,
  "showSubtitle": false,
  "noBgmMusic": false,
  "hdEnhancement": false,
  "fragmentList": [
    {
      "videoContent": "A cat playing in a garden with butterflies",
      "segmentCount": 1,
      "spliceMethod": "SPLICE",
      "useCoverFrame": false
    }
  ]
}'
# → {"taskIds":["019d0e21-xxxx-xxxx-xxxx-xxxxxxxxxxxx"],"message":"Video creation tasks submitted successfully"}
```

#### Example 2: veo 16:9 (only veo supports 16:9)

```bash
beervid-api video create --json '{
  "techType": "veo",
  "videoScale": "16:9",
  "dialogueLanguage": "English (American accent)",
  "showTitle": false,
  "showSubtitle": false,
  "noBgmMusic": false,
  "hdEnhancement": false,
  "fragmentList": [
    {
      "videoContent": "Ocean waves crashing on a rocky shore at sunset",
      "segmentCount": 1,
      "spliceMethod": "SPLICE",
      "useCoverFrame": false
    }
  ]
}'
```

> **Note:** Using `16:9` with sora/sora_azure/sora_h_pro returns error:
> `"Video scale '16:9' only works with veo tech type"`

#### Example 3: sora with HD Enhancement

```bash
beervid-api video create --json '{
  "techType": "sora",
  "videoScale": "9:16",
  "dialogueLanguage": "English (American accent)",
  "showTitle": false,
  "showSubtitle": true,
  "noBgmMusic": false,
  "hdEnhancement": true,
  "fragmentList": [
    {
      "videoContent": "A professional chef preparing sushi in a modern kitchen",
      "segmentCount": 1,
      "spliceMethod": "SPLICE",
      "useCoverFrame": false
    }
  ]
}'
```

> **Note:** `hdEnhancement: true` with veo will error. Only sora series models support HD enhancement.

#### Example 4: Multiple fragments

```bash
beervid-api video create --json '{
  "techType": "sora_azure",
  "videoScale": "9:16",
  "dialogueLanguage": "English (American accent)",
  "showTitle": false,
  "showSubtitle": false,
  "noBgmMusic": true,
  "hdEnhancement": false,
  "fragmentList": [
    {
      "videoContent": "Morning sunrise over mountains",
      "segmentCount": 1,
      "spliceMethod": "SPLICE",
      "useCoverFrame": false
    },
    {
      "videoContent": "A hiker reaching the summit and celebrating",
      "segmentCount": 1,
      "spliceMethod": "SPLICE",
      "useCoverFrame": false
    }
  ]
}'
```

#### Example 5: Named video with labels

```bash
beervid-api video create --json '{
  "name": "product-demo-v1",
  "techType": "sora_h_pro",
  "videoScale": "9:16",
  "dialogueLanguage": "English (American accent)",
  "showTitle": true,
  "showSubtitle": true,
  "noBgmMusic": false,
  "hdEnhancement": false,
  "labelIds": ["label-uuid-here"],
  "fragmentList": [
    {
      "videoContent": "Showcasing a sleek wireless headphone with premium packaging",
      "segmentCount": 1,
      "spliceMethod": "SPLICE",
      "useCoverFrame": false
    }
  ]
}'
```

### `video create` (CLI shortcut params)

| Parameter | Required | Type | Default | Notes |
|-----------|----------|------|---------|-------|
| `--tech-type` | **required** | string | — | `sora`, `veo`, `sora_azure`, `sora_h_pro` |
| `--video-scale` | optional | string | `9:16` | `16:9` only for veo |
| `--language` | optional | string | `English (American accent)` | Dialogue language |
| `--name` | optional | string | — | Video name |
| `--json` | optional | string | — | Full JSON overrides all above |

```bash
# Minimal with CLI params (auto-creates a default fragment)
beervid-api video create --tech-type veo --video-scale 9:16

# With name override
beervid-api video create --tech-type sora --name "my-test-video"
```

> **Best practice:** Prefer `--json` for full control. CLI shortcut params are convenient for quick generation but `--json` gives access to all fields (fragments, subtitles, BGM, etc).

### Validation Errors

```bash
# Missing techType
beervid-api video create --json '{}'
# → "Tech type (techType) is required, cannot be empty"

# Invalid techType
beervid-api video create --json '{"techType":"invalid","videoScale":"9:16","dialogueLanguage":"en","showTitle":false,"showSubtitle":false,"noBgmMusic":false,"hdEnhancement":false,"fragmentList":[]}'
# → "Tech type 'invalid' is not supported."
```

---

## Video Tasks

### `video tasks`

| Parameter | Required | Type | Values |
|-----------|----------|------|--------|
| `--current` | optional | number | Page number |
| `--size` | optional | number | Page size |
| `--status` | optional | number | `0` = failed, `1` = succeeded, `2` = generating |

```bash
# All tasks
beervid-api video tasks
# → {records: [...], total: 1458, current: 1, size: 20}

# Only succeeded
beervid-api video tasks --status 1

# Only generating (in progress)
beervid-api video tasks --status 2

# Only failed
beervid-api video tasks --status 0

# Paginated
beervid-api video tasks --current 1 --size 3
```

---

## Video Library

### `video library`

| Parameter | Required | Type | Default | Values |
|-----------|----------|------|---------|--------|
| `--current` | optional | number | `1` | Page number |
| `--size` | optional | number | `20` | Page size |
| `--name` | optional | string | — | Filter by video name |
| `--source-type` | optional | string | — | `VIDEO_GENERATION` or `STRATEGY` |
| `--task-mode` | optional | string | — | `smart` or `expert` |

```bash
# Default view
beervid-api video library

# Search by name
beervid-api video library --name "cat"

# Filter AI-generated only
beervid-api video library --source-type VIDEO_GENERATION

# Filter strategy-generated
beervid-api video library --source-type STRATEGY

# Filter by task mode
beervid-api video library --task-mode smart
beervid-api video library --task-mode expert

# Combined filters
beervid-api video library --source-type VIDEO_GENERATION --task-mode smart --current 1 --size 5
```

---

## Video Upload

### `video upload <file>`

| Parameter | Required | Type | Values |
|-----------|----------|------|--------|
| `<file>` | **required** | string | Local file path |
| `--file-type` | optional | string | `video`, `image`, `audio` |

```bash
# Upload with explicit type
beervid-api video upload ./my-video.mp4 --file-type video
# → {"fileUrl":"https://...","fileType":"video"}

beervid-api video upload ./cover.jpg --file-type image
beervid-api video upload ./bgm.mp3 --file-type audio

# File not found
beervid-api video upload nonexist.mp4
# → "File not found: /absolute/path/to/nonexist.mp4"
```

---

## Video Publish

### `video publish`

| Parameter | Required | Type | Notes |
|-----------|----------|------|-------|
| `--video-id` | **required** | string | Video ID from `video library` |
| `--business-id` | **required** | string | Account's `businessId` from `account list` |
| `--product-anchor` | optional | boolean | Enable product anchor (挂车) |
| `--product-id` | **conditional** | string | Required when `--product-anchor` is set |
| `--product-anchor-title` | optional | string | Custom anchor title text |

```bash
# Basic publish (no product anchor)
beervid-api video publish \
  --video-id "vid_a1b2c3d4" \
  --business-id "-000eHWsGBVt8T8cVmZZLWUL63_hDbLTpUyr"
# → {"shareId":"v_pub_url~v2.xxx","status":"PUBLISHED","message":"视频发布成功"}

# With product anchor
beervid-api video publish \
  --video-id "vid_a1b2c3d4" \
  --business-id "-000eHWsGBVt8T8cVmZZLWUL63_hDbLTpUyr" \
  --product-anchor \
  --product-id "prod_123" \
  --product-anchor-title "BUY NOW"
```

### Validation Errors

```bash
# Missing video-id
beervid-api video publish --business-id "bid"
# → error: required option '--video-id <id>' not specified

# Missing business-id
beervid-api video publish --video-id "vid"
# → error: required option '--business-id <id>' not specified

# Product anchor without product-id
beervid-api video publish --video-id "vid" --business-id "bid" --product-anchor
# → "--product-id is required when using --product-anchor"

# Invalid video-id
beervid-api video publish --video-id "invalid_xxx" --business-id "bid"
# → "videoId 格式错误"
```

---

## Strategy Create

### `strategy create` (JSON input only)

**JSON body fields:**

| Field | Required | Type | Values / Notes |
|-------|----------|------|----------------|
| `name` | **required** | string | Strategy name |
| `businessId` | **required** | string | From `account list` |
| `strategyType` | **required** | string | `VIDEO` or `TEMPLATE` (NOT "AUTO") |
| `pushMode` | **required** | number | `0` = sequential (in order), `1` = random |
| `pushTimeType` | **required** | number | `0` = scheduled (exact times), `1` = periodic (recurring) |
| `platform` | optional | string | `TIKTOK` (default) |
| `pushConfig` | optional | object | Scheduling configuration (see below) |
| `videoInfo` | optional | array | For `strategyType: "VIDEO"` |
| `videoInfo[].id` | **required** | string | Video ID |
| `videoInfo[].coverUrl` | **required** | string | Cover image URL |
| `contentTemplates` | optional | string[] | For `strategyType: "TEMPLATE"` |

**pushConfig fields:**

| Field | Required | Type | Values |
|-------|----------|------|--------|
| `productAnchorStatus` | **required** | boolean | Enable product anchor |
| `execType` | **required** | string | `LONG_TERM` or `FIXED_PERIOD` |
| `frequency` | **required** | string | `daily`, `weekly`, `monthly` |
| `range` | optional | string[] | Date range for `FIXED_PERIOD` |
| `bestTimes` | optional | string[] | Best posting times (HH:mm) |
| `weeklySchedule` | optional | string[] | Days of week |
| `monthlySchedule` | optional | number[] | Days of month |
| `batchExecutedAt` | optional | array | `[{date, times}]` for batch scheduling |
| `productLinkInfo` | optional | object | `{productId, title?, productAnchorTitle?}` |

#### Example: Video strategy with daily auto-publish

```bash
beervid-api strategy create --json '{
  "name": "daily-cat-videos",
  "businessId": "-000eHWsGBVt8T8cVmZZLWUL63_hDbLTpUyr",
  "platform": "TIKTOK",
  "strategyType": "VIDEO",
  "pushMode": 1,
  "pushTimeType": 1,
  "videoInfo": [
    {
      "id": "video-uuid-from-library",
      "coverUrl": "https://cdn.beervid.ai/covers/xxx.jpg"
    }
  ],
  "pushConfig": {
    "productAnchorStatus": false,
    "execType": "LONG_TERM",
    "frequency": "daily",
    "bestTimes": ["09:00", "18:00"]
  }
}'
# → {"id":"019d0e22-xxxx-xxxx-xxxx-xxxxxxxxxxxx"}
```

#### Example: Template strategy with weekly schedule

```bash
beervid-api strategy create --json '{
  "name": "weekly-template-push",
  "businessId": "-000eHWsGBVt8T8cVmZZLWUL63_hDbLTpUyr",
  "platform": "TIKTOK",
  "strategyType": "TEMPLATE",
  "pushMode": 1,
  "pushTimeType": 1,
  "contentTemplates": ["template-uuid-here"],
  "pushConfig": {
    "productAnchorStatus": false,
    "execType": "LONG_TERM",
    "frequency": "weekly",
    "weeklySchedule": ["monday", "wednesday", "friday"],
    "bestTimes": ["12:00"]
  }
}'
```

#### Example: From file

```bash
beervid-api strategy create --json ./strategy.json
# → {"id":"..."}
```

### Validation Errors

```bash
# Empty JSON
beervid-api strategy create --json '{}'
# → Returns all required fields list
```

> **Common mistake:** Using `"strategyType": "AUTO"` — the API only accepts `VIDEO` or `TEMPLATE`.
> **Common mistake:** Using string values for pushMode/pushTimeType — they must be integers (0 or 1).

---

## Strategy List / Detail

### `strategy list`

| Parameter | Required | Type | Values |
|-----------|----------|------|--------|
| `--current` | optional | number | Page number |
| `--size` | optional | number | Page size |
| `--name` | optional | string | Filter by name |
| `--status` | optional | number | `0` = inactive, `1` = active |
| `--business-id` | optional | string | Filter by account |
| `--order` | optional | string | `asc` or `desc` |

```bash
# All strategies
beervid-api strategy list

# Active only
beervid-api strategy list --status 1

# Inactive only
beervid-api strategy list --status 0

# Filter by account
beervid-api strategy list --business-id "-000eHWsGBVt8T8cVmZZLWUL63_hDbLTpUyr"

# Combined
beervid-api strategy list --status 1 --business-id "bid" --order desc --size 5

# By name
beervid-api strategy list --name "daily"
```

### `strategy detail <id>`

| Parameter | Required | Type |
|-----------|----------|------|
| `<id>` | **required** | string |

```bash
beervid-api strategy detail "019d0e22-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
# → Full strategy object with all config
```

---

## Strategy Toggle / Delete

### `strategy toggle <id>`

| Parameter | Required | Notes |
|-----------|----------|-------|
| `<id>` | **required** | Strategy ID |
| `--enable` | **mutually exclusive** | Enable the strategy |
| `--disable` | **mutually exclusive** | Disable the strategy |

One of `--enable` or `--disable` is required.

```bash
# Disable
beervid-api strategy toggle "019d0e22-xxx" --disable
# → {"success":true}

# Enable
beervid-api strategy toggle "019d0e22-xxx" --enable
# → {"success":true}

# Idempotent: repeated enable/disable does not error
beervid-api strategy toggle "019d0e22-xxx" --enable
beervid-api strategy toggle "019d0e22-xxx" --enable
# → both return {"success":true}
```

### `strategy delete <id>`

| Parameter | Required | Type |
|-----------|----------|------|
| `<id>` | **required** | string |

```bash
beervid-api strategy delete "019d0e22-xxx"
# → {"success":true}

# Delete again → error
beervid-api strategy delete "019d0e22-xxx"
# → "策略不存在或删除失败"
```

---

## Template

### `template list`

No parameters.

```bash
beervid-api template list
# → Array of template objects: [{value, label, previewVideoUrl, retain}, ...]
```

### `template detail <id>`

| Parameter | Required | Type |
|-----------|----------|------|
| `<id>` | **required** | string (UUID — the `value` field from `template list`) |

```bash
beervid-api template detail "template-uuid-value"
# → Full template configuration object
```

---

## Label

### `label list`

No parameters.

```bash
beervid-api label list
# → [{id, userId, labelName, createdAt, updatedAt}, ...]
```

---

## Product

### `product list`

| Parameter | Required | Type | Notes |
|-----------|----------|------|-------|
| `--creator-user-open-id` | **required** | string | From `account list` field `creatorUserOpenId` |
| `--current` | optional | number | Page number |
| `--size` | optional | number | Page size |

```bash
beervid-api product list --creator-user-open-id "open-id-value"
# → {records: [...], total, current, size}

# Missing required param
beervid-api product list
# → "required option '--creator-user-open-id <id>' not specified"
```

> **Note:** If the TikTok account has no TikTok Shop binding, `creatorUserOpenId` will be `null` and product queries will return empty results.

---

## Record

### `record list`

| Parameter | Required | Type | Values |
|-----------|----------|------|--------|
| `--current` | optional | number | Page number |
| `--size` | optional | number | Page size |
| `--strategy-id` | optional | string | Filter by strategy |
| `--business-id` | optional | string | Filter by account |
| `--status` | optional | number | `0` = publishing, `1` = create failed, `2` = publish failed, `3` = success |
| `--sort` | optional | string | Sort field: `published_at`, `created_at`, `updated_at` |
| `--order` | optional | string | `asc` or `desc` |
| `--start-time` | optional | string | ISO 8601 datetime |
| `--end-time` | optional | string | ISO 8601 datetime |

```bash
# All records
beervid-api record list

# Filter by account
beervid-api record list --business-id "-000eHWsGBVt8T8cVmZZLWUL63_hDbLTpUyr"

# Filter by status (successful only)
beervid-api record list --status 3

# Date range filter (ISO 8601)
beervid-api record list --start-time "2026-01-01T00:00:00Z" --end-time "2026-03-30T23:59:59Z"

# Sort by publish time descending
beervid-api record list --sort published_at --order desc

# Combined filters
beervid-api record list \
  --business-id "bid" \
  --status 3 \
  --order desc \
  --size 5
```

---

## Analytics

### `analytics video <id>`

| Parameter | Required | Type |
|-----------|----------|------|
| `<id>` | **required** | string (video ID from publish records) |

```bash
beervid-api analytics video "vid_published_xxx"
# → {videoId, videoViews, likes, likeRate, comments, shares, interactionRate, reach, fullVideoWatchedRate, ...}

# No analytics data available
beervid-api analytics video "vid_no_data"
# → {"videoId":"vid_no_data","error":true,"message":"No analytics data found..."}  (exit 1)

# Invalid ID
beervid-api analytics video "invalid_xxx"
# → {"videoId":"invalid_xxx","error":true,"message":"No analytics data found..."}  (exit 1)
```

---

## Common Workflows

> For detailed step-by-step workflow guides with polling strategies, shell scripts, and FAQ, see:
> - [Video Generation Workflow](video-generation-workflow.md) — end-to-end: create task → poll → get results
> - [Video Publishing Workflow](video-publishing-workflow.md) — end-to-end: account selection → strategy → monitoring

### Workflow 1: Generate a video and publish to TikTok

```bash
# Step 1: Create video task
beervid-api video create --json '{
  "techType": "veo",
  "videoScale": "9:16",
  "dialogueLanguage": "English (American accent)",
  "showTitle": false,
  "showSubtitle": true,
  "noBgmMusic": false,
  "hdEnhancement": false,
  "fragmentList": [
    {
      "videoContent": "A golden retriever running through autumn leaves in a park",
      "segmentCount": 1,
      "spliceMethod": "SPLICE",
      "useCoverFrame": false
    }
  ]
}'
# Note the taskId from response

# Step 2: Poll until task succeeds (status=1)
beervid-api video tasks --status 2
# Repeat until task disappears from status=2

# Step 3: Find the video in library
beervid-api video library --current 1 --size 5
# Note the video id

# Step 4: Get available accounts
beervid-api account list --keyword steve72920
# Note the businessId

# Step 5: Publish
beervid-api video publish \
  --video-id "<video-id>" \
  --business-id "<business-id>"
```

### Workflow 2: Set up an auto-publish strategy

```bash
# Step 1: Get account businessId
beervid-api account list --keyword steve72920

# Step 2: Get videos from library
beervid-api video library --source-type VIDEO_GENERATION --size 10

# Step 3: Create strategy
beervid-api strategy create --json '{
  "name": "auto-daily-publish",
  "businessId": "<business-id>",
  "platform": "TIKTOK",
  "strategyType": "VIDEO",
  "pushMode": 1,
  "pushTimeType": 1,
  "videoInfo": [
    {"id": "<video-id>", "coverUrl": "<cover-url>"}
  ],
  "pushConfig": {
    "productAnchorStatus": false,
    "execType": "LONG_TERM",
    "frequency": "daily",
    "bestTimes": ["09:00", "18:00"]
  }
}'
# Note the strategy id

# Step 4: Enable strategy
beervid-api strategy toggle "<strategy-id>" --enable

# Step 5: Monitor publish records
beervid-api record list --strategy-id "<strategy-id>"
```

### Workflow 3: Check video performance after publishing

```bash
# Get successful publish records
beervid-api record list --status 3 --order desc --size 5

# Check analytics for a specific video
beervid-api analytics video "<video-id>"
```

---

## Model Compatibility Matrix

| Feature | sora | veo | sora_azure | sora_h_pro |
|---------|------|-----|------------|------------|
| 9:16 scale | Y | Y | Y | Y |
| 16:9 scale | - | Y | - | - |
| HD Enhancement | Y | - | Y | Y |

> **`sora_aio` has been removed** — it is no longer supported by the API.

---

## Error Handling Tips

1. **Always check auth first:** `beervid-api auth check` before any operations
2. **Use `-q` for scripting:** Quiet mode ensures stdout is clean JSON, easy to pipe with `jq`
3. **API 500 errors:** Some business logic errors (invalid strategy ID, invalid template ID) return HTTP 500 instead of 4xx — this is a known API-side issue, not a CLI bug
4. **Null creatorUserOpenId:** If an account's `creatorUserOpenId` is null, product-related operations won't work for that account (no TikTok Shop binding)
