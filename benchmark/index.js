'use strict'

const { writeFileSync } = require('fs')
const { join } = require('path')
const { setFlagsFromString } = require('v8')
const { runInNewContext } = require('vm')

const contentLength = require('..')

const RUNS = 7
const DATA_URI_BYTES = 1024 * 1024
const DATA_URI_READS = 40
const RESPONSE_READS = 200000

const median = values => {
  const sorted = values.slice().sort((a, b) => a - b)
  return sorted[Math.floor(sorted.length / 2)]
}

setFlagsFromString('--expose-gc')
const collectGarbage = runInNewContext('gc')

const now = () => process.hrtime.bigint()

const elapsed = started => Number(now() - started) / 1e6

const patternedBytes = size => {
  const bytes = Buffer.alloc(size)
  for (let index = 0; index < size; index++) { bytes[index] = (index * 31 + 7) & 255 }
  return bytes
}

const toDataUri = bytes => `data:image/png;base64,${bytes.toString('base64')}`

const RESOURCE_BYTES = 12345

const responseShapes = () => [
  {
    headers: { 'content-length': String(RESOURCE_BYTES) },
    expected: RESOURCE_BYTES
  },
  {
    headers: {
      'content-range': `bytes 0-0/${RESOURCE_BYTES}`,
      'content-length': '1'
    },
    expected: RESOURCE_BYTES
  },
  {
    headers: { 'content-range': 'bytes 0-0/*', 'content-length': '1' },
    expected: undefined
  },
  { headers: {}, body: Buffer.alloc(64), expected: 64 },
  {
    headers: new Headers({ 'content-length': String(RESOURCE_BYTES) }),
    expected: RESOURCE_BYTES
  },
  {
    headers: new Headers({ 'content-range': `bytes 0-0/${RESOURCE_BYTES}` }),
    expected: RESOURCE_BYTES
  }
]

const dataUriCase = {
  name: 'data uri length 1MB',
  extra: `${DATA_URI_READS} reads of a ${DATA_URI_BYTES} byte base64 data uri`,
  setup: state => {
    state.dataUri = toDataUri(patternedBytes(DATA_URI_BYTES))
  },
  timed: state => {
    let matched = 0
    for (let read = 0; read < DATA_URI_READS; read++) {
      if (contentLength(state.dataUri) === DATA_URI_BYTES) matched++
    }
    return matched
  },
  verify: matched => matched === DATA_URI_READS
}

const responseCase = {
  name: 'response headers length',
  extra: `${RESPONSE_READS} fromResponse calls over 6 header shapes`,
  setup: state => {
    state.shapes = responseShapes()
  },
  timed: async state => {
    let matched = 0
    for (let read = 0; read < RESPONSE_READS; read++) {
      const shape = state.shapes[read % state.shapes.length]
      if ((await contentLength(shape)) === shape.expected) matched++
    }
    return matched
  },
  verify: matched => matched === RESPONSE_READS
}

const CASES = [dataUriCase, responseCase]

const fmt = value => value.toFixed(1)

const report = slot => {
  const med = slot.walls.length ? median(slot.walls) : Number.NaN
  const min = slot.walls.length ? Math.min(...slot.walls) : Number.NaN
  const max = slot.walls.length ? Math.max(...slot.walls) : Number.NaN
  const extra = `${slot.entry.extra}, errors ${slot.errors}, runs ${RUNS}`
  console.log(
    `${slot.entry.name}  median ${fmt(med)}ms  range ${fmt(min)}-${fmt(
      max
    )}  ${extra}`
  )
  return {
    name: slot.entry.name,
    unit: 'ms',
    value: Number(med.toFixed(1)),
    range: `${fmt(min)}-${fmt(max)}`,
    extra
  }
}

const takeSample = async (slot, run) => {
  try {
    collectGarbage()
    const started = now()
    const outcome = await slot.entry.timed(slot.state)
    const wall = elapsed(started)
    if (!slot.entry.verify(outcome)) {
      console.error(`${slot.entry.name} run ${run} produced unexpected output`)
      slot.errors++
      return
    }
    slot.walls.push(wall)
  } catch (error) {
    console.error(error)
    slot.errors++
  }
}

const main = async () => {
  const slots = []
  for (const entry of CASES) {
    const state = {}
    await entry.setup(state)
    await entry.timed(state)
    slots.push({ entry, state, walls: [], errors: 0 })
  }
  for (let run = 0; run < RUNS; run++) {
    for (const slot of slots) await takeSample(slot, run)
  }
  const results = slots.map(report)
  writeFileSync(
    join(__dirname, '..', 'benchmark-output.json'),
    JSON.stringify(results, null, 2) + '\n'
  )
  const errors = slots.reduce((total, slot) => total + slot.errors, 0)
  if (errors > 0 || results.some(result => !Number.isFinite(result.value))) {
    process.exitCode = 1
  }
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
