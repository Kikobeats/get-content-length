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
    const value = contentRange.split('/')
    const contentLength = value[value.length - 1]
    return Number(contentLength)
  }

  const contentLength = headers['content-length']
  if (contentLength) return Number(contentLength)
  if (res.body?.length !== undefined) return res.body.length
  if (!res.clone) return undefined

  const clonedResponse = res.clone()
  const arrayBuffer = await clonedResponse.arrayBuffer()
  return arrayBuffer.byteLength
}

const getContentLength = (input, opts) =>
  (dataUri.test(input)
    ? fromDataUri
    : typeof input === 'string'
      ? fromUrl
      : fromResponse)(input, opts)

module.exports = getContentLength
module.exports.fromUrl = fromUrl
module.exports.fromDataUri = fromDataUri
module.exports.fromResponse = fromResponse
