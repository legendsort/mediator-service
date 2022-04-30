/** @format */
const { ConsoleMessage } = require("puppeteer");
const puppeteer = require("puppeteer-extra");
const {
  installMouseHelper,
  sleep,
} = require("../../helper/installMouseHelper");
class Browser {
  constructor(id) {
    this.id = id;
    this.socket = null;
    this.config = {
      madrid: { url: "http://django.local.com/" },
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
    this.business = null;
    this.isBusySend = false;
  }

  launchBrowser = async () => {
    try {
      this.browser = await puppeteer.launch(this.config.browser);
      const page = await this.browser.newPage();
      this.page = await this.setHandlingPageEvent(page);
      await installMouseHelper(this.page);
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  };

  setHandlingPageEvent = async (page) => {
    // Emitted when the DOM is parsed and ready (without waiting for resources)
    page.once("domcontentloaded", () => {});

    // Emitted when the page is fully loaded
    page.once("load", () => {
      console.log("fully loaded");
    });

    // Emitted when the page attaches a frame
    page.on("frameattached", (frame) => {
      console.log(frame.url());
    });

    // Emitted when a frame within the page is navigated to a new URL
    page.on("framenavigated", async (frame) => {
      // console.dir(frame);
      // await page.goBack();
    });

    // Emitted when a script within the page uses `console.timeStamp`
    page.on("metrics", (data) => {});

    // Emitted when a script within the page uses `console`
    page.on("console", (message) => {});

    // Emitted when the page emits an error event (for example, the page crashes)
    page.on("error", (error) => {});

    // Emitted when a script within the page has uncaught exception
    page.on("pageerror", (error) => {});

    // Emitted when a script within the page uses `alert`, `prompt`, `confirm` or `beforeunload`
    page.on("dialog", async (dialog) => {});

    // Emitted when a new page, that belongs to the browser context, is opened
    page.on("popup", () => {
      console.log("popup");
    });

    // Emitted when the page produces a request
    page.on("request", (request) => {
      // console.dir(request);
    });

    // Emitted when a request, which is produced by the page, fails
    page.on("requestfailed", (request) => {});

    // Emitted when a request, which is produced by the page, finishes successfully
    page.on("requestfinished", (request) => {
      // console.log("request_finish");
    });

    // Emitted when a response is received
    page.on("response", (response) => {});

    // Emitted when the page creates a dedicated WebWorker
    page.on("workercreated", (worker) => {});

    // Emitted when the page destroys a dedicated WebWorker
    page.on("workerdestroyed", (worker) => {});

    // Emitted when the page detaches a frame
    page.on("framedetached", () => {});

    // Emitted after the page is closed
    page.once("close", () => {});
    await page.exposeFunction("puppeteerLogMutation", () => {
      console.log("Mutation Detected: A child node has been added or removed.");
    });
    await page.exposeFunction("onCustomEvent", (text) => console.log(text));

    await page.evaluate(() => {
      const target = document.querySelector("body");
      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.type === "childList") {
            puppeteerLogMutation();
          }
        }
      });
      observer.observe(target, { childList: true });
    });
    return page;
  };

  setSocket(socket) {
    if (this.socket) {
      this.socket.disconnect();
    }
    console.log(typeof this.socket);
    this.socket = socket;
    this.setSocketLogic();
    return this.socket;
  }

  closeSocket() {
    this.socket = null;
  }

  setSocketLogic = async () => {
    this.socket.on("start-page", async (data) => {
      const { action, viewport } = data;
      let [result, message] = [true, "Loaded!"];
      if (this._isEmpty) {
        await this.launchBrowser();
        if (this.business != action) {
          [result, message] = await this.openUrl(this.config[action].url);
        }
        this.business = action;
      }

      if (result) {
        await this.setViewport(viewport.width, viewport.height);
        this.sendScreenshot();
        this.sendMessage("send-resize", {});
      }
    });

    this.socket.on("mouse-move", async (data) => {
      this.mouseMove(data.point.x, data.point.y);
      await this.sendScreenshot(5000);
    });

    this.socket.on("mouse-click", async (data) => {
      try {
        await this.mouseClick(data.point.x, data.point.y);
        console.log(data);
        await this.sendScreenshot();
      } catch (error) {}
    });

    this.socket.on("mouse-dbclick", async (data) => {
      this.mouseDBclick(data.point.x, data.point.y);
    });

    this.socket.on("mouse-down", async (data) => {
      this.mouseDown(data.point.x, data.point.y);
      await this.sendScreenshot();
    });

    this.socket.on("mouse-up", async (data) => {
      this.mouseUp(data.point.x, data.point.y);
      await this.sendScreenshot();
    });

    this.socket.on("key-press", async (data) => {
      try {
        await this.keyPress(data.key);
        await this.sendScreenshot();
      } catch (error) {}
    });

    this.socket.on("set-viewport", async (data) => {
      try {
        await this.setViewport(data.width, data.height);
        await this.sendScreenshot();
      } catch (error) {}
    });

    this.socket.on("mouse-wheel", async (data) => {
      try {
        await this.setWheel(data.x, data.y);
        await this.sendScreenshot();
      } catch (error) {}
    });

    return this.socket;
  };

  close() {}

  sendScreenshot = async (delay = 100) => {
    try {
      if (!this._isEmpty(this.page) && !this.isBusySend) {
        console.log("-----------send screenshot---------------->");
        let img = await this.screenshot();
        this.isBusySend = true;
        this.sendMessage("send-screenshot", { screen: img });
        await sleep(delay);
        this.isBusySend = false;
      }
    } catch (error) {}
  };
  sendMessage = (event, message) => {
    this.socket.emit(event, message);
  };

  async openUrl(url) {
    if (this._isEmpty(this.page)) {
      console.log("puppeteer-ex::open_url    this.page is empty");
      return false, "ERR_NOT_FOUND_BROWSER";
    } else {
      try {
        await this.page.goto(url);
        return [true, "Sucessfully"];
      } catch (error) {
        let str_error = error.toString();
        if (str_error.includes("TimeoutError")) {
          return [false, "TimeoutError"];
        } else if (str_error.includes("ERR_NAME_NOT_RESOLVED")) {
          return [false, "ERR_NAME_NOT_RESOLVED"];
        } else if (str_error.includes("ERR_INTERNET_DISCONNECTED")) {
          return [false, "ERR_INTERNET_DISCONNECTED"];
        } else if (str_error.includes("ERR_CONNECTION_REFUSED")) {
          return [false, "ERR_CONNECTION_REFUSED"];
        } else if (str_error.includes("ERR_CONNECTION_TIMED_OUT")) {
          return [false, "ERR_CONNECTION_TIMED_OUT"];
        } else {
          return [false, "UNKNOWN_ERROR"];
        }
      }
    }
    return 0;
  }

  getUrl() {
    if (this._isEmpty(this.page)) {
      return "";
    } else {
      return this.page.url();
    }
  }

  _isEmpty(obj) {
    try {
      return Object.keys(obj).length === 0;
    } catch (error) {
      return false;
    }
  }

  async mouseDown(x, y) {
    if (!this._isEmpty(this.page)) {
      return await this.page.mouse.down(x, y);
    }
    return false;
  }

  async mouseMove(x, y) {
    if (!this._isEmpty(this.page)) {
      try {
        return await this.page.mouse.move(x, y);
      } catch (e) {
        return false;
      }
    }
    return false;
  }

  async mouseUp(x, y) {
    if (!this._isEmpty(this.page)) {
      return await this.page.mouse.up(x, y);
    }
    return false;
  }

  async mouseClick(x, y) {
    if (!this._isEmpty(this.page)) {
      return await this.page.mouse.click(x, y);
    }
    return false;
  }

  async mouseDBclick(x, y) {
    if (!this._isEmpty(this.page)) {
      return await this.page.mouse.click(x, y);
    }
    return false;
  }

  async keyDown(code) {
    if (this._isEmpty(this.page) == false) {
      return await this.page.keyboard.down(code);
    }
    return false;
  }

  async keyPress(code) {
    if (!this._isEmpty(this.page)) {
      return await this.page.keyboard.press(code);
    }
    return false;
  }

  async keyUp(code) {
    if (!this._isEmpty(this.page)) {
      return await this.page.keyboard.up(code);
    }
    return false;
  }

  async screenshot(x, y) {
    if (!this._isEmpty(this.page)) {
      var b64string = await this.page.screenshot({
        encoding: "base64",
        type: "jpeg",
      });
      var jpgImg = "data:image/jpg;base64, " + b64string;
      return jpgImg;
    }
    return false;
  }

  async setViewport(w, h) {
    if (!this._isEmpty(this.page)) {
      w -= this.config.option.margin_w;
      h -= this.config.option.margin_h;
      console.log("---set viewport-->", w, h);
      await this.page.setViewport({ width: w, height: h });
      return true;
    } else {
      console.log("set_viewport   failed !");
      return false;
    }
  }

  async setWheel(dw, dh) {
    if (!this._isEmpty(this.page)) {
      await this.page.evaluate(
        (dw, dh) => {
          window.scrollBy(dw, dh);
        },
        dw,
        dh,
      );
    } else {
      console.log("set_wheel   failed !");
    }
  }

  async paste(data) {
    if (!this._isEmpty(this.page)) {
      await this.page.keyboard.type(data);
    } else {
      console.log("paste   failed !");
    }
  }

  async selectAll() {
    if (!this._isEmpty(this.page)) {
      await this.page.keyboard.down("Control");
      await this.page.keyboard.press("KeyA");
      await this.page.keyboard.up("Control");
      //        console.log("selectall   called !!!");
    } else {
      console.log("selectall   failed !");
    }
  }

  async deleteWord() {
    if (!this._isEmpty(this.page)) {
      await this.page.keyboard.down("Control");
      await this.page.keyboard.press("Backspace");
      await this.page.keyboard.up("Control");
    } else {
      console.log("deleteword   failed !");
    }
  }
}
module.exports = Browser;
