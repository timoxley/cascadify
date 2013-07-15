"use strict"

var test = require('tape')

var concat = require('concat-stream')
var fs = require('fs')

var Cascadify = require('../')
var cascadify = Cascadify()
var h = Cascadify.addHeader
test('bundling nested css files', function(t) {
  t.plan(1)
  cascadify.add(__dirname + '/nested/index.js')
  cascadify.bundle()
  .pipe(concat(function(data) {
    var nestedCSSFile = __dirname + '/node_modules/nested/style.css'
    var multiCSS1File = __dirname + '/node_modules/multiple/style.css'
    var multiCSS2File = __dirname + '/node_modules/multiple/another_style.css'
    var singleCSSFile = __dirname + '/node_modules/simple/style.css'
    var nestedCSSData = fs.readFileSync(nestedCSSFile, 'utf8')
    var multiCSS1Data = fs.readFileSync(multiCSS1File, 'utf8')
    var multiCSS2Data = fs.readFileSync(multiCSS2File, 'utf8')
    var singleCSSData = fs.readFileSync(singleCSSFile, 'utf8')
    t.equal(data,
            h(singleCSSFile, singleCSSData) +
            h(multiCSS1File, multiCSS1Data) +
            h(multiCSS2File, multiCSS2Data) +
            h(nestedCSSFile, nestedCSSData))
  }))
})


