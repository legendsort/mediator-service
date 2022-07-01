/** @format */
const CloudinfoModel = require('../models/cloudInfoModel')
var {sendResponse} = require('./ControllerHepler')

const fs = require('fs')
const archiver = require('archiver')

const path = require('path')

const getFtpService = async (req) => {
  const ftpService = req.app.get('ftp-service')

  const username = req.body.username || process.env.FTP_USER
  const host = req.body.host || process.env.FTP_SERVER
  let cloudInfo
  try {
    cloudInfo = await CloudinfoModel.findOne({
      username: username,
      host: host,
    })
  } catch (e) {
    console.log(e)
    throw 'service database error'
  }
  if (typeof cloudInfo !== undefined && cloudInfo !== null) {
    await ftpService.getService(cloudInfo.url, cloudInfo.username, cloudInfo.password)
    return ftpService
  }
  throw 'cannot login to ftp server dut to database error'
}

const archive = async (path, tmpPath, name) => {
  const fileName = path + name + '.zip'
  const output = fs.createWriteStream(fileName)
  const archive = archiver('zip', {
    zlib: {level: 9},
  })
  output.on('close', function () {
    console.log(archive.pointer() + ' total bytes')
    console.log('archiver has been finalized and the output file descriptor has closed.')
  })
  output.on('end', function () {
    console.log('Data has been drained')
  })
  archive.on('warning', function (err) {
    if (err.code === 'ENOENT') {
      console.log(err.code)
    } else {
      throw err
    }
  })
  archive.on('error', function (err) {
    throw err
  })
  archive.pipe(output)
  archive.directory(tmpPath, false)
  archive.finalize()
}

/**
 * cloudInfoController.js
 *
 * @description :: Server-side logic for managing cloudInfos.
 */
module.exports = {
  /**
   * cloudInfoController.list()
   */
  list: async (req, res) => {
    try {
      const ftpService = await getFtpService(req)
      const path = req.query.path
      const ans = await ftpService.getList(path)
      return sendResponse(res, 200, true, 'get list succeed', ans)
    } catch (e) {
      console.log('Get list error!\n', e)
      return sendResponse(res, 500, false, 'get list failed', e)
    }
  },

  /**
   * cloudInfoController.copy()
   */
  copy: async (req, res) => {
    try {
      const ftpService = await getFtpService(req)
      const items = req.body.srcPath
      const dstPath = req.body.dstPath

      const tmpPath = `${req.app.get('public-dir')}/ftp/temp/`
      console.log(items)
      if (items.length > 0) {
        for (const srcPath of items) {
          const filename = path.basename(srcPath.path)
          console.log('[ftp controller] ===> ', srcPath, tmpPath, filename)
          await ftpService.download(srcPath, tmpPath)
          console.log('----> download succeed')
          const type = srcPath.type

          if (type === 1)
            await ftpService.upload(tmpPath + filename, path.join(dstPath, filename), type)
          else
            await ftpService.upload(
              path.join(tmpPath, filename),
              path.join(dstPath, filename),
              type
            )
        }
      }
      return sendResponse(res, 200, true, 'copy file succeed', {
        src: items,
        dst: dstPath,
      })
    } catch (e) {
      console.log('copy file error!\n', e)
      return sendResponse(res, 500, false, 'copy file failed', e)
    }
  },

  /**
   * cloudInfoController.move()
   */
  move: async (req, res) => {
    try {
      const ftpService = await getFtpService(req)
      const srcPath = req.body.srcPath
      const dstPath = req.body.dstPath
      const tmpPath = `${req.app.get('public-dir')}\\ftp\\upload\\${srcPath}`

      await ftpService.download(srcPath, tmpPath)
      await ftpService.upload(tmpPath, dstPath)
      fs.unlinkSync(tmpPath, {
        force: true,
      })
      await ftpService.remove(srcPath)
      return sendResponse(res, 200, true, 'copy file succeed', {
        src: srcPath,
        dst: dstPath,
      })
    } catch (e) {
      console.log('move file error!\n', e)
      return sendResponse(res, 500, false, 'copy file failed', e)
    }
  },

  /**
   * cloudInfoController.rename()
   */
  rename: async (req, res) => {
    try {
      const ftpService = await getFtpService(req)
      const srcPath = req.body.srcPath
      const dstPath = req.body.dstPath

      console.log('[ftp.controller rename] ===> ', srcPath, dstPath)
      if (Array.isArray(srcPath)) {
        const dir = path.dirname(srcPath[0].path)
        for (const item of srcPath) {
          const filename = path.basename(item.path)
          console.log('[ftp.controller rename] ===> ', item, path.join(dstPath, filename))
          await ftpService.rename(item.path, path.join(dstPath, filename))
        }
        const list = await ftpService.getList(dir)
        return sendResponse(res, 200, true, 'rename file succeed', list)
      } else {
        const dir = path.dirname(srcPath)
        await ftpService.rename(srcPath, dstPath)
        const list = await ftpService.getList(dir)
        return sendResponse(res, 200, true, 'rename file succeed', list)
      }
    } catch (e) {
      console.log('rename file error!\n', e)
      return sendResponse(res, 500, false, 'rename file failed', e)
    }
  },
  /**
   * cloudInfoController.update()
   */
  download: async (req, res) => {
    try {
      const ftpService = await getFtpService(req)
      const items = req.body.srcPath
      const target = req.body.dstPath
      const tmpPath = `${req.app.get('public-dir')}/ftp/temp/${target}/`
      const dstPath = `${req.app.get('public-dir')}/ftp/upload/`
      if (items.length > 0) {
        for (const item of items) {
          await ftpService.download(item, tmpPath)
        }
      }
      await archive(dstPath, tmpPath, target)
      return sendResponse(res, 200, true, 'download file succeed', items)
    } catch (e) {
      console.log('download file error!\n', e)
      return sendResponse(res, 500, false, 'download file failed', e)
    }
  },

  /**
   * cloudInfoController.update()
   */
  upload: async (req, res) => {
    try {
      const ftpService = await getFtpService(req)
      const srcPath = req.body.srcPath
      const uploaded_file = req.files.file
      const uploadPath = req.app.get('public-dir') + '/ftp/upload/' + uploaded_file.name
      await uploaded_file.mv(uploadPath)
      await ftpService.upload(uploadPath, srcPath)

      fs.unlinkSync(uploadPath, {
        force: true,
      })
      return sendResponse(res, 200, true, 'upload file succeed', {
        uploadPath: uploadPath,
        name: req.files.file.name,
      })
    } catch (e) {
      console.log('upload file error!\n', e)
      return sendResponse(res, 500, false, 'upload file failed', e)
    }
  },

  /**
   * cloudInfoController.remove()
   */
  remove: async (req, res) => {
    try {
      const ftpService = await getFtpService(req)
      const items = req.body.path
      if (items.length > 0) {
        for (const item of items) {
          await ftpService.remove(item)
        }
        const list = await ftpService.getList(path.dirname(items[0].path))
        return sendResponse(res, 200, true, 'remove file succeed', list)
      }
    } catch (e) {
      console.log('remove file error!\n', e)
      return sendResponse(res, 500, false, 'remove file failed', e)
    }
  },
}
