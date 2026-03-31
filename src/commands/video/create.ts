import { readFileSync } from 'node:fs'
import type { Command } from 'commander'
import { createVideo, printResult } from '../../client/index.js'
import { CliCommandError, handleCommandError } from '../../command-error.js'
import { log } from '../../logger.js'
import type { VideoCreateParams, TechType, VideoScale } from '../../types/index.js'

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
    .option('--tech-type <type>', 'Tech type (sora, veo, sora_azure, sora_h_pro)')
    .option('--video-scale <scale>', 'Video scale (16:9 or 9:16)')
    .option('--language <lang>', 'Dialogue language')
    .option('--name <name>', 'Video name')
    .action(async (opts: { json?: string; techType?: string; videoScale?: string; language?: string; name?: string }) => {
      try {
        let params: VideoCreateParams

        if (opts.json) {
          params = parseJsonInput(opts.json)
        } else if (opts.techType) {
          params = {
            techType: opts.techType as TechType,
            videoScale: (opts.videoScale || '9:16') as VideoScale,
            dialogueLanguage: opts.language || 'English',
            showTitle: false,
            showSubtitle: false,
            noBgmMusic: false,
            hdEnhancement: false,
            fragmentList: [],
          }
        } else {
          throw new CliCommandError(
            'Either --json or --tech-type is required. Use --json for full params, or --tech-type with other flags for quick creation.',
            { source: 'ValidationError' },
          )
        }

        // Shortcut params override JSON values when both provided
        if (opts.techType && opts.json) params.techType = opts.techType as TechType
        if (opts.videoScale && opts.json) params.videoScale = opts.videoScale as VideoScale
        if (opts.language && opts.json) params.dialogueLanguage = opts.language
        if (opts.name && opts.json) params.name = opts.name

        log.info('Creating video task...')
        const data = await createVideo(params)
        if (typeof data === 'string') {
          const match = data.match(/task IDs?:\s*\[([^\]]+)\]/i)
          const taskIds = match ? match[1].split(',').map(s => s.trim()) : []
          printResult({ taskIds, message: data })
        } else if (data && typeof data === 'object') {
          printResult(data)
        } else {
          printResult({ success: true })
        }
      } catch (err) {
        handleCommandError(err)
      }
    })
}
