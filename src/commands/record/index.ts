import type { Command } from 'commander'
import { register as registerList } from './list.js'

export function registerRecordCommands(program: Command): void {
  const record = program.command('record').description('Publish record operations')
  registerList(record)
}
