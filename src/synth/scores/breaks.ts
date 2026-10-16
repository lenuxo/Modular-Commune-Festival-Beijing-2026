import {type Arrangement, melody, drum, chord, layer, repeat, V} from '../score-kit'

// Original 16-bar electro breaks. Dm / Bb / Gm / Am, with a 2-bar kick conversation.
// A deliberately digital palette: narrow PWM bass, crunchy pulse stabs and a
// dry square hook. Pulse oscillators lack the builtin .3 oscillator trim, so
// their event gains are correspondingly smaller than conventional waveforms.
// Non-sbd percussion sets pattack/psustain/panchor=0 for an immediate pitch
// transient; Strudel otherwise supplies a .2 s pitch attack and held sustain.
export function breaks(): Arrangement {
  const kicks = [
    [0,6,10],[0,3,7,10,14],[0,6,11],[0,3,7,10],
    [0,6,10],[0,3,7,10,14],[0,6,11],[0,3,10,15],
    [0,6,10,15],[0,3,7,10,14],[0,6,11,15],[0,3,7,10],
    [0,6,10],[0,3,7,10,14],[0,6,11],[0,3,10,15],
  ]
  const backbeat = repeat([4,12])
  const bass = [
    'd2 ~ ~ d3 ~ ~ c3 ~ ~ a2 d2 ~ ~ ~ f2 ~',
    'd2 ~ f2 ~ ~ a2 ~ c3 ~ ~ d3 ~ c3 ~ a2 ~',
    'bb1 ~ ~ bb2 ~ ~ a2 ~ ~ f2 bb1 ~ ~ ~ d2 ~',
    'bb1 ~ d2 ~ ~ f2 ~ a2 ~ ~ bb2 ~ a2 ~ f2 ~',
    'g1 ~ ~ g2 ~ ~ f2 ~ ~ d2 g1 ~ ~ ~ bb1 ~',
    'g1 ~ bb1 ~ ~ d2 ~ f2 ~ ~ g2 ~ f2 ~ d2 ~',
    'a1 ~ ~ a2 ~ ~ g2 ~ ~ e2 a1 ~ ~ ~ c2 ~',
    'a1 ~ c2 ~ ~ e2 ~ g2 ~ ~ a2 ~ ~ g2 e2 ~',
    'd2 ~ ~ d3 ~ ~ c3 ~ ~ a2 d2 ~ ~ f2 a2 ~',
    'd2 ~ f2 ~ ~ a2 ~ c3 ~ ~ d3 ~ f3 ~ c3 ~',
    'bb1 ~ ~ bb2 ~ ~ a2 ~ ~ f2 bb1 ~ ~ d2 f2 ~',
    'bb1 ~ d2 ~ ~ f2 ~ a2 ~ ~ bb2 ~ d3 ~ a2 ~',
    'g1 ~ ~ g2 ~ ~ f2 ~ ~ d2 g1 ~ ~ ~ bb1 ~',
    'g1 ~ bb1 ~ ~ d2 ~ f2 ~ ~ g2 ~ f2 ~ d2 ~',
    'a1 ~ ~ a2 ~ ~ g2 ~ ~ e2 a1 ~ ~ ~ c2 ~',
    'a1 ~ c2 ~ ~ e2 ~ g2 ~ ~ a2 ~ c3 ~ e3 ~',
  ]
  const voicings = [
    'f3,a3,c4','f3,a3,c4','d3,f3,a3','d3,f3,a3',
    'bb3,d4,f4','bb3,d4,f4','c4,e4,g4','c4,e4,g4',
    'a3,c4,f4','a3,c4,f4','f3,a3,d4','f3,a3,d4',
    'bb3,d4,f4','bb3,d4,f4','c4,e4,g4','c4,e4,g4',
  ]
  const rhythm = [
    '~ ~ x ~ ~ ~ ~ ~ ~ x ~ ~ ~ ~ ~ ~',
    '~ ~ ~ ~ ~ ~ x ~ ~ ~ ~ ~ ~ ~ x ~',
    '~ ~ x ~ ~ ~ ~ ~ ~ x ~ ~ ~ ~ ~ ~',
    '~ ~ ~ ~ ~ ~ x ~ ~ ~ ~ ~ ~ x ~ ~',
    '~ ~ x ~ ~ ~ ~ ~ ~ x ~ ~ ~ ~ ~ ~',
    '~ ~ ~ ~ ~ ~ x ~ ~ ~ ~ ~ ~ ~ x ~',
    '~ ~ x ~ ~ ~ ~ ~ ~ x ~ ~ ~ ~ ~ ~',
    '~ ~ ~ ~ ~ ~ x ~ ~ ~ ~ ~ ~ x ~ ~',
    '~ ~ x ~ ~ ~ x ~ ~ x ~ ~ ~ ~ ~ ~',
    '~ ~ ~ ~ ~ ~ x ~ ~ ~ ~ x ~ ~ x ~',
    '~ ~ x ~ ~ ~ x ~ ~ x ~ ~ ~ ~ ~ ~',
    '~ ~ ~ ~ ~ ~ x ~ ~ ~ ~ x ~ x ~ ~',
    '~ ~ x ~ ~ ~ ~ ~ ~ x ~ ~ ~ ~ ~ ~',
    '~ ~ ~ ~ ~ ~ x ~ ~ ~ ~ ~ ~ ~ x ~',
    '~ ~ x ~ ~ ~ ~ ~ ~ x ~ ~ ~ ~ ~ ~',
    '~ ~ ~ ~ ~ ~ x ~ ~ ~ ~ ~ ~ x ~ ~',
  ]
  return {gain:.91, parts:[
    {part:'kick',pattern:layer(
      drum('sbd',kicks,{note:33,gain:1.01,decay:.195,pdecay:.019,penv:33,lpf:4800}),
      // Preserve the broken kick conversation, with a hard, short mid-bass hit.
      drum('triangle',kicks,{...V,note:45,gain:.55,penv:7,pattack:0,pdecay:.015,psustain:0,panchor:0,gate:.085,decay:.052,release:.015,hpf:74,lpf:1350,crush:10}),
      drum('crackle',kicks,{...V,gain:.18,density:14,hpf:1900,lpf:6500,decay:.012,release:.005}),
    )},
    {part:'drums',pattern:layer(
      drum('white',backbeat,{...V,gain:.72,crush:8,hpf:950,lpf:10800,decay:.10,release:.027}),
      drum('pulse',backbeat,{...V,note:50,pw:.32,gain:.17,penv:8,pattack:0,pdecay:.021,psustain:0,panchor:0,decay:.06,release:.017,lpf:3600}),
      drum('[pink pink pink ~ ~ ~ ~ ~ ~ ~ ~ ~]',backbeat,{...V,gain:.32,hpf:1200,lpf:6800,decay:.015,release:.009}),
      drum('white',[
        [0,2,3,6,8,10,11,14],[0,2,6,7,8,10,13],[0,2,3,6,8,10,11,14],[0,2,6,8,10,13,15],
        [0,2,3,6,8,10,11,14],[0,2,6,7,8,10,13],[0,2,3,6,8,10,11,14],[0,2,6,8,10,13],
        [0,2,3,6,8,10,11,14],[0,2,5,6,7,8,10,13],[0,2,3,6,8,10,11,14],[0,2,6,8,10,13,15],
        [0,2,3,6,8,10,11,14],[0,2,6,7,8,10,13],[0,2,3,6,8,10,11,14],[0,2,6,8,10,13],
      ],{...V,gain:.31,crush:8,hpf:5900,lpf:13600,decay:.025,release:.008}),
      drum('white',[
        [7],[14],[7],[14],[7],[14],[7],[14,15],
        [7,15],[14],[7,15],[14],[7],[14],[7],[14,15],
      ],{...V,gain:.31,crush:8,hpf:5700,lpf:13200,decay:.083,release:.019}),
    )},
    {part:'extra',pattern:layer(
      drum('pulse',[
        [3,11],[7,15],[3,11],[7,10,15],
        [3,11],[7,15],[3,11],[7,9,11,15],
        [3,7,11],[7,15],[3,7,11],[7,10,15],
        [3,11],[7,15],[3,11],[7,9,11,15],
      ],{...V,note:83,pw:.13,gain:.07,crush:7,hpf:3100,lpf:11800,decay:.021,release:.008}),
      drum('sine',[
        [],[],[],[14,15],[],[],[],[13,14,15],
        [],[],[],[14,15],[],[],[],[10,11,14,15],
      ],{...V,note:55,gain:.48,penv:15,pattack:0,pdecay:.045,psustain:0,panchor:0,crush:8,decay:.09,release:.02,hpf:150}),
      drum('white',[
        [],[11],[],[10,14],[],[11],[],[10,14,15],
        [],[11],[],[10,14],[],[11],[],[10,14,15],
      ],{...V,gain:.27,crush:7,hpf:1900,lpf:9800,decay:.035,release:.012}),
    )},
    {part:'bass',pattern:melody(bass,{...V,s:'pulse',pw:.22,pwsweep:.08,pwrate:.65,gain:.21,crush:9,decay:.12,release:.023,hpf:100,lpf:3300,lpenv:1.6,lpdecay:.055,lpsustain:.15})},
    {part:'sub',pattern:melody([
      'd1 ~ ~ ~ ~ ~ ~ a1','d1 ~ ~ ~ d1 ~ ~ ~','bb0 ~ ~ ~ ~ ~ ~ f1','bb0 ~ ~ ~ bb0 ~ ~ ~',
      'g1 ~ ~ ~ ~ ~ ~ d1','g1 ~ ~ ~ g1 ~ ~ ~','a1 ~ ~ ~ ~ ~ ~ e1','a1 ~ ~ ~ a1 ~ ~ ~',
      'd1 ~ ~ ~ ~ ~ ~ a1','d1 ~ ~ ~ d1 ~ ~ ~','bb0 ~ ~ ~ ~ ~ ~ f1','bb0 ~ ~ ~ bb0 ~ ~ ~',
      'g1 ~ ~ ~ ~ ~ ~ d1','g1 ~ ~ ~ g1 ~ ~ ~','a1 ~ ~ ~ ~ ~ ~ e1','a1 ~ ~ ~ a1 ~ ~ ~',
    ],{...V,s:'sine',gain:.5,decay:.17,release:.027,lpf:170})},
    {part:'chords',pattern:chord(voicings,rhythm,{...V,s:'pulse',pw:.31,pwsweep:.06,pwrate:.8,crush:7,gain:.07,decay:.075,release:.035,hpf:550,lpf:5200})},
    {part:'motif',pattern:melody([
      '~ ~ a4 ~ d5 ~ ~ ~ ~ ~ c5 a4 ~ ~ f4 ~',
      '~ ~ a4 ~ ~ ~ c5 ~ d5 ~ ~ ~ ~ ~ ~ ~',
      '~ ~ f4 ~ bb4 ~ ~ ~ ~ ~ a4 f4 ~ ~ d4 ~',
      '~ ~ f4 ~ ~ ~ a4 ~ bb4 ~ ~ ~ ~ ~ ~ ~',
      '~ ~ d5 ~ g5 ~ ~ ~ ~ ~ f5 d5 ~ ~ bb4 ~',
      '~ ~ d5 ~ ~ ~ f5 ~ g5 ~ ~ ~ ~ ~ ~ ~',
      '~ ~ e5 ~ a5 ~ ~ ~ ~ ~ g5 e5 ~ ~ c5 ~',
      '~ ~ e5 ~ ~ ~ g5 ~ a5 ~ ~ ~ g5 ~ e5 ~',
      '~ ~ d5 ~ f5 ~ ~ ~ ~ ~ e5 c5 ~ ~ a4 ~',
      '~ ~ d5 ~ ~ ~ c5 ~ a4 ~ ~ ~ ~ ~ ~ ~',
      '~ ~ bb4 ~ d5 ~ ~ ~ ~ ~ c5 a4 ~ ~ f4 ~',
      '~ ~ bb4 ~ ~ ~ a4 ~ f4 ~ ~ ~ ~ ~ ~ ~',
      '~ ~ d5 ~ g5 ~ ~ ~ ~ ~ f5 d5 ~ ~ bb4 ~',
      '~ ~ d5 ~ ~ ~ f5 ~ g5 ~ ~ ~ ~ ~ ~ ~',
      '~ ~ e5 ~ a5 ~ ~ ~ ~ ~ g5 e5 ~ ~ c5 ~',
      '~ ~ e5 ~ ~ ~ g5 ~ a5 ~ ~ ~ c6 ~ a5 ~',
    ],{...V,s:'pulse',pw:.18,pwsweep:.065,pwrate:.7,crush:8,gain:.085,decay:.07,release:.035,hpf:630,lpf:7200})},
    {part:'air',pattern:melody([
      '~','~ c5 ~ ~','~','~ a4 ~ ~','~','~ f5 ~ ~','~','~ g5 ~ ~',
      '~ a5 ~ ~','~ c6 ~ ~','~ f5 ~ ~','~ a5 ~ ~','~','~ f5 ~ ~','~','~ g5 ~ ~',
    ],{...V,s:'square',crush:7,gain:.14,decay:.038,release:.045,hpf:1400,lpf:7600,pan:.7})},
    {part:'fx',pattern:layer(
      drum('white',[[0],[],[],[],[0],[],[],[],[0],[],[],[],[0],[],[],[]],{...V,gain:.12,crush:7,decay:.29,release:.13,hpf:6500,lpf:12000}),
      drum('pulse',[[],[],[],[15],[],[],[],[15],[],[],[],[15],[],[],[],[15]],{...V,note:83,pw:.12,gain:.055,penv:-17,pattack:0,pdecay:.13,psustain:0,panchor:0,crush:7,decay:.1,release:.05,hpf:700,lpf:7800}),
    )},
  ]}
}
