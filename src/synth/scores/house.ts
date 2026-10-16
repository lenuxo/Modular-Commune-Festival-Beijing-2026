import {type Arrangement, melody, drum, chord, layer, repeat, V} from '../score-kit'

// Original 16-bar piano/disco house. Fm9 / Dbmaj9 / Abmaj9 / Eb9.
// A two-bar sung-style hook, rootless piano voicings and an answering octave bass.
// The repeated-hook / changing-harmony approach takes a cue from French house,
// rather than reproducing a record's melody or importing its sampled loop.
// Harmonic amplitudes use Strudel's builtin periodic-wave oscillator, with no samples.
// Non-sbd percussion sets pattack/psustain/panchor=0: Strudel's default .2 s
// pitch attack would otherwise turn a drum's quick down-sweep into a slow rise.
export function house(): Arrangement {
  const four = repeat([0,4,8,12])
  const backbeat = repeat([4,12])
  // Offbeat open hats answer the beat-aligned closed hat. Occasional gaps make
  // the longer accents breathe, rather than layering two hiss tracks together.
  const openHats = [
    [2,6,10,14],[2,6,14],[2,6,10,14],[2,6,10],
    [2,6,10,14],[2,10,14],[2,6,10,14],[2,6,10],
    [2,6,10,14],[2,6,10,14],[2,6,10,14],[2,6,14],
    [2,6,10,14],[2,10,14],[2,6,10,14],[2,6],
  ]
  const hatPickups = [
    [],[7],[],[13,15],[],[7],[],[11,15],
    [7],[7,15],[7],[13,15],[],[7],[],[11,13,15],
  ]
  const bass = [
    'f2 ~ ~ c3 ~ eb3 f3 ~ ~ c3 ~ ab2 ~ c3 eb3 ~',
    'f2 ~ ~ ab2 ~ c3 ~ eb3 f3 ~ eb3 ~ c3 ~ ab2 ~',
    'db2 ~ ~ ab2 ~ c3 db3 ~ ~ ab2 ~ f2 ~ ab2 c3 ~',
    'db2 ~ ~ f2 ~ ab2 ~ c3 db3 ~ c3 ~ ab2 ~ f2 ~',
    'ab1 ~ ~ eb2 ~ g2 ab2 ~ ~ eb2 ~ c2 ~ eb2 g2 ~',
    'ab1 ~ ~ c2 ~ eb2 ~ g2 ab2 ~ g2 ~ eb2 ~ c2 ~',
    'eb2 ~ ~ bb2 ~ db3 eb3 ~ ~ bb2 ~ g2 ~ bb2 db3 ~',
    'eb2 ~ ~ g2 ~ bb2 ~ db3 eb3 ~ db3 ~ bb2 ~ c3 eb2',
    'f2 ~ ~ c3 ~ eb3 f3 ~ ~ c3 ~ ab2 ~ c3 eb3 ~',
    'f2 ~ ~ ab2 ~ c3 ~ eb3 f3 ~ c3 ~ ab2 c3 eb3 ~',
    'db2 ~ ~ ab2 ~ c3 db3 ~ ~ ab2 ~ f2 ~ ab2 c3 ~',
    'db2 ~ ~ f2 ~ ab2 ~ c3 db3 ~ ab2 ~ f2 ab2 c3 ~',
    'ab1 ~ ~ eb2 ~ g2 ab2 ~ ~ eb2 ~ c2 ~ eb2 g2 ~',
    'ab1 ~ ~ c2 ~ eb2 ~ g2 ab2 ~ g2 ~ eb2 ~ c2 ~',
    'eb2 ~ ~ bb2 ~ db3 eb3 ~ ~ bb2 ~ g2 ~ bb2 db3 ~',
    'eb2 ~ ~ g2 ~ bb2 ~ db3 eb3 ~ db3 ~ c3 ~ eb3 e2',
  ]
  const voicings = [
    'ab3,c4,eb4,g4','ab3,c4,eb4,g4','ab3,c4,eb4,f4','ab3,c4,eb4,f4',
    'g3,bb3,c4,eb4','g3,bb3,c4,eb4','g3,bb3,db4,f4','g3,bb3,db4,f4',
    'ab3,c4,eb4,g4','c4,eb4,g4,ab4','ab3,c4,eb4,f4','c4,eb4,f4,ab4',
    'g3,bb3,c4,eb4','bb3,c4,eb4,g4','g3,bb3,db4,f4','g3,bb3,db4,f4',
  ]
  const rhythm = [
    'x ~ ~ x ~ ~ x ~ ~ x ~ ~ ~ ~ x ~',
    '~ ~ x ~ ~ x ~ ~ x ~ ~ x ~ ~ x ~',
    'x ~ ~ x ~ ~ x ~ ~ x ~ ~ ~ ~ x ~',
    '~ ~ x ~ ~ x ~ ~ x ~ ~ x ~ x ~ ~',
    'x ~ ~ x ~ ~ x ~ ~ x ~ ~ ~ ~ x ~',
    '~ ~ x ~ ~ x ~ ~ x ~ ~ x ~ ~ x ~',
    'x ~ ~ x ~ ~ x ~ ~ x ~ ~ ~ ~ x ~',
    '~ ~ x ~ ~ x ~ ~ x ~ ~ x ~ x ~ x',
    'x ~ ~ x ~ ~ x ~ ~ x ~ ~ ~ ~ x ~',
    '~ ~ x ~ ~ x ~ ~ x ~ ~ x ~ ~ x ~',
    'x ~ ~ x ~ ~ x ~ ~ x ~ ~ ~ ~ x ~',
    '~ ~ x ~ ~ x ~ ~ x ~ ~ x ~ x ~ ~',
    'x ~ ~ x ~ ~ x ~ ~ x ~ ~ ~ ~ x ~',
    '~ ~ x ~ ~ x ~ ~ x ~ ~ x ~ ~ x ~',
    'x ~ ~ x ~ ~ x ~ ~ x ~ ~ ~ ~ x ~',
    '~ ~ x ~ ~ x ~ ~ x ~ ~ x ~ x ~ x',
  ]
  return {gain:.91, parts:[
    {part:'kick',pattern:layer(
      drum('sbd',four,{note:29,gain:.97,decay:.235,pdecay:.022,penv:31,lpf:4400}),
      // A brief 90–130 Hz knock carries the kick on small phone speakers too.
      drum('triangle',four,{...V,note:41,gain:.62,penv:6,pattack:0,pdecay:.018,psustain:0,panchor:0,gate:.10,decay:.07,release:.019,hpf:62,lpf:950}),
      drum('white',four,{...V,gain:.15,hpf:1400,lpf:4800,decay:.01,release:.005}),
    )},
    {part:'drums',pattern:layer(
      // Three transients inside ~20 ms, followed by silence: a clap, rather than a roll.
      drum('[pink pink pink ~ ~ ~ ~ ~ ~ ~ ~ ~]',backbeat,{...V,gain:.86,hpf:650,lpf:7200,decay:.018,release:.013}),
      drum('white',backbeat,{...V,gain:.40,hpf:1050,lpf:6900,decay:.09,release:.026}),
      drum('sine',backbeat,{...V,note:58,gain:.34,penv:4,pattack:0,pdecay:.018,psustain:0,panchor:0,decay:.04,release:.014}),
      drum('white',four,{...V,gain:.27,hpf:6100,lpf:12200,decay:.025,release:.009}).swingBy(.055,8),
      drum('white',openHats,{...V,gain:.33,hpf:5400,lpf:11800,decay:.092,release:.025}).swingBy(.055,8),
      drum('white',hatPickups,{...V,gain:.17,hpf:6800,lpf:12600,decay:.017,release:.006}).swingBy(.055,8),
    )},
    {part:'extra',pattern:layer(
      drum('sine',[
        [3,10,15],[3,7,11],[3,10,15],[3,7,10,14],
        [3,10,15],[3,7,11],[3,10,15],[3,7,11,13,15],
        [3,7,10,15],[3,7,11],[3,7,10,15],[3,7,10,14],
        [3,10,15],[3,7,11],[3,10,15],[3,7,11,13,15],
      ],{...V,note:57,gain:.54,penv:7,pattack:0,pdecay:.026,psustain:0,panchor:0,decay:.09,release:.022,hpf:140}).swingBy(.055,8),
      drum('user',[
        [],[11],[],[11,15],[],[11],[],[9,11,15],
        [7,15],[11],[7,15],[11,15],[],[11],[],[9,11,15],
      ],{...V,note:84,partials:[1,0,.6,0,.22],gain:.19,hpf:1000,lpf:6000,decay:.018,release:.008}),
    )},
    {part:'bass',pattern:melody(bass,{...V,s:'triangle',gain:.78,lpf:1050,lpq:.65,lpenv:1.5,lpdecay:.1,lpsustain:.16,penv:.7,pattack:0,pdecay:.022,psustain:0,panchor:0,hpf:85,decay:.16,release:.045}).swingBy(.055,8)},
    {part:'sub',pattern:melody([
      '~ f1 ~ ~ ~ f1 ~ ~','~ f1 ~ ~ ~ f1 ~ ~','~ db1 ~ ~ ~ db1 ~ ~','~ db1 ~ ~ ~ db1 ~ ~',
      '~ ab1 ~ ~ ~ ab1 ~ ~','~ ab1 ~ ~ ~ ab1 ~ ~','~ eb1 ~ ~ ~ eb1 ~ ~','~ eb1 ~ ~ ~ eb1 ~ ~',
      '~ f1 ~ ~ ~ f1 ~ ~','~ f1 ~ ~ ~ f1 ~ ~','~ db1 ~ ~ ~ db1 ~ ~','~ db1 ~ ~ ~ db1 ~ ~',
      '~ ab1 ~ ~ ~ ab1 ~ ~','~ ab1 ~ ~ ~ ab1 ~ ~','~ eb1 ~ ~ ~ eb1 ~ ~','~ eb1 ~ ~ ~ eb1 ~ ~',
    ],{...V,s:'sine',gain:.38,decay:.2,release:.035,lpf:180})},
    {part:'chords',pattern:chord(voicings,rhythm,{...V,s:'user',partials:[1,.48,.24,.17,.09,.07,.025,.02],vib:5.4,vibmod:.012,gain:.265,attack:.002,decay:.28,sustain:.06,release:.12,hpf:230,lpf:4600}).swingBy(.055,8)},
    {part:'motif',pattern:melody([
      // A: a repeated, hummable seven-note call and a falling response.
      'c5 ~ ~ eb5 ~ f5 ~ ~ eb5 ~ c5 ~ ab4 ~ c5 ~',
      '~ ~ eb5 ~ c5 ~ ab4 ~ ~ g4 ab4 ~ c5 ~ ~ ~',
      'c5 ~ ~ eb5 ~ f5 ~ ~ eb5 ~ c5 ~ ab4 ~ c5 ~',
      '~ ~ f5 ~ eb5 ~ c5 ~ ~ bb4 ab4 ~ c5 ~ ~ ~',
      // B: the same rhythm opens upwards, then answers towards the tonic.
      'eb5 ~ ~ f5 ~ g5 ~ ~ f5 ~ eb5 ~ c5 ~ eb5 ~',
      '~ ~ g5 ~ f5 ~ eb5 ~ ~ c5 bb4 ~ c5 ~ ~ ~',
      'db5 ~ ~ eb5 ~ f5 ~ ~ eb5 ~ db5 ~ bb4 ~ db5 ~',
      '~ ~ f5 ~ eb5 ~ db5 ~ ~ bb4 g4 ~ ab4 ~ bb4 c5',
      // Return: the opening hook stays recognisable; only answers develop.
      'c5 ~ ~ eb5 ~ f5 ~ ~ eb5 ~ c5 ~ ab4 ~ c5 ~',
      '~ ~ eb5 ~ c5 ~ ab4 ~ ~ c5 eb5 ~ f5 ~ ~ ~',
      'c5 ~ ~ eb5 ~ f5 ~ ~ eb5 ~ c5 ~ ab4 ~ c5 ~',
      '~ ~ f5 ~ eb5 ~ c5 ~ ~ bb4 ab4 ~ c5 ~ ~ ~',
      'eb5 ~ ~ f5 ~ g5 ~ ~ f5 ~ eb5 ~ c5 ~ eb5 ~',
      '~ ~ g5 ~ f5 ~ eb5 ~ ~ c5 bb4 ~ c5 ~ ~ ~',
      'db5 ~ ~ eb5 ~ f5 ~ ~ eb5 ~ db5 ~ bb4 ~ db5 ~',
      '~ ~ f5 ~ eb5 ~ db5 ~ ~ bb4 g4 ~ c5 ~ ~ ~',
    ],{...V,s:'user',partials:[1,.32,.12,.06,.03,.018],vib:5.1,vibmod:.016,gain:.46,attack:.003,decay:.265,sustain:.06,release:.14,hpf:340,lpf:5200}).swingBy(.055,8)},
    {part:'air',pattern:melody([
      '~','~ ~ ~ ~ ~ ~ ~ c6','~','~ ~ ~ ~ ~ ~ ~ ab5',
      '~','~ ~ ~ ~ ~ ~ ~ g5','~','~ ~ ~ ~ ~ ~ ~ bb5',
      '~','~ ~ ~ ~ ~ ~ ~ c6','~','~ ~ ~ ~ ~ ~ ~ ab5',
      '~','~ ~ ~ ~ ~ ~ ~ g5','~','~ ~ ~ ~ ~ ~ ~ c6',
    ],{...V,s:'user',partials:[1,.03,.12],vib:4.8,vibmod:.025,gain:.13,attack:.008,decay:.2,release:.11,hpf:900,lpf:4200,pan:.64})},
    {part:'fx',pattern:layer(
      drum('pink',[[0],[],[],[],[0],[],[],[],[0],[],[],[],[0],[],[],[]],{...V,gain:.23,decay:.5,release:.2,hpf:4700,lpf:9500}),
      drum('pink',[[],[],[],[14],[],[],[],[14],[],[],[],[14],[],[],[],[14]],{...V,gain:.15,attack:.16,decay:.07,release:.07,hpf:2600,lpf:6200}),
    )},
  ]}
}
