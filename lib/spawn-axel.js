const debug = require('debug')('patbrid:spawn-axel')
const { spawn } = require('child_process')

module.exports = (link, output) => {
  debug(link, output)

  const args = [
    '--alternate',
    '--output',
    output,
    link
  ]

  const command = spawn('axel', args, {
    stdio: 'inherit'
  })

  command.on('close', (code) => {
    console.log(`Exiting process: ${code}`)
  })
}
