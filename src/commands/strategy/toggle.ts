import type { Command } from 'commander'
import { toggleStrategy, printResult } from '../../client/index.js'
import { CliCommandError, handleCommandError } from '../../command-error.js'
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
          throw new CliCommandError('Cannot use both --enable and --disable', { source: 'ValidationError' })
        }
        if (!opts.enable && !opts.disable) {
          throw new CliCommandError('Either --enable or --disable must be specified', { source: 'ValidationError' })
        }
        const enable = !!opts.enable
        log.info(`${enable ? 'Enabling' : 'Disabling'} strategy: ${id}`)
        const result = await toggleStrategy(id, enable)
        printResult(result)
      } catch (err) {
        handleCommandError(err)
      }
    })
}
