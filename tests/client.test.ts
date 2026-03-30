import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('client', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.stubEnv('BEERVID_API_KEY', 'test-key-123')
    vi.stubGlobal('fetch', vi.fn())
  })

  it('apiGet sends GET with X-API-KEY header', async () => {
    const mockResponse = { code: 200, message: 'success', data: { userId: '123' } }
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify(mockResponse)))

    const { apiGet } = await import('../src/client/index.js')
    const result = await apiGet<{ userId: string }>('/api/v1/beervid/profile')
    expect(result).toEqual({ userId: '123' })
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/beervid/profile'),
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({ 'X-API-KEY': 'test-key-123' }),
      })
    )
  })

  it('apiPost sends POST with JSON body', async () => {
    const mockResponse = { code: 200, message: 'success', data: { total: 10 } }
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify(mockResponse)))

    const { apiPost } = await import('../src/client/index.js')
    const result = await apiPost<{ total: number }>('/api/v1/beervid/strategies/list', { current: 1, size: 10 })
    expect(result).toEqual({ total: 10 })
  })

  it('throws ApiError when code !== 200', async () => {
    const mockResponse = { code: 401, message: 'Unauthorized' }
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify(mockResponse)))

    const { apiGet } = await import('../src/client/index.js')
    await expect(apiGet('/api/v1/beervid/profile')).rejects.toThrow('Unauthorized')
  })

  it('throws on HTTP 500', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response('error', { status: 500 }))

    const { apiGet } = await import('../src/client/index.js')
    await expect(apiGet('/api/v1/beervid/profile')).rejects.toThrow('HTTP 500')
  })

  it('printResult outputs JSON', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const { printResult } = await import('../src/client/index.js')
    printResult({ test: true })
    expect(spy).toHaveBeenCalledWith('{"test":true}')
  })

  it('printResult outputs pretty JSON when setPretty(true)', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const { printResult, setPretty } = await import('../src/client/index.js')
    setPretty(true)
    printResult({ test: true })
    expect(spy).toHaveBeenCalledWith(JSON.stringify({ test: true }, null, 2))
  })
})
