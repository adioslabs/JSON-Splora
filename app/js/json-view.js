'use strict'

const prettyJSON = require('./pretty-json')
const uuid = require('node-uuid')
const $ = require('jquery')

// types that can be coerced to string with String()
const booleanOutput = (x, uuid) => `<div class="boolean" data-output-id="${uuid}">${x}</div>`
const numberOutput = (x, uuid) => `<div class="number" data-output-id="${uuid}">${x}</div>`
const stringOutput = (x, uuid) => `<div class="string" data-output-id="${uuid}">"${x}"</div>`
const nullOutput = (uuid) => `<div class="null" data-output-id="${uuid}">null</div>`

class JSONView {

  constructor(data, el) {
    let id = uuid.v4()
    this.data = data
    if (data === null) {
      el.html(nullOutput(id))
    } else if ('string' == typeof data) {
      el.html(String(stringOutput(data, id)))
    } else if ('boolean' == typeof data) {
      el.html(String(booleanOutput(data, id)))
    } else if ('number' == typeof data) {
      el.html(String(numberOutput(data, id)))
    } else if ('undefined' == typeof data) {
      el.text('undefined')
    } else {
      console.log('id input', id)
      this.jsonView = new prettyJSON({
        data: data,
        uuid: id,
        el: el
      })
      this.jsonView.expandAll()
      this.setBracketEvents()
      this.uuid = id
    }
    this.view = $(`[data-output-id="${id}"]`)
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
    console.log('destroy', this.view)
    this.view.remove()
  }

}

module.exports = JSONView
