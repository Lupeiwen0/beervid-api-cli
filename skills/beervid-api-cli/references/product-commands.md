# Product Commands

## `beervid-api product list`

List TikTok Shop products for a creator account.

**Syntax:**

```bash
beervid-api product list --creator-user-open-id <id> [--current <page>] [--size <size>]
```

**Options:**

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `--creator-user-open-id <id>` | string | Yes | Creator user open ID (from account list) |
| `--current <page>` | number | No | Page number |
| `--size <size>` | number | No | Page size |

**Example:**

```bash
beervid-api product list --creator-user-open-id open_u1v2w3
beervid-api product list --creator-user-open-id open_u1v2w3 --current 1 --size 5
```

**Response:**

```json
{
  "records": [
    {
      "id": "prod_123",
      "title": "Wireless Bluetooth Headphones",
      "price": {
        "amount": 29.99,
        "currency": "USD"
      },
      "addedStatus": "ACTIVE",
      "brandName": "TechAudio",
      "images": [
        "https://cdn.tiktok.com/products/prod_123_1.jpg"
      ],
      "salesCount": 342,
      "createdAt": "2025-05-01T10:00:00Z"
    }
  ],
  "total": 1,
  "current": 1,
  "size": 20
}
```
