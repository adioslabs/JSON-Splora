'use strict'

const prettyJSON = require('./pretty-json')
const JSONView = require('./json-view')
const json5 = require('json5')
const jq = require('node-jq')
const fs = require('fs')
const $ = require('jquery')

const json = `{
  "name": "test data",
  "date": "Sun Nov 06 2016 09:55:06 GMT-0500 (EST)",
  "other": [false, null, true],
  "people": [{
    "name": "Wells",
    "age": 26,
    "activities": [null, 5, true, false]
  }, {
    "name": "Danielle",
    "age": 24
  }]
}`

class App {

  constructor(document) {
    this.outputContainer = $('.output-containers .json-output-container')
    this.outputContainers = $('.output-containers')
    this.messageWindow = $('.message-window')
    this.jqIndicator = $('.jq-indicator')
    this.checkmark = $('.checkmark-container')
    this.bottomBar = $('.bottom-bar')
    this.dataInput = $('.data-input')
    this.jqOutput = $('.output-containers .jq-output-container')
    this.jqInput = $('.jq-input')
    this.output = $('.output')

    this.bottomBar.hide()

    // drag over event file
    document.ondragover = document.ondrop = e => {
      e.preventDefault()
    }

    // drop event
    document.body.ondrop = e => {
      e.preventDefault()
      let path = e.dataTransfer.files[0].path
      this.jsonInput(fs.readFileSync(path).toString())
    }

    // text input
    this.dataInput.on('input', _ => {
      this.jsonInput(this.dataInput.val().trim())
    })

    // mess with data object
    this.jqInput.on('input', _ => {
      let filter = this.jqInput.val().trim()
      if (!filter || filter == '') {
        this.jqView.destroy()
        this.jqIndicator.css('color', 'gray')
        return
      }
      jq.run(filter, this.data, {
        input: 'json',
        output: 'json'
      }).then(output => {
        this.jqView = new JSONView(output, this.jqOutput)
        this.jqIndicator.css('color', 'green')
      }).catch(e => {
        console.log('error', e.stack || e)
        if (this.jqView) {
          this.jqView.destroy()
        }
        this.jqIndicator.css('color', 'gray')
      });
    })

    this.jsonInput(json)
  }

  /**
   * Handle input text
   */

  jsonInput(text) {
    try {
      this.data = json5.parse(text)
    } catch (e) {
      this.invalid();
      return
    }
    this.outputContainer.append('<div class="output"></div>')
    this.output = $('.output')
    this.view = new JSONView(this.data, this.output)
    this.outputContainers.show()
    this.dataInput.hide()
    this.bottomBar.show()
  }

  invalid() {
    this.message('invalid input')
    setTimeout(_ => this.message(''), 2000)
  }

  /**
   * Display a message
   */

  message(text) {
    this.messageWindow.text(text)
  }
}

const app = new App(document)

/**
 * Export app
 */

module.exports = app
