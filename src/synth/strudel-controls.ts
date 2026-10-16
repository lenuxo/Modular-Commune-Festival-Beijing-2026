// Pattern methods translate aliases before creating events. Our scores also write
// raw event objects, so translate those names explicitly before calling superdough.
const aliases: Readonly<Record<string, string>> = {
  lpf: 'cutoff',
  lpq: 'resonance',
  hpf: 'hcutoff',
  hpq: 'hresonance',
  bpf: 'bandf',
  bpq: 'bandq',
  fm: 'fmi',
  fm1: 'fmi',
  fmi1: 'fmi',
  fmh1: 'fmh',
  fm2: 'fmi2',
  fm3: 'fmi3',
  fm4: 'fmi4',
  fm5: 'fmi5',
  fm6: 'fmi6',
  fm7: 'fmi7',
  fm8: 'fmi8',
}

/** Preserve canonical/unknown controls and never mutate a score's source event. */
export function engineControls(source: Record<string, unknown>): Record<string, unknown> {
  const controls = {...source}
  for (const [alias, canonical] of Object.entries(aliases)) {
    if (!Object.prototype.hasOwnProperty.call(source, alias)) continue
    if (!Object.prototype.hasOwnProperty.call(controls, canonical)) controls[canonical] = source[alias]
    delete controls[alias]
  }
  return controls
}
