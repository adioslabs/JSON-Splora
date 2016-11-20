/**
 * CodeMirror editor wrapper class
 */

'use strict'

/**
 * Dependencies
 */

const json5 = require('json5')
const jq = require('node-jq')
const vm = require('vm')


/**
 * Wrapper class for json editor
 */

class Editor {

  constructor() {
    let textArea = document.querySelector('.codemirror')

    // CodeMirror is exposed in /index.html
    this.cm = CodeMirror.fromTextArea(textArea, {
      gutters: ["CodeMirror-lint-markers"],
      lineNumbers: true,
      smartIndent: true,
      autofocus: true,
      mode: 'application/json',
      lint: true
    })

    this.cm.setOption("lint", true);
    this.cm.on('change', this.onChange)
  }

  onChange(e) {
    console.log('onchange', e)
  }

  /**
   * Handle input
   *
   * @param {String} input
   */

  onInput(input) {
    try {
      this.data = json5.parse(input)
    } catch (e) {
      return
    }
  }

  /**
   * Parse raw input as JavaScript first, then JQ
   *
   * @param {String} filter
   */

  parseInput(filter) {
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
      jq.run(filter, this.data, {
        input: 'json',
        output: 'json'
      }).then(output => {
        this.jqView = new JSONView(output, this.jqOutput)
        this.jqIndicator.text('jq').css('color', 'green')
      }).catch(e => {
        this.jqIndicator.text('js').css('color', 'gray')
      });
    }
  }
}

/**
 * Exports
 */

module.exports = Editor
