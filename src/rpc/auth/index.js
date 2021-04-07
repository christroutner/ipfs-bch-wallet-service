/*
  This is the JSON RPC router for the users API
*/

// Public npm libraries
const jsonrpc = require('jsonrpc-lite')

// Local libraries
// const AuthLib = require('../../lib/auth')
const UserLib = require('../../lib/users')
const wlogger = require('../../lib/wlogger')

class AuthRPC {
  constructor (localConfig) {
    // Encapsulate dependencies
    // this.authLib = new AuthLib()
    this.jsonrpc = jsonrpc
    this.userLib = new UserLib()
  }

  // Top-level router for this library. All other methods in this class are for
  // a specific endpoint. This method routes incoming calls to one of those
  // methods.
  async authRouter (rpcData) {
    try {
      // console.log('authRouter rpcData: ', rpcData)

      const endpoint = rpcData.payload.params.endpoint

      // Route the call based on the requested endpoint.
      switch (endpoint) {
        case 'authUser':
          return await this.authUser(rpcData)
      }
    } catch (err) {
      console.error('Error in AuthRPC/authRouter()')
      throw err
    }
  }

  async authUser (rpcData) {
    try {
      // console.log('authUser rpcData: ', rpcData)

      if (!rpcData.payload.params.login) {
        throw new Error('login must be specified')
      }
      if (!rpcData.payload.params.password) {
        throw new Error('password must be specified')
      }

      const login = rpcData.payload.params.login
      const password = rpcData.payload.params.password

      const user = await this.userLib.authUser(login, password)
      // console.log('user: ', user)

      const token = user.generateToken()

      const response = {
        endpoint: 'authUser',
        userId: user._id,
        userType: user.type,
        userName: user.name,
        userEmail: user.email,
        apiToken: token,
        status: 200,
        success: true,
        message: ''
      }

      return response
    } catch (err) {
      // console.error('Error in authUser()')
      wlogger.error('Error in authUser(): ', err)
      // throw err

      // Return an error response
      return {
        success: false,
        status: 422,
        message: err.message,
        endpoint: 'authUser'
      }
    }
  }
}

module.exports = AuthRPC
