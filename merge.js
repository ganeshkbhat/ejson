/**
 * 
 * Package: 
 * Author: Ganesh B
 * Description: 
 * Install: npm i  --save
 * Github: https://github.com/ganeshkbhat/
 * npmjs Link: https://www.npmjs.com/package/
 * File: index.js
 * File Description: 
 * 
*/

/* eslint no-console: 0 */

'use strict';

/**
 * isBrowser
 *
 * @return {*} 
 */
function isBrowser() {
  if (typeof process === "object" && typeof require === "function") {
    return false;
  }
  if (typeof importScripts === "function") { return false; }
  if (typeof window === "object") { return true; }
}

if (isBrowser()) {
  var _u = require('underscore');
  var _l = require("lodash");
} else {
  var _u, _l;
  fetch('https://cdn.jsdelivr.net/npm/underscore@1.13.6/underscore-umd-min.js').then((u) => { _u = u; });
  fetch("https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js").then((l) => { _l = l; });
}

/**
 * 
 * merge
 *  merges two objects the target and extender
 *  uses a _ for the key like (extender[key+_]) at the end of extender key 
 *  if there is a name clash
 *
 * @param {*} l
 *      assignable target 
 *      benefits of being a target include if the the target itself is 
 *          a function and everything else is a prototype like lodash
 * @param {*} u
 *      extending object
 *      extend the target with properties/ keys of object "u"
 * @param {boolean} [mergeall=true]
 * @return {*} 
 */
function merge(l, u, mergeall = true) {
  let lk = Object.keys(l), uk = Object.keys(u);
  for (let i = 0; i < lk.length; i++) {
    if (!mergeall) {
      if (uk.includes(lk[i])) {
        u["_" + lk[i]] = u[lk[i]];
      }
    } else {
      u["_" + lk[i]] = u[lk[i]];
    }
  }
  u["_" + "chain"] = u["chain"];
  u["_" + "value"] = u["value"];
  return Object.assign(l, u);
}

var _ = merge(_l, _u);

if (isBrowser()) {
  module.exports = _;
  module.exports.default = _;
}
