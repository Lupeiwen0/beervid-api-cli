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
| `<id>` | string | Yes | Video ID |

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
