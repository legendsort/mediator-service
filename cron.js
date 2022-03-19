/** @format */

var cron = require("node-cron")
const BankCrawlerService = require("./services/Crawler/BankCrawler");


const browserConfig = require("./services/Crawler/config/browser.json");
const instruction = require("./services/Crawler/config/NewScript.json");

function run_cron () {
	const task = cron.schedule('*/20 * * * *', () => {
		try{
			const bcs = new BankCrawlerService(browserConfig.browser, instruction);
			bcs.crawl();
		}catch(e) {
			console.log(e)
		}	
	})
	task.start()
	
	
}

module.exports = {
	run_cron
}

