# Strategy Commands

## `beervid-api strategy create`

Create a new publishing strategy.

**Syntax:**

```bash
beervid-api strategy create --json <json|file|->
```

**Options:**

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `--json <json>` | string | **Yes** | JSON params string, file path, or `-` for stdin |

> **Important:**
> - `strategyType` must be `VIDEO` or `TEMPLATE` (NOT "AUTO")
> - `pushMode` and `pushTimeType` must be integers: `0` or `1` (NOT strings like "SCHEDULED")
> - `pushConfig` is required for auto-publish strategies

**JSON body fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | **Yes** | Strategy name |
| `businessId` | string | **Yes** | TikTok business account ID (from `account list`) |
| `strategyType` | string | **Yes** | `VIDEO` or `TEMPLATE` |
| `pushMode` | number | **Yes** | `0` = sequential (publish in template order), `1` = random (randomly select content) |
| `pushTimeType` | number | **Yes** | `0` = scheduled (specify exact times), `1` = periodic (recurring schedule) |
| `platform` | string | No | Default `TIKTOK` |
| `pushConfig` | object | No | Scheduling config (see below) |
| `videoInfo` | array | No | For strategyType=VIDEO: `[{id, coverUrl}]` |
| `contentTemplates` | string[] | No | For strategyType=TEMPLATE |

**pushConfig fields:**

| Field | Required | Type | Values / Notes |
|-------|----------|------|----------------|
| `productAnchorStatus` | **Yes** | boolean | Enable product anchor (挂车) |
| `execType` | **Yes** | string | `LONG_TERM` (long-term execution) or `FIXED_PERIOD` (fixed period) |
| `frequency` | Conditional | string | `daily`, `weekly`, `monthly` — required when `pushTimeType=1` (periodic) |
| `bestTimes` | Conditional | string[] | Posting times in `HH:mm` format, e.g. `["09:00", "18:00"]` — required when `pushTimeType=1` |
| `range` | Conditional | string[] | Date range `["2026-04-01", "2026-04-30"]` — required when `execType=FIXED_PERIOD` |
| `weeklySchedule` | Conditional | string[] | Days of week — required when `frequency=weekly`. Values: `monday`, `tuesday`, `wednesday`, `thursday`, `friday`, `saturday`, `sunday` |
| `monthlySchedule` | Conditional | number[] | Days of month `1`-`31` — required when `frequency=monthly` |
| `batchExecutedAt` | Conditional | array | Scheduled publish times — required when `pushTimeType=0` (scheduled). Format: `[{"date": "2026-04-01", "times": ["10:00", "18:00"]}]` |
| `productLinkInfo` | Conditional | object | Required when `productAnchorStatus=true`. Structure: `{"productId": "...", "productAnchorTitle": "..."}` |

**pushConfig usage by pushTimeType:**

- **Periodic (`pushTimeType=1`):** Use `frequency` + `bestTimes` + optional `weeklySchedule`/`monthlySchedule` + `execType` + optional `range`
- **Scheduled (`pushTimeType=0`):** Use `batchExecutedAt` + `execType`

**Example (periodic daily):**

```bash
beervid-api strategy create --json '{"name":"Daily Post","businessId":"biz_x9y8z7","platform":"TIKTOK","strategyType":"VIDEO","pushMode":1,"pushTimeType":1,"videoInfo":[{"id":"video-uuid","coverUrl":"https://cdn.beervid.ai/covers/xxx.jpg"}],"pushConfig":{"productAnchorStatus":false,"execType":"LONG_TERM","frequency":"daily","bestTimes":["09:00"]}}'

# Or from file
beervid-api strategy create --json ./strategy.json
```

**Example (scheduled at specific dates/times):**

```bash
beervid-api strategy create --json '{
  "name": "Launch Campaign",
  "businessId": "biz_x9y8z7",
  "platform": "TIKTOK",
  "strategyType": "TEMPLATE",
  "pushMode": 0,
  "pushTimeType": 0,
  "contentTemplates": ["template-uuid"],
  "pushConfig": {
    "productAnchorStatus": false,
    "execType": "LONG_TERM",
    "batchExecutedAt": [
      {"date": "2026-04-01", "times": ["10:00"]},
      {"date": "2026-04-02", "times": ["10:00", "18:00"]}
    ]
  }
}'
```

**Example (weekly with product anchor):**

```bash
beervid-api strategy create --json '{
  "name": "Weekly Product Push",
  "businessId": "biz_x9y8z7",
  "platform": "TIKTOK",
  "strategyType": "TEMPLATE",
  "pushMode": 1,
  "pushTimeType": 1,
  "contentTemplates": ["template-uuid"],
  "pushConfig": {
    "productAnchorStatus": true,
    "productLinkInfo": {"productId": "prod_123", "productAnchorTitle": "BUY NOW"},
    "execType": "LONG_TERM",
    "frequency": "weekly",
    "weeklySchedule": ["monday", "wednesday", "friday"],
    "bestTimes": ["12:00"]
  }
}'
```

**Response:**

```json
{
  "id": "strat_q1w2e3r4"
}
```

---

## `beervid-api strategy list`

List strategies with optional filters.

**Syntax:**

```bash
beervid-api strategy list [options]
```

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--current <page>` | number | — | Page number |
| `--size <size>` | number | — | Page size |
| `--name <name>` | string | — | Filter by name |
| `--status <status>` | number | — | `0`=inactive, `1`=active |
| `--business-id <id>` | string | — | Filter by business ID |
| `--order <order>` | string | — | `asc` or `desc` |
| `--sort <field>` | string | `createdAt` | Sort field (default: `createdAt`) |
| `--date-range <start> <end>` | string | — | Creation time range (ISO 8601) |

**Example:**

```bash
beervid-api strategy list --status 1 --current 1 --size 10
```

**Response:**

```json
{
  "records": [
    {
      "id": "strat_q1w2e3r4",
      "name": "Daily Post",
      "businessId": "biz_x9y8z7",
      "platform": "TIKTOK",
      "strategyType": "VIDEO",
      "pushMode": 1,
      "pushTimeType": 1,
      "status": 1
    }
  ],
  "total": 1,
  "current": 1,
  "size": 10
}
```

---

## `beervid-api strategy detail`

Get details of a specific strategy.

**Syntax:**

```bash
beervid-api strategy detail <id>
```

| Argument | Type | Required | Description |
|----------|------|----------|-------------|
| `<id>` | string | **Yes** | Strategy ID |

**Example:**

```bash
beervid-api strategy detail strat_q1w2e3r4
```

**Response:**

```json
{
  "id": "strat_q1w2e3r4",
  "name": "Daily Post",
  "businessId": "biz_x9y8z7",
  "platform": "TIKTOK",
  "strategyType": "VIDEO",
  "pushMode": 1,
  "pushTimeType": 1,
  "status": 1
}
```

---

## `beervid-api strategy toggle`

Enable or disable a strategy.

**Syntax:**

```bash
beervid-api strategy toggle <id> --enable
beervid-api strategy toggle <id> --disable
```

| Argument/Option | Type | Required | Description |
|-----------------|------|----------|-------------|
| `<id>` | string | **Yes** | Strategy ID |
| `--enable` | boolean | Mutually exclusive | Enable the strategy |
| `--disable` | boolean | Mutually exclusive | Disable the strategy |

One of `--enable` or `--disable` is required.

**Example:**

```bash
beervid-api strategy toggle strat_q1w2e3r4 --disable
```

**Response:**

```json
{
  "success": true
}
```

---

## `beervid-api strategy delete`

Delete a strategy.

**Syntax:**

```bash
beervid-api strategy delete <id>
```

| Argument | Type | Required | Description |
|----------|------|----------|-------------|
| `<id>` | string | **Yes** | Strategy ID |

**Example:**

```bash
beervid-api strategy delete strat_q1w2e3r4
```

**Response:**

```json
{
  "success": true
}
```
