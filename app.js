/** @format */

var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var jwt = require("express-jwt");
const fileupload = require("express-fileupload");
const bodyParser = require("body-parser");
require("dotenv").config();
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var cloudRouter = require("./routes/cloud");
const { FTPService } = require("./services");
const { BrowserService } = require("./services");
const mongoose = require("mongoose");
var cors = require("cors");
let ftpService = new FTPService();
let browserService = new BrowserService();

try {
  mongoose.connect(process.env.MONGODB_URL || "mongodb://localhost/Mediator");
} catch (error) {
  console.log("Failed connect to mongoDB!");
}

var app = express();
// register service to express application
app.set("ftp-service", ftpService);
app.set("browser-service", browserService);

//
app.use(logger("dev"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(fileupload());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(
  bodyParser.urlencoded({
    extended: true,
    limit: "50mb",
    parameterLimit: 5000,
  }),
);
app.use(
  jwt({
    secret: "hello world !",
    algorithms: ["HS256"],
    credentialsRequired: false,
    getToken: function fromHeaderOrQuerystring(req) {
      if (
        req.headers.authorization &&
        req.headers.authorization.split(" ")[0] === "Bearer"
      ) {
        return req.headers.authorization.split(" ")[1];
      } else if (req.query && req.query.token) {
        return req.query.token;
      }
      return null;
    },
  }),
);
app.use(express.static(path.join(__dirname, "public")));
app.set("public-dir", path.join(__dirname, "public"));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/cloud", cloudRouter);

module.exports = app;
