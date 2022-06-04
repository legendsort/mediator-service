/** @format */
const SocketHelper = require("../Socket/SocketHelper");
const path = require("path");
const fs = require("fs");

const puppeteer = require("puppeteer-extra");

const {
  installMouseHelper,
  sleep,
} = require("../../helper/installMouseHelper");

const pageEvent = require("./PageEvent");
const BrowserActions = require("./BrowserActions");
const ConfigController = require("../../controllers/config.controller");
class Browser {
  constructor(id) {
    this.id = id;
    this.socket = null;
    this.business = null;
    this.busy = false;
    this.socketHelper = {};
  }

  getConfig = async (req) => {
    const response = await ConfigController.get(req);
    if (response.response_code === false) {
      this.socketHelper.sendFailureMessage("Get Config Error!");
      throw "Get config error";
    }
    const res = JSON.parse(response.data);
    return res;
  };
  launchBrowser = async () => {
    try {
      this.config = await this.getConfig({ site: "WIPO", tag: "Browser" });
      this.scripts = await this.getConfig({
        site: "WIPO",
        // tag: "LoginToGoogle",
        // tag: "TestWithGitlab",
        tag: "LoginToWIPO",
        // tag: "TestUploadWithGitlab",
        // tag: "GoMadrid",
      });
      console.log(this.config, this.scripts);

      this.browser = await puppeteer.launch(this.config.browser);
      const page = await this.browser.newPage();
      this.page = await this.setHandlingPageEvent(page, this.socket);
      this.client = this.page._client;

      this.BrowserActions = new BrowserActions(
        page,
        this.socket,
        this.config,
        this.browser,
        puppeteer,
      );
      await installMouseHelper(this.page);
      setInterval(this.sendScreenshot, 1000, this);
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
    this.setFileUpload();
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

  setFileUpload = async () => {
    var client = this.client;
    if (client == null) return false;
    await client.send("Page.setInterceptFileChooserDialog", { enabled: true });
    client.on("Page.fileChooserOpened", ({ mode, backendNodeId, frameId }) => {
      // this.page_fileChooserOpened(mode, backendNodeId, frameId);
      console.log("Page.filechooseOpend");
    });
    client.on("Page.navigatedWithinDocument", ({ frameId, url }) => {
      console.log("page.navigatedWithinDocument");
      // this.page_navigatedWithinDocument(frameId, url);
    });
  };
  setSocketLogic = async () => {
    this.socket.on("start-page", async (data) => {
      try {
        const { action, viewport } = data;
        let [result, message] = [true, "Loaded!"];
        if (this._isEmpty) {
          await this.launchBrowser();
          if (true || this.business != action) {
            this.socketHelper.sendMessage("send-resize", {});

            [result, message] = await this.BrowserActions.execute(this.scripts);
            console.log(result, message);
            // const [fileChooser] = await Promise.all([
            //   this.page.waitForFileChooser(),
            //   this.page.click("input[type='file']"),
            // ]);
            // const data = await fileChooser.accept([
            //   "E:/work_temp/20220211_integration/itums/src/assets/img/bitcoin.png",
            // ]);
            // console.log({ data });
            await installMouseHelper(this.page);
          }
          this.business = action;
        }

        if (result) {
          console.log(viewport.width, viewport.height);
          await this.BrowserActions.setViewport(
            viewport.width,
            viewport.height,
          );
          this.sendScreenshot();
        } else {
          this.socketHelper.sendFailureMessage(message);
        }
      } catch (e) {
        console.log(e);
        this.socketHelper.sendFailureMessage("Network Error!");
      }
    });

    this.socket.on("mouse-move", async (data) => {
      this.BrowserActions.mouseMove(data.point.x, data.point.y);
      await this.sendScreenshot(2000);
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

    const uploadFilesToService = async (files, names, index) => {
      try {
        for (let i = 0; i < names.length; i++) {
          const name = names[i];
          const file = files[i];
          const dir = path.join(process.cwd(), "/public/wipo/upload", index);
          const filepath = path.join(dir, name);
          if (!fs.existsSync(dir)) {
            console.log("Create directory", dir);
            await fs.mkdirSync(dir, 0x0777);
          }
          await fs.writeFileSync(filepath, file, "binary");
        }
        this.socketHelper.sendSuccessMessage("Upload files succeed");
      } catch (e) {
        console.log(e);
        this.socketHelper.sendFailureMessage("Upload files failed");
      }
    };

    this.socket.on("select-file", async (response) => {
      const names = response.names;
      const files = response.files;
      const index = response.index;
      console.log({ names }, { files }, { index });
      try {
        console.log("I am HEEEEEEEEEEEEEEEEEEEEEEEEEEEEERE");
        await uploadFilesToService(files, names, index);
        // this.chooseFilesForService(names);
        // const inputUploadHandle = await this.page.$("[type=file]");
        // inputUploadHandle.uploadFile(file);

        const filePath = path.join(process.cwd(), "/public/wipo/");
        // console.log(process.cwd(), __dirname, filePath);
        // await inputUploadHandle.evaluate((upload) =>
        //   upload.dispatchEvent(new Event("onchange", { bubbles: true })),
        // );
        console.log("--------------------->end");
      } catch (e) {
        console.log(e);
      }
    });
    return this.socket;
  };
  sendScreenshot = async (delay = 1000) => {
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
  close() {}
}
module.exports = Browser;
