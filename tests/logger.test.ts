import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('logger', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.spyOn(process.stderr, 'write').mockImplementation(() => true)
  })

  it('info writes to stderr with [INFO] prefix', async () => {
    const { log } = await import('../src/logger.js')
    log.info('test message')
    expect(process.stderr.write).toHaveBeenCalledWith('[INFO] test message\n')
  })

  it('error always writes even in quiet mode', async () => {
    const { log, setQuiet } = await import('../src/logger.js')
    setQuiet(true)
    log.error('error msg')
    expect(process.stderr.write).toHaveBeenCalledWith('[ERROR] error msg\n')
  })

  it('info suppressed in quiet mode', async () => {
    const { log, setQuiet } = await import('../src/logger.js')
    setQuiet(true)
    log.info('should not appear')
    expect(process.stderr.write).not.toHaveBeenCalled()
  })
})
