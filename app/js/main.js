'use strict'

const prettyJSON = require('./pretty-json')
const json5 = require('json5')
const jq = require('node-jq')
const fs = require('fs')
const $ = require('jquery')

class App {

  constructor(document) {
    this.outputContainer = $('#output-container')
    this.messageWindow = $('#message-window')
    this.objectInput = $('#object-input')
    this.dataInput = $('#data-input')
    this.output = $('#output')

    // drag over event file
    document.ondragover = document.ondrop = e => {
      e.preventDefault()
    }

    // drop event
    document.body.ondrop = e => {
      e.preventDefault()
      let path = e.dataTransfer.files[0].path
      this.show(fs.readFileSync(path).toString())
    }

    // text input
    this.dataInput.on('input', _ => {
      this.show(this.dataInput.val().trim())
    })

    // mess with data object
    this.objectInput.on('input', _ => {
      let filter = this.objectInput.val()
      jq.run(filter, this.data, {
        input: 'json',
        output: 'json'
      }).then(output => {
        console.log('output', output)
      }).catch(e => {
        console.log('error', e)
      });
    })
  }

  /**
   * Handle input text
   */

  show(text) {
    try {
      this.data = json5.parse(text)
    } catch (e) {
      this.output.remove()
      this.message('Inalid JSON')
      return
    }
    this.outputContainer.append('<div id="output"></div>')
    this.output = $('#output')
    this.view = new prettyJSON({
      data: this.data,
      el: this.output
    })

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
