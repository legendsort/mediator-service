/** @format */
const ftp = require('basic-ftp')
const path = require('path')
const fs = require('fs')

class FTPService {
  constructor() {
    this.manager = {}
  }

  async getClient(host, user, password) {
    try {
      // const userInfo = {
      //   host: host,
      //   user: user,
      //   password: password,
      //   // secure: true,
      // }
      const userInfo = {
        host: process.env.FTP_URL,
        user: 'anonymous',
      }

      if (this.manager[user] == null || this.manager[user].client.closed) {
        console.log('no such user so that create new client')
        const client = new ftp.Client()
        // client.ftp.verbose = true;
        await client.access(userInfo)
        this.manager[user] = new FTPClient(client)
      }
      return this.manager[user]
    } catch (error) {
      console.error('get ftp service error!\n', error)
      throw error
    }
  }
}
class FTPClient {
  constructor(client) {
    this.client = client
  }

  checkValidPath = (filePath) => {
    return filePath === path.basename(filePath)
  }
  checkDirectoryExist = (filePath) => {
    return fs.existsSync(filePath)
  }

  checkDirectory = async (filePath) => {
    return (await this.checkDirectoryExist(filePath)) && (await fs.stat(filePath).isDirectory())
  }

  checkFile = async (filePath) => {
    return (await this.checkDirectoryExist(filePath)) && (await fs.statSync(filePath).isFile())
  }

  ensureDirectoryExistence = (filePath) => {
    const dirname = path.dirname(filePath)
    if (this.checkDirectoryExist(dirname)) return true
    this.ensureDirectoryExistence(dirname)
    fs.mkdirSync(dirname)
  }

  async cd(path) {
    try {
      // if(this.checkDirectory(path) === false) throw "such directory not exist";
      await this.client.cd(path)
    } catch (error) {
      console.error('cd path error!\n', error)
      throw error
    }
  }

  async getList(path) {
    try {
      return await this.client.list(path)
    } catch (error) {
      throw error
    }
  }

  async rename(srcPath, dstName) {
    try {
      const srcBaseName = path.basename(srcPath)
      const srcDirName = path.dirname(srcPath)

      await this.cd(srcDirName)

      return await this.client.rename(srcBaseName, dstName)
    } catch (error) {
      throw error
    }
  }

  async remove(item) {
    try {
      const dstPath = item.path
      const type = item.type

      const pathBaseName = path.basename(dstPath)
      const pathDirName = path.dirname(dstPath)

      await this.cd(pathDirName)
      return type === 1
        ? await this.client.remove(pathBaseName)
        : await this.client.removeDir(pathBaseName)
    } catch (error) {
      throw error
    }
  }

  async download(item, dir) {
    try {
      const srcPath = item.path
      const type = item.type

      const srcBaseName = path.basename(srcPath)
      const srcDirName = path.dirname(srcPath)
      console.log(item, dir)
      const dstPath = dir + srcBaseName
      await this.cd(srcDirName)
      this.ensureDirectoryExistence(dstPath)
      console.log('[FTPService] ====>', dstPath, type)

      return type === 1
        ? await this.client.downloadTo(fs.createWriteStream(dstPath), srcBaseName)
        : await this.client.downloadToDir(dstPath, srcBaseName)
    } catch (error) {
      throw error
    }
  }

  async upload(srcPath, dstPath, type = 1) {
    try {
      console.log('[FTPService upload] ===> ', srcPath, dstPath)
      const dstDirName = path.dirname(dstPath)
      await this.client.ensureDir(dstDirName)
      await this.cd(dstDirName)
      if (type === 1) {
        return await this.client.uploadFrom(srcPath, dstPath)
      } else {
        return await this.client.uploadFromDir(srcPath, dstPath)
      }
    } catch (error) {
      throw error
    }
  }
}

module.exports = FTPService
