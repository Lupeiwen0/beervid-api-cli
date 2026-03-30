import type { Command } from 'commander'
import { listLabels, printResult } from '../../client/index.js'
import { log } from '../../logger.js'

export function register(cmd: Command): void {
  cmd
    .command('list')
    .description('List labels')
    .action(async () => {
      try {
        log.info('Fetching labels...')
        const result = await listLabels()
        printResult(result)
      } catch (err) {
        log.error(String(err))
        process.exit(1)
      }
    })
}
