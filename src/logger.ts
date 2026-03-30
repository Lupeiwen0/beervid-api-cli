let quiet = false

export function setQuiet(value: boolean): void {
  quiet = value
}

export const log = {
  info(msg: string): void {
    if (!quiet) process.stderr.write(`[INFO] ${msg}\n`)
  },
  success(msg: string): void {
    if (!quiet) process.stderr.write(`[OK] ${msg}\n`)
  },
  warn(msg: string): void {
    if (!quiet) process.stderr.write(`[WARN] ${msg}\n`)
  },
  error(msg: string): void {
    process.stderr.write(`[ERROR] ${msg}\n`)
  },
}
