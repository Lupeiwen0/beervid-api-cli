import type { Command } from 'commander'
import { listProducts, printResult } from '../../client/index.js'
import { handleCommandError } from '../../command-error.js'
import { log } from '../../logger.js'

export function register(cmd: Command): void {
  cmd
    .command('list')
    .description('List products')
    .requiredOption('--creator-user-open-id <id>', 'Creator user open ID')
    .option('--current <page>', 'Page number')
    .option('--size <size>', 'Page size')
    .action(async (opts: { creatorUserOpenId: string; current?: string; size?: string }) => {
      try {
        log.info('Fetching products...')
        const result = await listProducts({
          creatorUserOpenId: opts.creatorUserOpenId,
          ...(opts.current ? { current: Number(opts.current) } : {}),
          ...(opts.size ? { size: Number(opts.size) } : {}),
        })
        printResult(result)
      } catch (err) {
        handleCommandError(err)
      }
    })
}
