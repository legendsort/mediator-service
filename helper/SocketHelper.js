/** @format */

const puppeteer = require('puppeteer-extra')

class SocketHelper {
  constructor(socket) {
    this.socket = socket
    this.busy = false
  }

  getState = () => {
    return this.busy
  }
  sendMessage = (event, message) => {
    if (event !== 'send-screenshot') console.log({event}, {message})
    if (event === 'status') {
      if (message === 'loading') this.busy = true
      else this.busy = false
    }
    this.socket.emit(event, message)
  }

  sendSuccessMessage = (message) => {
    this.sendMessage('message', {
      response_code: true,
      message: message,
    })
  }

  sendFailureMessage = (message) => {
    this.sendMessage('message', {
      response_code: false,
      message: message,
    })
  }
}

module.exports = SocketHelper
