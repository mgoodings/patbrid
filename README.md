patbrid
===

A Real-Debrid blackhole downloader.

### Development (Docker)

#### Requirements

* Docker

#### Setup

Copy `.env.example` to `.env`

#### Run

`$ docker-compose build`

`$ docker-compose run --rm downloader`

### Development (Local)

#### Requirements

* NodeJS
* Yarn
* Axel

#### Setup

`$ export WATCH_DIR=./watch`

`$ export DOWNLOAD_DIR=./download`

`$ export API_KEY=<your-api-key>`

#### Run

`$ yarn watch`
