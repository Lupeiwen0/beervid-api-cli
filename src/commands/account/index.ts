import type { Command } from 'commander'
import { register as registerList } from './list.js'

export function registerAccountCommands(program: Command): void {
  const account = program.command('account').description('TikTok account operations')
  registerList(account)
}
