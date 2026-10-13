import assert from 'node:assert/strict'
import test from 'node:test'
import {copyPhrase, makePhrase, modulation, noteFromPoint, PHRASE_STEPS} from '../src/synth/model.ts'

const note = {pitch: 72, tone: .5, energy: .2, space: .3}
test('gesture pitch stays in the pentatonic scale and is stable near a boundary', () => {
  const scale = new Set([60, 63, 65, 67, 70, 72, 75, 77, 79, 82])
  for (let y = -1; y <= 2; y += .013) assert.ok(scale.has(noteFromPoint({x: .5, y})))
  assert.equal(noteFromPoint({x: .5, y: 1 - 5.55 / 9}, 72), 72)
  assert.equal(noteFromPoint({x: .5, y: 1 - 5.8 / 9}, 72), 75)
})
test('a short take preserves rests instead of inventing notes; snapshots do not alias live input', () => {
  const take = [{...note}, null, {...note}]
  const phrase = makePhrase(take)
  assert.equal(phrase.length, PHRASE_STEPS)
  assert.equal(phrase.filter(Boolean).length, 2)
  assert.equal(phrase[1], null)
  take[0]!.pitch = 82
  assert.equal(phrase[0]!.pitch, 72)
  const history = copyPhrase(phrase)!
  phrase[0]!.tone = 1
  assert.equal(history[0]!.tone, .5)
})
test('long takes keep the most recent complete window in order', () => {
  const take = Array.from({length: PHRASE_STEPS + 16}, (_, i) => ({...note, pitch: i}))
  const phrase = makePhrase(take)
  assert.equal(phrase[0]!.pitch, 16)
  assert.equal(phrase[PHRASE_STEPS - 1]!.pitch, PHRASE_STEPS + 15)
})
test('second finger modulation is relative to its origin and bounded', () => {
  assert.deepEqual(modulation({x: .7, y: .2}, {x: .7, y: .2}), {energy: .35, space: .3})
  assert.deepEqual(modulation({x: 1, y: 0}, {x: 0, y: 1}), {energy: 1, space: 1})
  assert.deepEqual(modulation({x: 0, y: 1}, {x: 1, y: 0}), {energy: 0, space: 0})
})

test('each dance preset has a complete eight-bar arrangement with distinct note and rhythm patterns', async () => {
  const {presetEvents} = await import('../src/synth/presets.ts')
  const arrangements = ['bounce', 'night', 'float'].map(id => Array.from({length: 128}, (_, i) => presetEvents(id as 'bounce' | 'night' | 'float', i, .35)))
  for (const arrangement of arrangements) {
    const parts = new Set(arrangement.flat().map(event => event.part))
    for (const part of ['kick', 'hat', 'open', 'perc', 'bass', 'chord', 'motif', 'fx'] as const) assert.ok(parts.has(part), part)
    assert.ok(parts.has('clap') || parts.has('snare'))
    for (let bar = 0; bar < 8; bar++) {
      const events = arrangement.slice(bar * 16, bar * 16 + 16).flat()
      assert.ok(events.some(e => e.part === 'bass'))
      assert.ok(events.some(e => e.part === 'motif'))
      assert.ok(events.some(e => e.part === 'chord'))
    }
    assert.notDeepEqual(arrangement.slice(0, 16), arrangement.slice(112, 128))
    for (const event of arrangement.flat()) {
      assert.ok(event.level > 0 && event.level <= .85)
      assert.ok(event.notes?.every(Number.isFinite) ?? true)
    }
  }
  assert.notDeepEqual(arrangements[0], arrangements[1])
  assert.notDeepEqual(arrangements[1], arrangements[2])
})


test('drum grooves vary over eight bars and differ across genres', async () => {
  const {drumEvents, presetEvents, ARRANGEMENT_STEPS} = await import('../src/synth/presets.ts')
  assert.equal(PHRASE_STEPS, 8 * 16)
  assert.equal(PHRASE_STEPS, ARRANGEMENT_STEPS)
  const rhythms: string[] = []
  for (const feeling of ['bounce', 'night', 'float'] as const) {
    const bars = Array.from({length: 8}, (_, bar) => JSON.stringify(Array.from({length: 16}, (_, s) => drumEvents(feeling, bar * 16 + s, .35))))
    assert.ok(new Set(bars).size >= 6, `${feeling} needs changing drum bars`)
    rhythms.push(JSON.stringify(bars))
    for (let step = 0; step < 128; step++) assert.deepEqual(presetEvents(feeling, step, .35), presetEvents(feeling, step + 128, .35))
  }
  assert.equal(new Set(rhythms).size, 3)
})
