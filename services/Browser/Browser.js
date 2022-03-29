/** @format */

class Browser {
  constructor(id) {
    this.id = id;
    this.socket = null;
  }
  setSocket(socket) {
    this.socket = socket;
  }
  close() {}
  initBrowser() {}
  testCase() {
    if (this.socket) {
      this.socket.emit("test", { from: "server" });
    }
  }
  sendMessage = (event, message) => {
    console.log(message, event);
    this.socket.emit(event, message);
  };
}
module.exports = Browser;
