/** @format */
const Browser = require('./Browser')
class BrowserService {
  constructor() {
    this.browser = {}
  }

  makeBrowser = async (id) => {
    if (this.existBrowser(id)) {
      return this.browser[id]
    } else {
      this.browser[id] = new Browser(id)
      console.log('====make new browser')
      await this.browser[id].launchBrowser()

      return this.browser[id]
    }
  }

  removeBrowser = (id) => {
    delete this.browser[id]
  }

  existBrowser(id) {
    if (this.browser[id] === undefined) {
      return false
    } else {
      console.log('====Exist browser')
      return true
    }
  }

  getBrowser(id) {
    return this.existBrowser(id) ? this.browser[id] : false
  }
}
module.exports = BrowserService
