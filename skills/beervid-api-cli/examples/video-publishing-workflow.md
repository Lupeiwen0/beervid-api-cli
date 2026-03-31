# Video Publishing Workflow (CLI Best Practices)

> Complete CLI workflow: from selecting a TikTok account to creating auto-publish strategies and monitoring results.

## Workflow Overview

```
Get TikTok account list
       ↓
[Optional] Get product list (for shopping cart)
       ↓
Get video template list
       ↓
Create publishing strategy
       ↓
Enable strategy
       ↓
Query publishing records
```

---

## Step 1: Get TikTok Account List

List all bound TikTok accounts to find your target account's `businessId`:

```bash
beervid-api account list --shoppable-type ALL --pretty
```

**Key response fields to note:**
- `businessId` — needed for strategy creation and publishing
- `creatorUserOpenId` — needed for product queries (null if no TikTok Shop binding)
- `hasShoppingCart` — whether account supports product anchoring

Filter by account type:

```bash
# Regular TikTok accounts only
beervid-api account list --shoppable-type TT

# TikTok Shop accounts only (US/Brazil)
beervid-api account list --shoppable-type TTS

# Search by keyword
beervid-api account list --keyword "myshop"
```

---

## Step 2: Get Shopping Cart Product List (Optional)

If publishing with product anchor (挂车), get available products:

```bash
beervid-api product list --creator-user-open-id "<creatorUserOpenId>" --pretty
```

Note the `productId` for use in strategy creation.

> **Prerequisite:** TikTok Shopping Cart is only available for **US and Brazil** TikTok accounts with TikTok Shop enabled.

---

## Step 3: Get Video Template List

Retrieve available templates for template-based strategies:

```bash
beervid-api template list --pretty
```

Note the template `value` (UUID) for use in `contentTemplates`.

---

## Step 4: Create Publishing Strategy

### Strategy A: Periodic Publishing (Daily at Fixed Times)

Publish automatically every day at 10:00 and 18:00:

```bash
beervid-api strategy create --json '{
  "name": "Daily Product Promotion",
  "businessId": "<businessId>",
  "platform": "TIKTOK",
  "strategyType": "TEMPLATE",
  "pushMode": 0,
  "pushTimeType": 1,
  "contentTemplates": ["<template-uuid>"],
  "pushConfig": {
    "productAnchorStatus": false,
    "execType": "LONG_TERM",
    "frequency": "daily",
    "bestTimes": ["10:00", "18:00"]
  }
}'
# → {"id":"strategy_xxxxxxxx"}
```

### Strategy B: Weekly Publishing with Product Anchor

Publish every Monday, Wednesday, Friday with product link:

```bash
beervid-api strategy create --json '{
  "name": "Weekly Product Push",
  "businessId": "<businessId>",
  "platform": "TIKTOK",
  "strategyType": "TEMPLATE",
  "pushMode": 1,
  "pushTimeType": 1,
  "contentTemplates": ["<template-uuid>"],
  "pushConfig": {
    "productAnchorStatus": true,
    "productLinkInfo": {
      "productId": "<productId>",
      "productAnchorTitle": "Shop Now"
    },
    "execType": "LONG_TERM",
    "frequency": "weekly",
    "weeklySchedule": ["monday", "wednesday", "friday"],
    "bestTimes": ["12:00"]
  }
}'
```

### Strategy C: Scheduled Publishing (Specific Dates/Times)

Publish at exact dates and times for a campaign launch:

```bash
beervid-api strategy create --json '{
  "name": "New Product Launch Campaign",
  "businessId": "<businessId>",
  "platform": "TIKTOK",
  "strategyType": "TEMPLATE",
  "pushMode": 0,
  "pushTimeType": 0,
  "contentTemplates": ["<template-uuid>"],
  "pushConfig": {
    "productAnchorStatus": false,
    "execType": "LONG_TERM",
    "batchExecutedAt": [
      {"date": "2026-04-01", "times": ["10:00"]},
      {"date": "2026-04-02", "times": ["10:00", "18:00"]},
      {"date": "2026-04-03", "times": ["14:00"]}
    ]
  }
}'
```

### Strategy D: Video Strategy (Publish Existing Videos)

Use pre-generated videos from the library:

```bash
# First get videos from library
beervid-api video library --source-type VIDEO_GENERATION --size 10 -q

# Create strategy with video IDs
beervid-api strategy create --json '{
  "name": "Library Video Push",
  "businessId": "<businessId>",
  "platform": "TIKTOK",
  "strategyType": "VIDEO",
  "pushMode": 1,
  "pushTimeType": 1,
  "videoInfo": [
    {"id": "<video-id-1>", "coverUrl": "<cover-url-1>"},
    {"id": "<video-id-2>", "coverUrl": "<cover-url-2>"}
  ],
  "pushConfig": {
    "productAnchorStatus": false,
    "execType": "LONG_TERM",
    "frequency": "daily",
    "bestTimes": ["09:00", "18:00"]
  }
}'
```

### Using a JSON File

```bash
beervid-api strategy create --json ./strategy.json
```

### Parameter Quick Reference

| Parameter | Values | Description |
|-----------|--------|-------------|
| `strategyType` | `TEMPLATE`, `VIDEO` | Template auto-generates videos; Video uses existing library videos |
| `pushMode` | `0` (sequential), `1` (random) | How content is selected for publishing |
| `pushTimeType` | `0` (scheduled), `1` (periodic) | Scheduled = exact dates; Periodic = recurring |
| `execType` | `LONG_TERM`, `FIXED_PERIOD` | Long-term runs indefinitely; Fixed period has date range |
| `frequency` | `daily`, `weekly`, `monthly` | Used with `pushTimeType=1` (periodic) |

---

## Step 5: Enable Strategy

**Strategies are disabled by default after creation.** You must explicitly enable them:

```bash
beervid-api strategy toggle "<strategy-id>" --enable
# → {"success":true}
```

Once enabled, the system automatically generates videos (for TEMPLATE strategies) and publishes according to the configured schedule.

> **Timing:** The system begins preparation ~5 minutes before the scheduled publishing time.

---

## Step 6: Query Publishing Records

Monitor publishing status:

```bash
# All records
beervid-api record list --pretty

# Only successful publishes
beervid-api record list --status 3

# Filter by strategy
beervid-api record list --strategy-id "<strategy-id>"

# Filter by account
beervid-api record list --business-id "<businessId>"

# Date range
beervid-api record list --start-time "2026-04-01T00:00:00Z" --end-time "2026-04-30T23:59:59Z"

# Sort by publish time, newest first
beervid-api record list --sort published_at --order desc --size 10
```

**Publishing status values:**
- `0` — Publishing (in progress)
- `1` — Video creation failed
- `2` — Publishing failed
- `3` — Published successfully

---

## Managing Existing Strategies

### List Strategies

```bash
# All strategies
beervid-api strategy list --pretty

# Active only
beervid-api strategy list --status 1

# Filter by account
beervid-api strategy list --business-id "<businessId>"
```

### Pause/Resume Strategy

```bash
# Pause
beervid-api strategy toggle "<strategy-id>" --disable

# Resume
beervid-api strategy toggle "<strategy-id>" --enable
```

### Delete Strategy

```bash
beervid-api strategy delete "<strategy-id>"
```

---

## Check Video Performance

After publishing, monitor video analytics:

```bash
# Get successful publish records
beervid-api record list --status 3 --order desc --size 5

# Check analytics for a specific published video
beervid-api analytics video "<video-id>"
```

---

## Manual One-Off Publishing

For publishing a single video without a strategy:

```bash
# 1. Find the video in library
beervid-api video library --name "my-video" --pretty

# 2. Get target account
beervid-api account list --keyword "myshop"

# 3. Publish (without product anchor)
beervid-api video publish --video-id "<video-id>" --business-id "<businessId>"

# 3b. Publish (with product anchor)
beervid-api video publish \
  --video-id "<video-id>" \
  --business-id "<businessId>" \
  --product-anchor \
  --product-id "<productId>" \
  --product-anchor-title "Shop Now"
```

---

## FAQ

### How soon does publishing start after enabling a strategy?
- **Scheduled strategies** execute at the specified date/time
- **Periodic strategies** execute at the next matching time (e.g., if daily at 10:00 and you enable at 09:00, it publishes at 10:00 today)
- System begins preparation ~5 minutes before scheduled time

### What if publishing fails?
1. Check publishing records for failure details: `beervid-api record list --status 2`
2. Common causes:
   - **Expired TikTok authorization** — re-authorize on the BeerVid platform
   - **Video content violates TikTok standards** — modify video content and retry
   - **Account restrictions** — check TikTok account status
3. After fixing the issue, re-enable the strategy

### Can I run multiple strategies for the same account?
Yes. Multiple strategies can run simultaneously for the same TikTok account. The system executes each independently according to its configuration.

### What's the difference between TEMPLATE and VIDEO strategy types?
- **TEMPLATE:** System automatically generates new videos from templates before publishing. Best for continuous content creation.
- **VIDEO:** Publishes existing videos from your library. Best when you want full control over which specific videos are published.
