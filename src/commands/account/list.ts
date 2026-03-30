import type { Command } from 'commander'
import { listAccounts, printResult } from '../../client/index.js'
import { handleCommandError } from '../../command-error.js'
import { log } from '../../logger.js'
import type { ShoppableType } from '../../types/index.js'

export function register(cmd: Command): void {
  cmd
    .command('list')
    .description('List TikTok accounts')
    .requiredOption('--shoppable-type <type>', 'Shoppable type (TT, TTS, ALL)', 'ALL')
    .option('--keyword <keyword>', 'Search keyword')
    .option('--current <page>', 'Page number')
    .option('--size <size>', 'Page size')
    .action(async (opts: { shoppableType: string; keyword?: string; current?: string; size?: string }) => {
      try {
        log.info('Fetching accounts...')
        const result = await listAccounts({
          shoppableType: opts.shoppableType as ShoppableType,
          ...(opts.keyword ? { keyword: opts.keyword } : {}),
          ...(opts.current ? { current: Number(opts.current) } : {}),
          ...(opts.size ? { size: Number(opts.size) } : {}),
        })
        printResult(result)
      } catch (err) {
        handleCommandError(err)
      }
    })
}
