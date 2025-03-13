'use strict';

var yasuo = require("./script/yasuo");

function load() {
  yasuo.load();
}

function unload() {
  yasuo.unload();
}

var messages = {
  'open'() {
    Editor.Panel.open('nicoluss-tool');
  },
  'shrink-builded'() {
    yasuo.setCompressMode(1);
  },
  'unshrink-builded'() {
    yasuo.setCompressMode(0);
  }
};

module.exports.load = load;
module.exports.unload = unload;
module.exports.messages = messages;