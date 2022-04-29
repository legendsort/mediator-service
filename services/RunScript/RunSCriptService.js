/** @format */

class RunScriptService {
  constructor(browser, action) {
    this.browser = browser;
    if (this._instance_method_choices[action]) {
      self.action = action;
    }

    this._instance_method_choices = {
      visit: "visit",
    };
    const getProps = function* (object) {
      if (object !== Object.prototype) {
        for (let name of Object.getOwnPropertyNames(object)) {
          let method = object[name];
          // Supposedly you'd like to skip constructor and private methods (start with _ )
          if (
            method instanceof Function &&
            name !== "constructor" &&
            name[0] !== "_"
          )
            yield name;
        }
        yield* getProps(Object.getPrototypeOf(object));
      }
    };

    this[Symbol.iterator] = function* () {
      yield* getProps(this);
    };
  }
  async visitPage() {}
  async run() {}

  // --------------
}
module.exports = RunScriptService;
