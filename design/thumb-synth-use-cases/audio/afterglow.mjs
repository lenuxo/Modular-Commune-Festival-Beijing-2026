// Original eight-bar prototype, 2026-10-15. Strudel @strudel/web 1.3.0.
// 126 BPM, 4/4, D minor. Dm9 | Dm9 | Bbmaj9 | Bbmaj9 | Fmaj9 | Fmaj9 | Cadd9 | Csus -> C.
export const BPM = 126;
export const CPS = BPM / 240;
export const BARS = 8;
export function makeMusic(S) {
  const {s, note, stack, slowcat, silence} = S;
  const grid = xs => xs.map(x => x ?? '~').join(' ');
  const drum = (sound, rows, gain) => slowcat(...rows.map(row => s(grid(row.map(x => x ? sound : null))))).gain(gain);
  const slots = positions => Array.from({length:16}, (_,i)=>positions.includes(i));
  const kicks = [[0,4,8,12],[0,4,8,12],[0,4,8,12],[0,4,8,12,15],[0,4,8,12],[0,4,8,12],[0,4,8,12],[0,4,8]];
  const kick = drum('bd',kicks.map(slots),.78).orbit(0);
  const clap = drum('cp',Array.from({length:8},()=>slots([4,12])),.32).hpf(650).room(.08).roomsize(.8).orbit(1);
  const closed = slowcat(...Array.from({length:8},(_,b)=>s(grid(Array.from({length:16},(_,i)=> i%2===0 || b>=4&&[3,7,11,15].includes(i) ? 'hh' : null)))
    .gain(grid(Array.from({length:16},(_,i)=> i%4===2 ? .19 : i%2===0 ? .095 : .065)))))
    .swingBy(.06,8).hpf(5200).pan('.42 .58 .48 .61').orbit(1);
  const open = drum('oh',Array.from({length:8},(_,b)=>slots(b===7?[2,6]:b<4?[6,14]:[2,6,10,14])),.18).hpf(4900).release(.08).orbit(1);
  const rim = drum('rim',[[3,10],[7,15],[3,11],[7],[3,10,15],[7,11],[3,10],[3]].map(slots),.14).pan(.28).orbit(1);
  const tom = slowcat(silence,silence,silence,s('~ ~ ~ ~ ~ ~ ht mt'),silence,silence,silence,s('~ ~ ~ ~ ~ ht mt lt'))
    .gain(.23).pan('.35 .65').room(.1).orbit(1);
  const snare = slowcat(silence,silence,silence,s('~ ~ ~ ~ ~ ~ ~ sd').gain(.10),silence,silence,silence,
    s('~ ~ ~ ~ ~ ~ sd [sd sd]').gain('.05 .05 .05 .05 .05 .05 .12 .17')).hpf(500).orbit(1);
  const crash = slowcat(s('cr ~ ~ ~').gain(.16),silence,silence,silence,s('cr ~ ~ ~').gain(.11),silence,silence,silence).hpf(3800).orbit(1);

  const bassRows = [
    ['d2',null,null,'d2',null,null,'a2',null,'d2',null,null,'c3',null,'a2',null,null],
    ['d2',null,null,'d2',null,'a2',null,null,'c3',null,'a2',null,null,'d2',null,'a1'],
    ['bb1',null,null,'bb1',null,null,'f2',null,'bb1',null,null,'a2',null,'f2',null,null],
    ['bb1',null,null,'f2',null,'bb2',null,null,'a2',null,'f2',null,null,'bb1',null,'c2'],
    ['f2',null,null,'f2',null,null,'c3',null,'f2',null,null,'e3',null,'c3',null,null],
    ['f2',null,null,'f2',null,'c3',null,null,'e3',null,'c3',null,null,'f2',null,'g2'],
    ['c2',null,null,'c2',null,null,'g2',null,'c2',null,null,'d3',null,'g2',null,null],
    ['c2',null,null,'g2',null,'c3',null,null,'d3',null,'g2',null,'c2',null,null,null],
  ];
  const bassNotes = slowcat(...bassRows.map(row=>note(grid(row))));
  const bass = bassNotes.s('sawtooth').attack(.003).decay(.13).sustain(.08).release(.055)
    .lpf('<680 720 620 780 860 950 920 1100>').lpq(.7).lpenv(1.2).gain(.19).orbit(2);
  const sub = bassNotes.s('sine').attack(.004).decay(.16).sustain(.10).release(.045).gain(.23).orbit(2);

  const voicings = ['f3,a3,c4,e4','f3,a3,c4,e4','f3,a3,c4,d4','f3,a3,c4,d4','e3,a3,c4,g4','e3,a3,c4,g4','e3,g3,c4,d4','f3,g3,c4,d4'];
  const chords = slowcat(...voicings.map((v,b)=>note(v).struct(b===7?'~ x ~ x ~ x ~ ~':b%2?'~ x ~ [~ x] ~ x ~ x':'~ x ~ x ~ ~ ~ x')))
    .s('sawtooth').attack(.012).decay(.16).sustain(.03).release(.13).lpf('<1800 2100 1650 2000 2300 2600 2400 2900>')
    .hpf(320).gain(.075).pan('.43 .57').room(.18).roomsize(2).roomlp(4200).delay(.11).delaytime(60/BPM*.75).delayfeedback(.22).orbit(3);

  const melodyRows = [
    [null,null,'a4',null,'d5',null,null,'f5',null,'e5','d5',null,null,null,'a4',null],
    [null,'c5','d5',null,null,null,'a4',null,'g4',null,null,'a4',null,null,null,null],
    [null,null,'a4',null,'d5',null,null,'f5',null,'e5','d5',null,null,null,'c5',null],
    ['a4',null,null,'f4',null,null,'a4',null,'c5',null,'d5',null,null,null,null,null],
    [null,null,'c5',null,'f5',null,null,'a5',null,'g5','f5',null,null,null,'e5',null],
    [null,'c5','a4',null,null,null,'c5',null,'e5',null,null,'g5',null,'e5',null,null],
    [null,null,'g4',null,'c5',null,null,'e5',null,'d5','c5',null,null,null,'g4',null],
    ['a4',null,null,'g4',null,null,'e4',null,'d5',null,'c5',null,'a4',null,null,null],
  ];
  const lead = slowcat(...melodyRows.map(row=>note(grid(row)))).s('triangle').fm(.85).fmh(2)
    .attack(.004).decay(.22).sustain(.03).release(.20).lpf(4500).hpf(420).gain(.23)
    .pan('.47 .52 .49 .55').room(.23).roomsize(2.5).roomlp(5300)
    .delay(.24).delaytime(60/BPM*.75).delayfeedback(.30).orbit(4);
  const air = slowcat(silence,silence,silence,silence,note('~ a5 ~ e5 ~ c6 ~ g5'),note('~ g5 ~ e5 ~ c6 ~ a5'),note('~ g5 ~ d5 ~ e5 ~ g5'),note('~ g5 ~ e5 ~ d5 ~ ~'))
    .s('sine').attack(.006).decay(.12).sustain(0).release(.13).gain(.075).pan('.22 .76 .33 .68')
    .delay(.32).delaytime(60/BPM*.5).delayfeedback(.35).room(.3).roomsize(2.6).orbit(5);
  const sweep = slowcat(silence,silence,silence,s('~ ~ ~ white').attack(.23).release(.1).gain(.045),silence,silence,silence,
    s('~ ~ white ~').attack(.45).release(.12).gain(.065)).hpf(2600).lpf(6500).room(.2).orbit(6);

  const stems = {kick,drums:stack(clap,closed,open,rim,tom,snare,crash),bass:stack(bass,sub),chords,lead,air,sweep};
  return {stems, pattern:stack(...Object.values(stems)).postgain(.72)};
}
