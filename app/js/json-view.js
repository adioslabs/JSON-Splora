'use strict'

const prettyJSON = require('./pretty-json')
const $ = require('jquery')

// types that can be coerced to string with String()
const stringableTypes = ['boolean', 'undefined', 'number', 'string']

const booleanOutput = x => `<span class="boolean">${x}</span>`
const stringOutput = x => `<span class="string">"${x}"</span>`
const nullOutput = x => `<span class="null">null</span>`

class JSONView {

  constructor(data, $element) {
    this.view = $element
    this.data = data
    if (data === null) {
      $element.html(nullOutput())
    } else if ('string' == typeof data) {
      $element.html(String(stringOutput(data)))
    } else if ('boolean' == typeof data) {
      $element.html(String(booleanOutput(data)))
    } else if (stringableTypes.indexOf(typeof data) > -1) {
      $element.text(String(data))
    } else {
      this.view = new prettyJSON({
        data: data,
        el: $element
      })
      this.view.expandAll()
      this.setBracketEvents()
    }
  }

  setBracketEvents() {
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
  }

  destroy() {
    console.log('view', this.view)
    this.view.remove()
  }

}

module.exports = JSONView
