'use strict'

const JSONObject = require('./json');
const $ = require('jquery');
const fs = require('fs');

let mainWindow = $('main');

$('textarea').on('focus', _ => {
  $('textarea').val('');
});

document.ondragover = document.ondrop = (ev) => {
  ev.preventDefault();
};

document.body.ondrop = (ev) => {
  ev.preventDefault();
  let path = ev.dataTransfer.files[0].path;
  let text = fs.readFileSync(path).toString();
  let el = $('#main');
  new JSONObject(text, el);
  JSONObject.on('err', message => {
    console.log('here');
    $('#message-window').text(message);
  });
};
