See [demo](https://runkit.com/streamich/memfs-getting-started) on RunKit.

```
import { fs } from 'memfs';

fs.writeFileSync('/hello.txt', 'World!');
fs.readFileSync('/hello.txt', 'utf8'); // World!
```

Create a file system from a plain JSON:

```
import { fs, vol } from 'memfs';

const json = {
  './README.md': '1',
  './src/index.js': '2',
  './node_modules/debug/index.js': '3',
};
vol.fromJSON(json, '/app');

fs.readFileSync('/app/README.md', 'utf8'); // 1
vol.readFileSync('/app/src/index.js', 'utf8'); // 2
```

Export to JSON:

```
vol.writeFileSync('/script.sh', 'sudo rm -rf *');
vol.toJSON(); // {"/script.sh": "sudo rm -rf *"}
Use it for testing:

vol.writeFileSync('/foo', 'bar');
expect(vol.toJSON()).toEqual({ '/foo': 'bar' });
```

Create as many filesystem volumes as you need:

```
import { Volume } from 'memfs';

const vol = Volume.fromJSON({ '/foo': 'bar' });
vol.readFileSync('/foo'); // bar

const vol2 = Volume.fromJSON({ '/foo': 'bar 2' });
vol2.readFileSync('/foo'); // bar 2
```

Use memfs together with [unionfs](https://github.com/streamich/unionfs) to create one filesystem from your in-memory volumes and the real disk filesystem:

```
import * as fs from 'fs';
import { ufs } from 'unionfs';

ufs.use(fs).use(vol);

ufs.readFileSync('/foo'); // bar
```

Use [fs-monkey](https://github.com/streamich/fs-monkey) to monkey-patch Node's require function:

```
import { patchRequire } from 'fs-monkey';

vol.writeFileSync('/index.js', 'console.log("hi world")');
patchRequire(vol);
require('/index'); // hi world
```
