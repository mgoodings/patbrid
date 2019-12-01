const debug = require('debug')('patbrid:downloaders:aria2')
const rpc = require('node-json-rpc')
const { URL } = require('url')

class Aria2 {
  constructor (url, secret) {
    debug('ctor', url, secret)

    this.url = url
    this.secret = secret
    this.id = 0

    const rpcUrl = new URL(this.url)

    this.rpcClient = new rpc.Client({
      host: rpcUrl.hostname,
      port: rpcUrl.port,
      path: rpcUrl.pathname
    })

    this.download = this._download.bind(this)
  }

  _download (links) {
    debug('_download', links)

    return new Promise((resolve, reject) => {
      this.rpcClient.call({
        jsonrpc: '2.0',
        method: 'aria2.addUri',
        params: [`token:${this.secret}`, links],
        id: this.id++
      }, (err, res) => {
        !err ? resolve(res) : reject(err)
      })
    })
  }
}

module.exports = Aria2
