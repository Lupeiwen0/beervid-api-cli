import type { Command } from 'commander'
import { loadConfig, saveConfig, getConfigPath } from '../config.js'
import { printResult } from '../client/index.js'
import { CliCommandError, handleCommandError } from '../command-error.js'

export function registerConfigCommand(program: Command): void {
  const config = program.command('config').description('Manage CLI configuration')

  config
    .command('set <key> <value>')
    .description('Set a config value (API_KEY, BASE_URL)')
    .action((key: string, value: string) => {
      try {
        const cfg = loadConfig()
        if (key !== 'API_KEY' && key !== 'BASE_URL') {
          throw new CliCommandError(`Unknown config key: ${key}. Valid keys: API_KEY, BASE_URL`, { source: 'ValidationError' })
        }
        ;(cfg as Record<string, string>)[key] = value
        saveConfig(cfg)
        printResult({ key, value: key === 'API_KEY' ? '***' : value })
      } catch (err) {
        handleCommandError(err)
      }
    })

  config
    .command('get <key>')
    .description('Get a config value')
    .action((key: string) => {
      try {
        const cfg = loadConfig()
        const value = (cfg as Record<string, string | undefined>)[key]
        printResult({ key, value: key === 'API_KEY' && value ? '***' : value ?? null })
      } catch (err) {
        handleCommandError(err)
      }
    })

  config
    .command('path')
    .description('Show config file path')
    .action(() => {
      try {
        printResult({ path: getConfigPath() })
      } catch (err) {
        handleCommandError(err)
      }
    })
}
