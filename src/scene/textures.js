import * as THREE from 'three'

// Canvas-drawn textures for posters, labels, spines and screens.
// They redraw once web fonts finish loading so text never falls back to system fonts.
const registry = new Set()
let fontsHooked = false
function hookFonts() {
  if (fontsHooked || typeof document === 'undefined' || !document.fonts) return
  fontsHooked = true
  const faces = ['80px Anton', '40px "Archivo Black"', 'italic 900 40px Archivo', '40px "Instrument Serif"', 'italic 40px "Instrument Serif"', '20px "JetBrains Mono"', '20px "Press Start 2P"', 'bold 40px Caveat', '40px "DM Serif Display"']
  Promise.all(faces.map((f) => document.fonts.load(f).catch(() => null))).then(() => registry.forEach((t) => t.userData.redraw()))
}

export function makeTex(w, h, draw, opts = {}) {
  hookFonts()
  const c = document.createElement('canvas')
  c.width = w; c.height = h
  const g = c.getContext('2d')
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  if (opts.repeat) { tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(...opts.repeat) }
  tex.userData.redraw = () => { g.clearRect(0, 0, w, h); draw(g, w, h); tex.needsUpdate = true }
  tex.userData.redraw()
  registry.add(tex)
  return tex
}

export function rng(seed) {
  let s = seed
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646 }
}

export const plasterTex = () => makeTex(1024, 1024, (g, w, h) => {
  const r = rng(11)
  g.fillStyle = '#5a4637'; g.fillRect(0, 0, w, h)
  for (let i = 0; i < 40000; i++) { const a = (r() - 0.5) * 0.07; g.fillStyle = a > 0 ? `rgba(255,240,220,${a})` : `rgba(0,0,0,${-a})`; g.fillRect(r() * w, r() * h, 1 + r() * 2.5, 1 + r() * 2.5) }
  for (let i = 0; i < 14; i++) { const gr = g.createRadialGradient(r() * w, r() * h, 0, r() * w, r() * h, 200 + r() * 200); gr.addColorStop(0, 'rgba(0,0,0,0.05)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h) }
}, { repeat: [3, 2] })

export const rugTex = () => makeTex(1024, 768, (g, w, h) => {
  const r = rng(5)
  g.fillStyle = '#3b2c25'; g.fillRect(0, 0, w, h)
  for (let i = 0; i < 60000; i++) { g.fillStyle = `rgba(${r() > 0.5 ? '255,235,210' : '0,0,0'},${r() * 0.06})`; g.fillRect(r() * w, r() * h, 1, 2 + r() * 3) }
  g.strokeStyle = 'rgba(214,190,150,0.35)'; g.lineWidth = 10; g.strokeRect(46, 46, w - 92, h - 92)
  g.strokeStyle = 'rgba(214,190,150,0.18)'; g.lineWidth = 3; g.strokeRect(80, 80, w - 160, h - 160)
})

export const posterTex = () => makeTex(1400, 980, (g, w, h) => {
  g.fillStyle = '#0d0f15'; g.fillRect(0, 0, w, h)
  const gr = g.createRadialGradient(w * 0.78, h * 0.22, 10, w * 0.78, h * 0.22, 760); gr.addColorStop(0, 'rgba(70,140,255,.55)'); gr.addColorStop(1, 'rgba(70,140,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h)
  g.strokeStyle = 'rgba(170,215,255,.16)'; g.lineWidth = 2
  for (let i = 0; i < 16; i++) { g.beginPath(); for (let x = 0; x <= w; x += 16) { const y = 120 + i * 24 + Math.sin(x / 95 + i * 0.7) * 11; x ? g.lineTo(x, y) : g.moveTo(x, y) } g.stroke() }
  g.fillStyle = '#f2ece2'; g.font = 'italic 168px "Instrument Serif", Georgia, serif'; g.fillText('Welcome in.', 80, 560)
  g.fillStyle = '#e8122d'; g.fillRect(88, 610, 120, 8)
  g.fillStyle = '#f2ece2'; g.font = '64px Anton, Impact, sans-serif'; g.fillText('SATVEER GANASAN', 86, 700)
  g.fillStyle = '#9fc3ff'; g.font = '30px "JetBrains Mono", monospace'; g.fillText('BACKEND + AI ENGINEER  ·  PYTHON / FASTAPI', 88, 756)
  g.fillStyle = 'rgba(242,236,226,.75)'; g.font = '28px "JetBrains Mono", monospace'; g.fillText('Make yourself at home. Click anything that catches your eye.', 88, 880)
  g.fillStyle = 'rgba(242,236,226,.6)'; g.font = '24px "JetBrains Mono", monospace'; g.fillText('VOL. 2026', 80, 96); g.fillText('EDINBURGH  →  KUALA LUMPUR', 960, 96)
  g.strokeStyle = 'rgba(242,236,226,.32)'; g.lineWidth = 3; g.strokeRect(40, 40, w - 80, h - 80)
})

export const windowTex = (day) => makeTex(640, 600, (g, w, h) => {
  const sky = g.createLinearGradient(0, 0, 0, h)
  if (day) { sky.addColorStop(0, '#87b5e2'); sky.addColorStop(1, '#f0d7b4') } else { sky.addColorStop(0, '#060a1d'); sky.addColorStop(1, '#251d45') }
  g.fillStyle = sky; g.fillRect(0, 0, w, h)
  const r = rng(5)
  if (!day) { g.fillStyle = '#fff1de'; g.beginPath(); g.arc(w * 0.76, h * 0.17, 24, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,.8)'; for (let i = 0; i < 70; i++) g.fillRect(r() * w, r() * h * 0.45, 1.4, 1.4) }
  else { g.fillStyle = 'rgba(255,250,235,.9)'; g.beginPath(); g.arc(w * 0.8, h * 0.18, 34, 0, 7); g.fill() }
  for (let L = 0; L < 2; L++) for (let i = 0; i < 22; i++) {
    const bw = 26 + r() * 52, bh = (L ? 170 : 90) + r() * (L ? 210 : 140), bx = i * 31 - 20 + L * 9
    g.fillStyle = day ? (L ? '#6e7d96' : '#9aa6ba') : (L ? '#0a1126' : '#121b38'); g.fillRect(bx, h - bh, bw, bh)
    for (let yy = h - bh + 9; yy < h - 6; yy += 12) for (let xx = bx + 4; xx < bx + bw - 4; xx += 8) if (r() > (day ? 0.93 : 0.6)) { g.fillStyle = day ? 'rgba(255,255,255,.4)' : (r() > 0.5 ? '#ffd38a' : '#fff2c9'); g.fillRect(xx, yy, 3.5, 5) }
  }
  const bc = day ? '#55647d' : '#050918'
  const tower = (cx) => { g.fillStyle = bc; g.beginPath(); g.moveTo(cx - 22, h); g.lineTo(cx - 22, h - 340); g.lineTo(cx - 14, h - 390); g.lineTo(cx - 8, h - 415); g.lineTo(cx - 2, h - 480); g.lineTo(cx + 2, h - 480); g.lineTo(cx + 8, h - 415); g.lineTo(cx + 14, h - 390); g.lineTo(cx + 22, h - 340); g.lineTo(cx + 22, h); g.fill(); if (!day) { g.fillStyle = 'rgba(255,220,150,.85)'; for (let yy = h - 330; yy < h; yy += 10) g.fillRect(cx - 1.5, yy, 3, 4) } }
  tower(w * 0.44); tower(w * 0.44 + 64); g.fillStyle = bc; g.fillRect(w * 0.44 + 18, h - 236, 28, 6)
  if (!day) { g.strokeStyle = 'rgba(180,200,255,.16)'; for (let i = 0; i < 160; i++) { const x = r() * w, y = r() * h; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 5, y + 20); g.stroke() } }
})

// Framed football shirt (back view) in a shadow box. Plain red home shirt with your name and number.
export const kitTex = (kit) => makeTex(660, 920, (g, w, h) => {
  // felt backing
  const bg = g.createRadialGradient(w / 2, h * 0.42, 60, w / 2, h / 2, h * 0.75); bg.addColorStop(0, '#26221f'); bg.addColorStop(1, '#0c0b0a')
  g.fillStyle = bg; g.fillRect(0, 0, w, h)
  const r = rng(77); for (let k = 0; k < 9000; k++) { g.fillStyle = `rgba(255,255,255,${r() * 0.035})`; g.fillRect(r() * w, r() * h, 1, 1) }
  const shirt = () => {
    g.beginPath()
    g.moveTo(262, 120); g.quadraticCurveTo(330, 150, 398, 120)
    g.lineTo(500, 152); g.lineTo(612, 300); g.lineTo(540, 372); g.lineTo(484, 300)
    g.lineTo(490, 720); g.quadraticCurveTo(330, 740, 170, 720)
    g.lineTo(176, 300); g.lineTo(120, 372); g.lineTo(48, 300); g.lineTo(160, 152); g.closePath()
  }
  // drop shadow
  g.save(); g.translate(10, 16); shirt(); g.fillStyle = 'rgba(0,0,0,.6)'; g.filter = 'blur(10px)'; g.fill(); g.restore(); g.filter = 'none'
  // fabric
  g.save(); shirt(); g.clip()
  const fab = g.createLinearGradient(0, 120, 0, 740); fab.addColorStop(0, kit.color || '#c8102e'); fab.addColorStop(1, kit.shade || '#8e0b20'); g.fillStyle = fab; g.fillRect(0, 0, w, h)
  // folds and mesh texture
  ;[[230, 0.10], [330, -0.08], [430, 0.09]].forEach(([x, a]) => { const fg = g.createLinearGradient(x - 50, 0, x + 50, 0); fg.addColorStop(0, 'rgba(0,0,0,0)'); fg.addColorStop(0.5, `rgba(${a > 0 ? '255,255,255' : '0,0,0'},${Math.abs(a)})`); fg.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = fg; g.fillRect(x - 50, 120, 100, 620) })
  for (let y = 120; y < 740; y += 3) { g.fillStyle = 'rgba(0,0,0,.05)'; g.fillRect(0, y, w, 1) }
  // trims
  g.restore()
  g.strokeStyle = kit.trim || '#f4efe6'; g.lineWidth = 10; g.beginPath(); g.moveTo(262, 122); g.quadraticCurveTo(330, 152, 398, 122); g.stroke()
  g.lineWidth = 9; g.beginPath(); g.moveTo(52, 304); g.lineTo(122, 368); g.stroke(); g.beginPath(); g.moveTo(608, 304); g.lineTo(538, 368); g.stroke()
  // name + number
  g.fillStyle = kit.trim || '#f4efe6'; g.textAlign = 'center'
  g.font = '54px Anton, Impact, sans-serif'; g.fillText(kit.name, w / 2, 262)
  g.font = '250px Anton, Impact, sans-serif'; g.fillText(kit.number, w / 2, 520)
  // brass plaque
  const pl = g.createLinearGradient(0, 800, 0, 860); pl.addColorStop(0, '#d8b46a'); pl.addColorStop(1, '#8a6a30')
  g.fillStyle = pl; g.fillRect(w / 2 - 170, 800, 340, 58)
  g.fillStyle = '#2a1e0c'; g.font = '22px "JetBrains Mono", monospace'; g.fillText(kit.caption, w / 2, 838)
})

// Fallback art for the left-wall print until you drop in your own poster image. Original design: speed lines and a big title.
export const printTex = (p) => makeTex(600, 860, (g, w, h) => {
  g.fillStyle = '#f1e9d8'; g.fillRect(0, 0, w, h)
  const cx = w * 0.62, cy = h * 0.36, r = rng(19)
  g.fillStyle = '#141414'
  for (let k = 0; k < 120; k++) { const a = r() * Math.PI * 2, a2 = a + 0.012 + r() * 0.02; g.beginPath(); g.moveTo(cx + Math.cos(a) * 120, cy + Math.sin(a) * 120); g.lineTo(cx + Math.cos(a) * 900, cy + Math.sin(a) * 900); g.lineTo(cx + Math.cos(a2) * 900, cy + Math.sin(a2) * 900); g.closePath(); g.fill() }
  g.fillStyle = '#f1e9d8'; g.beginPath(); g.arc(cx, cy, 120, 0, 7); g.fill()
  g.fillStyle = p.accent || '#7a2ea0'; g.beginPath(); g.arc(cx, cy, 92, 0, 7); g.fill()
  g.fillStyle = '#f2c230'; g.beginPath(); g.arc(cx, cy, 44, 0, 7); g.fill()
  g.fillStyle = '#141414'; g.fillRect(0, h - 300, w, 300)
  g.fillStyle = p.accent || '#7a2ea0'; g.fillRect(36, h - 270, 16, 210)
  g.fillStyle = '#f1e9d8'; g.font = '108px Anton, Impact, sans-serif'; g.fillText(p.title, 70, h - 160)
  g.font = '26px "JetBrains Mono", monospace'; g.fillStyle = '#f2c230'; g.fillText(p.sub, 74, h - 100)
})

export const mangaPosterTex = () => makeTex(500, 720, (g, w, h) => {
  g.fillStyle = '#efe9dc'; g.fillRect(0, 0, w, h)
  g.strokeStyle = '#141414'; g.lineWidth = 7; g.strokeRect(22, 22, w - 44, 300); g.strokeRect(22, 340, 210, 356); g.strokeRect(250, 340, w - 272, 356)
  g.fillStyle = 'rgba(0,0,0,.55)'; for (let y = 36; y < 316; y += 10) for (let x = 36; x < w - 36; x += 10) { g.beginPath(); g.arc(x, y, 0.8 + 2.6 * (x / w), 0, 7); g.fill() }
  g.fillStyle = '#141414'; g.font = 'bold 50px sans-serif';['読', '書', '中'].forEach((c, i) => g.fillText(c, 100, 430 + i * 80))
  g.fillStyle = '#b3202e'; g.fillRect(262, 360, w - 296, 110); g.fillStyle = '#fff'; g.font = '76px Anton, Impact, sans-serif'; g.fillText('VOL.∞', 274, 444)
})

export const certTex = () => makeTex(900, 660, (g, w, h) => {
  g.fillStyle = '#f5efe2'; g.fillRect(0, 0, w, h)
  g.strokeStyle = '#8a6d3b'; g.lineWidth = 5; g.strokeRect(26, 26, w - 52, h - 52); g.lineWidth = 1.5; g.strokeRect(42, 42, w - 84, h - 84)
  g.textAlign = 'center'; g.fillStyle = '#6b5a44'; g.font = '24px Georgia, serif'; g.fillText('UNIVERSITY OF GLASGOW', w / 2, 132)
  g.fillStyle = '#1d1712'; g.font = '30px Georgia, serif'; g.fillText('Integrated Masters in', w / 2, 240)
  g.font = 'italic 92px "Instrument Serif", Georgia, serif'; g.fillText('Computer Science', w / 2, 340)
  g.font = 'italic 38px Georgia, serif'; g.fillText('Satveer Sahaas Ganasan', w / 2, 440); g.font = '24px Georgia, serif'; g.fillText('2026', w / 2, 510)
})

export const screenTex = () => makeTex(1280, 720, (g, w, h) => {
  g.fillStyle = '#d4001a'; g.fillRect(0, 0, w, h)
  g.save(); g.translate(-200, -300)
  for (let i = 0; i < 40; i++) { g.rotate(Math.PI / 20); g.fillStyle = i % 2 ? 'rgba(0,0,0,.14)' : 'rgba(0,0,0,0)'; g.beginPath(); g.moveTo(0, 0); g.lineTo(2400, -200); g.lineTo(2400, 200); g.fill() }
  g.restore()
  g.save(); g.translate(0, h * 0.68); g.rotate(-0.16); g.fillStyle = '#0b0b0b'; g.fillRect(-100, 0, w + 300, 500); g.fillStyle = '#fff'; g.fillRect(-100, -10, w + 300, 10); g.restore()
  const word = 'SAT//OS'; let x = 70
  const fonts = ['Anton, Impact', '"Archivo Black", Arial Black', '"DM Serif Display", Georgia', '"JetBrains Mono", monospace']
  word.split('').forEach((ch, i) => { const sz = i === 0 ? 120 : 96; g.font = `${sz}px ${fonts[i % 4]}`; const tw = g.measureText(ch).width; g.save(); g.translate(x, 170); g.rotate(((i * 37) % 13 - 6) * 0.02); g.fillStyle = i % 3 === 1 ? '#fff' : '#0b0b0b'; g.fillRect(-10, -sz * 0.86, tw + 20, sz * 1.02); g.fillStyle = i % 3 === 1 ? '#d4001a' : '#fff'; g.fillText(ch, 0, 0); g.restore(); x += tw + 26 })
  const items = ['EXPERIENCE', 'WHO AM I', 'CONTACT']
  items.forEach((t, i) => { g.save(); g.translate(560 + [40, 0, 80][i], 330 + i * 120); g.rotate(-0.1); g.fillStyle = i === 0 ? '#fff' : '#0b0b0b'; g.beginPath(); g.moveTo(-20, -84); g.lineTo(560, -100); g.lineTo(540, 20); g.lineTo(-10, 8); g.fill(); g.fillStyle = i === 0 ? '#0b0b0b' : '#fff'; g.font = 'italic 900 86px Archivo, Arial Black, sans-serif'; g.fillText(t, 10, -8); g.restore() })
  g.fillStyle = '#fff'; g.font = '30px "JetBrains Mono", monospace'; g.fillText('click to open', 70, 680)
})

export const boardTex = () => makeTex(1400, 980, (g, w, h) => {
  g.fillStyle = '#f3f3ef'; g.fillRect(0, 0, w, h)
  const r = rng(9)
  g.strokeStyle = 'rgba(0,0,0,.05)'; for (let i = 0; i < 40; i++) { g.beginPath(); g.moveTo(r() * w, r() * h); g.lineTo(r() * w, r() * h); g.stroke() }
  g.fillStyle = '#1b2a8c'; g.font = 'bold 96px Caveat, cursive'; g.fillText('PROJECTS', 70, 130)
  g.strokeStyle = '#1b2a8c'; g.lineWidth = 6; g.beginPath(); g.moveTo(70, 152); g.lineTo(450, 146); g.stroke()
  const sheets = [['01', 'Anime Atlas', 90, 220, -0.05], ['02', 'UFC Predictor', 520, 200, 0.04], ['03', 'Fatigue Signals', 950, 230, -0.03], ['04', 'Censis AR', 300, 560, 0.05]]
  sheets.forEach(([n, t, x, y, rot]) => {
    g.save(); g.translate(x + 180, y + 140); g.rotate(rot)
    g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(-172, -128, 360, 270)
    g.fillStyle = '#123a6e'; g.fillRect(-180, -136, 360, 270)
    g.strokeStyle = 'rgba(232,244,255,.18)'; g.lineWidth = 1; for (let k = -180; k < 180; k += 18) { g.beginPath(); g.moveTo(k, -136); g.lineTo(k, 134); g.stroke() } for (let k = -136; k < 134; k += 18) { g.beginPath(); g.moveTo(-180, k); g.lineTo(180, k); g.stroke() }
    g.strokeStyle = '#e8f4ff'; g.lineWidth = 3; g.strokeRect(-140, -80, 90, 46); g.strokeRect(-10, -80, 90, 46); g.strokeRect(60, 30, 90, 46); g.beginPath(); g.moveTo(-50, -57); g.lineTo(-10, -57); g.moveTo(35, -34); g.lineTo(35, 0); g.lineTo(105, 0); g.lineTo(105, 30); g.stroke()
    g.fillStyle = '#e8f4ff'; g.font = '22px "JetBrains Mono", monospace'; g.fillText(`FIG. ${n}`, -160, 104); g.font = 'bold 28px "JetBrains Mono", monospace'; g.fillText(t.toUpperCase(), -160, 70)
    g.fillStyle = '#e8122d'; g.beginPath(); g.arc(0, -128, 12, 0, 7); g.fill()
    g.restore()
  })
  g.fillStyle = '#e8122d'; g.font = 'bold 54px Caveat, cursive'; g.fillText('click to see how they work →', 760, 900)
})

function drawSpine(g, w, h, title, color, ink, foot) {
  const r = rng(title.length * 13 + (foot ? +foot : 0))
  g.fillStyle = color; g.fillRect(0, 0, w, h)
  for (let i = 0; i < 1200; i++) { g.fillStyle = `rgba(${r() > 0.5 ? '255,255,255' : '0,0,0'},${r() * 0.06})`; g.fillRect(r() * w, r() * h, 2, 2) }
  const sh = g.createLinearGradient(0, 0, w, 0); sh.addColorStop(0, 'rgba(0,0,0,.4)'); sh.addColorStop(0.25, 'rgba(255,255,255,.1)'); sh.addColorStop(0.7, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,.45)'); g.fillStyle = sh; g.fillRect(0, 0, w, h)
  g.fillStyle = ink; g.globalAlpha = 0.85; g.fillRect(8, 24, w - 16, 2); g.fillRect(8, h - 66, w - 16, 2); g.globalAlpha = 1
  g.save(); g.translate(w / 2 + 8, 40); g.rotate(Math.PI / 2); g.fillStyle = ink
  let size = 28; g.font = `${size}px "Instrument Serif", Georgia, serif`
  while (g.measureText(title).width > h - 120 && size > 13) { size -= 2; g.font = `${size}px "Instrument Serif", Georgia, serif` }
  g.fillText(title, 0, 0); g.restore()
  if (foot) { g.fillStyle = ink; g.textAlign = 'center'; g.font = '20px Anton, Impact, sans-serif'; g.fillText(foot, w / 2, h - 28) }
}
export const spineTex = (title, color, ink, foot) => makeTex(64, 512, (g, w, h) => drawSpine(g, w, h, title, color, ink, foot))

export const coverTex = (t, i) => makeTex(512, 512, (g, w, h) => {
  const [a, b] = t.colors
  const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, a); gr.addColorStop(1, b); g.fillStyle = gr; g.fillRect(0, 0, w, h)
  const r = rng(i * 31 + 7)
  g.globalAlpha = 0.85
  if (i % 3 === 0) { for (let k = 0; k < 6; k++) { g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 2; g.beginPath(); g.arc(w * 0.7, h * 0.35, 40 + k * 34, 0, 7); g.stroke() } }
  else if (i % 3 === 1) { for (let k = 0; k < 40; k++) { g.fillStyle = `rgba(255,255,255,${r() * 0.5})`; g.fillRect(r() * w, r() * h * 0.7, 2 + r() * 40, 2) } }
  else { g.fillStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.moveTo(0, h); g.lineTo(w, h * 0.2); g.lineTo(w, h); g.fill() }
  g.globalAlpha = 1
  for (let k = 0; k < 5000; k++) { g.fillStyle = `rgba(${r() > 0.5 ? '255,255,255' : '0,0,0'},${r() * 0.08})`; g.fillRect(r() * w, r() * h, 1.5, 1.5) }
  g.fillStyle = '#fff'; g.font = 'italic 900 50px Archivo, Arial Black, sans-serif'; g.fillText(t.title, 34, h - 92)
  g.font = '22px "JetBrains Mono", monospace'; g.fillStyle = 'rgba(255,255,255,.85)'; g.fillText(t.artist, 36, h - 48)
  g.font = '18px "JetBrains Mono", monospace'; g.fillText(String(i + 1).padStart(2, '0'), 36, 52)
})

export const cartLabelTex = (game, i) => makeTex(400, 360, (g, w, h) => {
  const [a, b] = game.colors
  const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, a); gr.addColorStop(1, b); g.fillStyle = gr; g.fillRect(0, 0, w, h)
  const r = rng(i * 17 + 3)
  for (let k = 0; k < 30; k++) { g.fillStyle = `rgba(255,255,255,${0.2 + r() * 0.6})`; g.fillRect(r() * w, r() * h * 0.6, 4, 4) }
  g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, h - 120, w, 120)
  g.fillStyle = '#fff'; g.font = '26px "Press Start 2P", monospace'
  const words = game.short.split(' '); words.forEach((wd, k) => g.fillText(wd, 22, h - 74 + k * 36 - (words.length - 1) * 18))
  g.font = '16px "JetBrains Mono", monospace'; g.fillStyle = 'rgba(255,255,255,.8)'; g.fillText(`SAT-0${i + 1}`, 22, 36)
})

export const photoFallbackTex = () => makeTex(800, 1000, (g, w, h) => {
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#d9cfbf'); gr.addColorStop(1, '#a89a86'); g.fillStyle = gr; g.fillRect(0, 0, w, h)
  g.fillStyle = 'rgba(60,45,30,.25)'; g.beginPath(); g.arc(w / 2, h * 0.38, 150, 0, 7); g.fill(); g.beginPath(); g.ellipse(w / 2, h * 0.95, 300, 260, 0, 0, 7); g.fill()
  g.fillStyle = '#3b2c1e'; g.textAlign = 'center'; g.font = '34px "JetBrains Mono", monospace'; g.fillText('your photo goes here', w / 2, h * 0.68); g.font = '24px "JetBrains Mono", monospace'; g.fillText('/public/images/me.jpg', w / 2, h * 0.73)
})

export const bookCoverTex = (b) => makeTex(512, 720, (g, W, H) => {
  g.save(); g.scale(2, 2); const w = W / 2, h = H / 2
  const r = rng(b.title.length * 7 + (b.foot ? +b.foot : 1))
  g.fillStyle = b.color; g.fillRect(0, 0, w, h)
  for (let i = 0; i < 2500; i++) { g.fillStyle = `rgba(${r() > 0.5 ? '255,255,255' : '0,0,0'},${r() * 0.06})`; g.fillRect(r() * w, r() * h, 2, 2) }
  g.fillStyle = b.ink; g.globalAlpha = 0.8; g.fillRect(20, 20, w - 40, 2); g.fillRect(20, h - 22, w - 40, 2); g.globalAlpha = 1
  g.font = '30px "Instrument Serif", Georgia, serif'
  const words = b.title.split(' '); const lines = []; let line = ''
  words.forEach((wd) => { const t = line ? line + ' ' + wd : wd; if (g.measureText(t).width > w - 44) { lines.push(line); line = wd } else line = t })
  lines.push(line)
  lines.slice(0, 5).forEach((l, i) => g.fillText(l, 22, 80 + i * 34))
  g.font = '14px "JetBrains Mono", monospace'; g.fillText((b.by || '').toUpperCase(), 22, h - 40)
  g.restore()
})

// All book spines share one 2048x2048 atlas (one GPU upload) instead of a texture each.
const ATLAS = { cols: 32, rows: 4, cw: 64, ch: 512, draws: [], tex: null, g: null }
function atlas() {
  if (ATLAS.tex) return ATLAS
  const c = document.createElement('canvas'); c.width = ATLAS.cols * ATLAS.cw; c.height = ATLAS.rows * ATLAS.ch
  ATLAS.g = c.getContext('2d')
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8
  tex.userData.redraw = () => { ATLAS.draws.forEach((d) => d()); tex.needsUpdate = true }
  registry.add(tex); hookFonts()
  ATLAS.tex = tex
  return ATLAS
}
let atlasTimer = null
export const spineHiTex = (title, color, ink, foot) => makeTex(128, 1024, (g, w, h) => {
  g.save(); g.scale(2, 2); drawSpine(g, 64, 512, title, color, ink, foot); g.restore()
  // subtle cloth grain and a worn edge so spines don't look flat
  const r = rng(title.length * 13 + (foot ? +foot || 3 : 1))
  for (let k = 0; k < 1800; k++) { g.fillStyle = `rgba(${r() > 0.5 ? '255,255,255' : '0,0,0'},${r() * 0.05})`; g.fillRect(r() * w, r() * h, 1, 2) }
  const e = g.createLinearGradient(0, 0, w, 0); e.addColorStop(0, 'rgba(0,0,0,.35)'); e.addColorStop(0.12, 'rgba(0,0,0,0)'); e.addColorStop(0.88, 'rgba(0,0,0,0)'); e.addColorStop(1, 'rgba(0,0,0,.35)')
  g.fillStyle = e; g.fillRect(0, 0, w, h)
})
// page block seen from the top and fore-edge
export const pagesTex = () => makeTex(256, 256, (g, w, h) => {
  g.fillStyle = '#efe6d2'; g.fillRect(0, 0, w, h)
  const r = rng(5)
  for (let y = 0; y < h; y += 2) { g.fillStyle = `rgba(120,100,70,${0.05 + r() * 0.12})`; g.fillRect(0, y, w, 1) }
})
export function spineFromAtlas(slot, title, color, ink, foot) {
  const A = atlas()
  const col = slot % A.cols, row = Math.floor(slot / A.cols)
  const draw = () => {
    const g = A.g; g.save(); g.translate(col * A.cw, row * A.ch); g.beginPath(); g.rect(0, 0, A.cw, A.ch); g.clip()
    drawSpine(g, A.cw, A.ch, title, color, ink, foot); g.restore()
  }
  A.draws.push(draw); draw()
  clearTimeout(atlasTimer); atlasTimer = setTimeout(() => { A.tex.needsUpdate = true }, 0)
  const t = A.tex.clone()
  t.repeat.set(1 / A.cols, 1 / A.rows)
  t.offset.set(col / A.cols, 1 - (row + 1) / A.rows)
  return t
}

// Vinyl record face: fine grooves, a soft sheen and a centre label in the album's colours.
export const recordTex = (t, i) => makeTex(1024, 1024, (g, w, h) => {
  const cx = w / 2, cy = h / 2, R = w / 2
  g.fillStyle = '#0a0a0b'; g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.fill()
  for (let r = R * 0.36; r < R * 0.985; r += 1.6) {
    const band = Math.sin(r * 0.21) * 0.5 + 0.5
    g.strokeStyle = `rgba(255,255,255,${0.025 + band * 0.035})`; g.lineWidth = 0.7
    g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.stroke()
  }
  ;[0.52, 0.68, 0.83].forEach((k) => { g.strokeStyle = 'rgba(0,0,0,.9)'; g.lineWidth = 5; g.beginPath(); g.arc(cx, cy, R * k, 0, Math.PI * 2); g.stroke() })
  if (g.createConicGradient) {
    const sh = g.createConicGradient(-0.6, cx, cy)
    sh.addColorStop(0, 'rgba(255,255,255,0)'); sh.addColorStop(0.08, 'rgba(255,255,255,.16)'); sh.addColorStop(0.16, 'rgba(255,255,255,0)')
    sh.addColorStop(0.5, 'rgba(255,255,255,0)'); sh.addColorStop(0.58, 'rgba(255,255,255,.12)'); sh.addColorStop(0.66, 'rgba(255,255,255,0)'); sh.addColorStop(1, 'rgba(255,255,255,0)')
    g.fillStyle = sh; g.beginPath(); g.arc(cx, cy, R * 0.985, 0, Math.PI * 2); g.arc(cx, cy, R * 0.35, 0, Math.PI * 2, true); g.fill()
  }
  const [a, b] = t.colors
  const lg = g.createLinearGradient(cx - R * 0.33, cy - R * 0.33, cx + R * 0.33, cy + R * 0.33); lg.addColorStop(0, a); lg.addColorStop(1, b)
  g.fillStyle = lg; g.beginPath(); g.arc(cx, cy, R * 0.33, 0, Math.PI * 2); g.fill()
  g.fillStyle = 'rgba(255,255,255,.92)'; g.textAlign = 'center'
  g.font = 'italic 900 34px Archivo, Arial Black, sans-serif'; g.fillText(t.title, cx, cy - 46)
  g.font = '20px "JetBrains Mono", monospace'; g.fillText(t.artist, cx, cy + 66)
  g.font = '16px "JetBrains Mono", monospace'; g.fillText(`SIDE A · ${String(i + 1).padStart(2, '0')}`, cx, cy + 96)
  g.fillStyle = '#d9d4cb'; g.beginPath(); g.arc(cx, cy, 11, 0, Math.PI * 2); g.fill()
  g.fillStyle = '#0a0a0b'; g.beginPath(); g.arc(cx, cy, 6, 0, Math.PI * 2); g.fill()
})

// Soft leaf-and-branch shadow, used as a spotlight gobo so sun through the window lands dappled on the desk.
export const leafShadowTex = () => makeTex(512, 512, (g, w, h) => {
  const r = rng(11)
  g.fillStyle = '#fff'; g.fillRect(0, 0, w, h)
  g.filter = 'blur(6px)'
  g.fillStyle = '#2a2a2a'; g.strokeStyle = '#2a2a2a'
  for (let b = 0; b < 6; b++) {
    let x = r() * w, y = h * (0.1 + r() * 0.8), a = (r() - 0.5) * 1.2
    g.lineWidth = 3 + r() * 3; g.beginPath(); g.moveTo(x, y)
    for (let s = 0; s < 7; s++) {
      x += Math.cos(a) * 55; y += Math.sin(a) * 55; a += (r() - 0.5) * 0.7
      g.lineTo(x, y)
      for (const side of [-1, 1]) {
        g.save(); g.translate(x, y); g.rotate(a + side * (0.8 + r() * 0.5)); g.scale(1, 0.42)
        g.beginPath(); g.arc(26, 0, 26 + r() * 10, 0, Math.PI * 2); g.fill(); g.restore()
      }
    }
    g.stroke()
  }
  g.filter = 'none'
})
