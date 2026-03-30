import type { Command } from 'commander'
import { register as registerCreate } from './create.js'
import { register as registerList } from './list.js'
import { register as registerDetail } from './detail.js'
import { register as registerToggle } from './toggle.js'
import { register as registerDelete } from './delete.js'

export function registerStrategyCommands(program: Command): void {
  const strategy = program.command('strategy').description('Strategy operations')
  registerCreate(strategy)
  registerList(strategy)
  registerDetail(strategy)
  registerToggle(strategy)
  registerDelete(strategy)
}
