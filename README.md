hal2hyper
=========

hal+json to hyper+json transform

Installation
------------

```sh
$ npm install hal2hyper
```

Usage
-----

```js
var hal2hyper = require('hal2hyper');

var document = {
  "_links": {
    "self": { "href": "/example_resource" }
  }
};

hal2hyper(document) // {"href": "/example_resource"}
```

See [test cases](https://github.com/hypergroup/hal2hyper/tree/master/test/cases) for example output.

Testing
-------

```sh
$ npm test
```
