const debug = require('debug')('patbrid:torrent-downloader')
const RealDebridClient = require('real-debrid-api')
const spawnAxel = require('./spawn-axel')

class TorrentDownloader {
  constructor (apiKey, downloadPath) {
    debug('ctor', apiKey, downloadPath)

    this._client = new RealDebridClient(apiKey)
    this._downloadPath = downloadPath
    this._watchList = []
  }

  addToWatchList (id) {
    debug('addToWatchList', id)

    this._watchList.push(id)
  }

  removeFromWatchList (id) {
    debug('removeFromWatchList', id)

    const index = this._watchList.indexOf(id)

    if (~index) {
      this._watchList.splice(index, 1)
    }
  }

  addTorrent (torrentFile) {
    debug('addTorrent', torrentFile)

    let id = null

    console.log(`Adding torrent: ${torrentFile}`)

    // Add the torrent to the queue
    return this._client.torrents.addTorrent(torrentFile)
      // Begin downloading the torrent
      .then(result => {
        id = result.id

        console.log(`Created ${id}, starting download`)

        return this._client.torrents.selectFiles(id)
      })
      // Save to the watch list
      .then(() => {
        this.addToWatchList(id)
      })
  }

  getTorrentInfo (id) {
    debug('getTorrentInfo', id)

    return this._client.torrents.info(id)
      .then(result => [id, result])
      .catch(() => Promise.resolve([id, null]))
  }

  getDownloadLink (link) {
    debug('getDownloadLink', link)

    return this._client.unrestrict.link(link)
      .then(result => [link, result])
      .catch(() => Promise.resolve([link, null]))
  }

  getDownloadLinks (links) {
    const promises = links.map(link => this.getDownloadLink(link))

    return Promise.all(promises)
  }

  downloadFile (url, data) {
    debug('downloadFile', url, data)

    if (!data) {
      return
    }

    console.log('Downloading file', url, data)

    const outputFile = `${this._downloadPath}/${data.filename}`

    spawnAxel(data.download, outputFile)
  }

  checkWatchResult (id, data) {
    debug('checkWatchResult', id)

    // Remove from the watch list if we have no data
    if (!data) {
      return this.removeFromWatchList(id)
    }

    console.log(`[${id}] status: ${data.status} name: ${data.filename} progress: ${data.progress}%`)

    // Has the torrent finished downloading
    if (data.status === 'downloaded') {
      console.log(`${id} is ready to download`)

      // Remove from the watch list
      this.removeFromWatchList(id)

      // Resolve all download links
      this.getDownloadLinks(data.links)
        .then(results => {
          // Check each download link result
          results.forEach(([url, data]) => this.downloadFile(url, data))
        })
        .catch(err => console.error(err))
    }
  }

  checkWatchList () {
    debug('checkWatchList')

    // Go through each torrent and get the info
    const promises = this._watchList.map(id => this.getTorrentInfo(id))

    // Wait for all info's to succeed
    return Promise.all(promises)
      .then(results => {
        // Check each info result
        results.forEach(([id, data]) => this.checkWatchResult(id, data))
      })
  }
}

module.exports = TorrentDownloader
