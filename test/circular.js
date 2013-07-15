"use strict"

var test = require('tape')

var concat = require('concat-stream')
var fs = require('fs')

var Cascadify = require('../')
var cascadify = Cascadify()

test('bundling circular dependencies css files', function(t) {
  t.plan(1)
  cascadify.add(__dirname + '/circular/index.js')
  cascadify.bundle().pipe(concat(function(data) {
    var aFile = __dirname + '/node_modules/circular-a/style.css'
    var bFile = __dirname + '/node_modules/circular-b/style.css'
    var aCSS = fs.readFileSync(aFile, 'utf8')
    var bCSS = fs.readFileSync(bFile, 'utf8')
    t.equal(data, Cascadify.addHeader(bFile, bCSS) + Cascadify.addHeader(aFile, aCSS))
  }))
})


