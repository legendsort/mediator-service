/** @format */

const { sleep } = require("../../helper/installMouseHelper");

class BrowserActions {
  constructor(page, socket, config) {
    this.page = page;
    this.socket = socket;
    this.config = config;
  }

  async visit(action) {
    const url = action.url;
    if (this._isEmpty(this.page)) {
      console.log("puppeteer-ex::open_url    this.page is empty");
      return [false, "ERR_NOT_FOUND_BROWSER"];
    } else {
      try {
        await this.page.goto(url, { waitUntil: "domcontentloaded" });
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

  mouseClickDOM = async (action) => {
    try {
      const selector = action.selector;
      await this.page.click(selector);
    } catch (e) {
      return [false, e];
    }
    return [true, "success"];
  };

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
      console.log({ code });
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

  input = async (action) => {
    let [selector, value] = [action.selector, action.value];
    console.log(selector, value);
    try {
      await this.page.focus(selector);
    } catch (e) {
      return [false, "No such input element"];
    }
    try {
      await this.page.keyboard.type(value, { delay: 30 });
    } catch (e) {
      return [false, "Error while typing"];
    }
    console.log("success");
    return [true, "Success"];
  };

  wait = async (action) => {
    try {
      const delay = action.delay;
      console.log(delay);

      await sleep(delay);
    } catch (e) {
      return [false, "Error while sleeping"];
    }
    return [true, "success"];
  };
  execute = async (scriptss) => {
    const scripts = [
      {
        type: "visit",
        action: {
          url: "https://www3.wipo.int/authpage/",
        },
      },
      {
        type: "wait",
        action: {
          delay: "3000",
        },
      },
      {
        type: "input",
        action: {
          selector: `form [maxlength="100"]`,
          value: "HYEYONGRI",
        },
      },
      {
        type: "input",
        action: {
          selector: `form [type="password"]`,
          value: "OMDMIIG3KP",
        },
      },
      {
        type: "mouseClickDOM",
        action: {
          selector: "#authform_signin",
        },
      },
    ];
    let response_code = true,
      message = "Success";
    console.log(scripts.length);
    for (const script of scripts) {
      let fn = script.type;
      console.log(script);
      if (fn in this) {
        try {
          const [res, msg] = await this[fn](script.action);
          if (res === false) {
            response_code = false;
            message = msg;
            break;
          }
        } catch (e) {
          response_code = false;
          message = e;
          break;
        }
      } else {
        response_code = false;
        message = "No such script";
        break;
      }
    }
    console.error(response_code, message);
    return [response_code, message];
  };
}

module.exports = BrowserActions;
