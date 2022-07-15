/** @format */

const axios = require('axios')
const cron = require('node-cron')
const getConfig = require('./helper/ConfigHelper')
const BankCrawlerService = require('./services/Crawler/BankCrawler')

const runCron = async () => {
  try {
    const browser = await getConfig({site: 'Bank', tag: 'browser'})
    const script = await getConfig({site: 'Bank', tag: 'script'})
    console.log(browser, script)
    const task = cron.schedule('*/3 * * * *', () => {
      try {
        const bcs = new BankCrawlerService(browser, script)
        bcs.crawl()
      } catch (e) {
        console.log(e)
      }
    })
    task.start()
  } catch (e) {
    console.log('Error: ', e)
  }
}

module.exports = {
  runCron,
}
