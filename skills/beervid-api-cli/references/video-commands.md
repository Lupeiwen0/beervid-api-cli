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
| `--tech-type <type>` | string | No | `veo`, `sora`, `sora_azure`, `sora_h_pro` (`sora_aio` deprecated) |
| `--video-scale <scale>` | string | No | `9:16` (all models), `16:9` (veo only) |
| `--language <lang>` | string | No | Dialogue language (see language list below) |
| `--name <name>` | string | No | Video name |

Either `--json` or the combination of `--tech-type`, `--video-scale`, and `--language` is required.

> **Note:** `16:9` videoScale only works with `veo` tech type. Using it with sora/sora_azure/sora_h_pro will error: `"Video scale '16:9' only works with veo tech type"`.
> **Note:** `hdEnhancement` only works with sora series (sora, sora_azure, sora_h_pro), NOT with veo.

**JSON body fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `techType` | string | **Yes** | AI model: `veo`, `sora`, `sora_azure`, `sora_h_pro` (`sora_aio` deprecated, may not work) |
| `videoScale` | string | **Yes** | `9:16` (all models), `16:9` (veo only) |
| `dialogueLanguage` | string | **Yes** | Dialogue language (see language list below) |
| `showTitle` | boolean | **Yes** | Show title overlay |
| `showSubtitle` | boolean | **Yes** | Show subtitles |
| `noBgmMusic` | boolean | **Yes** | Disable background music |
| `hdEnhancement` | boolean | **Yes** | Enable HD enhancement (sora series only, NOT veo) |
| `fragmentList` | array | **Yes** | List of video fragments (at least 1) |
| `fragmentList[].videoContent` | string | **Yes** | Scene description |
| `fragmentList[].segmentCount` | number | **Yes** | Segments per fragment: VEO 1-4, SORA must be 1 |
| `fragmentList[].spliceMethod` | string | **Yes** | `SPLICE` or `LONG_TAKE` (SORA does NOT support `LONG_TAKE`) |
| `fragmentList[].useCoverFrame` | boolean | No | Use cover frame (SORA does NOT support `true`) |
| `name` | string | No | Video name |
| `generatedQuantity` | number | No | Number of videos to generate |
| `labelIds` | string[] | No | Label IDs for categorization |
| `fragmentList[].positivePrompt` | string | No | Positive prompt for visual style |
| `fragmentList[].negativePrompt` | string | No | Negative prompt to exclude elements |
| `fragmentList[].productReferenceImages` | string[] | No | Product reference image URLs (VEO max 3, SORA max 1) |
| `fragmentList[].nineGridImages` | string[] | No | Nine-grid images (max 9; SORA requires both or neither with productReferenceImages) |
| `fragmentList[].portraitImages` | string[] | No | Portrait images (VEO only, max 1; SORA not supported) |
| `fragmentList[].productReferenceDescription` | string | No | Product reference description |
| `fragmentList[].contentLib` | string[] | No | Content library names |
| `bgmList` | array | No | Background music list `[{name, url, duration}]` |
| `titleStyleConfig` | object | No | Title style `{fontFamily, fontSize, color, offset}` |
| `subtitleStyleConfig` | object | No | Subtitle style (same structure as titleStyleConfig) |
| `globalControl` | string | No | Global control/description prompt |
| `headVideo` | string | No | Intro video URL |
| `endVideo` | string | No | Outro video URL |

### Dialogue Language Options

**VEO supported languages (15):**

`English (American accent)`, `Mandarin`, `French`, `Spanish`, `Arabic`, `Japanese`, `Korean`, `Malay`, `Indonesian`, `Vietnamese`, `German`, `Italian`, `Russian`, `Thai`, `Portuguese`

**SORA series supported languages (19, includes all VEO languages plus 4 additional):**

`English (American accent)`, `English (British accent)`, `English (Indian accent)`, `Mandarin`, `Cantonese`, `Mandarin (Northeastern accent)`, `Mandarin (Taiwan accent)`, `French`, `Spanish`, `Arabic`, `Japanese`, `Korean`, `Malay`, `Indonesian`, `Vietnamese`, `German`, `Italian`, `Russian`, `Thai`, `Portuguese`

### Model Constraints

| Constraint | VEO | SORA / sora_azure / sora_h_pro |
|------------|-----|-------------------------------|
| videoScale `16:9` | Y | Not supported |
| videoScale `9:16` | Y | Y |
| hdEnhancement | Not supported | Y |
| segmentCount | 1-4 | Must be 1 |
| spliceMethod `LONG_TAKE` | Y (when segmentCount > 1) | Not supported |
| useCoverFrame `true` | Y | Not supported |
| portraitImages | Y (max 1) | Not supported |
| productReferenceImages | Max 3 per fragment | Max 1 per fragment |
| showTitle / showSubtitle | Best with English dialogueLanguage | Best with English dialogueLanguage |

### Additional Validation Rules

- **Max fragments:** No more than 10 fragments per video task
- **SORA nineGridImages:** When `nineGridImages` is provided, `productReferenceImages` is also required (both or neither)
- **VEO LONG_TAKE:** VEO does not support `LONG_TAKE` when `segmentCount` is 1 (use `segmentCount` > 1 with `LONG_TAKE`)
- **useCoverFrame + portraitImages:** When `videoScale` is `9:16` and fragment has `portraitImages`, `useCoverFrame` must be `true`
- **productAnchorTitle:** Max 30 characters

**Example:**

```bash
beervid-api video create --json '{"techType":"veo","videoScale":"9:16","dialogueLanguage":"English (American accent)","showTitle":false,"showSubtitle":false,"noBgmMusic":false,"hdEnhancement":false,"fragmentList":[{"videoContent":"A cat playing in a garden","segmentCount":1,"spliceMethod":"SPLICE","useCoverFrame":false}]}'
```

**Response:**

```json
{
  "taskIds": ["019d0e21-xxxx-xxxx-xxxx-xxxxxxxxxxxx"],
  "message": "Video creation tasks submitted successfully"
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
| `--status <status>` | number | — | `0`=failed, `1`=succeeded, `2`=generating |

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
beervid-api video library [--current <page>] [--size <size>] [--name <name>] [--source-type <type>] [--task-mode <mode>] [--audit-status <status>] [--task-ids <ids>] [--strategy-ids <ids>] [--business-ids <ids>] [--label-ids <ids>] [--date-range <start> <end>]
```

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--current <page>` | number | `1` | Page number |
| `--size <size>` | number | `20` | Page size |
| `--name <name>` | string | — | Filter by name |
| `--source-type <type>` | string | — | `VIDEO_GENERATION` or `STRATEGY` |
| `--task-mode <mode>` | string | — | `smart` (smart creation) or `expert` (multi-fragment) |
| `--audit-status <status>` | number | — | `0`=not reviewed, `1`=approved, `2`=rejected, `3`=reviewing |
| `--task-ids <ids>` | string | — | Filter by video creation task IDs (comma-separated) |
| `--strategy-ids <ids>` | string | — | Filter by strategy IDs (comma-separated) |
| `--business-ids <ids>` | string | — | Filter by TikTok account IDs (comma-separated) |
| `--label-ids <ids>` | string | — | Filter by label IDs (comma-separated) |
| `--date-range <start> <end>` | string | — | Creation time range (ISO 8601) |

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
| `--video-id <id>` | string | **Yes** | Video ID from library |
| `--business-id <id>` | string | **Yes** | TikTok business account ID |
| `--product-anchor` | boolean | No | Enable product anchor |
| `--product-id <id>` | string | Conditional | Required when `--product-anchor` is set |
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
  "shareId": "v_pub_url~v2.xxxx",
  "status": "PUBLISHED",
  "message": "视频发布成功"
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
| `<file>` | string | **Yes** | Path to file |

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--file-type <type>` | string | — | `video`, `image`, or `audio` |

**File type constraints:**

| Type | Formats | Max Size |
|------|---------|----------|
| `video` | `.mp4`, `.mov` | 10 MB |
| `image` | `.jpg`, `.jpeg`, `.png` | 7 MB |
| `audio` | `.mp3`, `.wav` | 5 MB |

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
