/** @format */
const SocketHelper = require('../Socket/SocketHelper')

class URLPolicy {
  constructor(page, socket) {
    this.allowUrlList = []
    this.denyList = []
    this.page = page
    this.socketHelper = new SocketHelper(socket)
    this.socketHelper.sendSuccessMessage('URL POLICY')
  }

  validateURL = (url) => {
    let res = true
    this.denyList = ['http://gitlab.local.com/help', 'http://gitlab.local.com/explore']

    this.allowUrlList.forEach((aurl) => {
      if (url.indexOf(aurl) === 0) res = true
    })
    this.denyList.forEach((durl) => {
      if (url.indexOf(durl) === 0) res = false
    })
    return res
  }

  filterATag = async (page) => {
    if (page === undefined) {
      return
    }
    const url = page.url()

    await page.$$eval(
      'a',
      (data, url) =>
        data.map((el) => {
          if (el.target === '') {
          } else if (el.target === '_self') {
          } else {
            el.target = '_self'
          }
          if (el.href.indexOf(url) === 0) {
          } else if (el.href.indexOf('http:') != 0 && el.href.indexOf('https:') != 0) {
          } else if (el.href.indexOf('javascript:') === 0) {
          } else {
            const href = el.href
            this.validateURL(href).then((res) => {
              if (res === false) {
                if (el.href != '') {
                  el.href = ''
                }
                if (el.onclick != null) {
                  el.onclick = null
                }
              }
            })
          }
          return el
        }),
      url
    )
  }

  filterAll = async () => {
    try {
      console.log('Stop filter')
      return
      console.log('-----------------filterAll start-------------------')
      await this.filterATag(this.page)
      console.log('-----------------filterAll end---------------------')
      return
    } catch (e) {
      this.socketHelper.sendFailureMessage('Filter failed')
      console.log(e)
    }
  }
}

module.exports = URLPolicy
