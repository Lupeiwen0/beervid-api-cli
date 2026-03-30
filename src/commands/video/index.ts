import type { Command } from 'commander'
import { register as registerCreate } from './create.js'
import { register as registerTasks } from './tasks.js'
import { register as registerLibrary } from './library.js'
import { register as registerPublish } from './publish.js'
import { register as registerUpload } from './upload.js'

export function registerVideoCommands(program: Command): void {
  const video = program.command('video').description('Video operations')
  registerCreate(video)
  registerTasks(video)
  registerLibrary(video)
  registerPublish(video)
  registerUpload(video)
}
