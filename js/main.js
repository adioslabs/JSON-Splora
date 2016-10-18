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
    this.init();
  }

  /**
   * Prepare document events and message box
   */

  init() {

    // drag-drop file
    this.document.ondragover = document.ondrop = ev => {
      ev.preventDefault();
    };
    this.document.body.ondrop = ev => {
      ev.preventDefault();
      let path = ev.dataTransfer.files[0].path;
      this.input(fs.readFileSync(path).toString());
    };

    // text input
    this.textArea.on('input', i => {
      this.input(this.textArea.val().trim());
    });

    // welcome message
    this.message('Input text data, or drag a file');
  }

  /**
   * Handle input text
   *
   * @param {string} text
   */

  input(text) {
    try {
      this.data = json5.parse(text);
    } catch (e) {
      this.message('Not valid JSON');
      return;
    }
    this.displayData();
    this.textArea.css('height', '100px');
  }

  /**
   * Display a message
   */

  message(message) {
    this.messageWindow.text(message);
  }

  /**
   *
   */

  displayData() {
    this.outputContainer.append('<div id="output"></div>');
    this.output = $('#output');
    this.view = new prettyJSON.view.Node({
      data: this.data,
      el: this.output
    });
    this.view.expandAll();
    $('.null').text('NULL')
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
