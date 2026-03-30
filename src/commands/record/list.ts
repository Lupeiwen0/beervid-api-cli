import type { Command } from 'commander'
import { listRecords, printResult } from '../../client/index.js'
import { log } from '../../logger.js'
import type { PublishRecordStatus } from '../../types/index.js'

export function register(cmd: Command): void {
  cmd
    .command('list')
    .description('List publish records')
    .option('--current <page>', 'Page number')
    .option('--size <size>', 'Page size')
    .option('--strategy-id <id>', 'Filter by strategy ID')
    .option('--business-id <id>', 'Filter by business ID')
    .option('--status <status>', 'Filter by status (0-3)')
    .option('--sort <field>', 'Sort field')
    .option('--order <order>', 'Sort order (asc, desc)')
    .option('--start-time <time>', 'Start time filter')
    .option('--end-time <time>', 'End time filter')
    .action(async (opts: {
      current?: string
      size?: string
      strategyId?: string
      businessId?: string
      status?: string
      sort?: string
      order?: string
      startTime?: string
      endTime?: string
    }) => {
      try {
        log.info('Fetching records...')
        const result = await listRecords({
          ...(opts.current ? { current: Number(opts.current) } : {}),
          ...(opts.size ? { size: Number(opts.size) } : {}),
          ...(opts.strategyId ? { strategyId: opts.strategyId } : {}),
          ...(opts.businessId ? { businessId: opts.businessId } : {}),
          ...(opts.status !== undefined ? { status: Number(opts.status) as PublishRecordStatus } : {}),
          ...(opts.sort ? { sort: opts.sort } : {}),
          ...(opts.order ? { order: opts.order as 'asc' | 'desc' } : {}),
          ...(opts.startTime ? { startTime: opts.startTime } : {}),
          ...(opts.endTime ? { endTime: opts.endTime } : {}),
        })
        printResult(result)
      } catch (err) {
        log.error(String(err))
        process.exit(1)
      }
    })
}
