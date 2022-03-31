/** @format */

const io = require("socket.io")();
const socketioJwt = require("socketio-jwt");
const web_app = require("./app");

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
  let browser_srv = web_app.get("browser-service");
  let user = socket.decoded_token;
  let browser = browser_srv.getBrowser(user.user_id);
  console.log("----->", user.user_id, browser);
  if (browser) {
    browser.setSocket(socket);
    browser.sendMessage("socket-connection", { connection: true });
  }
  socket.on("test", (from) => {
    socket.emit("test", { from: "server" });
  });
});

module.exports = socket;
