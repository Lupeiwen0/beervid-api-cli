import type { Command } from 'commander'
import { listVideoLibrary, printResult } from '../../client/index.js'
import { handleCommandError } from '../../command-error.js'
import { log } from '../../logger.js'
import type { SourceType, TaskMode } from '../../types/index.js'

export function register(cmd: Command): void {
  cmd
    .command('library')
    .description('List video library')
    .option('--current <page>', 'Page number', '1')
    .option('--size <size>', 'Page size', '20')
    .option('--name <name>', 'Filter by name')
    .option('--source-type <type>', 'Source type (VIDEO_GENERATION, STRATEGY)')
    .option('--task-mode <mode>', 'Task mode (smart, expert)')
    .action(async (opts: { current: string; size: string; name?: string; sourceType?: string; taskMode?: string }) => {
      try {
        log.info('Fetching video library...')
        const result = await listVideoLibrary({
          current: Number(opts.current),
          size: Number(opts.size),
          ...(opts.name ? { name: opts.name } : {}),
          ...(opts.sourceType ? { sourceType: opts.sourceType as SourceType } : {}),
          ...(opts.taskMode ? { taskMode: opts.taskMode as TaskMode } : {}),
        })
        printResult(result)
      } catch (err) {
        handleCommandError(err)
      }
    })
}
