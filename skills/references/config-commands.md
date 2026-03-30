# Config Commands

## `beervid-api config set`

Set a configuration value.

**Syntax:**

```bash
beervid-api config set <key> <value>
```

**Valid keys:** `API_KEY`, `BASE_URL`

**Example:**

```bash
beervid-api config set API_KEY your-api-key-here
beervid-api config set BASE_URL https://open.beervid.ai
```

**Response:**

```json
{
  "key": "API_KEY",
  "value": "***"
}
```

---

## `beervid-api config get`

Get a configuration value.

**Syntax:**

```bash
beervid-api config get <key>
```

**Example:**

```bash
beervid-api config get BASE_URL
```

**Response:**

```json
{
  "key": "BASE_URL",
  "value": "https://open.beervid.ai"
}
```

> Note: `API_KEY` values are masked as `***` in output.

---

## `beervid-api config path`

Show the config file path.

**Syntax:**

```bash
beervid-api config path
```

**Example:**

```bash
beervid-api config path
```

**Response:**

```json
{
  "path": "/Users/you/.config/beervid-api/config.json"
}
```
