declare const __PKG_VERSION__: string

import { program } from 'commander'
import { setQuiet } from './logger.js'
import { setPretty } from './client/index.js'
import { registerConfigCommand } from './commands/config.js'

program
  .name('beervid-api')
  .version(typeof __PKG_VERSION__ !== 'undefined' ? __PKG_VERSION__ : '0.0.0')
  .description('BeerVid Open API CLI & SDK')
  .option('-q, --quiet', 'Suppress progress logs')
  .option('--pretty', 'Pretty-print JSON output')
  .hook('preAction', () => {
    if (program.opts()['quiet']) setQuiet(true)
    if (program.opts()['pretty']) setPretty(true)
  })

registerConfigCommand(program)

program.parse()
