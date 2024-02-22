
import { fs, vol, Volume } from "memfs";
import { ufs } from "unionfs";
import * as _lodash from "lodash";
import * as _underscore from "underscore";
import * as njq from "node-jq";
import { JQ } from "JQ";

import { default as merge } from "./merge.js";

class FileHandler {

  vl;

  /**
   * Creates an instance of FileHandler.
   * @param {*} json
   * @param {*} cwd
   * @memberof FileHandler
   */
  constructor(json, cwd) {
    this.vl = this.create(json, cwd);
  }

  /**
   *
   *
   * @param {*} json
   * @param {*} cwd
   * @param {boolean} [nested=true]
   * @return {*} 
   * @memberof FileHandler
   */
  create(json, cwd, nested = true) {
    return (!!nested) ? this.fromNestedJSON(json, cwd) : this.fromJSON(json, cwd);
  }

  /**
   *
   *
   * @param {*} json
   * @param {*} cwd
   * @return {*} 
   * @memberof FileHandler
   */
  fromNestedJSON(json, cwd) {
    return vol.fromNestedJSON(json, cwd || "/");
  }

  /**
   *
   *
   * @param {*} json
   * @param {*} cwd
   * @return {*} 
   * @memberof FileHandler
   */
  fromJSON(json, cwd) {
    return vol.fromJSON(json, cwd || "/");
  }


  writeFileSync(id, data, options) {

  }


  readFileSync(file, options) {

  }

  write = this.writeFileSync;
  read = this.readFileSync;

  usage() {

    const json = {
      "./README.md": "1",
      "./src/index.js": "2",
      "./node_modules/debug/index.js": "3",
    };
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
  jsonValue = {};

  /**
   * Creates an instance of Ejson.
   * @param {*} vjson
   * @param {*} cwd
   * @memberof Ejson
   */
  constructor(vjson, cwd) {
    super(vjson || {}, cwd);
    this.jsonValue = vjson;
    this.QueryBuilder = this.merge(_lodash, _underscore);
  }

  merge = merge;

  getQueryBuilder() {
    return this.QueryBuilder(this.jsonValue)
  }

  get() {
    return this.jsonValue;
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
   * @param {*} filter
   * @param {*} jsonPath
   * @param {*} options
   * @memberof Ejson
   */
  async run(filter, jsonObject, options = { input: 'json' }) {
    return await njq.run(filter || ".", jsonObject, options)
  }

  /**
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
   * @param {*} q
   * @return {*} 
   * @memberof Ejson
   */
  query(q) {
    return JQ(this.jsonValue)(q);
  }

}
