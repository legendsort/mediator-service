/** @format */
const SocketHelper = require("../Socket/SocketHelper");

const pageEvent = async (page, socket) => {
  const socketHelper = new SocketHelper(socket);
  page.setRequestInterception(true);

  const validateURL = (url, aurls = [], durls = []) => {
    let res = true;
    aurls.forEach((aurl) => {
      if (url.indexOf(aurl) === 0) res = true;
    });
    durls.forEach((durl) => {
      if (url.indexOf(durl) === 0) res = false;
    });
    return res;
  };
  const handleRequest = (request) => {
    let aurls = [];
    let durls = [
      "http://gitlab.local.com/help",
      "http://gitlab.local.com/explore",
    ];

    const url = request.url();

    if (validateURL(url, aurls, durls) == true) {
      request.continue();
    } else {
      console.log("aborted");
      request.abort();
    }
  };

  const filterATag = async () => {
    if (page === undefined) {
      return;
    }

    const config = {
      allow: [],
      deny: [],
    };
    const url = page.url();
    let aurls = config.allow;
    let durls = config.deny;
    console.log({ url });

    const nodes = await page.$$eval(
      "a",
      (data, url) =>
        data.map((el) => {
          console.log(validateURL);
          if (el.target === "") {
          } else if (el.target === "_self") {
          } else {
            el.target = "_self";
          }
          console.log("===+++++++++");
          if (el.href.indexOf(url) === 0) {
          } else if (
            el.href.indexOf("http:") != 0 &&
            el.href.indexOf("https:") != 0
          ) {
          } else if (el.href.indexOf("javascript:") === 0) {
          } else {
            console.log("+++++++++++", el.href);
            const response = validateURL(el.href);
            // const response = false;
            if (response === false) {
              if (el.href != "") {
                el.href = "";
              }
              if (el.onclick != null) {
                el.onclick = null;
              }
            }
          }
          return el;
        }),
      url,
    );
    console.log("END FILTER");
  };

  const filterAll = async () => {
    console.log("-----------------filterAll-------------------");
    try {
      await filterATag();
      console.log("-----------------filterAll-------------------end");
      return;
    } catch (e) {
      socketHelper.sendFailureMessage("Filter failed");
      console.log(e);
    }
  };

  // Emitted when the DOM is parsed and ready (without waiting for resources)
  page.once("domcontentloaded", () => {
    console.log("loaded");
  });

  // Emitted when the page is fully loaded
  page.once("load", async () => {
    console.log("fully loaded");
    await filterAll();
  });

  // Emitted when the page attaches a frame
  page.on("frameattached", (frame) => {
    console.log("frame detached");
  });

  // Emitted when a frame within the page is navigated to a new URL
  page.on("framenavigated", async (frame) => {
    console.log("==========>frame navigated ", frame.url());
    await filterAll();
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
  page.on("dialog", async (dialog) => {});

  // Emitted when a new page, that belongs to the browser context, is opened
  page.on("popup", () => {
    console.log("popup");
  });

  // Emitted when the page produces a request
  page.on("request", (request) => {
    console.log("====> request", request.url());
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
    await filterAll();
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
  await page.exposeFunction("onCustomEvent", (text) => console.log(text));
  await page.exposeFunction("validateURL", validateURL);

  return page;
};

module.exports = pageEvent;
