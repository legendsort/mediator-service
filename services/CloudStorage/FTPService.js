/** @format */
const ftp = require("basic-ftp");
const path = require("path");
const fs = require("fs");


class FTPService {
  constructor() {
    this.client = {};
  }

  ensureDirectoryExistence = filePath => {
    const dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
      return true;
    }
    this.ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);
}

  async cd(path) {
    try{
      await this.client.cd(path)
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  
  async loginServer(host, user, password) {
    const client = new ftp.Client();
    client.ftp.verbose = true;
    try {
      await client.access({
        host: host,
        user: user,
        password: password,
        // secure: true,
      });
      this.client = client;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
  async getList(path) {
    try {
      return await this.client.list(path);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async rename(srcPath, dstName) {
    try{
      const srcBaseName = path.basename(srcPath);
      const srcDirName = path.dirname(srcPath);
      
      await this.cd(srcDirName)

      return await this.client.rename(srcBaseName, dstName);
    } catch(error) {
      console.log(error);
      throw error;
    }
  }

  async remove(dstPath) {
    try{
      const pathBaseName = path.basename(dstPath);
      const pathDirName = path.dirname(dstPath);
      await this.cd(pathDirName);
      return await this.client.remove(pathBaseName)
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async download(srcPath, dstPath) {
    try{
      const srcBaseName = path.basename(srcPath);
      const srcDirName = path.dirname(srcPath);
      
      await this.cd(srcDirName)
      this.ensureDirectoryExistence(dstPath);
      return await this.client.downloadTo(fs.createWriteStream(dstPath), srcBaseName)
    } catch(error) {
      console.log(error);
      throw error;
    }
  }

  async upload(srcPath, dstPath) {
    try{
      const dstBaseName = path.basename(dstPath);
      const dstDirName = path.dirname(dstPath);
      await this.client.ensureDir(dstDirName)
      await this.cd(dstDirName)
      return await this.client.uploadFrom(srcPath, dstBaseName)
    } catch(error) {
      console.log(error);
      throw error;
    }
  }
}

module.exports = FTPService;
