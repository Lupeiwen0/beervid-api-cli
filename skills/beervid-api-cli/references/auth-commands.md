# Auth Commands

## `beervid-api auth profile`

Get the current user's profile information.

**Syntax:**

```bash
beervid-api auth profile
```

**Parameters:** None

**Example:**

```bash
beervid-api auth profile
```

**Response:**

```json
{
  "userId": "usr_abc123def456",
  "username": "demo_user",
  "email": "demo@example.com",
  "avatarUrl": "https://cdn.beervid.ai/avatars/usr_abc123def456.jpg",
  "membershipTierCode": "PRO",
  "apiKeyName": "my-api-key",
  "createdAt": "2025-01-15T08:30:00Z"
}
```

---

## `beervid-api auth check`

Check whether the current API key is valid.

**Syntax:**

```bash
beervid-api auth check
```

**Parameters:** None

**Example:**

```bash
beervid-api auth check
```

**Response (valid):**

```json
{
  "status": "ok",
  "username": "demo_user",
  "message": "Authenticated"
}
```

**Response (invalid):**

```json
{
  "status": "error",
  "username": null,
  "message": "Invalid API key"
}
```
