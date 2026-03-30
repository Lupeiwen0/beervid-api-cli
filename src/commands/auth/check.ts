import type { Command } from 'commander'
import { checkAuth, printResult } from '../../client/index.js'
import { log } from '../../logger.js'

export function register(cmd: Command): void {
  cmd
    .command('check')
    .description('Check authentication status')
    .action(async () => {
      try {
        log.info('Checking auth...')
        const result = await checkAuth()
        printResult(result)
      } catch (err) {
        log.error(String(err))
        process.exit(1)
      }
    })
}
