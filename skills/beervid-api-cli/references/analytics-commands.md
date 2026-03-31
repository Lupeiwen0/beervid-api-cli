# Analytics Commands

## `beervid-api analytics video`

Get analytics data for a published video.

**Syntax:**

```bash
beervid-api analytics video <id>
```

**Arguments:**

| Argument | Type | Required | Description |
|----------|------|----------|-------------|
| `<id>` | string | **Yes** | Video ID |

**Response fields:**

| Field | Type | Description |
|-------|------|-------------|
| `videoId` | string | Video ID |
| `shareUrl` | string | TikTok video URL |
| `businessName` | string | TikTok account name |
| `businessAvatarUrl` | string | Account avatar URL |
| `totalFollowers` | number | Total followers count |
| `newFollowers` | number | New followers from this video |
| `videoViews` | number | Total video views |
| `likes` | number | Total likes |
| `likeRate` | number | Like rate (likes / views) |
| `comments` | number | Total comments |
| `commentRate` | number | Comment rate (comments / views) |
| `shares` | number | Total shares |
| `shareRate` | number | Share rate (shares / views) |
| `interactionRate` | number | Overall interaction rate |
| `reach` | number | Unique viewers reached |
| `videoDuration` | number | Video duration in seconds |
| `fullVideoWatchedRate` | number | Completion rate (0-1) |
| `totalTimeWatched` | number | Total watch time in seconds |
| `averageTimeWatched` | number | Average watch time in seconds |
| `publishedAt` | string | Publish timestamp (ISO 8601) |

**Example:**

```bash
beervid-api analytics video vid_a1b2c3d4e5f6
```

**Response:**

```json
{
  "videoId": "vid_a1b2c3d4e5f6",
  "shareUrl": "https://www.tiktok.com/@myshop_official/video/7123456789",
  "businessName": "My TikTok Store",
  "businessAvatarUrl": "https://cdn.tiktok.com/avatars/myshop.jpg",
  "totalFollowers": 15200,
  "newFollowers": 38,
  "videoViews": 12450,
  "likes": 843,
  "likeRate": 0.0677,
  "comments": 56,
  "commentRate": 0.0045,
  "shares": 127,
  "shareRate": 0.0102,
  "interactionRate": 0.0824,
  "reach": 10890,
  "videoDuration": 15,
  "fullVideoWatchedRate": 0.42,
  "totalTimeWatched": 98750,
  "averageTimeWatched": 7.93,
  "publishedAt": "2025-06-15T09:30:00Z"
}
```

**Error Response (no data or invalid ID):**

```json
{
  "videoId": "invalid_xxx",
  "error": true,
  "message": "No analytics data found for video invalid_xxx"
}
```

Exit code 1 is returned for errors.

> **Data Delay:** Video analytics data may have a delay. Data typically starts updating 5-10 minutes after publishing. For reliable results, wait at least 30 minutes before querying analytics.
