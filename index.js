'use strict';

var path = require('path');
var fs = require('fs');

//
// Holy grail of hacks, and Node.js internal abuse right here:
//
// We want to delete our self from the Node.js cache so each file that depend
// on us will re-require this file and set the correct `module.parent`
// reference that allows us to track the directories in which we should search
// for either the configuration file, or a package.json that matches.
//
// This makes the assumption that __filename in Node.js is always the absolute
// path to the current file (this file) and that `require.cache` is set, and
// deletable when the module is executing.
//
// Please note this is not a full cache delete, we just want this code to be
// re-evaluated every single time a require("dotfig") is called.
//
var parent = module.parent && module.parent.filename || process.cwd();
delete require.cache[__filename];

/**
 * Parse the configuration file.
 *
 * @param {String} file Location of the file.
 * @returns {Object} Configuration.
 * @public
 */
function parse(file) {
  var str = fs.readFileSync(file, 'utf-8');

  //
  // Remove possible UTB-8 Byte Order Marker (BOM) from the file before parsing.
  //
  if (str.charCodeAt(0) === 0xFEFF) str = data.slice(1);

  try { return JSON.parse(str); }
  catch (e) { return null; }
}

/**
 * Actual function that tries to resolve a given directory in search
 * of a given what ever triggers the iterator to return a value.
 *
 * @param {String} root Directory that we need to search in.
 * @param {Function} iterator Function that is called on each directory level.
 * @returns {Mixed} Null incase of nothing, anthing else incase of result.
 * @private
 */
function resolve(root, iterator) {
  /**
   * The actual function that does the iteration of the directory and
   * searches for the correct file. It traverses the parent directory
   * until it reaches the root directory.
   *
   * @private
   */
  return (function next() {
    if (root.match(/^(\w:\\|\/)$/) || root == path.sep) return null;

    var data = iterator(root);
    if (data) return data;

    root = path.resolve(root, '..');

    //
    // No suitable match found, continue with the iteration until we've found
    // something fruitful.
    //
    return next();
  }());
}

/**
 * Extract the configuration from a given dotfile or package.json property.
 *
 * Options:
 * - name: Name of the file / property where the config can be stored
 * - filename: Custom filename for the configuration instead of .${name}rc.
 * - root: Starting directory that we traverse for config files.
 * - alias: Array of additional names that we can check in the package.json
 *   in case people make spelling mistakes etc.
 *
 * @param {String|Object} options Name of the configuration file, or options.
 * @returns {Object|Null} Configuration.
 * @public
 */
function dotfig(options) {
  if ('string' === typeof options) {
    options = { name: options };
  }

  /**
   * Finds the default, or returns the fallback.
   *
   * @param {String} name Name of the option we want to default.
   * @param {Mixed} fallback Default fallback.
   * @returns {Mixed} Fallback or configured option.
   * @private
   */
  function def(name, fallback) {
    return name in options ? options[name] : fallback;
  }

  //
  // Allow users to specify their own filename if they supply an object, or
  // default to the name .${name}rc
  //
  var filename = def('filename', '.' + options.name + 'rc');
  var pkgjson = def('pkgjson', 'package.json');
  var parser = def('parse', parse);

  return resolve(def('root', parent), function iterator(root) {
    var packagejson = pkgjson && path.join(root, pkgjson);
    var file = filename && path.join(root, filename);
    var data;

    //
    // Order of discovery is based on users effort in creating the files.
    //
    // 1. Creating a config a dedicated dotfile with JSON speaks of dedication
    // 2. Adding an extra field to a pre-existing is the least labor intensive
    //    way of specifying configurations.
    //
    if (file && fs.existsSync(file) && (data = parser(file))) return data;
    if (pkgjson && fs.existsSync(packagejson) && (data = parse(packagejson))) {
      //
      // So, we have a package.json in this directory, lets see if it contains
      // the property that we need to return.
      //
      var names = [options.name].concat(options.alias).filter(Boolean);
      for (var i = 0; i < names.length; i++) {
        if (names[i] in data) return data[names[i]];
      }
    }
  });
}

//
// Expose the individual functions
//
dotfig.resolve = resolve;
dotfig.parent = parent;
dotfig.parse = parse;

//
// Finally, after all these hacks, we can safely expose the module.
//
module.exports = dotfig;
