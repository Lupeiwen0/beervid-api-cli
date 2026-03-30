import type { Command } from 'commander'
import { uploadFile, printResult } from '../../client/index.js'
import { handleCommandError } from '../../command-error.js'
import { log } from '../../logger.js'

export function register(cmd: Command): void {
  cmd
    .command('upload <file>')
    .description('Upload a file (video, image, audio)')
    .option('--file-type <type>', 'File type (video, image, audio)')
    .action(async (file: string, opts: { fileType?: string }) => {
      try {
        log.info(`Uploading file: ${file}`)
        const result = await uploadFile(file, opts.fileType)
        printResult(result)
      } catch (err) {
        handleCommandError(err)
      }
    })
}
