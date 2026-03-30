import type { Command } from 'commander'
import { listStrategies, printResult } from '../../client/index.js'
import { handleCommandError } from '../../command-error.js'
import { log } from '../../logger.js'

export function register(cmd: Command): void {
  cmd
    .command('list')
    .description('List strategies')
    .option('--current <page>', 'Page number')
    .option('--size <size>', 'Page size')
    .option('--name <name>', 'Filter by name')
    .option('--status <status>', 'Filter by status (0=inactive, 1=active)')
    .option('--business-id <id>', 'Filter by business ID')
    .option('--order <order>', 'Sort order (asc, desc)')
    .action(async (opts: { current?: string; size?: string; name?: string; status?: string; businessId?: string; order?: string }) => {
      try {
        log.info('Fetching strategies...')
        const result = await listStrategies({
          ...(opts.current ? { current: Number(opts.current) } : {}),
          ...(opts.size ? { size: Number(opts.size) } : {}),
          ...(opts.name ? { name: opts.name } : {}),
          ...(opts.status !== undefined ? { status: Number(opts.status) as 0 | 1 } : {}),
          ...(opts.businessId ? { businessId: opts.businessId } : {}),
          ...(opts.order ? { order: opts.order as 'asc' | 'desc' } : {}),
        })
        printResult(result)
      } catch (err) {
        handleCommandError(err)
      }
    })
}
