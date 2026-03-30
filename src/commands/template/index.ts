import type { Command } from 'commander'
import { register as registerList } from './list.js'
import { register as registerDetail } from './detail.js'

export function registerTemplateCommands(program: Command): void {
  const template = program.command('template').description('Template operations')
  registerList(template)
  registerDetail(template)
}
