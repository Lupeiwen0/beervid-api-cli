import type { Command } from 'commander'
import { register as registerProfile } from './profile.js'
import { register as registerCheck } from './check.js'

export function registerAuthCommands(program: Command): void {
  const auth = program.command('auth').description('Authentication operations')
  registerProfile(auth)
  registerCheck(auth)
}
