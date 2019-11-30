const debug = require('debug')('patbrid:dir-watcher')
const fs = require('fs')
const path = require('path')

class DirWatcher {
  constructor (watchDir, extension, callback) {
    debug('ctor', watchDir, extension)

    this._watchDir = watchDir
    this._callback = callback
    this._extension = extension

    fs.watch(this._watchDir, this.onFileEvent.bind(this))
  }

  onFileEvent (eventType, fileName) {
    debug('onFileEvent', eventType, fileName)

    const filePath = `${this._watchDir}/${fileName}`
    const extension = path.extname(fileName)

    if (eventType !== 'rename' || extension !== this._extension) {
      return
    }

    fs.stat(filePath, (err) => this._callback(filePath, !err))
  }
}

module.exports = DirWatcher
