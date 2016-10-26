'use strict'

const prettyJSON = require('./pretty-json');
const json5 = require('json5');
const $ = require('jquery');
const fs = require('fs');

class App {

  constructor(document) {
    this.outputContainer = $('#output-container');
    this.textInput = $('#text-input');
    this.output = $('#output');

    // drag over event file
    document.ondragover = document.ondrop = e => {
      e.preventDefault();
    };

    // drop event
    document.body.ondrop = e => {
      e.preventDefault();
      let path = e.dataTransfer.files[0].path;
      this.parseTextInput(fs.readFileSync(path).toString());
    };

    // text input
    this.textInput.on('input', _ => {
      this.parseTextInput(this.textInput.val().trim());
    });
  }

  /**
   * Handle input text
   */

  parseTextInput(text) {
    try {
      this.data = json5.parse(text);
      this.message('');
    } catch (e) {
      this.output.remove();
      this.message('Inalid JSON');
      return;
    }
    this.displayData();
  }

  /**
   * Display pretty JSON
   */

  displayData() {
    this.outputContainer.append('<div id="output"></div>')
    this.output = $('#output');
    this.view = new prettyJSON({
      data: this.data,
      el: this.output
    });
    this.view.expandAll();
    $('.null').text('NULL')
  }

  /**
   * Display a message
   */

  message(text) {
    $('#message-window').text(text);
  }
}

const app = new App(document);

/**
 * Export app
 */

module.exports = app;
