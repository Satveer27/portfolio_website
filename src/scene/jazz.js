// The room's record player. There are no audio files: three small jazz trios are played live with the Web Audio API
// (electric piano, walking bass, brushes and ride), so the music is original and there is nothing to license.
// A track is a tempo plus a chord loop; the comping, bass line and sparse vibraphone melody are improvised from it on every pass.

const T = (root, kind) => ({ root, kind })
// rootless voicing intervals above the root, and the scale the melody draws from
const KINDS = {
  m7: { voice: [3, 7, 10, 14], scale: [0, 3, 5, 7, 10], third: 3 },
  dom: { voice: [4, 10, 14, 21], scale: [0, 2, 4, 7, 9, 10], third: 4 },
  maj: { voice: [4, 7, 11, 14], scale: [0, 2, 4, 7, 9, 11], third: 4 },
  hdim: { voice: [3, 6, 10, 13], scale: [0, 3, 5, 6, 10], third: 3 }
}

export const JAZZ = {
  lamp: { bpm: 78, swing: 0.64, ride: true, bars: [[T(2, 'm7')], [T(7, 'dom')], [T(0, 'maj')], [T(9, 'dom')], [T(2, 'm7')], [T(7, 'dom')], [T(4, 'hdim'), T(9, 'dom')], [T(2, 'm7')]] },
  rain: { bpm: 92, swing: 0.66, ride: true, bars: [[T(5, 'maj')], [T(4, 'hdim'), T(9, 'dom')], [T(2, 'm7')], [T(7, 'dom')], [T(0, 'm7')], [T(5, 'dom')], [T(10, 'maj')], [T(10, 'maj')]] },
  walk: { bpm: 68, swing: 0.6, ride: false, bars: [[T(3, 'maj')], [T(0, 'm7')], [T(5, 'm7')], [T(10, 'dom')], [T(3, 'maj')], [T(8, 'maj')], [T(7, 'm7')], [T(0, 'dom')]] }
}

const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12)
const rnd = (a, b) => a + Math.random() * (b - a)
const pick = (a) => a[Math.floor(Math.random() * a.length)]

// fold a pitch into a register
const fold = (m, lo, hi) => { while (m < lo) m += 12; while (m > hi) m -= 12; return m }

function noiseBuffer(ctx) {
  const b = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate), d = b.getChannelData(0)
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  return b
}

function impulse(ctx, secs = 2.2) {
  const n = Math.floor(ctx.sampleRate * secs), b = ctx.createBuffer(2, n, ctx.sampleRate)
  for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3) }
  return b
}

// the shared chain: instruments -> bus -> (dry + reverb) -> warm low-pass -> compressor -> out
export function makeRig(ctx, out = ctx.destination) {
  const bus = ctx.createGain()
  const dry = ctx.createGain(); dry.gain.value = 0.85
  const wet = ctx.createGain(); wet.gain.value = 0.3
  const verb = ctx.createConvolver(); verb.buffer = impulse(ctx)
  const warm = ctx.createBiquadFilter(); warm.type = 'lowpass'; warm.frequency.value = 5200; warm.Q.value = 0.3
  const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 3; comp.attack.value = 0.01; comp.release.value = 0.2
  const master = ctx.createGain(); master.gain.value = 1.4
  bus.connect(dry); bus.connect(verb); verb.connect(wet)
  dry.connect(warm); wet.connect(warm); warm.connect(comp); comp.connect(master); master.connect(out)
  return { ctx, bus, master, noise: noiseBuffer(ctx) }
}

function env(g, t, peak, attack, decay) {
  g.gain.setValueAtTime(0.0001, t)
  g.gain.linearRampToValueAtTime(peak, t + attack)
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay)
}

function osc(rig, type, f, t, dur, peak, attack, decay, dest) {
  const { ctx } = rig
  const o = ctx.createOscillator(), g = ctx.createGain()
  o.type = type; o.frequency.value = f
  env(g, t, peak, attack, decay)
  o.connect(g); g.connect(dest || rig.bus)
  o.start(t); o.stop(t + dur)
}

// electric piano: a round fundamental plus a quickly fading tine an octave up
function epiano(rig, t, m, vel) {
  const f = mtof(m)
  osc(rig, 'sine', f, t, 2.4, 0.11 * vel, 0.005, 1.7)
  osc(rig, 'triangle', f * 2.004, t, 1, 0.045 * vel, 0.003, 0.5)
  osc(rig, 'sine', f * 5.98, t, 0.3, 0.012 * vel, 0.002, 0.12)
}

function vibes(rig, t, m, vel) {
  const f = mtof(m)
  osc(rig, 'sine', f, t, 2.2, 0.09 * vel, 0.004, 1.5)
  osc(rig, 'sine', f * 3.99, t, 0.8, 0.025 * vel, 0.002, 0.35)
}

function bass(rig, t, m, vel) {
  const { ctx } = rig
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 520; lp.Q.value = 0.6
  lp.connect(rig.bus)
  osc(rig, 'triangle', mtof(m), t, 0.8, 0.3 * vel, 0.01, 0.5, lp)
  osc(rig, 'sine', mtof(m) * 2, t, 0.4, 0.05 * vel, 0.005, 0.18, lp)
}

function hiss(rig, t, dur, hp, peak, decay, band) {
  const { ctx } = rig
  const s = ctx.createBufferSource(); s.buffer = rig.noise
  const f = ctx.createBiquadFilter(); f.type = band ? 'bandpass' : 'highpass'; f.frequency.value = hp; if (band) f.Q.value = 0.8
  const g = ctx.createGain(); env(g, t, peak, 0.002, decay)
  s.connect(f); f.connect(g); g.connect(rig.bus)
  s.start(t, Math.random() * 0.5); s.stop(t + dur)
}

function kick(rig, t, vel) {
  const { ctx } = rig
  const o = ctx.createOscillator(), g = ctx.createGain()
  o.type = 'sine'; o.frequency.setValueAtTime(115, t); o.frequency.exponentialRampToValueAtTime(46, t + 0.12)
  env(g, t, 0.28 * vel, 0.003, 0.22)
  o.connect(g); g.connect(rig.bus); o.start(t); o.stop(t + 0.3)
}

// Schedule one bar of one track starting at time t. `bar` counts bars since the start, `prev` is the last melody note.
export function scheduleBar(rig, key, bar, t, state) {
  const song = JAZZ[key]
  const beat = 60 / song.bpm
  const chords = song.bars[bar % song.bars.length]
  const next = song.bars[(bar + 1) % song.bars.length][0]
  const half = chords.length > 1
  const chordAt = (b) => (half && b >= 2 ? chords[1] : chords[0])
  // swung eighths: the off-beat lands two thirds of the way through the beat
  const off = beat * song.swing
  const j = () => rnd(0, 0.014)
  const v = () => rnd(0.78, 1.05)

  // comping on 1, the swung and of 2, and sometimes the and of 4 / 3
  const comp = [[0, 0, 0.85], [1, off, 0.8], [3, off, 0.4], [2, 0, 0.3]]
  for (const [b, o, p] of comp) {
    if (Math.random() > p) continue
    const c = chordAt(b), K = KINDS[c.kind], base = 48 + c.root
    const hit = t + b * beat + o + j()
    K.voice.forEach((iv, n) => epiano(rig, hit + n * 0.006, fold(base + iv, 52, 71), v() * (b === 0 ? 1 : 0.8)))
  }

  // walking bass: root, a chord tone, a chord tone, then a step toward the next chord
  const lowRoot = (r) => 36 + r
  for (let b = 0; b < 4; b++) {
    const c = chordAt(b), K = KINDS[c.kind]
    let m
    if (b === 0 || (half && b === 2)) m = lowRoot(c.root)
    else if (b === 3) { const target = lowRoot(next.root); m = target + pick([-1, 1, -2]) }
    else m = lowRoot(c.root) + pick([K.third, 7, 7, 12, K.third])
    if (!song.ride && b % 2) continue
    bass(rig, t + b * beat + j(), fold(m, 31, 52), v())
  }

  // drums
  for (let b = 0; b < 4; b++) {
    const at = t + b * beat
    if (song.ride) {
      hiss(rig, at + j(), 0.4, 7000, 0.05 * v(), 0.2)
      if (b % 2) hiss(rig, at + off + j(), 0.4, 7000, 0.035 * v(), 0.15)
      if (b % 2) hiss(rig, at + j(), 0.2, 5500, 0.07, 0.05) // foot hat on 2 and 4
    } else {
      hiss(rig, at + j(), 0.5, 2600, 0.035 * v(), 0.28, true) // brushes
    }
  }
  if (Math.random() < 0.9) kick(rig, t + j(), song.ride ? 0.8 : 0.5)
  if (song.ride && Math.random() < 0.3) kick(rig, t + 2 * beat + off + j(), 0.4)

  // a little vibraphone line, stepping through the chord's scale
  const slots = song.ride ? [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5] : [0, 1, 2, 3]
  for (const s of slots) {
    if (Math.random() > (song.ride ? 0.32 : 0.4)) continue
    const c = chordAt(Math.floor(s)), K = KINDS[c.kind]
    const pool = []
    for (let m = 67; m <= 83; m++) if (K.scale.some((iv) => (m - c.root - iv + 144) % 12 === 0)) pool.push(m)
    let i = state.prev == null ? Math.floor(pool.length / 2) : pool.reduce((best, m, k) => (Math.abs(m - state.prev) < Math.abs(pool[best] - state.prev) ? k : best), 0)
    i = Math.max(0, Math.min(pool.length - 1, i + pick([-2, -1, -1, 1, 1, 2])))
    state.prev = pool[i]
    const at = t + Math.floor(s) * beat + (s % 1 ? off : 0) + j()
    vibes(rig, at, pool[i], rnd(0.6, 1))
  }

  // surface noise, like a record that has been loved
  for (let n = 0; n < 5; n++) hiss(rig, t + rnd(0, 4 * beat), 0.01, 3000, rnd(0.01, 0.035), 0.004)
}

// ---- playback: queue one bar at a time just ahead of the clock ----
let live = null

export function startJazz(key) {
  stopJazz()
  if (!JAZZ[key]) return
  const Ctx = window.AudioContext || window.webkitAudioContext
  if (!Ctx) return
  const ctx = live?.ctx || new Ctx()
  if (ctx.state === 'suspended') ctx.resume()
  const rig = makeRig(ctx)
  rig.master.gain.setValueAtTime(0.0001, ctx.currentTime)
  rig.master.gain.linearRampToValueAtTime(1.4, ctx.currentTime + 0.4)
  const state = { prev: null }
  let bar = 0, nextAt = ctx.currentTime + 0.15
  const barLen = (60 / JAZZ[key].bpm) * 4
  const tick = () => { while (nextAt < ctx.currentTime + 0.6) { scheduleBar(rig, key, bar++, nextAt, state); nextAt += barLen } }
  tick()
  live = { ctx, rig, timer: setInterval(tick, 150) }
}

export function stopJazz() {
  if (!live) return
  const { ctx, rig, timer } = live
  clearInterval(timer)
  try {
    rig.master.gain.cancelScheduledValues(ctx.currentTime)
    rig.master.gain.setValueAtTime(rig.master.gain.value, ctx.currentTime)
    rig.master.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.25)
    const dead = rig
    setTimeout(() => { try { dead.master.disconnect() } catch (e) {} }, 400)
  } catch (e) {}
  live = { ctx }
}
