import type { Command } from 'commander'
import { loadConfig, saveConfig, getConfigPath } from '../config.js'
import { printResult } from '../client/index.js'

export function registerConfigCommand(program: Command): void {
  const config = program.command('config').description('Manage CLI configuration')

  config
    .command('set <key> <value>')
    .description('Set a config value (API_KEY, BASE_URL)')
    .action((key: string, value: string) => {
      const cfg = loadConfig()
      if (key !== 'API_KEY' && key !== 'BASE_URL') {
        console.error(`[ERROR] Unknown config key: ${key}. Valid keys: API_KEY, BASE_URL`)
        process.exit(1)
      }
      ;(cfg as Record<string, string>)[key] = value
      saveConfig(cfg)
      printResult({ key, value: key === 'API_KEY' ? '***' : value })
    })

  config
    .command('get <key>')
    .description('Get a config value')
    .action((key: string) => {
      const cfg = loadConfig()
      const value = (cfg as Record<string, string | undefined>)[key]
      printResult({ key, value: key === 'API_KEY' && value ? '***' : value ?? null })
    })

  config
    .command('path')
    .description('Show config file path')
    .action(() => {
      printResult({ path: getConfigPath() })
    })
}
