const ConfigController = require('../controllers/config.controller')

getConfig = async (req) => {
  try {
    const response = await ConfigController.get(req)
    if (response.response_code === false) {
      throw response.message
    }
    const res = JSON.parse(response.data)
    return res
  } catch (e) {
    console.log('Get config error -> ', e)
  }
}

module.exports = getConfig
