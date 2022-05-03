/** @format */

const pageEvent = async (page) => {
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

module.exports = pageEvent;
