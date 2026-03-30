import type { Command } from 'commander'
import { listTemplates, printResult } from '../../client/index.js'
import { handleCommandError } from '../../command-error.js'
import { log } from '../../logger.js'

export function register(cmd: Command): void {
  cmd
    .command('list')
    .description('List available templates')
    .action(async () => {
      try {
        log.info('Fetching templates...')
        const result = await listTemplates()
        printResult(result)
      } catch (err) {
        handleCommandError(err)
      }
    })
}
