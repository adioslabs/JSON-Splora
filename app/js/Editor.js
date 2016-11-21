/**
 * CodeMirror editor wrapper class
 */

'use strict'

/**
 * Dependencies
 */

const formatJSON = require('js-beautify').js_beautify
const json5 = require('json5')
const jq = require('node-jq')
const vm = require('vm')


/**
 * Wrapper class for json editor
 */

class Editor {

  constructor() {
    this.messageBox = document.querySelector('.message')
    this.lastFormatted = 0
    this.lastChanged = 0

    // CodeMirror is exposed in /index.html
    this.editor = CodeMirror.fromTextArea(document.querySelector('.json-input'), {
      gutters: ["CodeMirror-lint-markers"],
      lineNumbers: true,
      smartIndent: true,
      autofocus: true,
      extraKeys: {
        Tab: false
      },
      mode: 'application/javascript',
      lint: true
    })

    // CodeMirror readonly filter output
    this.output = CodeMirror.fromTextArea(document.querySelector('.filter-output'), {
      lineNumbers: true,
      smartIndent: true,
      readOnly: true,
      mode: 'application/javascript',
      lint: true
    })

    // this.editor.setOption("lint", true)
    this.editor.on('change', e => this.onChange(e))

    // Pass the jq filter on to the parse function
    $('.jq-input').on('keyup', e => {
      let filter = $(e.target).val()
      this.parseInput(filter)
    })
  }

  /**
   * Fires when a change is registered in the editor
   *
   * @param {Object} e The editor change object
   */

  onChange(e) {
    let input = this.editor.getValue()
    this.parseJSON(input)
    this.lastChanged = now()
  }

  /**
   * Forats the code in the editor
   */

  formatInput() {
    console.log('formatting')
    let input = this.editor.getValue()
    let json = formatJSON(input, {
      indent_size: 2
    })
    this.editor.setValue(json)
    this.lastFormatted = now()
  }


  /**
   * Handle input
   *
   * @param {String} input
   */

  parseJSON(input) {
    try {
      this.data = json5.parse(input)
      this.message('valid json')
      let time = now()
      if (time - this.lastFormatted > 1 && time - this.lastChanged > 1) {
        this.formatInput()
      }
    } catch (e) {
      this.message('invalid')
    }
  }

  /**
   * Parse raw input as JavaScript first, then JQ
   *
   * @param {String} filter
   */

  parseInput(filter) {
    console.log('parse input', filter)
    let sandbox = {
      x: this.data,
      result: null
    }
    let code = `result = x${filter}`

    // Try to run through JavaScript vm
    try {
      new vm.Script(code).runInNewContext(sandbox)
      this.showOutput(sandbox.result)
    } catch (e) {

      console.log('javascript vm failed')

      // try jq filter
      jq.run(filter, this.data, {
        input: 'json',
        output: 'json'
      }).then(result => {
        this.showOutput(result)
      }).catch(e => {
        console.log('error', e.stack || e)
      });
    }
  }

  showOutput(value) {
    console.log('output', value)
    let input = JSON.stringify(value)
    let output = formatJSON(input, {
      keep_array_indentation: false,
      indent_size: 2
    })
    this.output.setValue(output)
  }

  /**
   * Write a message to the application message bar
   */

  message(message) {
    this.messageBox.innerHTML = message
  }
}

function now() {
  return new Date().getTime() / 1000
}

/**
 * Exports
 */

module.exports = Editor
