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

const finiteLength = value => {
  if (!value) return
  const parsed = Number(value)
  if (Number.isFinite(parsed)) return parsed
}

const fromResponse = async res => {
  const headers = res.headers.entries
    ? Object.fromEntries(res.headers)
    : res.headers

  const fromRange = finiteLength(headers['content-range']?.split('/').pop())
  if (fromRange !== undefined) return fromRange

  const fromLength = finiteLength(headers['content-length'])
  if (fromLength !== undefined) return fromLength
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
