"use strict"

var test = require('tape')

var concat = require('concat-stream')
var fs = require('fs')

var stylify = require('../')()

test('bundling nested css files', function(t) {
  t.plan(1)
  stylify.add(__dirname + '/nested/index.js')
  stylify.bundle()
  .pipe(concat(function(data) {
    var nestedCSS = fs.readFileSync(__dirname + '/node_modules/nested/style.css', 'utf8')
    var multiCSS1 = fs.readFileSync(__dirname + '/node_modules/multiple/style.css', 'utf8')
    var multiCSS2 = fs.readFileSync(__dirname + '/node_modules/multiple/another_style.css', 'utf8')
    var singleCSS = fs.readFileSync(__dirname + '/node_modules/simple/style.css', 'utf8')
    t.equal(data,  singleCSS + multiCSS1 + multiCSS2 + nestedCSS)
  }))
})


