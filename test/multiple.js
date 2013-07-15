"use strict"

var test = require('tape')

var concat = require('concat-stream')
var fs = require('fs')

var Cascadify = require('../')
var cascadify = Cascadify()

test('bundling multple css files', function(t) {
  t.plan(1)
  cascadify.add(__dirname + '/multiple/index.js')
  cascadify.bundle().pipe(concat(function(data) {
    var aFile = __dirname + '/node_modules/multiple/style.css'
    var bFile = __dirname + '/node_modules/multiple/another_style.css'
    var aCSS = fs.readFileSync(aFile, 'utf8')
    var bCSS = fs.readFileSync(bFile, 'utf8')
    t.equal(data, Cascadify.addHeader(aFile, aCSS) + Cascadify.addHeader(bFile, bCSS))
  }))
})

