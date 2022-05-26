/** @format */
const SocketHelper = require("../Socket/SocketHelper");

const puppeteer = require("puppeteer-extra");
const {
  installMouseHelper,
  sleep,
} = require("../../helper/installMouseHelper");

const BrowserActions = require("./BrowserActions");
const pageEvent = require("./PageEvent");
class Browser {
  constructor(id) {
    this.id = id;
    this.socket = null;
    this.config = {
      madrid: { url: "http://gitlab.local.com" },
      option: {
        margin_w: 1,
        margin_h: 6,
      },
      browser: {
        width: 330,
        height: 700,
        timeout: 120000,
        ignoreHTTPSErrors: true,
        args: [
          "--no-sandbox",
          "--disable-gpu",
          "--no-first-run",
          "--no-zygote",
          "--disable-setuid-sandbox",
          "--disable-infobars",
          "--disable-breakpad",
          "--disable-notifications",
          "--disable-desktop-notifications",
          "--disable-component-update",
          "--disable-background-downloads",
          "--disable-add-to-shelf",
          "--disable-datasaver-prompt",
          "--ignore-urlfetcher-cert-requests",
          "--ignore-certificate-errors",
          "--disable-client-side-phishing-detection",
          "--autoplay-policy=no-user-gesture-required",
          "--disable-web-security",
          "--allow-running-insecure-content",
          "--unhandled-rejections=strict",
          "--window-size=1920,1080",
        ],
      },
    };
    this.scripts = [];
    this.business = null;
    this.busy = false;
    this.socketHelper = {};
  }

  launchBrowser = async () => {
    try {
      this.browser = await puppeteer.launch(this.config.browser);
      const page = await this.browser.newPage();
      this.page = await this.setHandlingPageEvent(page, this.socket);

      this.BrowserActions = new BrowserActions(
        page,
        this.socket,
        this.config,
        this.browser,
        puppeteer,
      );
      await installMouseHelper(this.page);
      return true;
    } catch (e) {
      console.log("Lanuch", e);
      return false;
    }
  };

  setHandlingPageEvent = async (page, socket) => {
    return pageEvent(page, socket);
  };

  setSocket(socket) {
    if (this.socket) {
      this.socket.disconnect();
    }
    this.socket = socket;
    this.socketHelper = new SocketHelper(socket);
    this.setSocketLogic();
    return this.socket;
  }

  closeSocket() {
    this.socket = null;
  }
  _isEmpty(obj) {
    try {
      return Object.keys(obj).length === 0;
    } catch (error) {
      return false;
    }
  }
  setSocketLogic = async () => {
    this.socket.on("start-page", async (data) => {
      const { action, viewport } = data;
      let [result, message] = [true, "Loaded!"];
      if (this._isEmpty) {
        await this.launchBrowser();
        if (true || this.business != action) {
          [result, message] = await this.BrowserActions.execute(this.scripts);
          console.log(result, message);
        }
        this.business = action;
      }

      if (result) {
        console.log(viewport.width, viewport.height);
        await this.BrowserActions.setViewport(viewport.width, viewport.height);
        this.sendScreenshot();
        this.socketHelper.sendMessage("send-resize", {});
      } else {
        console.log("========>", message);
        this.socketHelper.sendFailureMessage(message);
      }
    });

    this.socket.on("mouse-move", async (data) => {
      this.BrowserActions.mouseMove(data.point.x, data.point.y);
      await this.sendScreenshot(1000);
    });

    this.socket.on("mouse-click", async (data) => {
      try {
        await this.BrowserActions.mouseClick(data.point.x, data.point.y);
        await this.sendScreenshot();
      } catch (error) {}
    });

    this.socket.on("mouse-dbclick", async (data) => {
      try {
        this.BrowserActions.mouseDBclick(data.point.x, data.point.y);
      } catch (error) {}
    });

    this.socket.on("mouse-down", async (data) => {
      try {
        this.BrowserActions.mouseDown(data.point.x, data.point.y);
        await this.sendScreenshot();
      } catch (error) {}
    });

    this.socket.on("mouse-up", async (data) => {
      try {
        this.BrowserActions.mouseUp(data.point.x, data.point.y);
        await this.sendScreenshot();
      } catch (error) {}
    });

    this.socket.on("key-press", async (data) => {
      try {
        await this.BrowserActions.keyPress(data.key);

        await this.sendScreenshot();
      } catch (error) {}
    });

    this.socket.on("set-viewport", async (data) => {
      try {
        await this.BrowserActions.setViewport(data.width, data.height);
        await this.sendScreenshot();
      } catch (error) {}
    });

    this.socket.on("mouse-wheel", async (data) => {
      try {
        await this.BrowserActions.setWheel(data.x, data.y);
        await this.sendScreenshot();
      } catch (error) {}
    });

    this.socket.on("copy", async (data) => {
      try {
        const res = await this.BrowserActions.copy(data);

        await this.socketHelper.sendMessage("message", {
          response_code: res[0],
          message: res[1],
        });
        if (res[0])
          await this.socketHelper.sendMessage("copy", {
            response_code: true,
            message: "success",
            data: res[2],
          });
        await this.sendScreenshot();
      } catch (error) {
        console.log(error);
      }
    });

    this.socket.on("paste", async (data) => {
      try {
        const res = await this.BrowserActions.paste(data);
        await this.socketHelper.sendMessage("message", {
          response_code: res[0],
          message: res[1],
        });

        await this.sendScreenshot();
      } catch (error) {
        console.log(error);
      }
    });

    this.socket.on("refresh", async () => {
      try {
        const res = await this.BrowserActions.refresh();
        await this.socketHelper.sendMessage("message", {
          response_code: res[0],
          message: res[1],
        });

        await this.sendScreenshot();
      } catch (error) {
        console.log(error);
      }
    });

    this.socket.on("back", async () => {
      try {
        const res = await this.BrowserActions.back();
        await this.socketHelper.sendMessage("message", {
          response_code: res[0],
          message: res[1],
        });

        await this.sendScreenshot();
      } catch (error) {
        console.log(error);
      }
    });

    this.socket.on("forward", async () => {
      try {
        const res = await this.BrowserActions.forward();
        await this.socketHelper.sendMessage("message", {
          response_code: res[0],
          message: res[1],
        });

        await this.sendScreenshot();
      } catch (error) {
        console.log(error);
      }
    });

    return this.socket;
  };
  sendScreenshot = async (delay = 500) => {
    try {
      if (!this._isEmpty(this.page) && !this.busy) {
        console.log("-----------send screenshot---------------->");
        let img = await this.BrowserActions.screenshot();
        this.busy = true;
        this.socketHelper.sendMessage("send-screenshot", { screen: img });

        await sleep(delay);

        this.busy = false;
      }
    } catch (error) {}
  };
  sendMessage = (event, message) => {
    console.log("Call me ?????????????????????");
    this.socket.emit(event, message);
  };
  close() {}
}
module.exports = Browser;
