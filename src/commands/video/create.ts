import { readFileSync } from 'node:fs'
import type { Command } from 'commander'
import { createVideo, printResult } from '../../client/index.js'
import { log } from '../../logger.js'
import type { VideoCreateParams, TechType, VideoScale } from '../../types/index.js'

function parseJsonInput(input: string): VideoCreateParams {
  if (input === '-') {
    const stdin = readFileSync(0, 'utf-8')
    return JSON.parse(stdin) as VideoCreateParams
  }
  try {
    return JSON.parse(input) as VideoCreateParams
  } catch {
    return JSON.parse(readFileSync(input, 'utf-8')) as VideoCreateParams
  }
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
        let params: VideoCreateParams
        if (opts.json) {
          params = parseJsonInput(opts.json)
        } else {
          if (!opts.techType || !opts.videoScale || !opts.language) {
            log.error('Either --json or --tech-type, --video-scale, and --language are required')
            process.exit(1)
          }
          params = {
            techType: opts.techType as TechType,
            videoScale: opts.videoScale as VideoScale,
            dialogueLanguage: opts.language,
            showTitle: false,
            showSubtitle: false,
            noBgmMusic: true,
            hdEnhancement: false,
            fragmentList: [],
            ...(opts.name ? { name: opts.name } : {}),
          }
        }
        log.info('Creating video task...')
        const result = await createVideo(params)
        printResult(result)
      } catch (err) {
        log.error(String(err))
        process.exit(1)
      }
    })
}
