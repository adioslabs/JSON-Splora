'use strict'

/**
 * Dependencies
 */

const uuid = require('node-uuid')
const _ = require('underscore')
const $ = require('jquery')

/**
 * Constants
 */

const closedKey = '<span class="open-bracket">...</span>'
const comma = '<span class="comma">,</span>'

/**
 * JSON View main class
 */

class JSONView {

  constructor(options) {
    this.data = options.data
    this.tpl = ''
    this.el = options.el
    new Node({
      data: this.data,
      id: uuid.v4(),
      el: this.el
    })
  }

  show(node) {
    $(this.el).html(node)
  }
}

/**
 * JSON Node view
 */

class Node {

  /**
   * Constructor
   */

  constructor(options) {
    this.level = options.level || 1
    this.data = options.data
    this.id = options.id
    this.el = options.el
    console.log(this.el)
    this.render()
  }

  /**
   * Render the JSON node
   */

  render() {

    // Output id is to destroy instance, so only used on the top level
    let outputId = ''
    if (this.level == 1) {
      outputId = `data-output-id="${this.id}"`
    }

    // This ID is used for matching brackets
    let bracketId = uuid.v4()

    // JSON node html
    this.html =
      `<span class="node-container" ${outputId}>
        <span class="node-top node-bracket" data-bracket-id="${bracketId}" />
          <span class="node-content-wrapper">
            <ul class="node-body" />
          </cspan>
          <span class="node-down node-bracket" data-bracket-id="${bracketId}" /></span>`

    console.log(this.el)
    this.el.html(this.html)

    // Easily access elements
    this.elements = {
      contentWrapper: $(this.el).find('.node-content-wrapper'),
      container: $(this.el).find('.node-container'),
      down: $(this.el).find('.node-down'),
      top: $(this.el).find('.node-top'),
      ul: $(this.el).find('.node-body')
    };
  }

  /**
   * Get the brackets for the given view
   */

  brackets() {
    let bottom = 'array' == this.type ? ']' : '}'
    let top = 'array' == this.type ? '[' : '{'
    let b = {
      bottom: bottom,
      close: `${top}${closedKey}${bottom}}`,
      top: top
    }
  }
}

class Leaf {
  constructor() {

  }
}

function getType(d) {
  let m = 'string';
  if (_.isNumber(d)) m = 'number';
  else if (_.isBoolean(d)) m = 'boolean';
  else if (_.isDate(d)) m = 'date';
  else if (_.isNull(d)) m = 'null'
  return m;
}

/**
 * Exports
 */

module.exports = JSONView
