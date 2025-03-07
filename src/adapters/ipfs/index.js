/*
  top-level IPFS library that combines the individual IPFS-based libraries.
*/

const IpfsAdapter = require('./ipfs')
const IpfsCoordAdapter = require('./ipfs-coord')

class IPFS {
  constructor (localConfig = {}) {
    // Encapsulate dependencies
    this.ipfsAdapter = new IpfsAdapter()
    this.IpfsCoordAdapter = IpfsCoordAdapter
    this.process = process

    this.ipfsCoordAdapter = {} // placeholder

    // Properties of this class instance.
    this.isReady = false
  }

  // Provides a global start() function that triggers the start() function in
  // the underlying libraries.
  async start (localConfig = {}) {
    try {
      const bchjs = localConfig.bchjs
      if (!bchjs) {
        throw new Error(
          'Instance of bch-js must be passed when instantiating IPFS adapter.'
        )
      }

      // Start IPFS
      await this.ipfsAdapter.start()
      console.log('IPFS is ready.')

      // this.ipfs is a Promise that will resolve into an instance of an IPFS node.
      this.ipfs = this.ipfsAdapter.ipfs

      // Start ipfs-coord
      this.ipfsCoordAdapter = new this.IpfsCoordAdapter({
        ipfs: this.ipfs,
        bchjs
      })
      await this.ipfsCoordAdapter.start()
      console.log('ipfs-coord is ready.')

      return true
    } catch (err) {
      console.error('Error in adapters/ipfs/index.js/start()')

      // If error is due to a lock file issue. Kill the process, so that
      // Docker or pm2 has a chance to restart the service.
      if (err.message.includes('Lock already being held')) {
        this.process.exit(1)
      }

      throw err
    }
  }
}

module.exports = IPFS
