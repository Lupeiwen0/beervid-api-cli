# Account Commands

## `beervid-api account list`

List connected TikTok accounts.

**Syntax:**

```bash
beervid-api account list --shoppable-type <type> [--keyword <keyword>] [--current <page>] [--size <size>]
```

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--shoppable-type <type>` | string | `ALL` | `TT` (TikTok), `TTS` (TikTok Shop), `ALL` |
| `--keyword <keyword>` | string | — | Search by name/username |
| `--current <page>` | number | — | Page number |
| `--size <size>` | number | — | Page size |

**Example:**

```bash
beervid-api account list --shoppable-type ALL
beervid-api account list --shoppable-type TTS --keyword "myshop"
```

**Response:**

```json
{
  "records": [
    {
      "id": "acc_001",
      "businessId": "biz_x9y8z7",
      "displayName": "My TikTok Store",
      "username": "myshop_official",
      "creatorUserOpenId": "open_u1v2w3",
      "profileImage": "https://cdn.tiktok.com/avatars/myshop.jpg",
      "profileUrl": "https://www.tiktok.com/@myshop_official",
      "followersCount": 15200,
      "country": "US",
      "timezone": "America/Los_Angeles"
    }
  ],
  "total": 1,
  "current": 1,
  "size": 20
}
```
