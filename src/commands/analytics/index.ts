import type { Command } from 'commander'
import { register as registerVideo } from './video.js'

export function registerAnalyticsCommands(program: Command): void {
  const analytics = program.command('analytics').description('Analytics operations')
  registerVideo(analytics)
}
