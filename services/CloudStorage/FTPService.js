/** @format */
const ftp = require("basic-ftp");
const mongoose = require("mongoose");

class FTPService {
  constructor() {
    this.client = {};
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
    } catch (err) {
      console.log(err);
    }
  }
  async getList() {
    try {
      return await this.client.list();
    } catch (error) {
      return null;
    }
  }
}

module.exports = FTPService;
