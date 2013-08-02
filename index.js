"use strict"

var fs = require('fs')
var path = require('path')

var through = require('through')
var concat = require('concat-stream')
var map = require('map-stream')
var parents = require('parents');

var browserify = require('browserify')

var log = require('debug')(require('./package.json').name)
var debug = require('debug')(require('./package.json').name + ' debug')

module.exports = Cascadify

/**
 * Create new Cascadify instance.
 */

function Cascadify() {
  if (!(this instanceof Cascadify)) return new Cascadify()
  this.files = []
  this.browserify = browserify()
}

/**
 * Add files for bundling.
 *
 * @param {String} file full path to file
 */

Cascadify.prototype.add = function add(file) {
  debug('adding %s', file)
  this.browserify.add(file)
}

/**
 * Create a CSS bundle.
 *
 * @return {Stream} Stream of bundled CSS
 */

Cascadify.prototype.bundle = function() {
  debug('bundling...')
  var tr = through();
  tr.pause()

  var pkgs = {}
  var stylesheets = []
  var b = this.browserify

  b.on('package', function(file, pkg) {
    var dirs = parents(path.dirname(file));
    (function next () {
      var dir = dirs.shift();
      if (dir === undefined) return;
      var pkgfile = path.join(dir, 'package.json');
      if (pkgs[file]) return;
      fs.readFile(pkgfile, function (err, src) {
        if (err) return next();
        try { var pkg = JSON.parse(src) }
        catch (e) {}
        pkg._pkgfile = pkgfile;
        pkgs[file] = pkg;
      });
    })();
  })

  b.on('dep', function(dep) {
    tr.queue(dep)
  })

  b.bundle(function() {
    debug('bundle complete.')
    tr.resume()
    tr.end()
  })

  return tr
  .pipe(sort())
  .pipe(extractStylesheets(pkgs))
  .pipe(readFiles())
  .pipe(through())

}

/**
 * Get a stream of absolute stylesheet filenames from packages
 *
 * @return {Stream}
 * @api private
 */

function extractStylesheets(pkgs) {
  return through(function(dep) {
    var tr = this
    var pkg = pkgs[dep.id]
    if (!(pkg && pkg.styles)) return
    debug('extracting styles from %s', pkg._pkgfile)
    pkg.styles.map(function(style) {
      var styleFile = path.join(path.dirname(pkg._pkgfile), style)
      debug('style %s', styleFile)
      tr.push(styleFile)
    })
  })
}

/**
 * Pipe a stream of filenames in, get stream of all contents out.
 *
 * @return {Stream}
 * @api private
 */

function readFiles() {
  return map(function(file, next) {
    debug('reading file... %s', file)
    fs.createReadStream(file, {encoding: 'utf8'}).pipe(concat(function(data) {
      debug('read file. %s', file)
      next(null, Cascadify.addHeader(file, data))
    }))
  })
}

/**
 * Default header between concatenated files.
 * e.g. "Cascadify:  relative/path/to/file.css"
 *
 * @param {String} file path to file
 * @param {String} data content of file
 * @return {String}
 * @api public
 */

Cascadify.addHeader = function(file, data) {
  file = path.relative(process.cwd(), file)
  return '\n\n/* Cascadify: '+file+' */\n\n' + data
}

/**
 * Pipe dependencies in, get stream of dependencies sorted in
 * appropriate order based on package dependents.
 *
 * @return {Stream}
 * @api private
 */

function sort() {
  var deps = {};
  return through(write, end);

  function write(dep) {
    deps[dep.id] = dep
  }

  function end() {
    // sort keys so results predictable
    var keys = Object.keys(deps).sort()
    var sortedDeps = {}
    keys.forEach(function(key) {
      sortedDeps[key] = deps[key]
    })
    deps = sortedDeps

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
      debug('dependency %s', dep.id, Object.keys(dep.deps))
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
}
