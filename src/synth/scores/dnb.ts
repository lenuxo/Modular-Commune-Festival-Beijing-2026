import {type Arrangement, melody, drum, chord, layer, repeat, V} from '../score-kit'

/** Amen-inspired DnB: four-bar break grammar, clipped hooks and a weighty Reese/sub pair.
 * Drum Hub's transcription informs the kick doubles, ghosts and displaced snare;
 * every sound is synthesized here, without loading the original recording.
 */
export function dnb(): Arrangement {
  const kicks = [[0,2,10,11],[0,2,10,11],[0,2,10],[2,3,10],
    [0,2,10,11],[0,2,10,11],[0,2,10],[0,2,3,10],
    [0,2,10,11],[0,2,10,11],[0,2,8,10],[2,3,10],
    [0,2,10],[0,2,10,11],[0,2,10],[0,2,3,10,15]]
  const backbeats = [[4,12],[4,12],[4,14],[4,12,14],
    [4,12],[4,12],[4,14],[4,12,14],
    [4,12],[4,12],[4,14],[4,12,14],
    [4,12],[4,12],[4,14],[4,12,14]]
  const ghostSnares = [[7,15],[7,15],[7],[1,7],
    [7,15],[7,15],[7],[1,7,15],
    [7,15],[3,7,15],[7],[1,7],
    [7],[7,15],[7],[1,7,15]]
  const ghostAccents = repeat([9])
  // The eighth-note ride pulse stays readable; extra sixteenths answer the snare.
  const mainHats = repeat([0,4,8,12])
  const offHats = [[2,6,10,14],[2,6,10,14],[2,6,10,12],[2,6,8],
    [2,6,10,14],[2,6,10,14],[2,6,10,12],[2,6,8],
    [2,6,10,14],[2,6,10,14],[2,6,10,12],[2,6,8],
    [2,6,10],[2,6,10,14],[2,6,10,12],[2,6,8]]
  const hats = [[3,11],[7,15],[3,11],[7,15],
    [3,11],[7,15],[3,11],[7,15],
    [3,7,11],[3,11,15],[3,11],[7,15],
    [11],[7,15],[3,11],[7,15]]
  const openHats = [[],[],[],[10],[],[],[],[10],[],[],[],[10],[],[],[],[10]]
  const ride = [[],[],[],[],[],[],[],[],[0,8],[0,8],[0,8],[0],[],[],[0,8],[0]]
  const claps = [[],[12],[],[],[],[12],[],[12],[],[12],[],[],[],[12],[],[12]]
  const rolls = [[],[],[],[15],[],[],[],[15],[],[],[],[15],[],[],[],[15]]
  const bass = [
    'g2 ~ ~ ~ ~ ~ g2 ~ d3 ~ g2 ~ ~ ~ g2 ~',
    'g2 ~ ~ g2 ~ ~ ~ ~ ~ d3 g2 ~ ~ ~ f3 ~',
    'eb2 ~ ~ ~ ~ ~ eb2 ~ bb2 ~ eb2 ~ ~ ~ eb2 ~',
    'eb2 ~ ~ eb2 ~ ~ ~ ~ ~ bb2 eb2 ~ ~ ~ d3 ~',
    'bb2 ~ ~ ~ ~ ~ bb2 ~ f3 ~ bb2 ~ ~ ~ bb2 ~',
    'bb2 ~ ~ bb2 ~ ~ ~ ~ ~ f3 bb2 ~ ~ ~ a3 ~',
    'f2 ~ ~ ~ ~ ~ f2 ~ c3 ~ f2 ~ ~ ~ f2 ~',
    'f2 ~ ~ f2 ~ ~ ~ ~ ~ c3 f2 ~ ~ c3 eb3 ~',
    'g2 ~ ~ ~ ~ ~ g2 ~ d3 ~ g2 ~ ~ ~ bb2 ~',
    'g2 ~ ~ g2 ~ ~ ~ ~ ~ d3 g2 ~ ~ d3 f3 ~',
    'eb2 ~ ~ ~ ~ ~ eb2 ~ bb2 ~ eb2 ~ ~ ~ g2 ~',
    'eb2 ~ ~ eb2 ~ ~ ~ ~ ~ bb2 eb2 ~ ~ bb2 d3 ~',
    'bb2 ~ ~ ~ ~ ~ bb2 ~ ~ ~ bb2 ~ ~ ~ ~ ~',
    'bb2 ~ ~ bb2 ~ ~ ~ ~ ~ f3 bb2 ~ ~ ~ f3 ~',
    'f2 ~ ~ ~ ~ ~ f2 ~ c3 ~ f2 ~ ~ ~ a2 ~',
    'f2 ~ ~ f2 ~ ~ ~ ~ ~ c3 f2 ~ ~ c3 eb3 f3',
  ]
  // Root-only sub anchors the moving Reese; fifths live in its upper layer.
  const subRoots = ['g1','g1','eb1','eb1','bb1','bb1','f1','f1',
    'g1','g1','eb1','eb1','bb1','bb1','f1','f1']
  const sub = subRoots.map((root,bar) => bar === 12
    ? `${root} ~ ~ ~ ~ ~ ${root} ~ ~ ~ ${root} ~ ~ ~ ~ ~`
    : `${root} ~ ~ ~ ~ ~ ${root} ~ ~ ~ ${root} ~ ~ ~ ${root} ~`)
  const pads = ['bb3,d4,f4,a4','bb3,d4,f4,a4','g3,bb3,d4,f4','g3,bb3,d4,f4',
    'd3,f3,a3,c4','d3,f3,a3,c4','a3,c4,eb4,g4','a3,c4,eb4,g4',
    'bb3,d4,f4,a4','bb3,d4,f4,a4','g3,bb3,d4,f4','g3,bb3,d4,f4',
    'd3,f3,a3,c4','d3,f3,a3,c4','a3,c4,eb4,g4','a3,c4,eb4,g4']
  const chordCuts = [
    '~ ~ x ~ ~ ~ x ~ ~ x ~ ~ ~ ~ x ~','x ~ ~ ~ ~ x ~ ~ ~ ~ x ~ ~ x ~ ~',
    '~ ~ x ~ ~ ~ x ~ ~ x ~ ~ ~ ~ x ~','x ~ ~ ~ ~ x ~ ~ ~ ~ x ~ ~ x ~ x',
    '~ ~ x ~ ~ ~ x ~ ~ x ~ ~ ~ ~ x ~','x ~ ~ ~ ~ x ~ ~ ~ ~ x ~ ~ x ~ ~',
    '~ ~ x ~ ~ ~ x ~ ~ x ~ ~ ~ ~ x ~','x ~ ~ ~ ~ x ~ ~ ~ ~ x ~ ~ x x ~',
    '~ ~ x ~ ~ ~ x ~ ~ x ~ x ~ ~ x ~','x ~ ~ ~ ~ x ~ x ~ ~ x ~ ~ x ~ ~',
    '~ ~ x ~ ~ ~ x ~ ~ x ~ x ~ ~ x ~','x ~ ~ ~ ~ x ~ x ~ ~ x ~ ~ x ~ x',
    'x ~ ~ ~ ~ ~ ~ ~ ~ ~ x ~ ~ ~ ~ ~','~ ~ x ~ ~ ~ ~ ~ ~ x ~ ~ ~ ~ ~ ~',
    '~ ~ x ~ ~ ~ x ~ ~ x ~ x ~ ~ x ~','x ~ ~ ~ ~ x ~ ~ ~ ~ x ~ ~ x x ~',
  ]
  return {gain:.92, parts:[
    {part:'kick',pattern:layer(
      drum('sbd',kicks,{gain:.98,note:31,decay:.195,penv:30,pdecay:.024,lpf:4600}),
      drum('pink',kicks,{...V,gain:.13,hpf:1100,lpf:4500,decay:.011,release:.008}),
      drum('triangle',kicks,{...V,gain:.24,note:55,penv:14,pattack:0,pdecay:.012,psustain:0,panchor:0,decay:.026,release:.011,hpf:170,lpf:3100}))},
    {part:'drums',pattern:layer(
      drum('white',backbeats,{...V,gain:.89,hpf:1600,lpf:11800,decay:.092,release:.032}),
      drum('pink',backbeats,{...V,gain:.30,hpf:950,lpf:5900,decay:.068,release:.025}),
      drum('triangle',backbeats,{...V,note:51,penv:9,pattack:0,pdecay:.014,psustain:0,panchor:0,fm:.45,fmh:1.7,gain:.66,decay:.078,release:.026}),
      drum('[pink pink pink ~ ~ ~ ~ ~ ~ ~ ~ ~]',claps,
        {...V,gain:.44,hpf:1350,lpf:7900,decay:.014,release:.009,pan:.48}),
      drum('white',mainHats,{...V,gain:.18,hpf:7800,lpf:13500,decay:.021,release:.009,pan:.42}),
      drum('white',offHats,{...V,gain:.255,hpf:7200,lpf:13700,decay:.027,release:.011,pan:.58}),
      drum('white',ghostSnares,{...V,gain:.18,hpf:1300,lpf:7300,attack:.002,decay:.029,release:.013}),
      drum('pink',ghostAccents,{...V,gain:.31,hpf:1100,lpf:8100,attack:.001,decay:.036,release:.015}),
      drum('triangle',ghostAccents,{...V,note:52,gain:.20,decay:.033,release:.014,hpf:170,lpf:1600}))},
    {part:'extra',pattern:layer(
      drum('square',hats,{...V,note:88,fm:3.7,fmh:3.7,gain:.14,hpf:6500,lpf:13700,decay:.016,release:.009,pan:.64}),
      drum('white',openHats,{...V,gain:.32,hpf:6100,lpf:13700,decay:.13,release:.026,pan:.38}),
      drum('square',openHats,{...V,note:92,fm:4.7,fmh:1.39,gain:.10,hpf:7500,lpf:13200,decay:.11,release:.022,pan:.38}),
      drum('white',ride,{...V,gain:.18,hpf:8500,lpf:14200,decay:.10,release:.021,pan:.34}),
      drum('[white white]',rolls,{...V,gain:.28,hpf:1600,lpf:8000,decay:.026,release:.012,pan:.56}),
      drum('triangle',[[],[],[],[13],[],[],[],[13,14],[],[],[],[13,14],[],[],[],[11,13,14]],
        {...V,note:55,fm:1.6,fmh:1.3,penv:8,pattack:0,pdecay:.016,psustain:0,panchor:0,gain:.28,decay:.041,release:.016}))},
    {part:'bass',pattern:layer(
      melody(bass,{...V,s:'supersaw',unison:3,detune:.29,spread:.55,gain:.58,hpf:62,lpf:2700,lpenv:.72,lpdecay:.085,lpsustain:.32,gate:.17,attack:.005,decay:.12,sustain:.34,release:.042}),
      melody(bass,{...V,s:'user',partials:[1,.55,.28,.12],gain:.25,hpf:62,lpf:580,gate:.17,attack:.004,decay:.13,sustain:.38,release:.036}))},
    {part:'sub',pattern:melody(sub,{...V,s:'sine',gain:.70,gate:.21,attack:.005,decay:.18,sustain:.36,release:.035,lpf:130})},
    {part:'chords',pattern:chord(pads,chordCuts,
      {...V,s:'supersaw',unison:3,detune:.28,spread:.9,gain:.175,hpf:400,lpf:4700,gate:.095,attack:.008,decay:.11,sustain:.12,release:.038})},
    {part:'motif',pattern:melody([
      'd5 d5 ~ f5 d5 ~ bb4 ~ ~ d5 g5 ~ f5 d5 ~ ~',
      '~ bb4 d5 ~ f5 ~ g5 f5 ~ d5 ~ bb4 d5 ~ c5 ~',
      'd5 d5 ~ f5 d5 ~ bb4 ~ ~ g4 bb4 ~ d5 f5 ~ ~',
      '~ g5 f5 ~ d5 ~ bb4 g4 ~ bb4 ~ d5 f5 ~ d5 ~',
      'c5 c5 ~ d5 f5 ~ a4 ~ ~ c5 f5 ~ d5 c5 ~ ~',
      '~ a4 c5 ~ d5 ~ f5 d5 ~ c5 ~ a4 c5 ~ d5 ~',
      'c5 c5 ~ eb5 c5 ~ a4 ~ ~ c5 g5 ~ f5 eb5 ~ ~',
      '~ g4 a4 ~ c5 ~ eb5 c5 ~ a4 ~ g4 a4 c5 eb5 f5',
      'd5 d5 ~ f5 d5 ~ bb4 ~ ~ d5 g5 ~ a5 g5 ~ ~',
      '~ bb4 d5 ~ f5 ~ g5 a5 ~ g5 f5 ~ d5 ~ c5 ~',
      'd5 d5 ~ f5 d5 ~ bb4 ~ ~ g4 bb4 ~ d5 g5 ~ ~',
      '~ g5 f5 ~ d5 ~ bb4 g4 ~ bb4 d5 f5 g5 ~ f5 ~',
      'c5 ~ ~ d5 f5 ~ ~ ~ c5 ~ ~ a4 ~ ~ c5 ~',
      '~ a4 c5 ~ ~ ~ f5 ~ ~ d5 ~ c5 a4 ~ c5 ~',
      'c5 c5 ~ eb5 c5 ~ a4 ~ ~ c5 g5 ~ f5 eb5 ~ ~',
      '~ g5 f5 ~ eb5 ~ c5 a4 ~ c5 eb5 f5 g5 f5 d5 ~',
    ],{...V,s:'user',partials:[1,.06,.18,.025,.055],vib:5.1,vibmod:.025,gain:.36,hpf:320,lpf:6200,gate:.105,attack:.004,decay:.085,sustain:.14,release:.032,pan:.54})},
    {part:'air',pattern:melody(['~','~','~','~','~','~','~','~',
      '~ ~ ~ ~ ~ ~ ~ d6 ~ ~ ~ ~ ~ ~ a5 ~','~ ~ ~ ~ ~ f6 ~ ~ ~ ~ ~ ~ ~ ~ d6 ~',
      '~ ~ ~ ~ ~ ~ ~ bb5 ~ ~ ~ ~ ~ ~ f6 ~','~ ~ ~ ~ ~ d6 ~ ~ ~ ~ ~ ~ ~ f6 d6 ~',
      '~','~','~ ~ ~ ~ ~ ~ ~ c6 ~ ~ ~ ~ ~ ~ g5 ~','~ ~ ~ ~ ~ eb6 ~ ~ ~ ~ ~ c6 ~ ~ ~ ~'],
      {...V,s:'triangle',gain:.115,hpf:1500,lpf:5000,gate:.075,attack:.005,decay:.07,sustain:0,release:.026,vib:5.1,vibmod:.025,pan:.3})},
    {part:'fx',pattern:layer(
      drum('white',[[0],[],[],[],[0],[],[],[],[0],[],[],[],[0],[],[],[]],
        {...V,gain:.11,hpf:7200,lpf:14000,decay:.38,release:.15,pan:.65}),
      drum('white',[[],[],[],[14],[],[],[],[14],[],[],[],[14],[],[],[],[14]],
        {...V,gain:.09,hpf:4000,lpf:9500,attack:.045,decay:.11,release:.07,pan:.4}))},
  ]}
}
