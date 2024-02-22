
import { fs, vol, Volume } from "memfs";
import { ufs } from 'unionfs';
import * as _lodash from "lodash";
import * as _underscore from "underscore";
import { default as merge } from "./merge.js";

class Ejson {
  _

  constructor() {
    this._ = this.merge(_lodash, _underscore)
  }

  merge = merge
  
}

class FileHandler {

  vl;

  constructor(json, cwd) {
    this.vl = this.create(json, cwd);
  }

  create(json, cwd, nested = true) {
    return (!!nested) ? this.fromNestedJSON(json, cwd) : this.fromJSON(json, cwd);
  }

  fromNestedJSON(json, cwd) {
    return vol.fromNestedJSON(json, cwd || "/");
  }

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
      './README.md': '1',
      './src/index.js': '2',
      './node_modules/debug/index.js': '3',
    };
    vol.fromJSON(json, '/app');
    fs.readFileSync('/app/README.md', 'utf8'); // 1
    vol.readFileSync('/app/src/index.js', 'utf8'); // 2
    vol.writeFileSync('/app/script.sh', 'sudo rm -rf *');
    vol.toJSON(); // {"/script.sh": "sudo rm -rf *"}
    const vol2 = Volume.fromJSON({ '/foo': 'bar' });
    vol.readFileSync('/foo'); // bar
    const vol3 = Volume.fromJSON({ '/foo': 'bar 2' });
    vol2.readFileSync('/foo'); // bar 2

    vol.writeFileSync('/foo', 'bar');
    expect(vol.toJSON()).toEqual({ '/foo': 'bar' });

  }

}


