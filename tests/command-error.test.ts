import { describe, it, expect } from 'vitest'
import { ApiError } from '../src/client/index.js'
import { CliCommandError, formatCommandError } from '../src/command-error.js'

describe('command error formatting', () => {
  it('includes ApiError source and API code', () => {
    const lines = formatCommandError(new ApiError(401, 'Unauthorized'))

    expect(lines).toContain('Source: ApiError')
    expect(lines).toContain('Message: Unauthorized')
    expect(lines).toContain('API code: 401')
  })

  it('includes nested cause information', () => {
    const lines = formatCommandError(
      new CliCommandError('Invalid JSON input', {
        source: 'ValidationError',
        cause: new SyntaxError('Unexpected token } in JSON at position 12'),
      }),
    )

    expect(lines).toContain('Source: ValidationError')
    expect(lines).toContain('Message: Invalid JSON input')
    expect(lines).toContain('Cause 1 Source: SyntaxError')
    expect(lines).toContain('Cause 1 Message: Unexpected token } in JSON at position 12')
  })
})
