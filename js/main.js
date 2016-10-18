'use strict'

const prettyJSON = require('./pretty-json');
const json2HTML = require('node-json2html');
const json5 = require('json5');
const $ = require('jquery');
const fs = require('fs');

class App {

  constructor(document) {

    this.outputContainer = $('#output-container');
    this.messageWindow = $('#message-window');
    this.textArea = $('#main textarea');
    this.queryArea = $('#query');
    this.document = document;

    // initial update
    this.update(this.textArea.val());

    /**
     * Drag / drop
     */

    document.ondragover = document.ondrop = (ev) => {
      ev.preventDefault();
    };

    document.body.ondrop = (ev) => {
      ev.preventDefault();
      let path = ev.dataTransfer.files[0].path;
      let text = fs.readFileSync(path).toString();
      let el = $('#main');
      this.update(text);
    };

    this.textArea.on('input', i => {
      this.textArea.val(this.textArea.val().trim());
      this.input = this.textArea.val();
      this.update();
    });
  }

  update(text) {
    try {
      this.data = json5.parse(this.input);
      this.clearMessage();
      this.show();
      this.textArea.hide();
      this.queryArea.show();
    } catch (e) {
      this.message(e.message);
    }
  }

  message(message) {
    this.messageWindow.text(message);
  }

  show() {
    this.outputContainer.append('<div id="output"></div>');
    this.output = $('#output');
    this.view = new prettyJSON.view.Node({
      data: this.data,
      el: this.output
    })
  }

  clearOutput() {
    this.output.remove();
  }

  clearMessage() {
    this.messageWindow.text('');
  }

}

const app = new App(document);

/**
 * Export app
 */

module.exports = app;
