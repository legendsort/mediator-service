/** @format */

const puppeteer = require("puppeteer");
class BankCrawlerService {
  constructor(url) {
    let browser = new puppeteer();
    this.browser = browser;
  }

  async start() {}
  async getForex() {}
}
