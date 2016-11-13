'use strict'

const prettyJSON = require('./pretty-json')
const JSONView = require('./json-view')
const json5 = require('json5')
const util = require('util')
const jq = require('node-jq')
const vm = require('vm')
const fs = require('fs')
const $ = require('jquery')


// const json = `
// {"video_id":3872,"user_id":null,"orientation_changed":1,"finished_video":true,"total_time_played":28.716198,"orientation_data":[{"x":0,"y":0,"time":0},{"x":0,"y":1.5708,"time":0.5},{"x":0,"y":1.5708,"time":1},{"x":0,"y":1.5708,"time":1.5},{"x":0,"y":1.5708,"time":2},{"x":0,"y":1.5708,"time":2.5},{"x":0,"y":1.5708,"time":3},{"x":0,"y":1.5708,"time":3.5},{"x":0,"y":1.5708,"time":4},{"x":0,"y":1.5708,"time":4.5},{"x":0,"y":1.5708,"time":5},{"x":0,"y":1.5708,"time":5.5},{"x":0,"y":1.5708,"time":6},{"x":0,"y":1.5708,"time":6.5},{"x":0,"y":1.5708,"time":7},{"x":0,"y":1.5708,"time":7.5},{"x":0,"y":1.5708,"time":8},{"x":0,"y":1.5708,"time":8.5},{"x":0,"y":1.5708,"time":9},{"x":0,"y":1.5708,"time":9.5},{"x":0,"y":1.5708,"time":10},{"x":0,"y":1.5708,"time":10.5},{"x":0,"y":1.5708,"time":11},{"x":0,"y":1.5708,"time":11.5},{"x":0,"y":1.5708,"time":12},{"x":0,"y":1.5708,"time":12.5},{"x":0,"y":1.5708,"time":13},{"x":0,"y":1.5708,"time":13.5},{"x":0,"y":1.5708,"time":14},{"x":0,"y":1.5708,"time":14.5},{"x":0,"y":1.5708,"time":15},{"x":0,"y":1.5708,"time":15.5},{"x":0,"y":1.5708,"time":16},{"x":0,"y":1.5708,"time":16.5},{"x":0,"y":1.5708,"time":17},{"x":0,"y":1.5708,"time":17.5},{"x":0,"y":1.5708,"time":18},{"x":0,"y":1.5708,"time":18.5},{"x":0,"y":1.5708,"time":19},{"x":0,"y":1.5708,"time":19.5},{"x":0,"y":1.5708,"time":20},{"x":0,"y":1.5708,"time":20.5},{"x":0,"y":1.5708,"time":21},{"x":0,"y":1.5708,"time":21.5},{"x":0,"y":1.5708,"time":22},{"x":0,"y":1.5708,"time":22.5},{"x":0,"y":1.5708,"time":23},{"x":0,"y":1.5708,"time":23.5},{"x":0,"y":1.5708,"time":24},{"x":0,"y":1.5708,"time":24.5},{"x":0,"y":1.5708,"time":25},{"x":0,"y":1.5708,"time":25.5},{"x":0,"y":1.5708,"time":26},{"x":0,"y":1.5708,"time":26.5},{"x":0,"y":1.5708,"time":27},{"x":0,"y":1.5708,"time":27.5},{"x":0,"y":1.5708,"time":28},{"x":0,"y":1.5708,"time":28.5}],"seeked":false,"device_type":"desktop","operating_system":"Windows","browser":"Chrome","user_agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.71 Safari/537.36","device":"Web Browser","platform":"Web","uuid":"ada236b6-0786-4dd9-8a89-ecdb1e4e2b31","timestamp":"2016-10-26T21:39:14-04:00","ip_address":"112.171.126.75","env":"production"}
// `


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
        this.destroyOutput()
      } else {
        this.parseJsInput(filter)
      }
    })
  }

  parseJsInput(filter) {
    let sandbox = {
      x: this.data,
      result: null
    }
    let code = `result = x${filter}`
    try {
      new vm.Script(code).runInNewContext(sandbox)
      this.jqView = new JSONView(sandbox.result, this.jqOutput)
      this.jqIndicator.css('color', 'green')
    } catch (e) {
      this.jqIndicator.css('color', 'gray')
      this.parseJqInput(filter)
    }
  }

  parseJqInput(filter) {
    jq.run(filter, this.data, {
      input: 'json',
      output: 'json'
    }).then(output => {
      this.jqView = new JSONView(output, this.jqOutput)
      this.jqIndicator.text('jq').css('color', 'green')
    }).catch(e => {
      this.jqIndicator.text('js').css('color', 'gray')
        // this.parseJsInput(filter)
    });
  }

  destroyOutput() {
    if (this.jqView) {
      this.jqView.destroy()
    }
    this.jqIndicator.css('color', 'gray')
    this.jqIndicator.text('jq')
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
