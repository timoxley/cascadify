# stylify

Recursively find and concatenates styles specified in package.json.

Stylify will find any required module's stylesheets, specified by
package.json, and ensure they are bundled in the correct order.

For example, if module `A` depends on modules `B` and `C`, `B` and `C`'s styles will be output
before the styles of module `A`.

## Installation

```
npm install -g stylify
```

## Usage

Provide the entry point to your app, and pipe output to desired css
file:

```
stylify ./index.js > output.css
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

Stylify uses [browserify](https://github.com/substack/node-browserify)'s package finding mechanisms to find required modules, so *modules must be required somewhere via a `require` call for their styles to be used*.

## Licence

MIT

