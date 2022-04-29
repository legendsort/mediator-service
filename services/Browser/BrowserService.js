/** @format */
var configModel = require("../../models/config.model");

const Browser = require("./Browser");
class BrowserService {
  constructor() {
    this.browser = {};
  }

  makeBrowser = (id) => {
    if (this.existBrowser(id)) {
      return this.browser[id];
    } else {
      this.browser[id] = new Browser(id);
      return this.browser[id];
    }
  };

  removeBrowser = (id) => {
    delete this.browser[id];
  };

  existBrowser(id) {
    if (this.browser[id] === undefined) {
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
