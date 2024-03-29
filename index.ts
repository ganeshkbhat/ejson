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

import { fs, memfs, vol, Volume } from "memfs";
import { ufs } from "unionfs";
import * as _lodash from "lodash";
import * as _underscore from "underscore";
import * as njq from "node-jq";
import { JQ } from "JQ";
import * as tar from "tar-stream";

import type * as fsa from './node_modules/memfs/lib/fsa/types';
import { FsaNodeFs } from './node_modules/memfs/lib/fsa-to-node';


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
function merge(l: any, u: any, mergeall = true) {
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

class FileHandler {

  vl: any;

  constructor() { }

  init(vjson: object, cwd: string) {
    this.vl = this.create(vjson, cwd);
  }

  /**
   *
   *
   * @param {*} vjson
   * @param {*} cwd
   * @param {boolean} [nested=true]
   * @return {*} 
   * @memberof FileHandler
   */
  create(vjson: any, cwd: string, nested = true) {
    return (!!nested) ? this.fromNestedJSON(vjson, cwd) : this.fromJSON(vjson, cwd);
  }

  /**
   *
   *
   * @param {object} vjson
   * @param {string} cwd
   * @return {*} 
   * @memberof FileHandler
   */
  fromNestedJSON(vjson: any, cwd: string) {
    const vol = new Volume();
    vol.fromNestedJSON(vjson, cwd || "/");
    return vol;
  }

  /**
   *
   *
   * @param {object} vjson
   * @param {string} cwd
   * @return {*} 
   * @memberof FileHandler
   */
  fromJSON(vjson: any, cwd: string) {
    const vol = new Volume();
    vol.fromJSON(vjson, cwd || "/");
    return vol;
  }

  writeFileSync(id: string, data: any, options: any, vol: any) {
    vol.writeFileSync(id, data, options);
    return true;
  }

  readFileSync(file: string, options: string | any, vol: any) {
    return vol.readFileSync(file, options);
  }

  async writeFileSystem(dir: fsa.IFileSystemDirectoryHandle) {
    // (window as any).process = await import('process/browser');
    // (window as any).Buffer = await (await import('buffer')).Buffer;

    const fs = new FsaNodeFs(dir);
  }

  write = this.writeFileSync;
  read = this.readFileSync;

  usage() {

    const json = {
      "./README.md": "1",
      "./src/index.js": "2",
      "./node_modules/debug/index.js": "3",
    };
    var vol = new Volume();
    vol.fromJSON(json, "/app");
    fs.readFileSync("/app/README.md", "utf8"); // 1
    vol.readFileSync("/app/src/index.js", "utf8"); // 2
    vol.writeFileSync("/app/script.sh", "sudo rm -rf *");
    vol.toJSON(); // {"/script.sh": "sudo rm -rf *"}
    const vol2 = Volume.fromJSON({ "/foo": "bar" });
    vol.readFileSync("/foo"); // bar
    const vol3 = Volume.fromJSON({ "/foo": "bar 2" });
    vol2.readFileSync("/foo"); // bar 2

    vol.writeFileSync("/foo", "bar");
    // expect(vol.toJSON()).toEqual({ "/foo": "bar" });

  }

}

class Ejson extends FileHandler {
  _QueryBuilder: any;
  vfsContext: boolean = true;

  vfsJsonValueSetter: Function = () => {
    var vjson: any = {};
    return {
      init: (vj: object = {}) => {
        vjson = JSON.parse(JSON.stringify(vj));
      },
      get: (k: string = "") => {
        if (!!k && !!vjson[k]) return vjson[k];
        return vjson;
      },
      set: (k: string, v: any) => {
        try {
          vjson[k] = v;
          (!!this.vfsContext) ? this.writeFileSync(k, v, {}, this.vl) : null;
          return true;
        } catch (e) {
          return JSON.stringify(e);
        }
      },
      delete: (k: string) => {

      },
      sync: (timer: number, interval: boolean) => {
        let fn = () => { };
        if (!interval) {
          setInterval(fn, timer || 600000);
        } else {
          setTimeout(fn, timer || 1000);
        }
      }
    }
  }

  jsonValue: any = this.vfsJsonValueSetter();

  /**
   * Creates an instance of Ejson.
   * @param {object} vjson
   * @param {string} cwd
   * @param {boolean} vfsContext
   * @memberof Ejson
   */
  constructor(vjson: any, cwd: string, vfsContext: boolean) {
    super();
    this.vfsContext = vfsContext;
    this.create(vjson, cwd);
    Object.keys(vjson).forEach((k) => {
      this.jsonValue.set(k, vjson[k]);
    });
    this._QueryBuilder = this.merge(_lodash, _underscore);
  }

  merge: Function = merge;

  /**
   *
   *
   * @return {*} 
   * @memberof Ejson
   */
  getQueryBuilder() {
    return this._QueryBuilder();
  }

  /**
   *
   *
   * @param {string} f
   * @param {*} v
   * @return {*} 
   * @memberof Ejson
   */
  insert(f: string, v: any) {
    return this.jsonValue.set(f, v);
  }

  /**
   *
   *
   * @param {string} f
   * @return {*} 
   * @memberof Ejson
   */
  delete(f: string) {
    return this.jsonValue.set(f, undefined);
  }

  /**
   * 
   * Usage Similar to
   * https://lodash.com/docs/4.17.15#find
   *
   * @param {(string | any[] | object)} q
   * @return {*} 
   * @memberof Ejson
   */
  find(q: string | any[] | object) {
    return this.getQueryBuilder().find(this.jsonValue.get(), q);
  }

  /**
   *
   * Usage Similar to
   * https://lodash.com/docs/4.17.15#find
   * https://lodash.com/docs/4.17.15#findLast
   *
   * @param {(string | any[] | object)} q
   * @param {boolean} [last=true]
   * @return {*} 
   * @memberof Ejson
   */
  findOne(q: string | any[] | object, last = true) {
    return (!!last) ? this.getQueryBuilder().findLast(this.jsonValue.get(), q) : this.getQueryBuilder().find(this.jsonValue.get(), q)[0];
  }

  /**
   *
   *
   * @param {*} q
   * @memberof Ejson
   */
  execute(q: any) {

  }

  /**
   *
   * wrapper for jq - lightweight and flexible command-line JSON processor
   * https://www.npmjs.com/package/node-jq
   *
   * @param {string} filter
   * @param {object} jsonObject
   * @param {object} [options={ input: 'json' }]
   * @return {*} 
   * @memberof Ejson
   */
  async run(filter: string, jsonObject: object, options: object = { input: 'json' }) {
    return await njq.run(filter || ".", jsonObject, options)
  }

  /**
   *
   * JQ is a DSL for querying javascript object. APIs are very similar to jQuery
   * 
   * {  "father_name": "bob", "mother_name": "kathy", 
   *    "children": [ 
   *        { "name": "john", "age": 3 }, { "name": "alice", "age": 2 }, { "name": "mike", "age": 1 } 
   *    ]
   * };
   * $family("name === "john" || age === 1").get(0); // -> { name: "john", age: 3 }
   * $family("name === "john" || age === 1").get(1); // -> { name: "make", age: 1 }
   * 
   * https://www.npmjs.com/package/JQ
   *
   * @param {(any | string)} q
   * @return {*} 
   * @memberof Ejson
   */
  query(q: any | string) {
    return JQ(this.jsonValue)(q);
  }

}

const edb = new Ejson({}, "/", true);
edb.insert("/test.txt", "Testing");
edb.insert("/test.md", "Testing");
edb.insert("/test.csv", "Testing");
edb.insert("/src/test.txt", "Testing");

let c = edb.find("test");
let d = edb.findOne("test.md");

console.log(c);
console.log(d);

