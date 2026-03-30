import type { Command } from 'commander'
import { publishVideo, printResult } from '../../client/index.js'
import { CliCommandError, handleCommandError } from '../../command-error.js'
import { log } from '../../logger.js'

export function register(cmd: Command): void {
  cmd
    .command('publish')
    .description('Publish a video to TikTok')
    .requiredOption('--video-id <id>', 'Video ID')
    .requiredOption('--business-id <id>', 'Business account ID')
    .option('--product-anchor', 'Enable product anchor')
    .option('--product-id <id>', 'Product ID for anchor')
    .option('--product-anchor-title <title>', 'Product anchor title')
    .action(async (opts: { videoId: string; businessId: string; productAnchor?: boolean; productId?: string; productAnchorTitle?: string }) => {
      try {
        if (opts.productAnchor && !opts.productId) {
          throw new CliCommandError('--product-id is required when using --product-anchor', { source: 'ValidationError' })
        }
        log.info('Publishing video...')
        const result = await publishVideo({
          videoId: opts.videoId,
          businessId: opts.businessId,
          ...(opts.productAnchor ? { productAnchorStatus: true } : {}),
          ...(opts.productId ? {
            productLinkInfo: {
              productId: opts.productId,
              ...(opts.productAnchorTitle ? { productAnchorTitle: opts.productAnchorTitle } : {}),
            },
          } : {}),
        })
        printResult(result)
      } catch (err) {
        handleCommandError(err)
      }
    })
}
