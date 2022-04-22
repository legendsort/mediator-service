/** @format */

require("dotenv").config();
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var jwt = require("express-jwt");
const fileupload = require("express-fileupload");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

// import routes
var indexRouter = require("./routes/index");
var cloudRouter = require("./routes/cloud.route");
var configRouter = require("./routes/config.route");
var connectRouter = require("./routes/connect.route");
var tradeInfoRouter = require("./routes/tradeInfo.route");
var crawlHistoryRouter = require("./routes/crawlHistory.route");

// import services
const { FTPService, BrowserService } = require("./services");

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
    secret: process.env.SECRET_KEY || "hello world !",
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

// register route
const baseURL = process.env.BASE_URL;
app.use(baseURL + "/", indexRouter);
app.use(
  `${baseURL}/connect`,
  jwt({
    secret: process.env.SECRET_KEY || "hello world !",
    algorithms: ["HS256"],
    credentialsRequired: true,
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
  connectRouter,
);
app.use(baseURL + "/cloud", cloudRouter);
app.use(baseURL + "/config", configRouter);
app.use(baseURL + "/bank/trade-info", tradeInfoRouter);
app.use(baseURL + "/bank/crawl-history", crawlHistoryRouter);
module.exports = app;
