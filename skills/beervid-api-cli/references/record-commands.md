# Record Commands

## `beervid-api record list`

List video publish records.

**Syntax:**

```bash
beervid-api record list [options]
```

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--current <page>` | number | — | Page number |
| `--size <size>` | number | — | Page size |
| `--strategy-id <id>` | string | — | Filter by strategy ID |
| `--business-id <id>` | string | — | Filter by business ID |
| `--status <status>` | number | — | Filter by status (0-3) |
| `--sort <field>` | string | — | Sort field |
| `--order <order>` | string | — | `asc` or `desc` |
| `--start-time <time>` | string | — | Start time filter (ISO 8601) |
| `--end-time <time>` | string | — | End time filter (ISO 8601) |

**Example:**

```bash
beervid-api record list --status 1 --current 1 --size 10
beervid-api record list --strategy-id strat_q1w2e3r4 --start-time 2025-06-01T00:00:00Z --end-time 2025-06-30T23:59:59Z
```

**Response:**

```json
{
  "records": [
    {
      "id": "rec_a1b2c3",
      "strategyId": "strat_q1w2e3r4",
      "strategyName": "Daily Post",
      "videoId": "vid_a1b2c3d4e5f6",
      "videoName": "Cat video",
      "videoUrl": "https://cdn.beervid.ai/videos/vid_a1b2c3d4e5f6.mp4",
      "coverUrl": "https://cdn.beervid.ai/covers/vid_a1b2c3d4e5f6.jpg",
      "businessId": "biz_x9y8z7",
      "businessName": "My TikTok Store",
      "workType": "AUTO",
      "status": 1,
      "publishedAt": "2025-06-15T09:30:00Z",
      "errorMessage": null
    }
  ],
  "total": 1,
  "current": 1,
  "size": 10
}
```
