/** @format */

class BrowserService {
  constructor() {
    this.browser = {};
  }

  makeBrowser = (id) => {
    this.browser[id] = `I am a browser of ${id}`;
  };
}
module.exports = BrowserService;
