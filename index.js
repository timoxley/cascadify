"use strict"

var fs = require('fs')

var browserify = require('browserify')
var through = require('through')
var path = require('path')
var moduleDeps = require('module-deps')
var concat = require('concat-stream')
var map = require('map-stream')

module.exports = Stylify

function Stylify() {
  if (!(this instanceof Stylify)) return new Stylify()
  this.files = []
  this.browserify = browserify()
}

Stylify.prototype.add = function add(file) {
  this.browserify.add(file)
}

Stylify.prototype.require = function require(mod) {
  this.browserify.require(mod)
}

Stylify.prototype.bundle = function() {
  var tr = through();
  tr.pause()

  var pkgs = {}
  var stylesheets = []
  var b = this.browserify

  b.on('package', function(file, pkg) {
    pkgs[file] = pkg
  })

  b.on('dep', function(dep) {
    tr.queue(dep)
  })

  b.bundle(function() {
    tr.resume()
    tr.end()
  })

  return tr
  .pipe(sort())
  .pipe(extractStylesheets(pkgs))
  .pipe(readFiles())
  .pipe(through())

}

function extractStylesheets(pkgs) {
  return through(function(dep) {
    var tr = this
    var pkg = pkgs[dep.id]
    if (!(pkg && pkg.styles)) return
    var file = dep.id
    pkg.styles.map(function(style) {
      tr.push(path.join(path.dirname(file), style))
    })
  })
}

function readFiles() {
  return map(function(file, next) {
    fs.createReadStream(file, {encoding: 'utf8'}).pipe(concat(function(data) {
      next(null, data)
    }))
  })
}

function sort() {

  var deps = {};
  return through(write, end);

  function write(dep) {
    deps[dep.id] = dep
  }

  function end () {
    var tr = this;



    var root = Object.keys(deps).filter(function(id) {
      return deps[id].entry
    })

    var sortedDependencies = sortDeps(deps[root])
    sortedDependencies.filter(function(a, aIndex) {
      return !(sortedDependencies.some(function(b, bIndex) {
        return a.id === b.id && aIndex < bIndex
      }))
    }).forEach(function(dep) {
      tr.queue(dep)
    })
    tr.push(null);
  }

  function sortDeps(dep) {
    if (typeof dep != 'object') return []
    sortDeps.sorted = sortDeps.sorted || {}
    if (sortDeps.sorted[dep.id]) return []
    else sortDeps.sorted[dep.id] = true

    var results = []
    Object.keys(dep.deps).map(function(id) {
      results = results.concat(sortDeps(deps[dep.deps[id]]))
    })
    results.push(dep)
    return results
  }

  function cmp (a, b) {
    return a.id < b.id ? -1 : 1;
  }
};
