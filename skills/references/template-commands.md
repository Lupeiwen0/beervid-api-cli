# Template Commands

## `beervid-api template list`

List available video templates.

**Syntax:**

```bash
beervid-api template list
```

**Parameters:** None

**Example:**

```bash
beervid-api template list
```

**Response:**

```json
[
  {
    "value": "tpl_001",
    "label": "Product Showcase",
    "previewVideoUrl": "https://cdn.beervid.ai/templates/tpl_001_preview.mp4",
    "retain": true
  },
  {
    "value": "tpl_002",
    "label": "Story Narrative",
    "previewVideoUrl": "https://cdn.beervid.ai/templates/tpl_002_preview.mp4",
    "retain": false
  }
]
```

---

## `beervid-api template detail`

Get details of a specific template.

**Syntax:**

```bash
beervid-api template detail <id>
```

**Example:**

```bash
beervid-api template detail tpl_001
```

**Response:**

```json
{
  "value": "tpl_001",
  "label": "Product Showcase",
  "previewVideoUrl": "https://cdn.beervid.ai/templates/tpl_001_preview.mp4",
  "retain": true
}
```
