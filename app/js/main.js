'use strict'

const prettyJSON = require('./pretty-json')
const json5 = require('json5')
const jq = require('node-jq')
const fs = require('fs')
const $ = require('jquery')

class App {

  constructor(document) {
    this.outputContainer = $('.output-containers .json-output-container')
    this.jqOutput = $('.output-containers .jq-output-container')
    this.messageWindow = $('.message-window')
    this.objectInput = $('.object-input')
    this.dataInput = $('.data-input')
    this.checkmark = $('.checkmark')
    this.output = $('.output')

    this.checkmark.hide()

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
    this.objectInput.on('input', _ => {
      let filter = this.objectInput.val()
      jq.run(filter, this.data, {
        input: 'json',
        output: 'json'
      }).then(jqData => {
        this.jqData = jqData
        if (typeof jqData == 'object') {
          this.jqView = new prettyJSON({
            data: jqData,
            el: this.jqOutput
          })
          this.checkmark.show();
        } else {
          $('.jq-output-container').text(jqData)
        }
      }).catch(e => {
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
    this.objectInput.show()
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
