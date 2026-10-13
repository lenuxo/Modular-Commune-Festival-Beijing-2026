import {clamp} from './model'
import type {Point} from './model'

export type FieldState = {playing: boolean; pulse: number; energy: number; space: number; lead: Point | null; second: Point | null; reduced: boolean}
export type FieldRenderer = {draw: (time: number, state: FieldState) => void; destroy: () => void}
const vertex = `
attribute vec2 a_grid;
uniform vec2 u_size;
uniform float u_time;
uniform float u_active;
uniform float u_pulse;
uniform float u_energy;
uniform float u_ratio;
uniform mediump float u_glow;
uniform vec3 u_lead;
uniform vec3 u_second;
varying float v_light;
varying float v_depth;
void main() {
  float depth = a_grid.y;
  float x = (a_grid.x * 2.0 - 1.0) * (0.57 + depth * 0.85);
  float y = 0.02 - depth * 1.09;
  float wave = sin(a_grid.x * 10.0 + depth * 8.0 - u_time * 0.9) * 0.043;
  wave += cos(a_grid.x * 15.0 - depth * 9.0 + u_time * 0.5) * 0.024;
  wave *= 0.6 + u_active * (0.8 + u_energy);
  float crest = exp(-pow((a_grid.x - 0.28) * 5.0, 2.0) - pow((depth - 0.32) * 4.0, 2.0));
  wave += crest * (0.07 + u_active * 0.09);
  float lx = u_lead.x * 2.0 - 1.0;
  float peak = exp(-pow((x - lx) * 4.3, 2.0) - pow((depth - 0.35) * 3.3, 2.0)) * u_lead.z;
  wave += peak * (0.18 + (1.0 - u_lead.y) * 0.20);
  vec2 world = vec2(x, y);
  vec2 sp = vec2(u_second.x * 2.0 - 1.0, 1.0 - u_second.y * 2.0);
  float dist = length((world - sp) * vec2(1.0, u_size.y / u_size.x));
  float ripple = sin(dist * 28.0 - u_time * 4.5) * exp(-dist * 2.2) * u_second.z;
  wave += ripple * 0.035;
  y += wave + u_pulse * 0.012 * sin(depth * 7.0);
  gl_Position = vec4(x, y, 0.0, 1.0);
  gl_PointSize = (1.8 + depth * 1.5 + peak * 0.5) * u_ratio * (1.0 + u_glow * 2.4);
  v_light = (0.20 + depth * 0.24 + crest * 0.20 + peak * 0.32 + abs(ripple) * 0.24) * (0.7 + u_active * 1.4);
  v_light += u_pulse * (0.07 + u_energy * 0.10);
  v_depth = depth;
}`
const fragment = `
precision mediump float;
uniform mediump float u_glow;
varying float v_light;
varying float v_depth;
void main() {
  float d = length(gl_PointCoord - vec2(0.5)) * 2.0;
  if (d > 1.0) discard;
  float core = 1.0 - smoothstep(0.25, 0.92, d);
  float halo = exp(-d * d * 5.0) * 0.18;
  float alpha = mix(core, halo, u_glow) * min(1.0, v_light);
  vec3 green = mix(vec3(0.30, 0.85, 0.29), vec3(0.77, 1.0, 0.65), min(1.0, v_light));
  gl_FragColor = vec4(green, alpha);
}`

function fallback(canvas: HTMLCanvasElement): FieldRenderer {
  const ctx = canvas.getContext('2d')
  return {
    draw(time, state) {
      if (!ctx) return
      const {width, height} = canvas.getBoundingClientRect()
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5)
      if (canvas.width !== Math.round(width * ratio) || canvas.height !== Math.round(height * ratio)) {
        canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio)
      }
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0); ctx.clearRect(0, 0, width, height)
      for (let row = 0; row < 42; row++) for (let col = 0; col < 65; col++) {
        const depth = row / 41, x = col / 64
        const wave = Math.sin(x * 10 + depth * 8 - time) * (state.playing ? .05 : .02)
        const peak = Math.exp(-(((x - (state.lead?.x ?? .3)) * 5) ** 2) - ((depth - .35) * 4) ** 2) * (state.lead ? .22 : .06)
        const px = width / 2 + (x * 2 - 1) * (.57 + depth * .85) * width / 2
        const py = height * (.49 + depth * .545 - wave - peak)
        const light = clamp((.18 + depth * .24 + peak) * (state.playing ? 1.7 : .8))
        const radius = .7 + depth * .5
        ctx.fillStyle = `rgba(100,240,90,${light * .09})`
        ctx.beginPath(); ctx.arc(px, py, radius * 3.2, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = `rgba(189,255,161,${light})`
        ctx.beginPath(); ctx.arc(px, py, radius, 0, Math.PI * 2); ctx.fill()
      }
    }, destroy() {ctx?.clearRect(0, 0, canvas.width, canvas.height)},
  }
}

/** The dot cloud is displaced on the GPU, rather than thousands of DOM nodes. */
export function createField(canvas: HTMLCanvasElement, fallbackCanvas: HTMLCanvasElement): FieldRenderer {
  const gl = canvas.getContext('webgl', {alpha: true, antialias: false, depth: false, powerPreference: 'low-power'})
  if (!gl || gl.isContextLost()) {fallbackCanvas.hidden = false; canvas.hidden = true; return fallback(fallbackCanvas)}
  canvas.hidden = false; fallbackCanvas.hidden = true
  const shaders: WebGLShader[] = []
  const program = gl.createProgram()!
  const buffer = gl.createBuffer()!
  let backup: FieldRenderer | null = null
  let destroyed = false
  const activateFallback = () => {
    canvas.hidden = true; fallbackCanvas.hidden = false
    backup ??= fallback(fallbackCanvas)
  }
  for (const [kind, code] of [[gl.VERTEX_SHADER, vertex], [gl.FRAGMENT_SHADER, fragment]] as const) {
    const shader = gl.createShader(kind)!
    gl.shaderSource(shader, code); gl.compileShader(shader)
    shaders.push(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {activateFallback(); break}
    gl.attachShader(program, shader)
  }
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) activateFallback()
  const grid = new Float32Array(80 * 56 * 2)
  let index = 0
  for (let y = 0; y < 56; y++) for (let x = 0; x < 80; x++) {grid[index++] = x / 79; grid[index++] = y / 55}
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer); gl.bufferData(gl.ARRAY_BUFFER, grid, gl.STATIC_DRAW)
  const attribute = gl.getAttribLocation(program, 'a_grid')
  const uniforms = Object.fromEntries(['size', 'time', 'active', 'pulse', 'energy', 'ratio', 'glow', 'lead', 'second'].map(key => [key, gl.getUniformLocation(program, `u_${key}`)]))
  const lost = (event: Event) => {event.preventDefault(); activateFallback()}
  canvas.addEventListener('webglcontextlost', lost)
  return {
    draw(time, state) {
      if (destroyed) return
      if (backup) {backup.draw(time, state); return}
      const rect = canvas.getBoundingClientRect(), ratio = Math.min(window.devicePixelRatio || 1, 1.6)
      const width = Math.max(1, Math.round(rect.width * ratio)), height = Math.max(1, Math.round(rect.height * ratio))
      if (canvas.width !== width || canvas.height !== height) {canvas.width = width; canvas.height = height}
      gl.viewport(0, 0, width, height); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT)
      gl.useProgram(program); gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
      gl.enableVertexAttribArray(attribute); gl.vertexAttribPointer(attribute, 2, gl.FLOAT, false, 0, 0)
      gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE)
      gl.uniform2f(uniforms.size, rect.width, rect.height)
      gl.uniform1f(uniforms.time, state.reduced ? 0 : time)
      gl.uniform1f(uniforms.active, state.playing ? 1 : 0)
      gl.uniform1f(uniforms.pulse, state.reduced ? 0 : state.pulse)
      gl.uniform1f(uniforms.energy, state.energy); gl.uniform1f(uniforms.ratio, ratio)
      gl.uniform3f(uniforms.lead, state.lead?.x ?? .3, state.lead?.y ?? .5, state.lead ? 1 : 0)
      gl.uniform3f(uniforms.second, state.second?.x ?? .7, state.second?.y ?? .65, state.second ? 1 : 0)
      // A broad, low-intensity phosphor pass underneath the sharp dot cores.
      gl.uniform1f(uniforms.glow, 1)
      gl.drawArrays(gl.POINTS, 0, grid.length / 2)
      gl.uniform1f(uniforms.glow, 0)
      gl.drawArrays(gl.POINTS, 0, grid.length / 2)
    },
    destroy() {
      destroyed = true; canvas.removeEventListener('webglcontextlost', lost); backup?.destroy()
      gl.deleteBuffer(buffer); gl.deleteProgram(program); shaders.forEach(shader => gl.deleteShader(shader))
    },
  }
}
