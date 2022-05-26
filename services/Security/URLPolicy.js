/** @format */

class URLPolicy {
  constructor() {
    this.allowUrlList = [];
  }
  isAllowUrl = (url) => {
    return this.allowUrlList.includes(url);
  };
}

module.exports = URLPolicy;
