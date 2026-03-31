import { readFileSync } from 'node:fs'
import type { Command } from 'commander'
import { createStrategy, printResult } from '../../client/index.js'
import { handleCommandError } from '../../command-error.js'
import { log } from '../../logger.js'
import type { StrategyCreateParams } from '../../types/index.js'

function parseJsonInput(input: string): StrategyCreateParams {
  if (input === '-') {
    return JSON.parse(readFileSync(0, 'utf-8')) as StrategyCreateParams
  }
  if (input.startsWith('{') || input.startsWith('[')) {
    return JSON.parse(input) as StrategyCreateParams
  }
  return JSON.parse(readFileSync(input, 'utf-8')) as StrategyCreateParams
}

export function register(cmd: Command): void {
  cmd
    .command('create')
    .description('Create a new strategy')
    .requiredOption('--json <json>', 'JSON params string, file path, or - for stdin')
    .action(async (opts: { json: string }) => {
      try {
        const params = parseJsonInput(opts.json)
        log.info('Creating strategy...')
        const result = await createStrategy(params)
        printResult({ id: result.id })
      } catch (err) {
        handleCommandError(err)
      }
    })
}
