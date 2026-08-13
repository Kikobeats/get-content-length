'use strict'

const dataUri = require('data-uri-utils')
const got = require('got').extend({ throwHttpErrors: false })

const fromUrl = (url, opts) =>
  new Promise((resolve, reject) => {
    const stream = got.stream(url, opts)
    let byteLength = 0

    stream
      .on('data', buffer => (byteLength += buffer.byteLength))
      .on('response', async res => {
        const contentLength = await fromResponse(res)
        if (contentLength) {
          resolve(contentLength)
          stream.destroy()
        }
      })
      .on('error', reject)
      .on('end', () => resolve(byteLength))
  })

const fromDataUri = data => dataUri.toBuffer(data).byteLength

const fromResponse = async res => {
  const headers = res.headers.entries
    ? Object.fromEntries(res.headers)
    : res.headers

  const contentRange = headers['content-range']

  if (contentRange) {
    const total = contentRange.split('/').pop()
    // RFC 9110: total may be "*" when unknown; do not return NaN.
    if (total && total !== '*') {
      const parsed = Number(total)
      if (Number.isFinite(parsed)) return parsed
    }
  }

  const contentLength = headers['content-length']
  if (contentLength) {
    const parsed = Number(contentLength)
    if (Number.isFinite(parsed)) return parsed
  }
  if (res.body?.length !== undefined) return res.body.length
  if (!res.clone) return undefined

  const clonedResponse = res.clone()
  const arrayBuffer = await clonedResponse.arrayBuffer()
  return arrayBuffer.byteLength
}

// Prefix check: data-uri-utils.test() historically rejected valid
// `charset`+`base64` URIs, which made got throw "Unsupported protocol".
const isDataUri = input =>
  typeof input === 'string' &&
  (dataUri.test(input) || /^data:/i.test(input))

const getContentLength = (input, opts) =>
  (isDataUri(input)
    ? fromDataUri
    : typeof input === 'string'
      ? fromUrl
      : fromResponse)(input, opts)

module.exports = getContentLength
module.exports.fromUrl = fromUrl
module.exports.fromDataUri = fromDataUri
module.exports.fromResponse = fromResponse
