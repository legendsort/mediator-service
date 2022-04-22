/** @format */

const axios = require('axios');
const cron = require("node-cron");
const BankCrawlerService = require("./services/Crawler/BankCrawler");


const baseURL = process.env.BASE_URL;
const service = process.env.SERVICE;

const runCron = async () => {
	try{
		
		const browserResponse = await axios.get(service + baseURL + "/config/fetch", {params: {site: "bank", tag: "browser"}});
		if(browserResponse.data.response_code === false) {
			throw "Cannot import browser config";
		}
		const browser = browserResponse.data.data;
		
		const scriptResponse = await axios.get(service + baseURL + "/config/fetch", {params: {site: "bank", tag: "currencyScript"}});
		if(scriptResponse.data.response_code === false) {
			throw "Cannot import currency script";
		}
		const script = scriptResponse.data.data;
		const task = cron.schedule('*/20 * * * *', () => {
			try{
				const bcs = new BankCrawlerService(browser.config, script.config);
				bcs.crawl();
			}catch(e) {
				console.log(e)
			}	
		})
		task.start()

	} catch(e) {
		console.log("Error: ", e)
	}
	
	
}

module.exports = {
	runCron
}

