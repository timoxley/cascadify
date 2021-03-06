# cascadify

[![Build Status](https://travis-ci.org/timoxley/cascadify.png?branch=master)](https://travis-ci.org/timoxley/cascadify)

Cascadify aims to work alongside [browserify](https://github.com/substack/node-browserify) to produce a single CSS file
for all your client-side npm dependencies.

Cascadify recursively finds stylesheets, specified by
package.json, and ensures they are concatenated in the correct order
as per the heirarchy in which they are required.

For example, if module `A` depends on modules `B` and `C`, the styles of `B` and `C`'s will be output
before the styles of module `A`.

## Installation

```
npm install -g cascadify
```

## Usage

Provide the entry point to your app, and pipe output to desired css
file:

```
cascadify ./index.js > output.css
```

## Configuration

Specify styles in an Array in your module's `package.json`:

```json
{
  "name": "my-package",
  "styles": [
    "my-package-style.css"
  ]
}
```

#### Note: 

Cascadify uses [browserify](https://github.com/substack/node-browserify)'s package finding mechanisms to find required modules, so *modules must be required somewhere via a `require` call for their styles to be used*.

## Example

#### A's package.json:
```json
{
  "name": "a",
  "styles": [
    "a.css"
  ]
}
```

#### A's index.js:
```js
require('b')
require('c')
```

### Run cascadify:

Assume B and C have a similar package.json to A.

```
cascadify ./a/index.js > output.css
```

#### output.css
```css
/* CSS B */
/* CSS C */
/* CSS A */
```



## Licence

MIT

