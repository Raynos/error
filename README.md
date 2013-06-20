# error

<!--
    [![build status][1]][2]
    [![NPM version][3]][4]
    [![Coverage Status][5]][6]
    [![gemnasium Dependency Status][7]][8]
    [![Davis Dependency status][9]][10]
-->

<!-- [![browser support][11]][12] -->

Custom errors

## Example

```js
var ValidationError = require("error/validation")
var OptionError = require("error/option")

var error = ValidationError([{
  message: "Please enter required field",
  attribute: "name"
}, {
  message: "Password must be at least 10 characters",
  attribute: "password"
}])

console.log("error.errors", error.errors)

var error = OptionError("Something went wrong", metaData)

console.log("error.option", error.option)
```

## Installation

`npm install error`

## Contributors

 - Raynos

## MIT Licenced

  [1]: https://secure.travis-ci.org/Raynos/error.png
  [2]: https://travis-ci.org/Raynos/error
  [3]: https://badge.fury.io/js/error.png
  [4]: https://badge.fury.io/js/error
  [5]: https://coveralls.io/repos/Raynos/error/badge.png
  [6]: https://coveralls.io/r/Raynos/error
  [7]: https://gemnasium.com/Raynos/error.png
  [8]: https://gemnasium.com/Raynos/error
  [9]: https://david-dm.org/Raynos/error.png
  [10]: https://david-dm.org/Raynos/error
  [11]: https://ci.testling.com/Raynos/error.png
  [12]: https://ci.testling.com/Raynos/error
