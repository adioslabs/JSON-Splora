'use strict'

/**
 * pretty-json.js
 *
 * taken from https://github.com/warfares/pretty-json and modified to be an ES6 module
 */

const EventEmitter = require('events').EventEmitter;
const Backbone = require('backbone');
const _ = require('underscore');
const $ = require('jquery');

const PrettyJSON = {
  view: {},
  tpl: {}
};

const closeKey = '<span class="open-bracket">...</span>';
const nullValue = 'null';

const NodeHTML = `
<span class="node-container">
  <span class="node-top node-bracket" />
    <span class="node-content-wrapper">
      <ul class="node-body" />
    </span>
    <span class="node-down node-bracket" /></span>
`;

const LeafHTML = `
<span class="leaf-container">
  <span class="<%= type %>"><%-data%></span><span><%=coma %></span>
</span>
`;

const NodeView = Backbone.View.extend({
  tagName: 'span',
  data: null,
  level: 1,
  path: '',
  type: '',
  size: 0,
  isLast: true,
  rendered: false,
  events: {
    'click .node-bracket': 'collapse',
    'mouseover .node-container': 'mouseover',
    'mouseout .node-container': 'mouseout'
  },
  initialize: function(opt) {
    this.options = opt;
    this.data = this.options.data;
    this.level = this.options.level || this.level;
    this.path = this.options.path;
    this.isLast = _.isUndefined(this.options.isLast) ? this.isLast : this.options.isLast;
    this.dateFormat = this.options.dateFormat;
    var m = this.getMeta();
    this.type = m.type;
    this.size = m.size;
    this.childs = [];
    this.render();
    if (this.level == 1)
      this.show();
  },
  getMeta: function() {
    var val = {
      size: _.size(this.data),
      type: _.isArray(this.data) ? 'array' : 'object',
    };
    return val;
  },
  elements: function() {
    this.els = {
      container: $(this.el).find('.node-container'),
      contentWrapper: $(this.el).find('.node-content-wrapper'),
      top: $(this.el).find('.node-top'),
      ul: $(this.el).find('.node-body'),
      down: $(this.el).find('.node-down')
    };
  },
  render: function() {
    this.tpl = _.template(NodeHTML);
    $(this.el).html(this.tpl);
    this.elements();
    var b = this.getBrackets();
    this.els.top.html(b.top);
    this.els.down.html(b.bottom);
    this.hide();
    return this;
  },
  renderChilds: function() {
    var count = 1;
    _.each(this.data, function(val, key) {
      var isLast = (count == this.size);
      count = count + 1;
      var path = (this.type == 'array') ? this.path + '[' + key + ']' : this.path + '.' + key;
      var opt = {
        key: key,
        data: val,
        parent: this,
        path: path,
        level: this.level + 1,
        dateFormat: this.dateFormat,
        isLast: isLast
      };
      var child = (isObject(val) || _.isArray(val)) ? new NodeView(opt) : new LeafView(opt);
      child.on('mouseover', function(e, path) {
        this.trigger("mouseover", e, path);
      }, this);
      child.on('mouseout', function(e) {
        this.trigger("mouseout", e);
      }, this);
      var li = $('<li/>');
      var colom = '&nbsp;:&nbsp;';
      var left = $('<span />');
      var right = $('<span />').append(child.el);
      (this.type == 'array') ? left.html(''): left.html(key + colom);
      left.append(right);
      li.append(left);
      this.els.ul.append(li);
      child.parent = this;
      this.childs.push(child);
    }, this);
  },
  isVisible: function() {
    return this.els.contentWrapper.is(":visible");
  },
  collapse: function(e) {
    e.stopPropagation();
    this.isVisible() ? this.hide() : this.show();
    this.trigger("collapse", e);
  },
  show: function() {
    if (!this.rendered) {
      this.renderChilds();
      this.rendered = true;
    }
    this.els.top.html(this.getBrackets().top);
    this.els.contentWrapper.show();
    this.els.down.show();
  },
  hide: function() {
    var b = this.getBrackets();
    this.els.top.html(b.close);
    this.els.contentWrapper.hide();
    this.els.down.hide();
  },
  getBrackets: function() {
    var v = {
      top: '{',
      bottom: '}',
      close: '{ ' + closeKey + ' }'
    };
    if (this.type == 'array') {
      v = {
        top: '[',
        bottom: ']',
        close: '[ ' + closeKey + ' ]'
      };
    };
    v.bottom = (this.isLast) ? v.bottom : v.bottom + ',';
    v.close = (this.isLast) ? v.close : v.close + ',';
    return v;
  },
  mouseover: function(e) {
    e.stopPropagation();
    this.trigger("mouseover", e, this.path);
  },
  mouseout: function(e) {
    e.stopPropagation();
    this.trigger("mouseout", e);
  },
  expandAll: function() {
    _.each(this.childs, function(child) {
      if (child instanceof NodeView) {
        child.show();
        child.expandAll();
      }
    }, this);
    this.show();
  },
  collapseAll: function() {
    _.each(this.childs, function(child) {
      if (child instanceof NodeView) {
        child.hide();
        child.collapseAll();
      }
    }, this);
    if (this.level != 1)
      this.hide();
  }
});

const LeafView = Backbone.View.extend({
  tagName: 'span',
  data: null,
  level: 0,
  path: '',
  type: 'string',
  isLast: true,
  events: {
    "mouseover .leaf-container": "mouseover",
    "mouseout .leaf-container": "mouseout"
  },
  initialize: function(opt) {
    this.options = opt;
    this.data = this.options.data;
    this.level = this.options.level;
    this.path = this.options.path;
    this.type = this.getType();
    this.dateFormat = this.options.dateFormat;
    this.isLast = _.isUndefined(this.options.isLast) ? this.isLast : this.options.isLast;
    this.render();
  },
  getType: function() {
    var m = 'string';
    var d = this.data;
    if (_.isNumber(d)) m = 'number';
    else if (_.isBoolean(d)) m = 'boolean';
    else if (_.isDate(d)) m = 'date';
    else if (_.isNull(d)) m = 'null'
    return m;
  },
  getState: function() {
    var coma = this.isLast ? '' : ',';
    var state = {
      data: this.data,
      level: this.level,
      path: this.path,
      type: this.type,
      coma: coma
    };
    return state;
  },
  render: function() {
    var state = this.getState();
    if (state.type == 'date' && this.dateFormat) {
      state.data = dateFormat(this.data, this.dateFormat);
    }
    if (state.type == 'null') {
      state.data = nullValue;
    }
    if (state.type == 'string') {
      state.data = (state.data == '') ? '""' : '"' + state.data + '"';
    }
    this.tpl = _.template(LeafHTML);
    $(this.el).html(this.tpl(state));
    return this;
  },
  mouseover: function(e) {
    e.stopPropagation();
    var path = this.path + '&nbsp;:&nbsp;<span class="' + this.type + '"><b>' + this.data + '</b></span>';
    this.trigger("mouseover", e, path);
  },
  mouseout: function(e) {
    e.stopPropagation();
    this.trigger("mouseout", e);
  }
});

function dateFormat(date, f) {
  f = f.replace('YYYY', date.getFullYear());
  f = f.replace('YY', String(date.getFullYear()).slice(-2));
  f = f.replace('MM', pad(date.getMonth() + 1, 2));
  f = f.replace('DD', pad(date.getDate(), 2));
  f = f.replace('HH24', pad(date.getHours(), 2));
  f = f.replace('HH', pad((date.getHours() % 12), 2));
  f = f.replace('MI', pad(date.getMinutes(), 2));
  f = f.replace('SS', pad(date.getSeconds(), 2));
  return f;
}

function isObject(v) {
  return Object.prototype.toString.call(v) === '[object Object]';
}

function pad(str, length) {
  str = String(str);
  while (str.length < length) str = '0' + str;
  return str;
}

module.exports = NodeView;
