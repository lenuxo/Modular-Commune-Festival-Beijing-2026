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
  assert.deepEqual(modulation({x: .7, y: .2}, {x: .7, y: .2}), {energy: .5, space: .4})
  assert.deepEqual(modulation({x: 1, y: 0}, {x: 0, y: 1}), {energy: 1, space: 1})
  assert.deepEqual(modulation({x: 0, y: 1}, {x: 1, y: 0}), {energy: 0, space: 0})
})

test('gesture notes follow each preset harmony rather than the old fixed key', async () => {
  const {harmonicPitch} = await import('../src/synth/music-controls.ts')
  for (const feeling of ['bounce','night','float'] as const) for (let bar=0;bar<8;bar++) {
    const pitches = [60,63,65,67,70,72,75,77,79,82].map(p=>harmonicPitch(p,feeling,bar))
    assert.ok(pitches.every(Number.isFinite))
    assert.ok(pitches.every((p,i)=>i===0 || p>pitches[i-1]))
    assert.equal(pitches[5]-pitches[0],12)
  }
  assert.equal(harmonicPitch(60,'bounce',0),62)
  assert.equal(harmonicPitch(60,'bounce',2),67)
  assert.equal(harmonicPitch(60,'night',0),65)
  assert.equal(harmonicPitch(60,'float',0),69)
})

test('all touch extremes preserve the rhythmic foundation and bound feedback and filters', async () => {
  const {liveTargets,gestureVoice}=await import('../src/synth/music-controls.ts')
  const parts=['kick','drums','extra','bass','sub','chords','motif','air','lead'] as const
  for(const feeling of ['bounce','night','float'] as const) {
    const neutral=liveTargets(feeling,'kick',{tone:.5,energy:.2,space:.3},false)
    for(const energy of [-1,0,.5,1,2]) for(const space of [-1,0,1,2]) for(const tone of [0,1]) {
      const controls={energy,space,tone}
      assert.deepEqual(liveTargets(feeling,'kick',controls,true),neutral)
      assert.equal(liveTargets(feeling,'sub',controls,true).gain,1)
      for(const part of parts) {
        const target=liveTargets(feeling,part,controls,true)
        assert.ok(target.cutoff>=650 && target.cutoff<=18000)
        assert.ok(target.gain>=0 && target.gain<=1.881)
        assert.ok(target.wet>=0 && target.wet<=.535)
        assert.ok(target.resonance<=2.2)
      }
      assert.ok(Number(gestureVoice(feeling,{pitch:60,...controls},0).delayfeedback)<.5)
    }
    const low={tone:.5,energy:0,space:0}, high={tone:.5,energy:1,space:1}
    assert.ok(liveTargets(feeling,'extra',high,false).gain>liveTargets(feeling,'extra',low,false).gain*10)
    assert.ok(liveTargets(feeling,'lead',high,false).wet>liveTargets(feeling,'lead',low,false).wet*20)
    assert.ok(liveTargets(feeling,'motif',high,true).gain<liveTargets(feeling,'motif',high,false).gain)
  }
})


test('release starts at the held values, eases monotonically, and reaches the destination', async () => {
  const {ReleaseControls,RELEASE_SECONDS,CONTROL_AXES}=await import('../src/synth/release-controls.ts')
  const release=new ReleaseControls(),held={tone:.95,energy:1,space:1},target={tone:.5,energy:.2,space:.3}
  release.start(held,CONTROL_AXES,10)
  assert.deepEqual(release.value(target,10),held)
  let previous=held
  for(let i=1;i<=20;i++) {
    const next=release.value(target,10+RELEASE_SECONDS*i/20)
    for(const axis of CONTROL_AXES) assert.ok(next[axis]<=previous[axis] && next[axis]>=target[axis])
    previous=next
  }
  assert.deepEqual(release.value(target,11,true),target)
  assert.equal(release.active,false)
})

test('second-finger release leaves tone immediate and re-grabbing cancels the return', async () => {
  const {ReleaseControls,MODULATION_AXES}=await import('../src/synth/release-controls.ts')
  const release=new ReleaseControls(),held={tone:.8,energy:1,space:1},target={tone:.1,energy:.2,space:.3}
  release.start(held,MODULATION_AXES,0)
  const middle=release.value(target,.16)
  assert.equal(middle.tone,.1)
  assert.ok(Math.abs(middle.energy-.6)<1e-10)
  assert.ok(Math.abs(middle.space-.65)<1e-10)
  // Audio lookahead must not finish the release ahead of wall-clock playback.
  release.value(target,.4)
  assert.equal(release.value(target,.16).energy,middle.energy)
  release.grab(MODULATION_AXES)
  assert.deepEqual(release.value(held,.17),held)
  assert.equal(release.active,false)
})


test('single finger changes bass body, grit and drums, with bounded multi-parameter expression', async () => {
  const {liveTargets,eventExpression}=await import('../src/synth/music-controls.ts')
  const source={s:'sine',gain:.5,decay:.15,release:.1,lpenv:2,fm:1}
  for(const feeling of ['bounce','night','float'] as const) {
    const left={tone:0,energy:.2,space:.3},right={...left,tone:1}
    const soft=liveTargets(feeling,'bass',left,true),hard=liveTargets(feeling,'bass',right,true)
    assert.ok(hard.cutoff>soft.cutoff*1.5)
    assert.ok(hard.body-soft.body>=4)
    assert.ok(hard.grit>soft.grit*2)
    assert.ok(liveTargets(feeling,'drums',right,true).cutoff>liveTargets(feeling,'drums',left,true).cutoff)
    for(const part of ['kick','sub'] as const) assert.deepEqual(eventExpression(part,right,source),source)
    assert.notEqual(eventExpression('bass',left,source).fm,eventExpression('bass',right,source).fm)
    assert.notEqual(eventExpression('drums',left,source).decay,eventExpression('drums',right,source).decay)
    for(const tone of [-1,0,1,2]) for(const energy of [-1,0,1,2]) for(const space of [-1,0,1,2]) {
      const value=liveTargets(feeling,'bass',{tone,energy,space},false)
      assert.ok(value.grit>=0 && value.grit<=.5)
      assert.ok(value.body>=-3 && value.body<=4)
      assert.ok(Math.abs(value.pan)<=1)
    }
  }
  assert.deepEqual(source,{s:'sine',gain:.5,decay:.15,release:.1,lpenv:2,fm:1})
})

test('single finger release can ease over a longer handoff without delaying a new touch', async () => {
  const {ReleaseControls,CONTROL_AXES}=await import('../src/synth/release-controls.ts')
  const release=new ReleaseControls(),held={tone:1,energy:.2,space:.3},target={tone:0,energy:.2,space:.3}
  release.start(held,CONTROL_AXES,0,.42)
  assert.equal(release.value(target,0).tone,1)
  assert.ok(Math.abs(release.value(target,.21).tone-.5)<1e-10)
  assert.ok(release.value(target,.32).tone>0)
  assert.equal(release.value(target,.43,true).tone,0)
  release.grab(CONTROL_AXES)
  assert.equal(release.value(held,.44).tone,1)
})
