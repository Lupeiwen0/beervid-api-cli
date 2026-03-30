import { describe, it, expect } from 'vitest'
import { execSync } from 'node:child_process'

describe('CLI', () => {
  const run = (args: string) => execSync(`npx tsx src/cli.ts ${args}`, { encoding: 'utf-8' })

  it('shows help with all command groups', () => {
    const output = run('--help')
    expect(output).toContain('beervid-api')
    expect(output).toContain('auth')
    expect(output).toContain('video')
    expect(output).toContain('strategy')
    expect(output).toContain('account')
    expect(output).toContain('template')
    expect(output).toContain('label')
    expect(output).toContain('product')
    expect(output).toContain('record')
    expect(output).toContain('analytics')
    expect(output).toContain('config')
  })

  it('shows version', () => {
    const output = run('--version')
    expect(output.trim()).toMatch(/\d+\.\d+\.\d+/)
  })

  it('config path outputs JSON with config path', () => {
    const output = run('config path')
    const parsed = JSON.parse(output)
    expect(parsed.path).toContain('.beervid-api')
    expect(parsed.path).toContain('config.json')
  })

  it('video subcommand shows all video commands', () => {
    const output = run('video --help')
    expect(output).toContain('create')
    expect(output).toContain('tasks')
    expect(output).toContain('library')
    expect(output).toContain('publish')
    expect(output).toContain('upload')
  })

  it('strategy subcommand shows all strategy commands', () => {
    const output = run('strategy --help')
    expect(output).toContain('create')
    expect(output).toContain('list')
    expect(output).toContain('detail')
    expect(output).toContain('toggle')
    expect(output).toContain('delete')
  })
})
