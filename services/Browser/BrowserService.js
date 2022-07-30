/** @format */
const Browser = require('./Browser')
class BrowserService {
  constructor() {
    this.browser = {}
    this.desTime = 1000 * 60 * 60 * 24 //1 day
  }

  makeBrowser = async (id) => {
    if (this.existBrowser(id)) {
      return this.browser[id]
    } else {
      this.browser[id] = new Browser(id)
      console.log('====make new browser')
      await this.browser[id].launchBrowser()
      setTimeout(() => {
        this.removeBrowser(id)
      }, this.desTime)
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
