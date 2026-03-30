# Video Commands

## `beervid-api video create`

Create a video generation task.

**Syntax:**

```bash
beervid-api video create --json <json|file|->
beervid-api video create --tech-type <type> --video-scale <scale> --language <lang> [--name <name>]
```

**Options:**

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `--json <json>` | string | No | JSON params string, file path, or `-` for stdin |
| `--tech-type <type>` | string | No | `sora`, `veo`, `sora_azure`, `sora_h_pro`, `sora_aio` |
| `--video-scale <scale>` | string | No | `16:9` or `9:16` |
| `--language <lang>` | string | No | Dialogue language (e.g. `English (American accent)`) |
| `--name <name>` | string | No | Video name |

Either `--json` or the combination of `--tech-type`, `--video-scale`, and `--language` is required.

**JSON body fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `techType` | string | Yes | AI model type |
| `videoScale` | string | Yes | Aspect ratio |
| `dialogueLanguage` | string | Yes | Dialogue language |
| `showTitle` | boolean | No | Show title overlay |
| `showSubtitle` | boolean | No | Show subtitles |
| `noBgmMusic` | boolean | No | Disable background music |
| `hdEnhancement` | boolean | No | Enable HD enhancement |
| `name` | string | No | Video name |
| `fragmentList` | array | Yes | List of video fragments |
| `fragmentList[].videoContent` | string | Yes | Scene description |
| `fragmentList[].segmentCount` | number | Yes | Number of segments |
| `fragmentList[].spliceMethod` | string | Yes | `SPLICE` |
| `fragmentList[].useCoverFrame` | boolean | No | Use cover frame |

**Example:**

```bash
beervid-api video create --json '{"techType":"veo","videoScale":"9:16","dialogueLanguage":"English (American accent)","showTitle":false,"showSubtitle":false,"noBgmMusic":false,"hdEnhancement":false,"fragmentList":[{"videoContent":"A cat playing in a garden","segmentCount":1,"spliceMethod":"SPLICE","useCoverFrame":false}]}'
```

**Response:**

```json
{
  "taskId": "task_7f3a9b2c1d4e"
}
```

---

## `beervid-api video tasks`

List video creation tasks.

**Syntax:**

```bash
beervid-api video tasks [--current <page>] [--size <size>] [--status <status>]
```

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--current <page>` | number | — | Page number |
| `--size <size>` | number | — | Page size |
| `--status <status>` | number | — | `0`=pending, `1`=processing, `2`=done |

**Example:**

```bash
beervid-api video tasks --status 2 --current 1 --size 5
```

**Response:**

```json
{
  "records": [
    {
      "taskId": "task_7f3a9b2c1d4e",
      "coverUrl": "https://cdn.beervid.ai/covers/task_7f3a9b2c1d4e.jpg",
      "taskName": "Cat video",
      "videoTitle": "Cat playing in garden",
      "videoContent": "A cat playing in a garden",
      "generatedAt": "2025-06-01T12:00:00Z",
      "videoUrl": "https://cdn.beervid.ai/videos/task_7f3a9b2c1d4e.mp4",
      "status": 2,
      "taskMode": "smart",
      "labelInfos": [
        { "id": "lbl_001", "labelName": "pets" }
      ]
    }
  ],
  "total": 1,
  "current": 1,
  "size": 5
}
```

---

## `beervid-api video library`

List videos in the library.

**Syntax:**

```bash
beervid-api video library [--current <page>] [--size <size>] [--name <name>] [--source-type <type>] [--task-mode <mode>]
```

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--current <page>` | number | `1` | Page number |
| `--size <size>` | number | `20` | Page size |
| `--name <name>` | string | — | Filter by name |
| `--source-type <type>` | string | — | `VIDEO_GENERATION` or `STRATEGY` |
| `--task-mode <mode>` | string | — | `smart` or `expert` |

**Example:**

```bash
beervid-api video library --current 1 --size 10 --source-type VIDEO_GENERATION
```

**Response:**

```json
{
  "records": [
    {
      "id": "vid_a1b2c3d4e5f6",
      "name": "Cat video",
      "url": "https://cdn.beervid.ai/videos/vid_a1b2c3d4e5f6.mp4",
      "coverUrl": "https://cdn.beervid.ai/covers/vid_a1b2c3d4e5f6.jpg",
      "duration": 15,
      "sourceType": "VIDEO_GENERATION",
      "sourceTask": "task_7f3a9b2c1d4e",
      "taskId": "task_7f3a9b2c1d4e",
      "generatedDate": "2025-06-01T12:00:00Z",
      "auditStatus": "APPROVED",
      "tiktokAccounts": [],
      "labelInfos": [
        { "id": "lbl_001", "labelName": "pets" }
      ]
    }
  ],
  "total": 1,
  "current": 1,
  "size": 10
}
```

---

## `beervid-api video publish`

Publish a video to TikTok.

**Syntax:**

```bash
beervid-api video publish --video-id <id> --business-id <id> [--product-anchor] [--product-id <id>] [--product-anchor-title <title>]
```

**Options:**

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `--video-id <id>` | string | Yes | Video ID from library |
| `--business-id <id>` | string | Yes | TikTok business account ID |
| `--product-anchor` | boolean | No | Enable product anchor |
| `--product-id <id>` | string | No | Product ID for anchor |
| `--product-anchor-title <title>` | string | No | Product anchor title |

**Example:**

```bash
beervid-api video publish --video-id vid_a1b2c3d4e5f6 --business-id biz_x9y8z7

# With product anchor
beervid-api video publish --video-id vid_a1b2c3d4e5f6 --business-id biz_x9y8z7 --product-anchor --product-id prod_123 --product-anchor-title "Buy Now"
```

**Response:**

```json
{
  "success": true,
  "publishId": "pub_m1n2o3p4"
}
```

---

## `beervid-api video upload`

Upload a file (video, image, or audio).

**Syntax:**

```bash
beervid-api video upload <file> [--file-type <type>]
```

**Arguments:**

| Argument | Type | Required | Description |
|----------|------|----------|-------------|
| `<file>` | string | Yes | Path to file |

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--file-type <type>` | string | — | `video`, `image`, or `audio` |

**Example:**

```bash
beervid-api video upload ./my-video.mp4 --file-type video
```

**Response:**

```json
{
  "fileUrl": "https://cdn.beervid.ai/uploads/f_abc123.mp4",
  "fileType": "video"
}
```
