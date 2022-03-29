/** @format */

const puppeteer = require("puppeteer-extra");
const res = require("express/lib/response");
const axios = require("axios");
const FormData = require("form-data");
const sleep = require("await-sleep");

const baseURL = process.env.BASE_URL;
const serverURL = process.env.WIPO_SERVER;

class MyCrawler {
  constructor(browserConfig, instruction) {
    this.configs = browserConfig;
    this.instruction = instruction;
    this.browser;
    this.results = {};
  }

  initBrowser = async () => {
    if (this.browser) {
      try {
        await this.browser.close();
      } catch (e) {
        console.log(e);
        return false;
      }
    }
  };

  launchBrowser = async () => {
    try {
      this.browser = await puppeteer.launch(this.configs);
    } catch (e) {
      console.log(e);
      return false;
    }
  };

  openBlankPage = async () => {
    try {
      return await this.browser.newPage();
    } catch (e) {
      console.log(e);
      return false;
    }
  };

  visit = async (page, script) => {
    let url = script.url;
    try {
      await page.goto(url, { waitUntil: "domcontentloaded" });
    } catch (e) {
      console.log(e);
      return false;
    }
  };

  input = async (page, script) => {
    let [selector, value] = [script.selector, script.value];
    try {
      await page.focus(selector);
    } catch (e) {
      console.log(e);
      return false;
    }
    try {
      await page.keyboard.type(value, { delay: 30 });
    } catch (e) {
      console.log(e);
      return false;
    }
  };

  click = async (page, script) => {
    let selector = script.selector;
    try {
      await page.click(selector);
    } catch (e) {
      console.log(e);
      return false;
    }
  };

  waitForNavigation = async (page, script) => {
    try {
      await page.waitForNavigation();
    } catch (e) {
      console.log(e);
      return false;
    }
  };

  checkWait = async (page, script) => {
    let selector = script.selector;
    try {
      await page.waitForSelector(selector);
    } catch (e) {
      console.log("e");
      return false;
    }
  };

  reload = async (page, script) => {
    try {
      await page.reload();
    } catch (e) {
      console.log(e);
      return false;
    }
  };

  insertFieldToTable = (result, fields) => {
    const res = [];
    for (let row of result) {
      if (row.length == 0) continue;
      let obj = {};
      for (let i = 0; i < fields.length; i++) {
        obj[fields[i]] = row[i];
      }
      res.push(obj);
    }
    return res;
  };

  saveData = (name, res, time) => {
    axios
      .post(`${serverURL}${baseURL}/bank/trade-info/create`, {
        res,
        name,
        time,
      })
      .then(console.log("Save Success"))
      .catch((e) => console.log(e));
  };

  saveHistory = async (type, status, message) => {
    const history = {
      type: type,
      status: status,
      message: message,
      time: new Date().toISOString(),
    };
    axios
      .post(`${serverURL}${baseURL}/bank/crawl-history/create`, {
        history,
      })
      .then(console.log("Create history Success"))
      .catch((e) => {
        console.log(e);
      });
  };

  getTableData = async (page, script, name, time) => {
    let [rowSelector, headerSelector] = [
      script.rowSelector,
      script.headerSelector,
    ];

    let fields = [];
    if (!("fields" in script))
      fields = await page.$$eval(headerSelector, (data) =>
        data.map((x) => x.innerText),
      );
    else fields = script.fields;

    let colSelector = "td";
    if ("colSelector" in script) colSelector = script.colSelector;
    try {
      const result = await page.$$eval(
        rowSelector,
        (rows, colSelector) => {
          return Array.from(rows, (row) => {
            const columns = row.querySelectorAll(colSelector);
            return Array.from(columns, (column) => column.innerText);
          });
        },
        colSelector,
      );

      if (result.length === 0) return false;

      const res = this.insertFieldToTable(result, fields);
      this.results[name].data = this.results[name].data.concat(res);
    } catch (e) {
      console.log(e);
      return false;
    }
  };

  success = async (page, script, name) => {
    this.results[name].status = "success";
    await this.saveHistory(
      name,
      "success",
      `${name} crawl data successfully...`,
    );
    console.log("Crawling succeed!");
  };

  execute = async (page, info) => {
    let result;
    for (let script of info.scripts) {
      let fn = script.type;
      if (fn in this) {
        try {
          result = await this[fn](page, script, info.name);
          if (result === false) {
            break;
          }
        } catch (e) {
          console.log(e);
          break;
        }
      } else {
        console.log("unknow script -->", script);
        break;
      }
    }
    if (result === false) return false;
  };

  start = async () => {
    await this.initBrowser();
    await this.launchBrowser();
  };

  processEach = async (item) => {
    await this.saveHistory(
      item.name,
      "request",
      `${item.name} requesting data...`,
    );
    this.results[item.name] = {
      status: "",
      data: [],
    };
    let page = await this.openBlankPage();
    return await this.execute(page, item);
  };

  process = async (todo) => {
    for (let item of todo) {
      try {
        const res = await this.processEach(item);
        if (res === false) {
          console.log(`${item.name} crawl failed`);
          this.saveHistory(item.name, "failed", `${item.name} download failed`);
        }
      } catch (e) {
        console.log(e);
      }
    }
  };

  end = async () => {
    const time = new Date().toISOString();
    for (let name in this.results) {
      let res = this.results[name];
      if (res.status === "success") this.saveData(name, res.data, time);
    }
    await this.browser.close();
  };

  crawl = async () => {
    await this.start();
    await this.process(this.instruction.todo);
    await this.end();
  };
}

module.exports = MyCrawler;
