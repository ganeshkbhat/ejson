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

import { default as merge } from "./merge.js";
import type * as fsa from './node_modules/memfs/lib/fsa/types';
import { FsaNodeFs } from './node_modules/memfs/lib/fsa-to-node';

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
  fromNestedJSON(vjson: object, cwd: string) {
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
  fromJSON(vjson: object, cwd: string) {
    const vol = new Volume();
    vol.fromJSON(vjson, cwd || "/");
    return vol;
  }

  writeFileSync(id: string, data: any, options: object, vol: any) {
    vol.writeFileSync(id, data, options);
  }

  readFileSync(file: string, options: string | object, vol: any) {
    return vol.readFileSync(file, options);
  }

  async writeFileSystem(dir: fsa.IFileSystemDirectoryHandle) {
    (window as any).process = await import('process/browser');
    (window as any).Buffer = await import('buffer').Buffer;

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
  QueryBuilder;
  jsonValue = (function () {
    var vjson = {};
    return {
      get: (k: any = null) => {
        if (vjson[k]) return vjson[k];
        return vjson[k];
      },
      set: (k: any, v: any) => {
        try {
          vjson[k] = v;
          this.writeFileSync(k, v, {}, this.vl);
          return true;
        } catch (e) {
          return JSON.stringify(e);
        }
      }
    }
  })()

  /**
   * Creates an instance of Ejson.
   * @param {object} vjson
   * @param {string} cwd
   * @memberof Ejson
   */
  constructor(vjson: object, cwd: string) {
    super();
    this.create(vjson, cwd);
    Object.keys(vjson).forEach((k) => {
      this.jsonValue.set(k, vjson[k]);
    });
    this.QueryBuilder = this.merge(_lodash, _underscore);
  }

  merge = merge;

  /**
   *
   *
   * @return {*} 
   * @memberof Ejson
   */
  getQueryBuilder() {
    return this.QueryBuilder(this.jsonValue.get())
  }

  insert() {

  }

  delete() {

  }

  find() {

  }

  findOne() {

  }

  execute() {

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
