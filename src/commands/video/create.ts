import { readFileSync } from 'node:fs'
import type { Command } from 'commander'
import { createVideo, printResult } from '../../client/index.js'
import { CliCommandError, handleCommandError } from '../../command-error.js'
import { log } from '../../logger.js'
import type { VideoCreateParams } from '../../types/index.js'

function parseJsonInput(input: string): VideoCreateParams {
  if (input === '-') {
    return JSON.parse(readFileSync(0, 'utf-8')) as VideoCreateParams
  }
  if (input.startsWith('{') || input.startsWith('[')) {
    return JSON.parse(input) as VideoCreateParams
  }
  return JSON.parse(readFileSync(input, 'utf-8')) as VideoCreateParams
}

export function register(cmd: Command): void {
  cmd
    .command('create')
    .description('Create a video generation task')
    .option('--json <json>', 'JSON params string, file path, or - for stdin')
    .option('--tech-type <type>', 'Tech type (sora, veo, sora_azure, sora_h_pro, sora_aio)')
    .option('--video-scale <scale>', 'Video scale (16:9 or 9:16)')
    .option('--language <lang>', 'Dialogue language')
    .option('--name <name>', 'Video name')
    .action(async (opts: { json?: string; techType?: string; videoScale?: string; language?: string; name?: string }) => {
      try {
        if (!opts.json) {
          throw new CliCommandError(
            'video create requires --json <params>. Use --json with JSON string, file path, or - for stdin.',
            { source: 'ValidationError' },
          )
        }
        const params: VideoCreateParams = parseJsonInput(opts.json)
        log.info('Creating video task...')
        const result = await createVideo(params)
        printResult(result)
      } catch (err) {
        handleCommandError(err)
      }
    })
}
