# beervid-api-cli

BeerVid Open API CLI & TypeScript SDK.

## Installation

```bash
npm install -g beervid-api-cli
```

Or use directly:

```bash
npx beervid-api-cli --help
```

## Quick Start

```bash
# Configure API Key
beervid-api config set API_KEY your-api-key-here

# Check authentication
beervid-api auth check

# Get user profile
beervid-api auth profile
```

## Commands

| Command | Description |
|---------|-------------|
| `beervid-api auth profile` | Get user profile |
| `beervid-api auth check` | Check auth status |
| `beervid-api video create --json <params>` | Create video generation task |
| `beervid-api video tasks` | Query video tasks |
| `beervid-api video library` | Query video library |
| `beervid-api video publish` | Publish video to TikTok |
| `beervid-api video upload <file>` | Upload file |
| `beervid-api strategy create --json <params>` | Create publishing strategy |
| `beervid-api strategy list` | List strategies |
| `beervid-api strategy detail <id>` | Get strategy details |
| `beervid-api strategy toggle <id>` | Enable/disable strategy |
| `beervid-api strategy delete <id>` | Delete strategy |
| `beervid-api account list` | List TikTok accounts |
| `beervid-api template list` | List video templates |
| `beervid-api template detail <id>` | Get template details |
| `beervid-api label list` | List labels |
| `beervid-api product list` | List shop products |
| `beervid-api record list` | List publish records |
| `beervid-api analytics video <id>` | Get video analytics |
| `beervid-api config set <key> <value>` | Set config |
| `beervid-api config get <key>` | Get config |
| `beervid-api config path` | Show config path |

## Global Options

- `-q, --quiet` — Suppress progress logs
- `--pretty` — Pretty-print JSON output

## SDK Usage

```typescript
import { createVideo, getVideoTasks, listAccounts } from 'beervid-api-cli'

// Set API key via env
process.env.BEERVID_API_KEY = 'your-key'

const tasks = await getVideoTasks({ status: 1, current: 1, size: 10 })
const accounts = await listAccounts({ shoppableType: 'ALL' })
```

## License

MIT
