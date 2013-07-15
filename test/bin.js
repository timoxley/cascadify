"use strict"

var test = require('tape')
var exec = require('child_process').exec
var concat = require('concat-stream')

var expected = new Error('no')
var pkg = require('../package.json')
var path = require('path')
var BIN = path.resolve(__dirname + '/../', pkg.bin[pkg.name])
console.log(BIN)

test('setup', function(t) {
  t.plan(1)
  var cascadify = require('../')()
  cascadify.add(__dirname + '/multiple/index.js')
  cascadify.bundle().pipe(concat(function(data) {
    t.ok(data)
    expected = data
  }))
})

test('writes bundled css to stdout', function(t) {
  t.plan(2)
  exec(BIN + ' ' + __dirname + '/multiple/index.js', function(err, stdout, stderr) {
    t.ifError(err)
    t.equal(stdout, expected)
  })
})
