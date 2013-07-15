"use strict"

var test = require('tape')

var concat = require('concat-stream')
var fs = require('fs')

var Cascadify = require('../')
var cascadify = Cascadify()

test('bundling single css file', function(t) {
  t.plan(1)
  cascadify.add(__dirname + '/simple/index.js')
  cascadify.bundle().pipe(concat(function(data) {
    var file = __dirname + '/node_modules/simple/style.css'
    var css = fs.readFileSync(file, 'utf8')
    t.equal(data, Cascadify.addHeader(file, css))
  }))
})
