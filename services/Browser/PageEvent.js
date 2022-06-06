/** @format */
const SocketHelper = require("../Socket/SocketHelper");
const URLPolicy = require("../Security/URLPolicy");
const fs = require("path");

const pageEvent = async (page, socket, browser) => {
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

  browser.on("disconnected", (data) => {
    console.log("disconnected");
  });
  browser.on("targetchanged", (data) => {
    console.log("target canged");
  });
  browser.on("targetcreated", (data) => {
    console.log("target created");
  });

  // Emitted when the DOM is parsed and ready (without waiting for resources)
  page.once("domcontentloaded", () => {
    // socketHelper.sendMessage("status", "loaded");

    console.log("loaded");
  });

  // Emitted when the page is fully loaded
  page.once("load", async () => {
    console.log("fully loaded");
    // socketHelper.sendMessage("status", "loaded");

    await urlPolicy.filterAll();
  });

  // Emitted when the page attaches a frame
  page.on("frameattached", (frame) => {
    console.log("frame detached");
  });

  // Emitted when a frame within the page is navigated to a new URL
  page.on("framenavigated", async (frame) => {
    console.log("==========>frame navigated ", frame.url());
    socketHelper.sendMessage("status", "loaded");

    try {
      await urlPolicy.filterAll();
    } catch (e) {
      console.log(e);
    }
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
    if (request.isNavigationRequest()) {
      console.log("===============>", request.url());
      socketHelper.sendMessage("status", "loading");
    }
    handleRequest(request);
  });

  // Emitted when a request, which is produced by the page, fails
  page.on("requestfailed", (request) => {
    console.log("====> request failed");

    // socketHelper.sendFailureMessage("Request failed");
  });

  // Emitted when a request, which is produced by the page, finishes successfully
  page.on("requestfinished", async (request) => {
    console.log("====> request_finish");
    // await urlPolicy.filterAll();
  });

  // Emitted when a response is received
  page.on("response", (response) => {
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
  page.once("close", () => {
    console.log("Closed");
  });

  await page.exposeFunction("onCustomEvent", ({ type, detail }) => {
    console.log(`Event fired: ${type}, detail: ${detail}`);
  });

  await page.evaluateOnNewDocument(async () => {
    console.log("Evaluate document");

    window.addEventListener("click", (e) => {
      // get selector of element;
      const getSelector = (elm) => {
        try {
          if (elm.tagName === "BODY") return "BODY";
          const names = [];

          while (elm.parentElement && elm.tagName !== "BODY") {
            if (elm.id && false) {
              names.unshift("#" + elm.getAttribute("id")); // getAttribute, because `elm.id` could also return a child element with name "id"
              break; // Because ID should be unique, no more is needed. Remove the break, if you always want a full path.
            } else {
              let c = 1,
                e = elm;
              for (
                ;
                e.previousElementSibling;
                e = e.previousElementSibling, c++
              );
              names.unshift(elm.tagName + ":nth-child(" + c + ")");
            }
            elm = elm.parentElement;
          }
          return names.join(">");
        } catch (e) {
          console.log(e);
          return "Error";
        }
      };

      const type = e.target.type;
      // for upload
      // if (type === "text") {
      if (type === "file") {
        const selector = getSelector(e.target);
        console.log(selector);

        window.sendMessage("upload", {
          response_code: true,
          message: "Click file choose button",
          data: { selector: selector },
        });
        e.preventDefault();
        e.stopPropagation();
      }
      return;
      function onConvertSelectClick(event) {
        var id_list = event.currentTarget.id_list;

        var dom_list = document.getElementById(id_list);
        var list_display = dom_list.style.display;

        if (list_display == "none") {
          dom_list.style.display = "block";
        } else {
          dom_list.style.display = "none";
        }
      }

      function onConvertOptionClick(event) {
        var id_list = event.currentTarget.id_list;
        var id_btn = event.currentTarget.id_btn;

        var value = event.target.value;
        var text = event.target.innerHTML;

        var dom_select = document.getElementById(id_btn);
        dom_select.innerHTML = text;

        var dom_list = document.getElementById(id_list);
        dom_list.style.display = "none";
      }

      function convert(no) {
        console.log("CONVERT ---------L");
        var parent = document.querySelector("select"),
          docFrag = document.createDocumentFragment(),
          list = document.createElement("ul");

        if (parent === undefined) {
          return;
        }

        var parent_display = parent.style.display;
        if (parent_display == "none") {
          return;
        }

        var parent_div = document.createElement("div");
        var select_btn = document.createElement("div");
        var current_option = parent.options[parent.selectedIndex].text;
        var current_width = parent.style.width;

        while (parent.firstChild) {
          var option = parent.removeChild(parent.firstChild);
          if (option.nodeType !== 1) continue;
          var listItem = document.createElement("li");
          for (var i in option) {
            if (option.hasAttribute(i))
              listItem.setAttribute(i, option.getAttribute(i));
          }
          while (option.firstChild) {
            listItem.appendChild(option.firstChild);
          }
          docFrag.appendChild(listItem);
        }

        for (var i in parent) {
          if (parent.hasAttribute(i))
            list.setAttribute(i, parent.getAttribute(i));
        }

        list.appendChild(docFrag);
        list.setAttribute("id", "lang_list" + no);
        list.addEventListener("click", onConvertOptionClick);
        list.id_list = "lang_list" + no;
        list.id_btn = "mybtn" + no;

        list.setAttribute(
          "style",
          "list-style: none; margin: 0; padding: 0 10px; cursor: pointer; border: 1px solid black; max-height: 300px; overflow: auto; box-sizing: border-box; position: absolute; background-color: white; z-index: 100;",
        );
        list.style.display = "none";
        list.style.width = current_width;

        select_btn.setAttribute("id", "mybtn" + no);
        select_btn.addEventListener("click", onConvertSelectClick);
        select_btn.id_list = "lang_list" + no;

        select_btn.setAttribute(
          "style",
          "background-repeat: no-repeat, repeat; background-position: 100% center; background-size: 15px 10px; background-color: white; text-align: left;border: 2px solid black; cursor: pointer; box-sizing: border-box; border-radius: 4px; padding: 1px 10px; display: inline-block; background-image: url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR2ZmTPdWRicfeVgmuHeWynnkCz_fgFC4Rl2w&usqp=CAU');",
        );
        select_btn.innerHTML = current_option;
        select_btn.style.width = current_width;

        parent_div.appendChild(select_btn);
        parent_div.appendChild(list);
        parent_div.style.display = "inline-block";

        parent.parentNode.replaceChild(parent_div, parent);
      }

      const selectElements = document.querySelectorAll("select");
      console.log(selectElements.length);
      for (let i = 0; i < selectElements.length; i++) convert(i);
    });
  });

  await page.exposeFunction("validateURL", urlPolicy.validateURL);
  await page.exposeFunction("sendMessage", socketHelper.sendMessage);

  return page;
};

module.exports = pageEvent;
