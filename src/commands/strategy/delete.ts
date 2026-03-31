import type { Command } from 'commander'
import { deleteStrategy, printResult } from '../../client/index.js'
import { handleCommandError } from '../../command-error.js'
import { log } from '../../logger.js'

export function register(cmd: Command): void {
  cmd
    .command('delete <id>')
    .description('Delete a strategy')
    .action(async (id: string) => {
      try {
        log.info(`Deleting strategy: ${id}`)
        await deleteStrategy(id)
        printResult({ success: true })
      } catch (err) {
        handleCommandError(err)
      }
    })
}
