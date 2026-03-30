import { describe, it, expect, vi, beforeEach } from 'vitest'
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'

vi.mock('node:fs')

describe('config', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.mocked(existsSync).mockReturnValue(false)
  })

  it('loadConfig returns empty object when no file', async () => {
    const { loadConfig } = await import('../src/config.js')
    expect(loadConfig()).toEqual({})
  })

  it('loadConfig reads existing file', async () => {
    vi.mocked(existsSync).mockReturnValue(true)
    vi.mocked(readFileSync).mockReturnValue('{"API_KEY":"test-key"}')
    const { loadConfig } = await import('../src/config.js')
    expect(loadConfig()).toEqual({ API_KEY: 'test-key' })
  })

  it('saveConfig creates directory and writes file', async () => {
    const { saveConfig } = await import('../src/config.js')
    saveConfig({ API_KEY: 'abc' })
    expect(mkdirSync).toHaveBeenCalled()
    expect(writeFileSync).toHaveBeenCalled()
  })
})
