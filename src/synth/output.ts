// Shared by live playback and offline audition so transient/headroom checks match.
export const MASTER_GAIN=.68
export function createOutput(context:BaseAudioContext) {
  const limiter=context.createDynamicsCompressor()
  limiter.threshold.value=-2.5;limiter.knee.value=1;limiter.ratio.value=12
  // Let the drum's initial knock through; limit peaks rather than flattening the whole mix.
  limiter.attack.value=.003;limiter.release.value=.045
  const master=context.createGain();master.gain.value=0
  limiter.connect(master);master.connect(context.destination)
  return {master,limiter}
}
