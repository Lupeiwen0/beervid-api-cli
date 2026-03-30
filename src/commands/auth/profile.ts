import type { Command } from 'commander'
import { getProfile, printResult } from '../../client/index.js'
import { handleCommandError } from '../../command-error.js'
import { log } from '../../logger.js'

export function register(cmd: Command): void {
  cmd
    .command('profile')
    .description('Get current user profile')
    .action(async () => {
      try {
        log.info('Fetching profile...')
        const result = await getProfile()
        printResult(result)
      } catch (err) {
        handleCommandError(err)
      }
    })
}
