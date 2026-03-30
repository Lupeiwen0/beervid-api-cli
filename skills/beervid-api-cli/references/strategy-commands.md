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
| `--json <json>` | string | Yes | JSON params string, file path, or `-` for stdin |

**Example:**

```bash
beervid-api strategy create --json '{"name":"Daily Post","businessId":"biz_x9y8z7","platform":"TIKTOK","strategyType":"AUTO","pushMode":"SCHEDULED","pushTimeType":"FIXED_TIME"}'

# Or from file
beervid-api strategy create --json ./strategy.json
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
      "strategyType": "AUTO",
      "pushMode": "SCHEDULED",
      "pushTimeType": "FIXED_TIME",
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
  "strategyType": "AUTO",
  "pushMode": "SCHEDULED",
  "pushTimeType": "FIXED_TIME",
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

**Options:**

| Option | Type | Description |
|--------|------|-------------|
| `--enable` | boolean | Enable the strategy |
| `--disable` | boolean | Disable the strategy |

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
