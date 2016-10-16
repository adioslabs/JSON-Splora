'use strict'

const prettyJSON = require('./pretty-json');
const EventEmitter = require('events');

class JSONObject extends EventEmitter {

  constructor(text, el) {
    super();
    try {
      this.json = JSON.parse(text);
    } catch (e) {
      this.emit('err', e);
    }
  }

  createView() {
    this.view = new prettyJSON.view.Node({
      data: this.json,
      el: el
    })
  }
}

/**
 * Exports
 */

module.exports = JSONObject
