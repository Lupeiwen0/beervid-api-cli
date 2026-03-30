import type { Command } from 'commander'
import { getVideoTasks, printResult } from '../../client/index.js'
import { handleCommandError } from '../../command-error.js'
import { log } from '../../logger.js'
import type { TaskStatus } from '../../types/index.js'

export function register(cmd: Command): void {
  cmd
    .command('tasks')
    .description('List video creation tasks')
    .option('--current <page>', 'Page number')
    .option('--size <size>', 'Page size')
    .option('--status <status>', 'Task status (0=pending, 1=processing, 2=done)')
    .action(async (opts: { current?: string; size?: string; status?: string }) => {
      try {
        log.info('Fetching video tasks...')
        const result = await getVideoTasks({
          ...(opts.current ? { current: Number(opts.current) } : {}),
          ...(opts.size ? { size: Number(opts.size) } : {}),
          ...(opts.status !== undefined ? { status: Number(opts.status) as TaskStatus } : {}),
        })
        printResult(result)
      } catch (err) {
        handleCommandError(err)
      }
    })
}
