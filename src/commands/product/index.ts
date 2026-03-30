import type { Command } from 'commander'
import { register as registerList } from './list.js'

export function registerProductCommands(program: Command): void {
  const product = program.command('product').description('Product operations')
  registerList(product)
}
