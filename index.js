const debug = require('debug')('patbrid:index')
const DirWatcher = require('./lib/dir-watcher')
const TorrentDownloader = require('./lib/torrent-downloader')

const {
  API_KEY,
  WATCH_DIR = '/watch',
  DOWNLOAD_DIR = '/download',
  TORRENT_CHECK_RATE = 15000
} = process.env

if (!API_KEY) {
  console.log('You must specify an API_KEY env var')

  process.exit(-1)
}

// Create a downloader instance
const downloader = new TorrentDownloader(API_KEY, DOWNLOAD_DIR)

// Setup a file event handler
const handleTorrent = (torrentFile, exists) => {
  debug('handleTorrent', torrentFile, exists)

  if (!exists) {
    return
  }

  downloader.addTorrent(torrentFile)
    .catch(err => console.error(err))
}

// Start watching the directory
new DirWatcher(WATCH_DIR, '.torrent', handleTorrent)

console.log(`Watching '${WATCH_DIR}' for new torrents`)

setInterval(() => {
  console.log('Checking torrent watch list')

  // Check the torrent watch list
  downloader.checkWatchList()
    .catch(err => console.error(err))
}, TORRENT_CHECK_RATE)
