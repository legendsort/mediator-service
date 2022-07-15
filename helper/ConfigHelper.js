const ConfigController = require('../controllers/config.controller')

getConfig = async (req) => {
  const response = await ConfigController.get(req)
  if (response.response_code === false) {
    throw response.message
  }
  const res = JSON.parse(response.data)
  return res
}

module.exports = getConfig
