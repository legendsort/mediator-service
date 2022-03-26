
const getHourMinute = time => {
  const data = time.split((/[: ]/))
  return [parseInt(data[0]), parseInt(data[1])]
}

const sendResponse = (res, status, response_code, message, data, expire = false) => {
  if(expire){
   return res.status(status).json({
        response_code: response_code,
        message: message,
        ...data       
    })
  } else{
     return res.status(status).json({
      response_code: response_code,
      message: message,
      data:data
    })
  }
}

module.exports = {
  getHourMinute: getHourMinute,
  sendResponse: sendResponse
}