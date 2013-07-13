"use strict"

var test = require('tape')

var concat = require('concat-stream')
var fs = require('fs')

var stylify = require('../')()

test('bundling single css file', function(t) {
  t.plan(1)
  stylify.add(__dirname + '/simple/index.js')
  stylify.bundle().pipe(concat(function(data) {
    var targetCSS = fs.readFileSync(__dirname + '/node_modules/simple/style.css', 'utf8')
    t.equal(data, targetCSS)
  }))
})
