/** @format */
const Browser = require("./Browser");
class BrowserService {
  constructor() {
    this.browser = {};
  }

  makeBrowser = (id) => {
    if (!this.existBrowser(id)) {
      return this.browser[id];
    } else {
      this.browser[id] = new Browser(id);
      return this.browser[id];
    }
  };

  existBrowser(id) {
    if (typeof this.browser[id] === undefined) {
      return false;
    } else {
      return true;
    }
  }

  getBrowser(id) {
    return this.existBrowser(id) ? this.browser[id] : false;
  }
}
module.exports = BrowserService;
