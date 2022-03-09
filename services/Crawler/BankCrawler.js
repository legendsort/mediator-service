/** @format */

const puppeteer = require("puppeteer-extra");
const browserConfig = require("../../config/browser.json");
const urlList = require("../../config/url.json");
const sleep = require("await-sleep");
const res = require("express/lib/response");
const axios = require("axios");
const FormData = require("form-data");

class BankCrawlerService {
  constructor() {
    this.urls = urlList.allow;
    this.configs = browserConfig.browser;
    this.broswer, this.pages;
  }

  //check whether broswer open and if it is, close all pages
  initBrowser = async () => {
    if (this.browser) {
      await this.browser.close();
      pages = {};
    }
  };

  //launch broswer
  launchBrowser = async () => {
    try {
      this.browser = await puppeteer.launch(this.configs);
    } catch (error) {
      console.log(error, "Launching browser has some errors.");
    }
  };

  //open new pages
  openBlankPages = async () => {
    for (let i = 0; i < this.urls.length; i++) {
      try {
        await this.browser.newPage();
      } catch (error) {
        console.log(error, "New page Error");
      }
    }

    try {
      console.log(this.browser);
      this.pages = await this.browser.pages();
    } catch (error) {
      console.log(error);
    }
  };

  //open target pages
  openTargetPages = async () => {
    await this.urls.map(async (url, i) => {
      try {
        await pages[i + 1].setDefaultNavigationTimeout(
          this.browserConfig.timeout,
        );
        await pages[i + 1].goto(url);
      } catch (error) {
        console.log(`crawling in ${url} page has some error. Like ${error}`);
      }
    });
  };
  start = async () => {
    this.initBrowser();
    this.launchBrowser();
    this.openBlankPages();
    this.openTargetPages();
    await sleep(15000);
  };

  //waitForSelector
  async wFS(page, query) {
    try {
      await page.waitForSelector(query);
      return 1;
    } catch (e) {
      return 0;
    }
  }

  //get data from table
  async getTable(page, query) {
    const data = await page.evaluate((query) => {
      const rows = document.querySelectorAll(query);
      return Array.from(rows, (row) => {
        const columns = row.querySelectorAll("td");
        return Array.from(columns, (column) => column.innerText);
      });
    }, query);
    return data;
  }

  //conver data into object and push
  addDataToResponse(res, data, params) {
    for (let i = 0; i < data.length; i++) {
      if (i == 0) {
        continue;
      }
      let item = Object.assign.apply(
        {},
        params.map((v, j) => ({ [v]: data[i][j] })),
      );
      res.push(item);
    }
  }

  async getForex() {
    let page, find, data, params;
    let response = [];
    // var bodyFormData = new FormData();

    // bodyFormData.append('apikey', '2d8b3b803594b13e02a7dc827f4a63f8');
    // bodyFormData.append('fields', 'bid,ask');
    // bodyFormData.append('symbols', '^USDEUR,^USDAUD,^USDCAD,^USDHKD,^USDCNY,^USDCHF,^USDGBP,^USDRUB,^USDSEK,^USDSGD,^USDJPY,^EURCNY');

    // axios({
    //   method: "post",
    //   url: "https://ondemand.websol.barchart.com/getQuote.json",
    //   data: bodyFormData,
    //   headers: bodyFormData.getHeaders()
    // }).then(res=>{
    //   console.log(res.data)
    // }).catch(err=>{
    //   console.log(err)
    // })

    // return

    // ------------- page 1 --------------
    page = pages[1];
    await page.bringToFront();
    await page.reload();

    find = await this.wFS(
      page,
      "#quotetable > table > tbody > tr:nth-child(13)",
    );
    if (find == 0) return;

    data = await this.getTable(page, "#quotetable > table > tbody > tr");
    params = ["SB", "Bid", "Ask", "Hig", "Low", "Opn", "Chg", "Tim"];
    this.addDataToResponse(response, data, params);
    // ------------- page 2 --------------
    page = pages[2];
    await page.bringToFront();
    await page.reload();

    find = await this.wFS(
      page,
      "#quotetable > table > tbody > tr:nth-child(7)",
    );
    if (find == 0) return;

    data = await this.getTable(page, "#quotetable > table > tbody > tr");
    this.addDataToResponse(response, data, params);
    console.log("Forex: ", response.length);
    return response;
  }

  async getWSJ() {
    const page = pages[3];

    await page.bringToFront();
    await page.reload();

    try {
      await page.waitForSelector(
        "#root > div > div > div > div:nth-child(2) > div > div > div.WSJBase--card--2XHo-8Ej > table",
      );
    } catch (e) {
      console.log("ERROR: [waitForSelector]", e);
      return;
    }

    const Thtml = await page.evaluate(() => {
      const rows = document.querySelectorAll(
        "#root > div > div > div > div:nth-child(2) > div > div > div.WSJBase--card--2XHo-8Ej > table > tbody > tr",
      );
      return Array.from(rows, (row) => {
        const columns = row.querySelectorAll("td");
        return Array.from(columns, (column) => column.innerText);
      });
    });
    let response = [];
    for (var i = 0; i < Thtml.length; i++) {
      var pageItemData = {
        SB: Thtml[i][0], //symbol
        IUM: Thtml[i][1], //IN US$ MON
        IUF: Thtml[i][2], //In US$ FRI
        UC1: Thtml[i][3], //US$ VS. % CHG 1-DAY
        UCY: Thtml[i][4], //US$ VS. % CHG YTD
        PUM: Thtml[i][5], //PER US$ MON
        PUF: Thtml[i][6], //PER US$ FRI
      };
      response.push(pageItemData);
    }
    console.log("WSJ: ", "OK");
    return response;
  }
  async getSGE() {
    const page = pages[4];

    await page.bringToFront();
    await page.reload();

    try {
      await page.waitForSelector(
        "body > div.news_warp.pt30.pb30 > div > div.main > div.trading_content > div > table > tbody",
      );
    } catch (e) {
      console.log("ERROR: [waitForSelector]", e);
      return;
    }

    const Thtml = await page.evaluate(() => {
      const rows = document.querySelectorAll(
        "body > div.news_warp.pt30.pb30 > div > div.main > div.trading_content > div > table > tbody > tr",
      );
      return Array.from(rows, (row) => {
        const columns = row.querySelectorAll("td");
        return Array.from(columns, (column) => column.innerText);
      });
    });
    let response = [];
    for (var i = 0; i < Thtml.length; i++) {
      var pageItemData = {
        Vty: Thtml[i][0], //Variety
        Lst: Thtml[i][1], //Latest
        Hig: Thtml[i][2], //High
        Low: Thtml[i][3], //Low
        Opn: Thtml[i][4], //Open
      };
      response.push(pageItemData);
    }
    console.log("SGE: ", "OK");
    return response;
  }

  async getBOC() {
    const page = pages[5];

    await page.bringToFront();
    await page.reload();

    try {
      await page.waitForSelector(
        "body > table:nth-child(2) > tbody > tr > td:nth-child(2) > table:nth-child(5) > tbody > tr > td > table > tbody",
      );
    } catch (e) {
      console.log("ERROR: [waitForSelector]", e);
      return;
    }

    const Thtml = await page.evaluate(() => {
      const rows = document.querySelectorAll(
        "body > table:nth-child(2) > tbody > tr > td:nth-child(2) > table:nth-child(5) > tbody > tr > td > table > tbody > tr",
      );
      return Array.from(rows, (row) => {
        const columns = row.querySelectorAll("td");
        return Array.from(columns, (column) => column.innerText);
      });
    });
    let response = [];
    for (var i = 0; i < Thtml.length; i++) {
      if (i == 0) {
        continue;
      }
      var pageItemData = {
        CN: Thtml[i][0], //Currency Name
        BR: Thtml[i][1], //Buying Rate
        CBR: Thtml[i][2], //Cash Buying Rate
        SR: Thtml[i][3], //Selling Rate
        CR: Thtml[i][4], //Cash Selling Rate
        MR: Thtml[i][5], //Middle Rate
        PT: Thtml[i][6], //Pub Time
      };
      response.push(pageItemData);
    }
    console.log("BOC: ", "OK");
    return response;
  }

  async getEnergy() {
    const page = pages[6];

    await page.bringToFront();
    await page.reload();

    try {
      await page.waitForSelector(
        "#content > div > div > div.section-front__main-content > div.data-tables.first > div > table > tbody",
      );
    } catch (e) {
      console.log("ERROR: [waitForSelector]", e);
      return;
    }

    let selector_url = [
      "#content > div > div > div.section-front__main-content > div.data-tables.first > div > table > tbody > tr",
      "#content > div > div > div.section-front__main-content > div:nth-child(6) > div > table > tbody > tr",
      "#content > div > div > div.section-front__main-content > div:nth-child(8) > div > table > tbody > tr",
    ];
    let response = [];
    for (let i = 0; i < 3; i++) {
      let sel_item = selector_url[i];
      const Thtml = await page.evaluate(
        ({ sel_item }) => {
          const rows = document.querySelectorAll(sel_item);
          return Array.from(rows, (row) => {
            const th = row.querySelector("th");
            const columns = row.querySelectorAll("td");
            const temp = Array.from(columns, (column) =>
              column.innerText.replace(/,/g, ""),
            );
            temp.push(th.innerText);
            return temp;
          });
        },
        { sel_item },
      );

      for (var j = 0; j < Thtml.length; j++) {
        var pageItemData = {
          Idx: Thtml[j][6], //Index
          Unt: Thtml[j][0], //Units
          Prc: Thtml[j][1], //Price
          Chg: Thtml[j][2], //Change
          "%Ch": Thtml[j][3], //%Change
          Ctr: Thtml[j][4], //Contract
          EST: Thtml[j][5], //Time(EST)
        };
        response.push(pageItemData);
      }
    }
    console.log("Energy: ", "OK");
    return response;
  }

  async getCbr() {
    const page = pages[7];

    await page.bringToFront();
    await page.reload();

    try {
      await page.waitForSelector(
        "#content > div > div > div > div.table-wrapper > div > table > tbody",
      );
    } catch (e) {
      console.log("ERROR: [waitForSelector]", e);
      return;
    }

    const Thtml = await page.evaluate(() => {
      const rows = document.querySelectorAll(
        "#content > div > div > div > div.table-wrapper > div > table > tbody > tr",
      );
      return Array.from(rows, (row) => {
        const columns = row.querySelectorAll("td");
        return Array.from(columns, (column) => column.innerText);
      });
    });
    let response = [];
    for (var i = 0; i < Thtml.length; i++) {
      if (i == 0) {
        continue;
      }
      var pageItemData = {
        NC: Thtml[i][0], //Num code
        CC: Thtml[i][1], //Char code
        Unt: Thtml[i][2], //Unit
        Cur: Thtml[i][3], //Currency
        Rat: Thtml[i][4], //Rate
      };
      response.push(pageItemData);
    }
    console.log("Chr: ", "OK");
    return response;
  }

  async getLMM() {
    const page = pages[8];

    await page.bringToFront();
    await page.reload();

    try {
      await page.waitForSelector(
        "#quotetable > table > tbody > tr:nth-child(22)",
      );
    } catch (e) {
      console.log("ERROR: [waitForSelector]", e);
      return;
    }

    const Thtml = await page.evaluate(() => {
      const rows = document.querySelectorAll(
        "#quotetable > table > tbody > tr",
      );
      return Array.from(rows, (row) => {
        const columns = row.querySelectorAll("td");
        return Array.from(columns, (column) => column.innerText);
      });
    });
    let response = [];
    for (var i = 0; i < Thtml.length; i++) {
      if (i == 0) {
        continue;
      }
      let pageItemData = {
        SB: Thtml[i][0], //symbol
        Bid: Thtml[i][1], //bid
        Ask: Thtml[i][2], //ask
        Hig: Thtml[i][3], //high
        Low: Thtml[i][4], //low
        Opn: Thtml[i][5], //open
        Chg: Thtml[i][6], //change
        Tim: Thtml[i][7], // time
      };
      response.push(pageItemData);
    }

    console.log("LMM: ", "OK");
    return response;
  }

  async crawl() {
    await this.start();
    this.getForex();
    // this.getWSJ()
    // this.getSGE()
    // this.getBOC()
    // this.getEnergy()
    // this.getCbr()
    // this.getLMM()
  }

  async fetchData(pageIndex, waitFS, querySA) {
    let page = pages[pageIndex];
    try {
      await page.bringToFront();
    } catch (e) {
      console.log("ERROR [bring to front]: ", e);
    }

    // await page.reload()

    try {
      await page.waitForSelector(waitFS);
    } catch (e) {
      console.log("ERROR [waitForSelector]", e);
    }

    let response = [];

    const htmlData = await page.evaluate(() => {
      console.log(querySA);
      const rows = document.querySelectorAll(querySA);
      return Array.from(rows, (row) => {
        const columns = row.querySelectorAll("td");
        return Array.from(columns, (column) => column.innerText);
      });
    });
    for (let i = 0; i < htmlData.length; i++) {
      if (i == 0) {
        continue;
      }
      let pageItemData = {
        Sym: htmlData[i][0],
        Bid: htmlData[i][1],
        Ask: htmlData[i][2],
        Hig: htmlData[i][3],
        Low: htmlData[i][4],
        Opn: htmlData[i][5],
        Chn: htmlData[i][6],
        Tim: htmlData[i][7],
      };
      response.push(pageItemData);
    }
    console.log("response: ", response);
    return response;
  }
}
module.exports = BankCrawlerService;
