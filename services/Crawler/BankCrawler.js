const puppeteer = require("puppeteer-extra");
const res = require("express/lib/response");
const axios = require("axios");
const FormData = require("form-data");
const sleep = require("await-sleep");

class MyCrawler {
  constructor(browserConfig, instruction) {
    this.configs = browserConfig;  
    this.instruction = instruction;
    this.browser
  }

  initBrowser = async () => {
    if (this.browser) {
      try {
        await this.browser.close();
      } catch (e) {
        console.log(e);
      }
    }
  };

  launchBrowser = async () => {
    try {
      this.browser = await puppeteer.launch(this.configs);
    } catch (e) {
      console.log(e);
    }

  };

  openBlankPage = async () => {
    try {
      return await this.browser.newPage();
    } catch (e) {
      console.log(e);
    }
  };

  visit = async (page, script) => {
    let url = script.url;
    
    try {
      await page.goto(url,  {waitUntil: 'domcontentloaded'});
    } catch (e) {
      console.log(e);
    }
  };

  input = async (page, script) => {
    let [selector, value] = [script.selector, script.value];
    try {
      await page.focus(selector);
    } catch (e) {
      console.log(e);
    }
    try {
      await page.keyboard.type(value, { delay: 30 });
    } catch (e) {
      console.log(e);
    }
  };

  click = async (page, script) => {
    let selector = script.selector;
    try {
      await page.click(selector);
    } catch (e) {
      console.log(e);
    }
  };

  waitForNavigation = async (page, script) => {
    try {
      await page.waitForNavigation();
    } catch (e) {
      console.log(e);
    }
  };

  checkWait = async (page, script) => {
    let selector = script.selector;
    try {
      await page.waitForSelector(selector);
    } catch (e) {
      console.log("e");
    }
  };

  reload = async (page, script) => {
    try {
      await page.reload();
    } catch (e) {
      console.log(e);
    }
  };

  insertFieldToTable = (result, fields) => {
    const res = [];
    for(let row of result) {
      if(row.length == 0) continue
      let obj = {};
      for(let i = 0; i < fields.length; i++) {
        obj[fields[i]] = row[i]
      }
      res.push(obj)
    }
    return res
  }
  
  getTableData = async (page, script, name, time) => {
    let [rowSelector, headerSelector] = [script.rowSelector, script.headerSelector]
    
    let fields = [];
    if(! ("fields" in script)) fields = await page.$$eval(headerSelector, data => data.map(x => x.innerText))
    else fields = script.fields
     
    let colSelector = 'td'
    if('colSelector' in script) {
      colSelector = script.colSelector
    }
    const result = await page.$$eval(rowSelector, (rows, colSelector) => {
      return Array.from(rows, row => {
        const columns = row.querySelectorAll(colSelector);
        return Array.from(columns, column => column.innerText);
      });
    }, colSelector);

    const res = this.insertFieldToTable(result, fields);
    let upTime = res && time ? res[0][time.field] : undefined
    axios.post('http://127.0.0.1:3001/trade-info/create', {
      res,
      name,
      upTime
    }).then(
      console.log("Save Success")
    ).catch(e => console.log(e))

    return res

  }

  success = async (page, script) => {
    console.log("Crawling Succed!")
  }

  execute = async (page, info) => {
    
    for (let script of info.scripts) {
      let fn = script.type;
      if(fn in this) {
        await this[fn](page, script, info.name, info.time);
      } else {
        console.log("unknow script -->", script)
      }
    }
  };

  start = async () => {
    await this.initBrowser();
    await this.launchBrowser();
  };

  process = async (todo) => {
    for(let item of todo) {
      let page = await this.openBlankPage();
      try{
        await this.execute(page, item);
      } catch(e) {
        console.log(e)
        await this.browser.close()    
        break;
      }
    }
  }
  crawl = async () => {
    await this.start();
    await this.process(this.instruction.todo)
    await this.browser.close()
  };


}

module.exports = MyCrawler