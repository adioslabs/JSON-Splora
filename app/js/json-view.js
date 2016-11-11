'use strict'

const prettyJSON = require('./pretty-json')
const uuid = require('node-uuid')
const $ = require('jquery')

class JSONView {

  constructor(data, el) {
    let id = uuid.v4()
    this.data = data
    this.id = id
    this.el = el
    if (data && 'object' == typeof data) {
      this.jsonView = new prettyJSON({
        data: data,
        uuid: id,
        el: el
      })
      this.jsonView.expandAll()
      this.setBracketEvents()
    } else if (data === null) {
      this.primitiveOutput('null', 'null')
    } else {
      this.primitiveOutput(typeof data, data)
    }
    this.view = $(`[data-output-id="${id}"]`)
  }

  primitiveOutput(type, data) {
    if (type == 'string') data = `"${data}"`
    this.el.html(`<div class="${type}" data-output-id="${this.id}">${data}</div>`)
  }

  setBracketEvents() {
    $('.node-bracket').each(function() {
      $(this).hover(function() {
        let id = $(this).data('bracket-id')
        $(`[data-bracket-id="${id}"]`).addClass('bracket-hover')
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
    this.view.remove()
  }

}

module.exports = JSONView
