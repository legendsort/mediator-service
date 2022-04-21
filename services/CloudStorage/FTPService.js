/** @format */
const ftp = require("basic-ftp");
const path = require("path");
const fs = require("fs");


class FTPService {
  constructor() {
    this.client = {};
    this.user = null;
  }

  checkValidPath = filePath => {
    return filePath === path.basename(filePath)
  }
  checkDirectoryExist = filePath => {
    return fs.existsSync(filePath);
  }

  checkDirectory = async (filePath) => {
    return await this.checkDirectoryExist(filePath) && await fs.stat(filePath).isDirectory();
  }

  checkFile = async (filePath) => {
    return await this.checkDirectoryExist(filePath) && await fs.statSync(filePath).isFile();
  }


  ensureDirectoryExistence = filePath => {
    const dirname = path.dirname(filePath);
    if (this.checkDirectoryExist(dirname)) return true;
    this.ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);
}

  async cd(path) {
    try{
      // if(this.checkDirectory(path) === false) throw "such directory not exist";
      await this.client.cd(path)
    } catch (error) {
      console.error("cd path error!\n", error);
      throw error;
    }
  }
  
  async loginServer(host, user, password) {
   
    try {
      const newUser = {
        host: host,
        user: user,
        password: password,
        // secure: true,
      }
      
      if( JSON.stringify(this.user) !== JSON.stringify(newUser) ) {

        const client = new ftp.Client();
        client.ftp.verbose = true;
        await client.access(newUser);
        this.client = client;
        this.user = newUser;
      }
     
    } catch (error) {
      console.error("login server error!\n", error);
      throw error;
    }
  }
  async getList(path) {
    try {
      return await this.client.list(path);
    } catch (error) { 
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
      throw error;
    }
  }

  async remove(item) {
    try{
      const dstPath = item.path;
      const type = item.type;
      
      const pathBaseName = path.basename(dstPath);
      const pathDirName = path.dirname(dstPath);
      
      await this.cd(pathDirName);
      return type === 1 ? await this.client.remove(pathBaseName) : await this.client.removeDir(pathBaseName)
      
    } catch (error) {
      throw error;
    }
  }

  async download(item, dir) {
    try{
      const srcPath = item.path;
      const type = item.type;
      
      const srcBaseName = path.basename(srcPath);
      const srcDirName = path.dirname(srcPath);
      
      const dstPath = dir + srcBaseName;
      await this.cd(srcDirName);
      this.ensureDirectoryExistence(dstPath);
      return type === 1 ? await this.client.downloadTo(fs.createWriteStream(dstPath), srcBaseName) : await this.client.downloadToDir(dstPath, srcBaseName)
    } catch(error) {
      throw error;
    }
  }

  async upload(srcPath, dstPath, type = 1) {
    try{
    
      const dstBaseName = path.basename(dstPath);
      const dstDirName = path.dirname(dstPath);
      await this.client.ensureDir(dstDirName)
      await this.cd(dstDirName)
      if(type === 1) {
        return await this.client.uploadFrom(srcPath, dstPath);
      }
      else {
        return await this.client.uploadFromDir(srcPath, dstDirName)
      }
      
    } catch(error) {
      throw error;
    }
  }
}

module.exports = FTPService;
