export {}
const {ServiceProvider} = require('@osjs/common')
const axios = require('axios')

const DBRoot = "http://lass:8080"

class DatabaseProvider extends ServiceProvider {
  provides() {
    return ['server/database/api']
  }

  async get(route) {
    let result = await axios.get(DBRoot + route)
    return result.data
  }

  async post(route, data) {
    let result = await axios.post(DBRoot + route, data)
    return result.data
  }


  async init() {
    this.core.singleton('server/database/api', () => ({
      get: route => {
        return this.get(route)
      },
      post: (route, data) => {
        return this.post(route, data)
      }
    }))
  }
}

module.exports = DatabaseProvider