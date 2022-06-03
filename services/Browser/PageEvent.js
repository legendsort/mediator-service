/** @format */
const SocketHelper = require("../Socket/SocketHelper");
const URLPolicy = require("../Security/URLPolicy");

const pageEvent = async (page, socket) => {
  const socketHelper = new SocketHelper(socket);
  const urlPolicy = new URLPolicy(page, socket);
  page.setRequestInterception(true);

  const handleRequest = (request) => {
    const url = request.url();
    if (urlPolicy.validateURL(url) == true) {
      request.continue();
    } else {
      console.log("aborted");
      request.abort();
    }
  };

  // Emitted when the DOM is parsed and ready (without waiting for resources)
  page.once("domcontentloaded", () => {
    console.log("loaded");
  });

  // Emitted when the page is fully loaded
  page.once("load", async () => {
    console.log("fully loaded");
    await urlPolicy.filterAll();
  });

  // Emitted when the page attaches a frame
  page.on("frameattached", (frame) => {
    console.log("frame detached");
  });

  // Emitted when a frame within the page is navigated to a new URL
  page.on("framenavigated", async (frame) => {
    console.log("==========>frame navigated ", frame.url());
    await urlPolicy.filterAll();
  });

  // Emitted when a script within the page uses `console.timeStamp`
  page.on("metrics", (data) => {});

  // Emitted when a script within the page uses `console`
  page.on("console", (message) => {
    console.log("In page for console===>", message.text());
  });

  // Emitted when the page emits an error event (for example, the page crashes)
  page.on("error", (error) => {});

  // Emitted when a script within the page has uncaught exception
  page.on("pageerror", (error) => {});

  // Emitted when a script within the page uses `alert`, `prompt`, `confirm` or `beforeunload`
  page.on("dialog", async (dialog) => {
    console.log("dialog");
  });
  page.on("filedialog", (data) => {
    console.log("file dialog");
  });
  // Emitted when a new page, that belongs to the browser context, is opened
  page.on("popup", () => {
    console.log("popup");
  });

  // Emitted when the page produces a request
  page.on("request", (request) => {
    // console.log("====> request", request.url());
    handleRequest(request);
  });

  // Emitted when a request, which is produced by the page, fails
  page.on("requestfailed", (request) => {
    console.log("====> request failed");
    socketHelper.sendFailureMessage("Request failed");
  });

  // Emitted when a request, which is produced by the page, finishes successfully
  page.on("requestfinished", async (request) => {
    console.log("====> request_finish");
    // await urlPolicy.filterAll();
  });

  // Emitted when a response is received
  page.on("====> response", (response) => {
    console.log("response");
  });

  // Emitted when the page creates a dedicated WebWorker
  page.on("workercreated", (worker) => {});

  // Emitted when the page destroys a dedicated WebWorker
  page.on("workerdestroyed", (worker) => {});

  // Emitted when the page detaches a frame
  page.on("framedetached", () => {
    console.log("frame detached");
  });

  // Emitted after the page is closed
  page.once("close", () => {});

  await page.exposeFunction("onCustomEvent", ({ type, detail }) => {
    console.log(`Event fired: ${type}, detail: ${detail}`);
  });

  // listen for events of type 'status' and
  // pass 'type' and 'detail' attributes to our exposed function
  await page.evaluateOnNewDocument(() => {
    window.addEventListener("click", (e) => {
      const type = e.target.getAttribute("type");
      const id = e.target.getAttribute("id");

      // for upload
      if (type === "text") {
        // if (type === "file") {
        window.sendMessage("upload", {
          response_code: true,
          message: "Click file choose button",
          data: { id: id, el: e },
        });
        e.preventDefault();
        e.stopPropagation();
        e.uploadFile("path/to/file");
      }
    });
  });

  await page.exposeFunction("validateURL", urlPolicy.validateURL);
  await page.exposeFunction("sendMessage", socketHelper.sendMessage);

  return page;
};

module.exports = pageEvent;
