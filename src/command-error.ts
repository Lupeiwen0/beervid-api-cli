import { ApiError } from './client/index.js'
import { log } from './logger.js'

interface CliCommandErrorOptions {
  source?: string
  cause?: unknown
  details?: Record<string, unknown>
}

interface ErrorWithMeta extends Error {
  cause?: unknown
  code?: unknown
  errno?: unknown
  syscall?: unknown
  path?: unknown
  status?: unknown
  details?: unknown
}

export class CliCommandError extends Error {
  readonly details?: Record<string, unknown>

  constructor(message: string, options?: CliCommandErrorOptions) {
    super(message, { cause: options?.cause })
    this.name = options?.source ?? 'CliCommandError'
    this.details = options?.details
  }
}

export function formatCommandError(error: unknown): string[] {
  const lines: string[] = []
  appendError(lines, error, 0)
  return lines.length > 0
    ? lines
    : ['Source: UnknownError', 'Message: Unknown error']
}

export function handleCommandError(error: unknown): never {
  for (const line of formatCommandError(error)) {
    log.error(line)
  }
  process.exit(1)
}

function appendError(lines: string[], error: unknown, depth: number): void {
  const prefix = depth === 0 ? '' : `Cause ${depth} `

  if (error instanceof ApiError) {
    appendLine(lines, prefix, 'Source', error.name)
    appendLine(lines, prefix, 'Message', error.message)
    appendLine(lines, prefix, 'API code', error.code)
    appendCommonDetails(lines, error, prefix, ['details'])
    appendCause(lines, error.cause, depth)
    return
  }

  if (error instanceof Error) {
    appendLine(lines, prefix, 'Source', error.name || 'Error')
    appendLine(lines, prefix, 'Message', error.message || 'Unknown error')
    appendCommonDetails(lines, error as ErrorWithMeta, prefix)
    appendCause(lines, (error as ErrorWithMeta).cause, depth)
    return
  }

  if (typeof error === 'string') {
    appendLine(lines, prefix, 'Source', 'Error')
    appendLine(lines, prefix, 'Message', error)
    return
  }

  appendLine(lines, prefix, 'Source', 'UnknownError')
  appendLine(lines, prefix, 'Message', formatValue(error))
}

function appendCause(lines: string[], cause: unknown, depth: number): void {
  if (cause === undefined) return
  appendError(lines, cause, depth + 1)
}

function appendCommonDetails(
  lines: string[],
  error: ErrorWithMeta,
  prefix: string,
  excludeKeys: string[] = [],
): void {
  const skip = new Set(excludeKeys)

  if (!skip.has('status')) appendLine(lines, prefix, 'HTTP status', error.status)
  if (!skip.has('code')) appendLine(lines, prefix, 'Error code', error.code)
  if (!skip.has('errno')) appendLine(lines, prefix, 'Errno', error.errno)
  if (!skip.has('syscall')) appendLine(lines, prefix, 'Syscall', error.syscall)
  if (!skip.has('path')) appendLine(lines, prefix, 'Path', error.path)

  if (!skip.has('details') && isRecord(error.details)) {
    for (const [key, value] of Object.entries(error.details)) {
      appendLine(lines, prefix, `Detail ${key}`, value)
    }
  }
}

function appendLine(lines: string[], prefix: string, label: string, value: unknown): void {
  if (value === undefined) return
  lines.push(`${prefix}${label}: ${formatValue(value)}`)
}

function formatValue(value: unknown): string {
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean' || value === null) return String(value)

  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
