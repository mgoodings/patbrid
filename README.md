patbrid
===

A real-debrid blackhole downloader using aria2 RPC.

### Environment Variables

Value | Description | Default
--- | --- | ---
REAL_DEBRID_API_KEY | Real Debrid API Key |
ARIA2_URL | Aria2 JSON-RPC URL |
ARIA2_SECRET | Aria2 JSON-RPC Secret |
WATCH_DIR | Directory to watch | /watch
WATCH_RATE | Rate to check for updates | 5000

### Development

#### Requirements

* Docker
* aria2 with JSON-RPC enabled

#### Setup

Copy `.env.example` to `.env`

#### Run

`$ docker-compose build`

`$ docker-compose run --rm downloader`
