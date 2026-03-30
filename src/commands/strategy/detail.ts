import type { Command } from 'commander'
import { getStrategyDetail, printResult } from '../../client/index.js'
import { handleCommandError } from '../../command-error.js'
import { log } from '../../logger.js'

export function register(cmd: Command): void {
  cmd
    .command('detail <id>')
    .description('Get strategy detail')
    .action(async (id: string) => {
      try {
        log.info(`Fetching strategy detail: ${id}`)
        const result = await getStrategyDetail(id)
        printResult(result)
      } catch (err) {
        handleCommandError(err)
      }
    })
}
