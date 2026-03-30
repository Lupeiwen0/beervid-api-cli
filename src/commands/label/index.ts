import type { Command } from 'commander'
import { register as registerList } from './list.js'

export function registerLabelCommands(program: Command): void {
  const label = program.command('label').description('Label operations')
  registerList(label)
}
