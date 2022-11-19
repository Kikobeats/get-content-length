# get-content-length

![Last version](https://img.shields.io/github/tag/Kikobeats/get-content-length.svg?style=flat-square)
[![Coverage Status](https://img.shields.io/coveralls/Kikobeats/get-content-length.svg?style=flat-square)](https://coveralls.io/github/Kikobeats/get-content-length)
[![NPM Status](https://img.shields.io/npm/dm/get-content-length.svg?style=flat-square)](https://www.npmjs.org/package/get-content-length)

> Get [Content-Length](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Length) from the input.

## Install

```bash
$ npm install get-content-length --save
```

## Usage

The default method automagically detects the input:

```js
const contentLength = require('get-content-length')
await contentLength('https://microlink.io/favicon.ico') // => 34494
```

It accepts [got#options](https://github.com/sindresorhus/got/tree/v11#options) as second argument:

```js
const contentLength = require('get-content-length')
await contentLength('https://microlink.io/favicon.ico', { timeout: 8000 }) // => 34494
```

Alternatively, you can explicitly call the desired method:

### .fromUrl

```js
const contentLength = require('get-content-length')

await contentLength.fromUrl('https://microlink.io/favicon.ico') // => 34494
```

### .fromDataUri

```js
const contentLength = require('get-content-length')

const dataUri = 'data:image/png;base64,iVBORw0KGgoAAA…'

await contentLength.fromDataUri(dataUri) // => 34494
```

### .fromResponse

```js
const contentLength = require('get-content-length')
const reachableUrl = require('reachable-url')

const url = 'https://mirrors.dotsrc.org/blender/blender-demo/movies/ToS/tearsofsteel_4k.mov'
const response = await reachableUrl(url)

await contentLength.fromResponse(response) // => 6737592810
```

## Related

- [reachable-url](https://github.com/Kikobeats/reachable-url) — It resolves the URL as fast as possible, without downloading the body.
- [html-get](https://github.com/microlinkhq/html-get) — Get the HTML from any website, using prerendering when is necessary.

## License

**get-content-length** © [Kiko Beats](https://kikobeats.com), released under the [MIT](https://github.com/Kikobeats/get-content-length/blob/master/LICENSE.md) License.<br>
Authored and maintained by [Kiko Beats](https://kikobeats.com) with help from [contributors](https://github.com/Kikobeats/get-content-length/contributors).

> [kikobeats.com](https://kikobeats.com) · GitHub [Kiko Beats](https://github.com/Kikobeats) · Twitter [@Kikobeats](https://twitter.com/Kikobeats)
