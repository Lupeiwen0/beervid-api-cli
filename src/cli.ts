declare const __PKG_VERSION__: string

import { program } from 'commander'
import { setQuiet } from './logger.js'
import { setPretty } from './client/index.js'
import { registerAuthCommands } from './commands/auth/index.js'
import { registerVideoCommands } from './commands/video/index.js'
import { registerStrategyCommands } from './commands/strategy/index.js'
import { registerAccountCommands } from './commands/account/index.js'
import { registerTemplateCommands } from './commands/template/index.js'
import { registerLabelCommands } from './commands/label/index.js'
import { registerProductCommands } from './commands/product/index.js'
import { registerRecordCommands } from './commands/record/index.js'
import { registerAnalyticsCommands } from './commands/analytics/index.js'
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

registerAuthCommands(program)
registerVideoCommands(program)
registerStrategyCommands(program)
registerAccountCommands(program)
registerTemplateCommands(program)
registerLabelCommands(program)
registerProductCommands(program)
registerRecordCommands(program)
registerAnalyticsCommands(program)
registerConfigCommand(program)

program.parse()
