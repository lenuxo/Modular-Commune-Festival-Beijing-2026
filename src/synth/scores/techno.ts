import {type Arrangement, melody, drum, chord, layer, repeat, V} from '../score-kit'

/** F-pedal industrial techno: a heavy mono engine, clipped metal and cold suspended stabs. */
export function techno(): Arrangement {
  const quarters = repeat([0,4,8,12])
  const kicks = quarters.map((hits, bar) => bar===7 ? [0,4,8,12,15] : bar===15 ? [0,4,8] : hits)
  const backbeats = repeat([4,12])
  const closed = [
    [0,4,8,12],[0,2,4,8,10,12],[0,4,8,12],[0,2,4,8,10,12,15],
    [0,4,8,12],[0,2,4,8,10,12],[0,4,8,12],[0,2,4,8,10,12],
    [0,2,4,6,8,10,12,14],[0,2,4,6,8,10,12,14],[0,2,4,6,8,10,12,14],[0,2,4,6,8,10,12],
    [0,4,8,12],[0,2,4,8,10,12],[0,2,4,6,8,10,12,14],[0,2,4,8,10,12],
  ]
  const open = [
    [6,14],[2,6,14],[6,14],[2,6,10],
    [6,14],[2,6,10,14],[6,14],[2,6,10],
    [2,6,10,14],[2,6,10,14],[2,6,10,14],[2,6,10],
    [6,14],[2,6,14],[2,6,10,14],[2,6],
  ]
  const ghosts = [[],[],[3,11],[7,15],[],[7,15],[3,11],[11,14,15],
    [3,11],[7,15],[3,11],[7,11,15],[],[7,15],[3,11],[9,11,14,15]]
  const percussion = [[3,10],[3,7,14],[3,10],[7,10,15],[3,10],[7,11],[3,7,14],[7,10,13],
    [3,7,10,14],[3,7,11,14],[3,7,10,14],[7,10,13],[3,10],[3,7,14],[3,7,10,14],[7,10,13]]
  const fills = [[],[],[],[14],[],[],[],[14,15],[],[],[],[10,14,15],[],[],[],[10,11,14,15]]
  // A pedal, rather than a bright chord progression, makes the changing rhythm the hook.
  const bass = [
    '~ f2 ~ ~ ~ f2 ~ c2 ~ f2 ~ eb2 ~ f2 ~ ~',
    '~ f2 ~ f2 ~ f2 ~ ~ ~ f2 ~ c2 ~ eb2 ~ c2',
    '~ f2 ~ ~ ~ f2 ~ c2 ~ f2 ~ eb2 ~ f2 ~ ~',
    '~ f2 ~ f2 ~ f2 ~ c2 ~ f2 ~ ~ ~ eb2 ~ ~',
    '~ f2 ~ ~ ~ f2 ~ c2 ~ f2 ~ ab1 ~ f2 ~ ~',
    '~ f2 ~ f2 ~ f2 ~ ~ ~ f2 ~ c2 ~ eb2 ~ c2',
    '~ f2 ~ ~ ~ f2 ~ c2 ~ f2 ~ eb2 ~ f2 ~ ~',
    '~ f2 ~ f2 ~ f2 ~ c2 ~ f2 ~ eb2 ~ c2 ~ ~',
    '~ f2 ~ f2 ~ f2 ~ c2 ~ f2 ~ eb2 ~ f2 ~ c2',
    '~ f2 ~ f2 ~ f2 ~ c2 ~ f2 ~ c2 ~ eb2 ~ c2',
    '~ f2 ~ f2 ~ f2 ~ c2 ~ f2 ~ eb2 ~ f2 ~ c2',
    '~ f2 ~ f2 ~ f2 ~ c2 ~ f2 ~ eb2 ~ c2 ~ ~',
    '~ f2 ~ ~ ~ f2 ~ c2 ~ f2 ~ ab1 ~ f2 ~ ~',
    '~ f2 ~ f2 ~ f2 ~ ~ ~ f2 ~ c2 ~ eb2 ~ c2',
    '~ f2 ~ f2 ~ f2 ~ c2 ~ f2 ~ eb2 ~ f2 ~ c2',
    '~ f2 ~ f2 ~ f2 ~ c2 ~ f2 ~ eb2 ~ c2 ~ ~',
  ]
  const sub = bass.map(bar=>bar.replace(/([a-g](?:b|#)?)([12])/g,
    (_,name,octave)=>`${name}${Math.max(1,Number(octave)-1)}`))
  const stabs = [
    'f3,c4,gb4','f3,c4,gb4','f3,ab3,eb4','f3,c4,gb4',
    'f3,c4,gb4','f3,ab3,eb4','f3,c4,gb4','f3,ab3,eb4',
    'f3,c4,gb4','f3,ab3,eb4','f3,c4,gb4','f3,c4,gb4',
    'f3,c4,gb4','f3,ab3,eb4','f3,c4,gb4','f3,ab3,eb4',
  ]
  const rhythms = [
    '~ ~ x ~ ~ ~ ~ ~','~','~ ~ ~ ~ ~ x ~ ~','~ ~ x ~ ~ ~ ~ ~',
    '~ ~ ~ ~ ~ x ~ ~','~','~ ~ x ~ ~ ~ ~ ~','~ ~ ~ ~ ~ x ~ ~',
    '~ ~ x ~ ~ x ~ ~','~ ~ ~ x ~ ~ x ~','~ ~ x ~ ~ x ~ ~','~ ~ ~ x ~ ~ ~ ~',
    '~','~ ~ ~ ~ ~ x ~ ~','~ ~ x ~ ~ x ~ ~','~ ~ ~ x ~ ~ ~ ~',
  ]
  const motif = [
    '~ ~ f3 ~ ~ ~ ~ ~ ~ ~ c4 ~ ~ ~ ~ ~','~ ~ ~ ~ eb4 ~ ~ ~ ~ f3 ~ ~ ~ ~ ~ ~',
    '~ ~ f3 ~ ~ ~ ~ ~ ~ ~ c4 ~ ~ ~ ~ ~','~ ~ ~ ~ eb4 ~ ~ gb4 ~ f3 ~ ~ ~ ~ ~ ~',
    '~ ~ f3 ~ ~ ~ ~ ~ ~ ~ c4 ~ ~ ~ ~ ~','~ ~ ~ ~ eb4 ~ ~ ~ ~ f3 ~ ~ ~ ~ ~ ~',
    '~ ~ f3 ~ ~ ~ ~ ~ ~ ~ c4 ~ ~ ~ ~ ~','~ ~ ~ ~ gb4 ~ eb4 ~ ~ f3 ~ ~ ~ ~ ~ ~',
    '~ ~ f3 ~ ~ ~ c4 ~ ~ ~ eb4 ~ ~ f3 ~ ~','~ ~ ~ ~ eb4 ~ ~ ~ ~ f3 ~ ~ ~ c4 ~ ~',
    '~ ~ f3 ~ ~ ~ c4 ~ ~ ~ eb4 ~ ~ f3 ~ ~','~ ~ ~ ~ gb4 ~ eb4 ~ ~ f3 ~ ~ ~ ~ ~ ~',
    '~','~ ~ ~ ~ eb4 ~ ~ ~ ~ f3 ~ ~ ~ ~ ~ ~',
    '~ ~ f3 ~ ~ ~ c4 ~ ~ ~ eb4 ~ ~ f3 ~ ~','~ ~ ~ ~ gb4 ~ eb4 ~ ~ f3 ~ ~ ~ ~ ~ ~',
  ]
  return {gain:.95, parts:[
    {part:'kick',pattern:layer(
      drum('sbd',kicks,{gain:.96,note:29,decay:.215,penv:35,pdecay:.020,lpf:4100,distort:.50,distortvol:.73}),
      drum('triangle',kicks,{...V,note:41,gain:.24,penv:9,pattack:0,pdecay:.012,psustain:0,panchor:0,decay:.043,release:.016,lpf:680}),
      drum('white',kicks,{...V,gain:.10,hpf:1900,lpf:5400,decay:.009,release:.006}))},
    {part:'drums',pattern:layer(
      drum('white',backbeats,{...V,gain:.53,hpf:1100,lpf:8300,decay:.064,release:.016,distort:.3,distortvol:.83}),
      drum('[pink pink pink ~ ~ ~ ~ ~ ~ ~ ~ ~]',backbeats,{...V,gain:.30,hpf:1700,lpf:8800,decay:.015,release:.008,pan:.53}),
      drum('triangle',backbeats,{...V,note:46,penv:8,pattack:0,pdecay:.015,psustain:0,panchor:0,fm:1.5,fmh:1.8,gain:.35,decay:.048,release:.018}),
      drum('square',closed,{...V,note:91,fm:5.2,fmh:3.71,gain:.145,hpf:5900,lpf:12200,decay:.018,release:.009,pan:.46}),
      drum('white',open,{...V,gain:.29,hpf:5800,lpf:12000,decay:.078,release:.022,pan:.55}))},
    {part:'extra',pattern:layer(
      drum('square',percussion,{...V,note:74,fm:6.5,fmh:2.71,gain:.20,hpf:1700,lpf:7300,decay:.026,release:.013,distort:.25,distortvol:.82,pan:.60}),
      drum('white',ghosts,{...V,gain:.14,hpf:6700,lpf:11500,decay:.015,release:.008,pan:.40}),
      drum('pulse',fills,{...V,note:43,pw:.22,penv:14,pattack:0,pdecay:.025,psustain:0,panchor:0,gain:.23,lpf:2100,decay:.056,release:.018,crush:9}))},
    {part:'bass',pattern:layer(
      melody(bass,{...V,s:'sawtooth',gain:.50,hpf:44,lpf:760,lpq:1.25,lpenv:2,lpdecay:.11,lpsustain:.18,gate:.165,decay:.13,sustain:.20,release:.032,distort:.34,distortvol:.78,pan:.5}),
      melody(bass,{...V,s:'user',partials:[1,.48,.24,.10,.04],gain:.25,hpf:40,lpf:650,gate:.18,attack:.004,decay:.12,sustain:.30,release:.03,pan:.5}))},
    {part:'sub',pattern:melody(sub,{...V,s:'sine',gain:.43,hpf:27,lpf:145,gate:.17,decay:.14,sustain:.20,release:.035,pan:.5})},
    {part:'chords',pattern:chord(stabs,rhythms,{...V,s:'sawtooth',gain:.18,hpf:280,lpf:1650,lpq:1.65,lpenv:2.4,lpdecay:.035,lpsustain:0,decay:.063,release:.032,distort:.48,distortvol:.72})},
    {part:'motif',pattern:melody(motif,
      {...V,s:'pulse',pw:.145,gain:.24,hpf:270,lpf:1200,lpq:2.7,lpenv:2.8,lpdecay:.035,lpsustain:.02,gate:.083,decay:.062,release:.022,distort:.36,distortvol:.76,pan:.5})},
    {part:'air',pattern:melody(['~','~','~','~','~','~','~','~',
      '~ ~ ~ ~ ~ ~ c6 ~','~','~ ~ ~ ~ ~ ~ gb6 ~','~ ~ ~ ~ eb6 ~ ~ ~',
      '~','~','~ ~ ~ ~ ~ ~ c6 ~','~'],
      {...V,s:'sine',fm:4.2,fmh:2.71,gain:.10,hpf:2300,lpf:7200,gate:.10,decay:.09,release:.028,pan:.37})},
    {part:'fx',pattern:layer(
      drum('white',[[0],[],[],[],[],[],[],[14],[0],[],[],[],[0],[],[],[14]],
        {...V,gain:.09,hpf:3900,lpf:9500,decay:.25,release:.08,distort:.3,distortvol:.8,pan:.54}),
      drum('sine',[[],[],[],[14],[],[],[],[12],[],[],[],[14],[],[],[],[12]],
        {...V,note:83,fm:7.5,fmh:2.71,gain:.13,hpf:1100,lpf:8200,attack:.004,decay:.16,release:.08,pan:.30}),
      drum('white',[[],[],[],[],[],[],[],[14],[],[],[],[14],[],[],[],[12]],
        {...V,gain:.09,hpf:4200,lpf:9000,attack:.12,decay:.16,release:.08,pan:.65}))},
  ]}
}
