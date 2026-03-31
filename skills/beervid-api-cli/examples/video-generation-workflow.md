# Video Generation Workflow (CLI Best Practices)

> Complete CLI workflow: from creating a video generation task to retrieving the finished video.

## Workflow Overview

```
[Optional] Get template list
       ↓
Create video generation task
       ↓
Poll task status (until success/failure)
       ↓
Query video library for results
```

---

## Step 1: Get Video Template List (Optional)

If creating a template-based video, first retrieve available templates:

```bash
beervid-api template list --pretty
```

Note the template `value` (UUID) for use in subsequent steps.

---

## Step 2: Create Video Generation Task

### Minimal Example (VEO 9:16)

```bash
beervid-api video create --json '{
  "techType": "veo",
  "videoScale": "9:16",
  "dialogueLanguage": "English (American accent)",
  "showTitle": false,
  "showSubtitle": false,
  "noBgmMusic": false,
  "hdEnhancement": false,
  "generatedQuantity": 1,
  "fragmentList": [
    {
      "videoContent": "Close-up shot of white sneakers, professional product photography, white background, premium quality",
      "segmentCount": 1,
      "spliceMethod": "SPLICE",
      "useCoverFrame": false
    }
  ]
}'
# → {"taskIds":["019d0e21-xxxx-xxxx-xxxx-xxxxxxxxxxxx"],"message":"Video creation tasks submitted successfully"}
```

### Expert Mode with Multiple Fragments (SORA)

```bash
beervid-api video create --json '{
  "name": "product-showcase-v1",
  "techType": "sora",
  "videoScale": "9:16",
  "dialogueLanguage": "English (American accent)",
  "showTitle": false,
  "showSubtitle": true,
  "noBgmMusic": false,
  "hdEnhancement": true,
  "generatedQuantity": 1,
  "fragmentList": [
    {
      "videoContent": "Opening scene: a modern kitchen with warm lighting",
      "segmentCount": 1,
      "spliceMethod": "SPLICE",
      "useCoverFrame": false
    },
    {
      "videoContent": "Close-up of hands preparing fresh ingredients on a wooden cutting board",
      "segmentCount": 1,
      "spliceMethod": "SPLICE",
      "useCoverFrame": false
    }
  ]
}'
```

### Using a JSON File (Recommended for Complex Payloads)

```bash
# Save payload to file
cat > video-task.json << 'EOF'
{
  "name": "weekly-content-batch",
  "techType": "veo",
  "videoScale": "9:16",
  "dialogueLanguage": "Mandarin",
  "showTitle": false,
  "showSubtitle": true,
  "noBgmMusic": false,
  "hdEnhancement": false,
  "generatedQuantity": 3,
  "labelIds": ["label-uuid-here"],
  "fragmentList": [
    {
      "videoContent": "产品展示：时尚运动鞋特写，白色背景，专业摄影风格",
      "segmentCount": 2,
      "spliceMethod": "SPLICE",
      "useCoverFrame": false,
      "positivePrompt": "high quality, professional lighting, clean background",
      "negativePrompt": "blurry, low quality, dark"
    }
  ]
}
EOF

beervid-api video create --json ./video-task.json
```

---

## Step 3: Poll Task Status

Video generation typically takes **3-10 minutes**. Use the following polling strategy:

```bash
# Check for generating tasks (status=2)
beervid-api video tasks --status 2 -q

# Check for succeeded tasks (status=1)
beervid-api video tasks --status 1 --current 1 --size 5 -q

# Check for failed tasks (status=0)
beervid-api video tasks --status 0 --current 1 --size 5 -q
```

### Recommended Polling Strategy

- **Initial interval:** Poll every 30 seconds
- **After 5 minutes:** Switch to polling every 60 seconds
- **Maximum wait:** 30 minutes (task likely failed if still generating)

### Shell Script for Automated Polling

```bash
#!/bin/bash
# poll-video-task.sh — Poll until task completes or timeout
# Usage: ./poll-video-task.sh

MAX_WAIT=1800  # 30 minutes
ELAPSED=0
INTERVAL=30

echo "Polling for generating tasks..."

while [ $ELAPSED -lt $MAX_WAIT ]; do
  RESULT=$(beervid-api video tasks --status 2 -q)
  TOTAL=$(echo "$RESULT" | jq '.total // 0')

  if [ "$TOTAL" -eq 0 ]; then
    echo "No generating tasks remaining. Checking results..."
    beervid-api video tasks --status 1 --current 1 --size 5 --pretty
    exit 0
  fi

  echo "[$ELAPSED s] $TOTAL task(s) still generating..."
  sleep $INTERVAL
  ELAPSED=$((ELAPSED + INTERVAL))

  # Switch to slower polling after 5 minutes
  if [ $ELAPSED -ge 300 ]; then
    INTERVAL=60
  fi
done

echo "Timeout after ${MAX_WAIT}s. Check tasks manually:"
echo "  beervid-api video tasks --status 0  # failed"
echo "  beervid-api video tasks --status 2  # still generating"
exit 1
```

---

## Step 4: Query Video Library for Results

Once the task succeeds, find your videos in the library:

```bash
# Get latest generated videos
beervid-api video library --source-type VIDEO_GENERATION --current 1 --size 10 --pretty

# Filter by task mode
beervid-api video library --task-mode expert --current 1 --size 10

# Search by name
beervid-api video library --name "product-showcase" --pretty
```

The response includes `id` (video ID), `url` (video URL), and `coverUrl` (cover image) — use the `id` for publishing.

---

## Important Notes

### Prompt Quality
Video quality depends heavily on prompt quality. Be specific about:
- Scene composition (close-up, wide shot, aerial view)
- Lighting conditions (warm, natural, studio)
- Subject details (colors, materials, actions)
- Style references (cinematic, documentary, commercial)

### Generation Quantity
- Set `generatedQuantity` to `1` for **testing** — verify prompt and settings work before scaling
- Scale up after confirming results meet expectations

### Credit Consumption
- Each video generation consumes credits based on model and settings
- Check account credits before batch generation: `beervid-api auth profile`

### Model Selection Guide

| Use Case | Recommended Model | Notes |
|----------|-------------------|-------|
| General content, 16:9 landscape | `veo` | Only model supporting 16:9 |
| TikTok vertical video | `veo` or `sora` | Both support 9:16 |
| High-quality enhancement needed | `sora` / `sora_h_pro` | HD enhancement available |
| Cost-effective batch generation | `veo` | Multi-segment support (1-4) |
