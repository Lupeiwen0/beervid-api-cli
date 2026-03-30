import type { Command } from 'commander'
import { toggleStrategy, printResult } from '../../client/index.js'
import { log } from '../../logger.js'

export function register(cmd: Command): void {
  cmd
    .command('toggle <id>')
    .description('Enable or disable a strategy')
    .option('--enable', 'Enable the strategy')
    .option('--disable', 'Disable the strategy')
    .action(async (id: string, opts: { enable?: boolean; disable?: boolean }) => {
      try {
        if (opts.enable && opts.disable) {
          log.error('Cannot use both --enable and --disable')
          process.exit(1)
        }
        if (!opts.enable && !opts.disable) {
          log.error('Either --enable or --disable must be specified')
          process.exit(1)
        }
        const enable = !!opts.enable
        log.info(`${enable ? 'Enabling' : 'Disabling'} strategy: ${id}`)
        const result = await toggleStrategy(id, enable)
        printResult(result)
      } catch (err) {
        log.error(String(err))
        process.exit(1)
      }
    })
}
