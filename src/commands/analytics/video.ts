import type { Command } from 'commander'
import { getVideoAnalytics, printResult } from '../../client/index.js'
import { handleCommandError } from '../../command-error.js'
import { log } from '../../logger.js'

export function register(cmd: Command): void {
  cmd
    .command('video <id>')
    .description('Get video analytics')
    .action(async (id: string) => {
      try {
        log.info(`Fetching analytics for video: ${id}`)
        const result = await getVideoAnalytics(id)
        printResult(result)
      } catch (err) {
        handleCommandError(err)
      }
    })
}
