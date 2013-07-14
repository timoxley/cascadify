"use strict"

var test = require('tape')

var concat = require('concat-stream')
var fs = require('fs')

var cascadify = require('../')()

test('bundling multple css files', function(t) {
  t.plan(1)
  cascadify.add(__dirname + '/multiple/index.js')
  cascadify.bundle().pipe(concat(function(data) {
    var aCSS = fs.readFileSync(__dirname + '/node_modules/multiple/style.css', 'utf8')
    var bCSS = fs.readFileSync(__dirname + '/node_modules/multiple/another_style.css', 'utf8')
    t.equal(data, aCSS + bCSS)
  }))
})

