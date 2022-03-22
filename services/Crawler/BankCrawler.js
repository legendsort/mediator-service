const puppeteer = require("puppeteer-extra");
const res = require("express/lib/response");
const axios = require("axios");
const FormData = require("form-data");
const sleep = require("await-sleep");

const baseURL = process.env.BASE_URL

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
        return false
      }
    }
  };

  launchBrowser = async () => {
    try {
      this.browser = await puppeteer.launch(this.configs);
    } catch (e) {
      console.log(e);
      return false
    }

  };

  openBlankPage = async () => {
    try {
      return await this.browser.newPage();
    } catch (e) {
      console.log(e);
      return false
    }
  };

  visit = async (page, script) => {
    let url = script.url;
    try {
      await page.goto(url,  {waitUntil: 'domcontentloaded'});
    } catch (e) {
      console.log(e);
      return false
    }
  };

  input = async (page, script) => {
    let [selector, value] = [script.selector, script.value];
    try {
      await page.focus(selector);
    } catch (e) {
      console.log(e);
      return false
    }
    try {
      await page.keyboard.type(value, { delay: 30 });
    } catch (e) {
      console.log(e);
      return false
    }
  };

  click = async (page, script) => {
    let selector = script.selector;
    try {
      await page.click(selector);
    } catch (e) {
      console.log(e);
      return false
    }
  };

  waitForNavigation = async (page, script) => {
    try {
      await page.waitForNavigation();
    } catch (e) {
      console.log(e);
      return false
    }
  };

  checkWait = async (page, script) => {
    let selector = script.selector;
    try {
      await page.waitForSelector(selector);
    } catch (e) {
      console.log("e");
      return false
    }
  };

  reload = async (page, script) => {
    try {
      await page.reload();
    } catch (e) {
      console.log(e);
      return false
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
  
  saveData = (res, name, upTime) => {
    axios.post(`${baseURL}/bank/trade-info/create`, {
      res,
      name,
      upTime
    }).then(
      console.log("Save Success")
    ).catch(e => console.log(e))
  }

  saveHistory = async (type, status, message) => {
    
    const history = {
      type: type,
      status: status,
      message: message,
      time: new Date().toISOString(),
      isSync: false
    }

    axios.post(`${baseURL}/bank/crawl-history/create`, {
      history
    }).then(
      console.log("Create history Success")
    ).catch(e => console.log(e))
  }

  getTableData = async (page, script, name, time) => {
    let [rowSelector, headerSelector] = [script.rowSelector, script.headerSelector]
    
    let fields = [];
    if(! ("fields" in script)) fields = await page.$$eval(headerSelector, data => data.map(x => x.innerText))
    else fields = script.fields
     
    let colSelector = 'td'
    if('colSelector' in script) colSelector = script.colSelector
    try{
      const result = await page.$$eval(rowSelector, (rows, colSelector) => {
        return Array.from(rows, row => {
          const columns = row.querySelectorAll(colSelector);
          return Array.from(columns, column => column.innerText);
        });
      }, colSelector);

      if(result.length === 0) return false

      const res = this.insertFieldToTable(result, fields);
      let upTime = res && time ? res[0][time.field] : undefined

      this.saveData(res, name, upTime)
      this.saveHistory(name, 'success', `${name} download success`)
      return res
    }catch(e) {
      console.log(e)
      return false
    }
    

  }

  success = async (page, script) => {
    console.log("Crawling Succed!")
  }

  execute = async (page, info) => {
    let result;
    for (let script of info.scripts) {
      let fn = script.type;
      if(fn in this) {
        try{
          result = await this[fn](page, script, info.name, info.time);  
          if(result === false) {
            break;
          }
        } catch(e) {
           console.log(e)
           break
        }
      } else {
        console.log("unknow script -->", script)
      }
    }
    if(result === false) return false
  };

  start = async () => {
    await this.initBrowser();
    await this.launchBrowser();
  };

  

  processEach = async (item) => {
    await this.saveHistory(item.name, "request", `${item.name} requesting data...`)
    let page = await this.openBlankPage();
    return await this.execute(page, item);

  }

  process = async (todo) => {
    for(let item of todo) {
      try{
        const res = await this.processEach(item)  
        if(res === false) {
          console.log(`${item.name} crawl failed`)
          this.saveHistory(item.name, 'failed', `${item.name} download failed`)
        }
      } catch(e) {
        console.log(e)
      }
    }
  }

  end = async () => {
    await this.browser.close()
  }

  crawl = async () => {
    await this.start();
    await this.process(this.instruction.todo)
    await this.end();
  };
}

module.exports = MyCrawler