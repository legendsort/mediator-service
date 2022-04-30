/** @format */

const io = require("socket.io")();
const socketioJwt = require("socketio-jwt");
const web_app = require("../app");

const socket = {
  io: io,
};
io.use(
  socketioJwt.authorize({
    secret: process.env.SECRET_KEY,
    handshake: true,
  }),
);
io.on("connection", (socket) => {
  try {
    let browser_srv = web_app.get("browser-service");
    let user = socket.decoded_token;
    let browser = browser_srv.getBrowser(user.identifier);
    if (browser) {
      browser.setSocket(socket);
      browser.sendMessage("socket-connection", { connection: true });
    } else {
    }
  } catch (error) {
    console.error("socket connecting error", error);
  }
});

module.exports = socket;
