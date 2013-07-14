"use strict"

var test = require('tape')
var exec = require('child_process').exec
var concat = require('concat-stream')

var expected = new Error('no')

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
  t.plan(3)
  exec(__dirname + '/../bin/cascadify ' +__dirname + '/multiple/index.js', function(err, stdout, stderr) {
    t.ifError(err)
    t.equal(stderr, '')
    t.equal(stdout, expected)
  })
})
