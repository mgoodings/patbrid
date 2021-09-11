const fs = require('fs')
const path = require('path')
const debug = require('debug')('patbrid:watchers:real-debrid')
const RealDebridClient = require('real-debrid-api')
const RealDebridTorrent = require('./torrent')

class RealDebridWatcher {
  constructor (apiKey, downloadFn) {
    debug('ctor', apiKey)

    this.client = new RealDebridClient(apiKey)
    this.downloadFn = downloadFn
    this.watchList = []
  }

  addFile (file) {
    debug('addFile', file)

    const extension = path.extname(file).toLowerCase()

    if (extension === '.magnet') {
      this.addMagnet(file)
    } else {
      this.addTorrent(file)
    }
  }

  addTorrent (file) {
    debug('addTorrent', file)

    // Create a torrent instance
    const torrent = new RealDebridTorrent(this.client, this.downloadFn, file)

    // Add the torrent to the queue
    return torrent.addToQueue()
      // Save to the watch list
      .then(() => this.addToWatchList(torrent))
      // Log errors
      .catch(err => console.error('[!] addTorrent failed', err))
  }

  addMagnet (file) {
    debug('addMagnet', file)

    fs.readFile(file, 'utf8', (err, data) => {
      if (err) {
        return console.error('[!] addMagnet read failed', err)
      }

      // Create a torrent instance
      const torrent = new RealDebridTorrent(this.client, this.downloadFn, file, data)

      // Add the torrent to the queue
      torrent.addToQueue()
        // Save to the watch list
        .then(() => this.addToWatchList(torrent))
        // Log errors
        .catch(err => console.error('[!] addMagnet failed', err))
    })
  }

  checkWatchList () {
    debug('checkWatchList', this.watchList.length)

    // Remove invalid torrents
    this.removeInvalidTorrents()

    // Go through each torrent and update it
    const promises = this.watchList.map(torrent => torrent.update())

    // Wait for all torrents to update
    return Promise.all(promises)
      .catch(err => console.error('[!] checkWatchList failed', err))
  }

  addToWatchList (torrent) {
    debug('addToWatchList', torrent.file)

    // Add the torrent to the watch list
    this.watchList.push(torrent)
  }

  removeFromWatchList (torrent) {
    debug('removeFromWatchList', torrent.file)

    // Remove the torrent from the watch list
    const index = this.watchList.indexOf(torrent)

    if (~index) {
      this.watchList.splice(index, 1)
    }
  }

  removeInvalidTorrents () {
    debug('removeInvalidTorrents')

    // Remove any invalid torrents from the watch list
    this.watchList.forEach(torrent => {
      if (torrent.status === 'invalid') {
        this.removeFromWatchList(torrent)
      }
    })
  }
}

module.exports = RealDebridWatcher
