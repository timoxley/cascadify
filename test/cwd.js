"use strict"

var test = require('tape')
var exec = require('child_process').exec
var concat = require('concat-stream')

var expected = new Error('no')
var pkg = require('../package.json')
var fs = require('fs')
var path = require('path')
var BIN = path.resolve(__dirname + '/../', pkg.bin[pkg.name])

test('writes bundled css to stdout', function(t) {
  var expected = fs.readFileSync(__dirname + '/cwd/style.css', {encoding:'utf8'})
  expected += fs.readFileSync(__dirname + '/node_modules/simple/style.css', {encoding:'utf8'})
  t.plan(2)
  exec(BIN, {cwd: __dirname + '/inner'}, function(err, stdout, stderr) {
    t.ifError(err)
    console.log(stderr)
    t.equal(stdout, expected)
  })
})
