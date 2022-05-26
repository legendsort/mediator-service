/** @format */

const puppeteer = require("puppeteer-extra");

class SocketHelper {
  constructor(socket) {
    this.socket = socket;
  }
  sendMessage = (event, message) => {
    console.log({ event }, { message });
    this.socket.emit(event, message);
  };

  sendSuccessMessage = (message) => {
    this.sendMessage("message", {
      response_code: true,
      message: message,
    });
  };

  sendFailureMessage = (message) => {
    this.sendMessage("message", {
      response_code: false,
      message: message,
    });
  };
}

module.exports = SocketHelper;
