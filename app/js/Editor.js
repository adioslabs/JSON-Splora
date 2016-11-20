/**
 * CodeMirror editor wrapper class
 */

'use strict'

/**
 * Dependencies
 */

const format = require('js-beautify').js_beautify
const json5 = require('json5')
const jq = require('node-jq')
const vm = require('vm')


/**
 * Wrapper class for json editor
 */

class Editor {

  constructor() {
    this.lastFormatted = 0
    this.lastChanged = 0
    let textArea = document.querySelector('.codemirror')
      // CodeMirror is exposed in /index.html
    this.editor = CodeMirror.fromTextArea(textArea, {
      gutters: ["CodeMirror-lint-markers"],
      lineNumbers: true,
      smartIndent: true,
      autofocus: true,
      mode: 'application/json',
      lint: true
    })

    // this.editor.setOption("lint", true)
    this.editor.on('change', e => this.onChange(e))
  }

  /**
   * Fires when a change is registered in the editor
   *
   * @param {Object} e The editor change object
   */

  onChange(e) {
    let input = this.editor.getValue()
    this.parse(input)
    this.lastChanged = now()
  }

  /**
   * Forats the code in the editor
   */

  format() {
    console.log('formatting')
    let input = this.editor.getValue()
    let json = format(input, {
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

  parse(input) {
    try {
      this.data = json5.parse(input)
      console.log('valid')
      let time = now()
      if (time - this.lastFormatted > 1 && time - this.lastChanged > 1) {
        this.format()
      }
    } catch (e) {
      console.log('invalid')
    }
  }

  /**
   * Parse raw input as JavaScript first, then JQ
   *
   * @param {String} filter
   */

  parseInput(filter) {
    // let sandbox = {
    //   x: this.data,
    //   result: null
    // }
    // let code = `result = x${filter}`
    // try {
    //   new vm.Script(code).runInNewContext(sandbox)
    //   this.jqView = new JSONView(sandbox.result, this.jqOutput)
    //   this.jqIndicator.css('color', 'green')
    // } catch (e) {
    //   this.jqIndicator.css('color', 'gray')
    //   jq.run(filter, this.data, {
    //     input: 'json',
    //     output: 'json'
    //   }).then(output => {
    //     this.jqView = new JSONView(output, this.jqOutput)
    //     this.jqIndicator.text('jq').css('color', 'green')
    //   }).catch(e => {
    //     this.jqIndicator.text('js').css('color', 'gray')
    //   });
    // }
  }
}

function now() {
  return new Date().getTime() / 1000
}

/**
 * Exports
 */

module.exports = Editor
