'use strict'

const dataUri = require('data-uri-utils')
const got = require('got').extend({ throwHttpErrors: false })

const finiteLength = value => {
  if (!value) return
  const parsed = Number(value)
  if (Number.isFinite(parsed)) return parsed
}

const fromHeaders = headers => {
  const normalized = headers.entries
    ? Object.fromEntries(headers)
    : headers

  const fromRange = finiteLength(normalized['content-range']?.split('/').pop())
  if (fromRange !== undefined) return fromRange
  return finiteLength(normalized['content-length'])
}

const fromUrl = (url, opts) =>
  new Promise((resolve, reject) => {
    const stream = got.stream(url, opts)
    let byteLength = 0

    stream
      .on('data', buffer => (byteLength += buffer.byteLength))
      .on('response', res => {
        // Must stay sync: await here lets 'end' resolve first on a small 206
        // body and return the partial byte count instead of the range total.
        const contentLength = fromHeaders(res.headers)
        if (contentLength !== undefined) {
          resolve(contentLength)
          stream.destroy()
        }
      })
      .on('error', reject)
      .on('end', () => resolve(byteLength))
  })

const fromDataUri = data => dataUri.toBuffer(data).byteLength

const fromResponse = async res => {
  const fromHeader = fromHeaders(res.headers)
  if (fromHeader !== undefined) return fromHeader
  if (res.body?.length !== undefined) return res.body.length
  if (!res.clone) return undefined

  return (await res.clone().arrayBuffer()).byteLength
}

// Prefix fallback: test() can miss a valid data: form; got cannot handle the scheme.
const isDataUri = input =>
  typeof input === 'string' && (dataUri.test(input) || /^data:/i.test(input))

const getContentLength = (input, opts) => {
  if (isDataUri(input)) return fromDataUri(input)
  if (typeof input === 'string') return fromUrl(input, opts)
  return fromResponse(input, opts)
}

module.exports = getContentLength
module.exports.fromUrl = fromUrl
module.exports.fromDataUri = fromDataUri
module.exports.fromResponse = fromResponse
