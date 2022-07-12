/** @format */
const fs = require('fs')
const path = require('path')
const puppeteer = require('puppeteer-extra')

const pageEvent = require('./PageEvent')
const BrowserActions = require('./BrowserActions')

const getConfig = require('../../helper/ConfigHelper')
const SocketHelper = require('../../helper/SocketHelper')
const {installMouseHelper, sleep} = require('../../helper/installMouseHelper')

class Browser {
  constructor(id) {
    this.id = id
    this.socket = null
    this.business = null
    this.busy = false
    this.socketHelper = {}
    this.screenShotInterval = {}
  }

  launchBrowser = async () => {
    try {
      console.log('====launch browser')
      this.config = await getConfig({site: 'wipo', tag: 'Browser'})

      this.browser = await puppeteer.launch(this.config.browser)
      this.page = await this.browser.newPage()
      await this.page.setDefaultNavigationTimeout(60000)

      this.browser.on('disconnected', (data) => {
        console.log('browser_disconnected')
      })
      this.browser.on('targetchanged', (target) => {
        console.log('target changed', target.url())
      })
      this.browser.on('targetcreated', async (target) => {
        if (target.type() == 'page') {
          console.log('browser_targetcreated')

          const newPage = await target.page()
          const newURL = newPage.url()
          await newPage.close()
          if (this.BrowserActions) await this.BrowserActions.visit({url: newURL})
          console.log(this.page.url())
        }
      })
      return true
    } catch (e) {
      console.log('Lanuch', e)
      return false
    }
  }

  setHandlingPageEvent = async (page, socket, socketHelper) => {
    return pageEvent(page, socket, socketHelper)
  }

  setSocket = async (socket) => {
    console.log('====set socket')
    if (this.socket) {
      this.socket.disconnect()
    }
    this.socket = socket
    this.socketHelper = new SocketHelper(socket)

    this.page.removeAllListeners('request')
    this.page = await this.setHandlingPageEvent(this.page, this.socket, this.socketHelper)
    await this.setSocketLogic()
    return this.socket
  }

  closeSocket() {
    this.socket = null
  }
  _isEmpty(obj) {
    try {
      return Object.keys(obj).length === 0
    } catch (error) {
      return false
    }
  }

  setSocketLogic = async () => {
    this.socket.on('start-page', async (data) => {
      try {
        const {params, viewport} = data
        this.type = params.type
        this.BrowserActions = new BrowserActions(
          this.page,
          this.socket,
          this.config,
          this.browser,
          this.socketHelper
        )
        let [result, message] = [true, 'Loaded!']
        if (this._isEmpty) {
          if (true || this.business != params) {
            this.socketHelper.sendMessage('send-resize', {})
            const {type, action} = params
            console.log(type, action)

            const config = await getConfig({
              site: type,
              tag: 'Link',
            })
            console.log(config)
            this.scripts = [
              {
                type: 'visit',
                action: {
                  url: config[action],
                },
              },
            ]
            const response = await this.BrowserActions.execute(this.scripts)
            result = response.response_code
            if (response.response_code === false) {
              this.socketHelper.sendFailureMessage(response.message)
            }

            // await installMouseHelper(this.page)
          }
        }

        if (result) {
          console.log(viewport.width, viewport.height)
          await this.BrowserActions.setViewport(viewport.width, viewport.height)
          console.log('=====start screenshot====')
          clearInterval(this.screenShotInterval)
          this.screenShotInterval = setInterval(() => this.sendScreenshot(1000), 2000, this)
          this.business = params
        } else {
          this.socketHelper.sendFailureMessage(message)
        }
      } catch (e) {
        console.log(e)
        this.socketHelper.sendFailureMessage('Network Error!')
      }
    })

    this.socket.on('mouse-move', async (data) => {
      this.BrowserActions.mouseMove(data.point.x, data.point.y)
      // await this.sendScreenshot(2000)
    })

    this.socket.on('mouse-click', async (data) => {
      try {
        console.log('Click:', data.point.x, data.point.y)
        await this.BrowserActions.mouseClick(data.point.x, data.point.y)
        await this.sendScreenshot()
      } catch (error) {}
    })

    this.socket.on('mouse-dbclick', async (data) => {
      try {
        this.BrowserActions.mouseDBclick(data.point.x, data.point.y)
      } catch (error) {}
    })

    this.socket.on('mouse-down', async (data) => {
      console.log('mouse down:', data.point.x, data.point.y)

      try {
        this.BrowserActions.mouseDown(data.point.x, data.point.y)
        await this.sendScreenshot()
      } catch (error) {}
    })

    this.socket.on('mouse-up', async (data) => {
      console.log('mouse up:', data.point.x, data.point.y)

      try {
        this.BrowserActions.mouseUp(data.point.x, data.point.y)
        await this.sendScreenshot()
      } catch (error) {}
    })

    this.socket.on('keyEvent', async (data) => {
      switch (data.type) {
        case 'singleKeyDown':
          await this.BrowserActions.keyPress(data.key)
          break
        case 'selectAll':
          this.BrowserActions.selectAll()
          break
        case 'copy':
          this.BrowserActions.copy({})
          break
        case 'cut':
          this.BrowserActions.cut({})
          break

        case 'paste':
          this.BrowserActions.paste({})
          break
        case 'deleteword':
          this.BrowserActions.deleteWord({})
          break
      }
      await this.sendScreenshot()
    })

    this.socket.on('set-viewport', async (data) => {
      try {
        await this.BrowserActions.setViewport(data.width, data.height)
        await this.sendScreenshot()
      } catch (error) {}
    })

    this.socket.on('mouse-wheel', async (data) => {
      try {
        await this.BrowserActions.setWheel(data.x, data.y)
        await this.sendScreenshot(1000)
      } catch (error) {}
    })

    this.socket.on('copy', async (data) => {
      try {
        const res = await this.BrowserActions.copy(data)

        await this.socketHelper.sendMessage('message', {
          response_code: res[0],
          message: res[1],
        })
        if (res[0])
          await this.socketHelper.sendMessage('copy', {
            response_code: true,
            message: 'success',
            data: res[2],
          })
        await this.sendScreenshot()
      } catch (error) {
        console.log(error)
      }
    })

    this.socket.on('paste', async (data) => {
      try {
        const res = await this.BrowserActions.paste(data)
        await this.socketHelper.sendMessage('message', {
          response_code: res[0],
          message: res[1],
        })

        await this.sendScreenshot()
      } catch (error) {
        console.log(error)
      }
    })

    this.socket.on('refresh', async () => {
      try {
        const res = await this.BrowserActions.refresh()
        await this.socketHelper.sendMessage('message', {
          response_code: res[0],
          message: res[1],
        })

        await this.sendScreenshot()
      } catch (error) {
        console.log(error)
      }
    })

    this.socket.on('back', async () => {
      try {
        const res = await this.BrowserActions.back()
        await this.socketHelper.sendMessage('message', {
          response_code: res[0],
          message: res[1],
        })

        await this.sendScreenshot()
      } catch (error) {
        console.log(error)
      }
    })

    this.socket.on('forward', async () => {
      try {
        const res = await this.BrowserActions.forward()
        await this.socketHelper.sendMessage('message', {
          response_code: res[0],
          message: res[1],
        })

        await this.sendScreenshot()
      } catch (error) {
        console.log(error)
      }
    })

    const getCurrentDir = async (index) => {
      try {
        const dir = path.join(process.cwd(), '/public/wipo/upload', index)
        if (!fs.existsSync(dir)) {
          console.log('Create directory', dir)
          await fs.mkdirSync(dir, 0x0777)
        }
        return dir
      } catch (e) {
        console.log(e)
        throw e
      }
    }

    const uploadFilesToService = async (files, names, index) => {
      try {
        for (let i = 0; i < names.length; i++) {
          const name = names[i]
          const file = files[i]
          const dir = await getCurrentDir(index)
          const filepath = path.join(dir, name)
          await fs.writeFileSync(filepath, file, 'binary')
        }
        this.socketHelper.sendSuccessMessage('Upload files succeed')
      } catch (e) {
        console.log(e)
        this.socketHelper.sendFailureMessage('Upload files failed')
      }
    }

    const autoChooseFiles = async (names, index, selector) => {
      try {
        const dir = await getCurrentDir(index)
        names = names.map((name) => {
          name = path.join(dir, name)
          return name
        })
        const files = await Promise.all(names)
        const inputUploadHandle = await this.page.$(selector)
        inputUploadHandle.uploadFile(...files)
      } catch (e) {
        console.log(e)
        throw e
      }
    }

    this.socket.on('select-file', async (response) => {
      const names = response.names
      const files = response.files
      const index = response.index
      const selector = response.selector
      try {
        await uploadFilesToService(files, names, index)
        await autoChooseFiles(names, index, selector)
      } catch (e) {
        console.log(e)
      }
    })

    this.socket.on('stop-screenshot', async () => {
      console.log('Stop - screenshot')
      try {
        clearInterval(this.screenShotInterval)
      } catch (e) {
        console.log('Stop screenshot error')
        console.log(e)
      }
    })
  }
  sendScreenshot = async (delay = 200) => {
    try {
      if (!this._isEmpty(this.page) && !this.busy) {
        if (this.socketHelper.getState()) return
        console.log('-----------send screenshot---------------->')
        let img = await this.BrowserActions.screenshot()
        this.busy = true
        this.socketHelper.sendMessage('send-screenshot', {screen: img, url: this.page.url()})

        await sleep(delay)

        this.busy = false
      }
    } catch (error) {}
  }
  close() {}

  async test() {
    console.log('=======================  Page.test  ===================')
    var lists =
      '<select name="cars" id="cars">' +
      '  <option value="volvo">Volvo</option>' +
      '  <option value="saab">Saab</option>' +
      '  <option value="mercedes">Mercedes</option>' +
      '  <option value="audi">Audi</option>' +
      '</select>'
    try {
      console.log(path.join(__dirname, 'ProxySelect.css'))
      await this.page.addStyleTag({path: path.join(__dirname, 'ProxySelect.css')})
      await this.page.addScriptTag({path: path.join(__dirname, 'ProxySelect.js')})

      await this.page.evaluate((lists) => {
        var wrapper = document.createElement('div')
        wrapper.innerHTML = lists
        var div = wrapper.firstChild
        document.body.appendChild(div)
        var selectNodes = document.getElementsByTagName('select')
        console.log('------------------------>  select event listener')

        for (var i = 0, len = selectNodes.length; i < len; i++) {
          var selectNode = selectNodes[i]
          console.log('====>', selectNode.hasAttribute('no-proxy-select'))
          window.proxifySelect(selectNode)
          console.log(selectNode)
        }
        console.log(selectNodes.length)
        window.proxifyDynamicallyAddedSelects()
      }, lists)
    } catch (e) {
      console.log(e)
    }
  }
}
module.exports = Browser
