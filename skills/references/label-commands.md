# Label Commands

## `beervid-api label list`

List all labels for the current user.

**Syntax:**

```bash
beervid-api label list
```

**Parameters:** None

**Example:**

```bash
beervid-api label list
```

**Response:**

```json
[
  {
    "id": "lbl_001",
    "userId": "usr_abc123def456",
    "labelName": "pets",
    "createdAt": "2025-03-10T09:00:00Z",
    "updatedAt": "2025-03-10T09:00:00Z"
  },
  {
    "id": "lbl_002",
    "userId": "usr_abc123def456",
    "labelName": "product-demo",
    "createdAt": "2025-04-20T14:30:00Z",
    "updatedAt": "2025-04-20T14:30:00Z"
  }
]
```
