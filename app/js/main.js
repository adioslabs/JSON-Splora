'use strict'

const prettyJSON = require('./pretty-json')
const json5 = require('json5')
const jq = require('node-jq')
const fs = require('fs')
const $ = require('jquery')

class App {

  constructor(document) {
    this.outputContainer = $('.output-containers .json-output-container')
    this.outputContainers = $('.output-containers')
    this.messageWindow = $('.message-window')
    this.checkmark = $('.checkmark-container')
    this.bottomBar = $('.bottom-bar')
    this.dataInput = $('.data-input')
    this.jqOutput = $('.output-containers .jq-output-container')
    this.jqInput = $('.jq-input')
    this.output = $('.output')

    this.checkmark.hide()
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
      let filter = this.jqInput.val()
      jq.run(filter, this.data, {
        input: 'json',
        output: 'json'
      }).then(jqData => {
        this.jqData = jqData
        if (jqData && typeof jqData == 'object') {
          this.jqView = new prettyJSON({
            data: jqData,
            el: this.jqOutput
          })
          this.bottomBar.show()
          this.checkmark.show()
          this.jqView.expandAll()
        } else {
          if (jqData === null) {
            this.jqOutput.text('null')
          } else {
            this.jqOutput.text(String(jqData))
          }
          this.jqOutput.show()
          this.checkmark.show()
        }
      }).catch(e => {
        this.checkmark.hide()
        this.jqOutput.hide()
        console.log('error', e)
      });
    })
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
    this.view = new prettyJSON({
      data: this.data,
      el: this.output
    })

    this.dataInput.hide()
    this.view.expandAll()
    this.outputContainers.show()

    $('.node-bracket').each(function() {
      $(this).hover(function() {
        let uuid = $(this).data('uuid')
        $(`[data-uuid="${uuid}"]`).addClass('bracket-hover')
      })
    })

    $('.node-bracket').mouseleave(function() {
      $('.node-bracket').removeClass('bracket-hover')
    })

    $('.node-bracket').click(function(e) {
      if (!$(e.target).hasClass('node-bracket')) {
        $('.node-bracket').removeClass('bracket-hover')
      }
    })

    this.dataInput.hide()
    this.bottomBar.show()
  }

  collapseAll() {
    this.view.collapseAll()
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
