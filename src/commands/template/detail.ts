import type { Command } from 'commander'
import { getTemplateDetail, printResult } from '../../client/index.js'
import { handleCommandError } from '../../command-error.js'
import { log } from '../../logger.js'

export function register(cmd: Command): void {
  cmd
    .command('detail <id>')
    .description('Get template detail')
    .action(async (id: string) => {
      try {
        log.info(`Fetching template detail: ${id}`)
        const result = await getTemplateDetail(id)
        printResult(result)
      } catch (err) {
        handleCommandError(err)
      }
    })
}
