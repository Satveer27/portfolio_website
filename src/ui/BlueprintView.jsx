import { useEffect, useRef, useState } from 'react'
import { useStore } from '../store'
import { projects } from '../data'
import './blueprint.css'

// tiny parser for the "M x y H x V y" paths used in data.js
function points(d) {
  const t = d.match(/[MHV]|-?\d+(?:\.\d+)?/g) || []; const pts = []; let x = 0, y = 0
  for (let i = 0; i < t.length; i++) {
    const c = t[i]
    if (c === 'M') { x = +t[++i]; y = +t[++i]; pts.push([x, y]) }
    else if (c === 'H') { x = +t[++i]; pts.push([x, y]) }
    else if (c === 'V') { y = +t[++i]; pts.push([x, y]) }
  }
  return pts
}
function arrow(d) {
  const p = points(d); const [x2, y2] = p[p.length - 1]; const [x1, y1] = p[p.length - 2]
  const a = Math.atan2(y2 - y1, x2 - x1), s = 8
  const l = [x2 - s * Math.cos(a - 0.55), y2 - s * Math.sin(a - 0.55)], r = [x2 - s * Math.cos(a + 0.55), y2 - s * Math.sin(a + 0.55)]
  return `M${l[0]} ${l[1]} L${x2} ${y2} L${r[0]} ${r[1]}`
}
const WAVE = 'M30 470 L90 470 L100 466 L110 470 L130 470 L138 440 L146 498 L154 470 L200 470 L210 465 L220 470 L246 470 L254 434 L262 502 L270 470 L322 470 L332 466 L342 470 L364 470 L372 444 L380 494 L388 470 L438 470 L448 464 L458 470 L486 470 L494 432 L502 504 L510 470 L560 470 L570 466 L580 470 L604 470 L612 442 L620 496 L628 470 L680 470 L690 465 L700 470 L724 470 L732 436 L740 500 L748 470 L770 470'

function Diagram({ p }) {
  const n = p.nodes.length
  const edgeStart = 0.25 + n * 0.14
  return (
    <svg viewBox="0 0 800 560" className="bp-svg" role="img" aria-label={`${p.title} architecture diagram`}>
      <path className="f" style={{ animationDelay: '.05s' }} d="M30 18 H770 M30 12 V24 M770 12 V24" stroke="#8fc3ea" fill="none" />
      <text className="sub f" style={{ animationDelay: '.1s' }} x="400" y="10" textAnchor="middle">{p.caption}</text>
      {p.nodes.map((nd, i) => {
        const h = nd.h || 60, d = 0.2 + i * 0.14
        return (
          <g key={nd.id}>
            <rect className="box" style={{ animationDelay: `${d + 0.1}s` }} x={nd.x} y={nd.y} width={nd.w} height={h} />
            <rect className="draw" style={{ animationDelay: `${d}s` }} x={nd.x} y={nd.y} width={nd.w} height={h} pathLength="1" />
            <text className="lbl f" style={{ animationDelay: `${d + 0.3}s` }} x={nd.x + 14} y={nd.y + 26}>{nd.label}</text>
            <text className="sub f" style={{ animationDelay: `${d + 0.4}s` }} x={nd.x + 14} y={nd.y + 46}>{nd.sub}</text>
          </g>
        )
      })}
      {p.edges.map((d, i) => (
        <g key={i}>
          <path className="edge" style={{ animationDelay: `${edgeStart + i * 0.15}s` }} d={d} pathLength="1" />
          <path className="arrow f" style={{ animationDelay: `${edgeStart + i * 0.15 + 0.55}s` }} d={arrow(d)} />
          <circle r="4" className="f" fill={i % 2 ? '#8fd0ff' : '#ffd166'} style={{ animationDelay: `${edgeStart + 1.2}s` }}>
            <animateMotion dur={`${1.4 + (i % 3) * 0.3}s`} begin={`${edgeStart + 1.2 + i * 0.3}s`} repeatCount="indefinite" path={d} />
          </circle>
        </g>
      ))}
      {p.notes.map((nt, i) => (
        <text key={i} className="note f" style={{ animationDelay: `${edgeStart + p.edges.length * 0.15 + 0.4 + i * 0.15}s` }} x={nt.x} y={nt.y} textAnchor={nt.anchor || 'start'}>{nt.text}</text>
      ))}
      {p.wave && <>
        <path className="f" style={{ animationDelay: `${edgeStart}s` }} d="M30 400 H770 M30 540 H770" stroke="rgba(143,195,234,.4)" fill="none" />
        <text className="sub f" style={{ animationDelay: `${edgeStart}s` }} x="30" y="394">INPUT SIGNAL · ILLUSTRATIVE</text>
        <path className="wave" style={{ animationDelay: `${edgeStart}s` }} pathLength="1" d={WAVE} />
      </>}
      <text className="sub f" style={{ animationDelay: '1s' }} x="30" y="552">FIG. {p.code} · {p.title.toUpperCase()}</text>
    </svg>
  )
}

export function BlueprintView() {
  const close = useStore((s) => s.close)
  const [sel, setSel] = useState(0)
  const [nonce, setNonce] = useState(0)
  const [videoOk, setVideoOk] = useState(true)
  const last = useRef(0)
  const p = projects[sel]
  const pick = (i) => { setSel(i); setNonce((n) => n + 1); setVideoOk(true) }
  useEffect(() => {
    const k = (e) => { if (e.key === 'Escape') close(); if (e.key === 'ArrowRight') pick((sel + 1) % projects.length); if (e.key === 'ArrowLeft') pick((sel - 1 + projects.length) % projects.length) }
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k)
  })
  const onWheel = (e) => { const t = Date.now(); if (Math.abs(e.deltaY) < 4 || t - last.current < 600) return; last.current = t; pick((sel + (e.deltaY > 0 ? 1 : -1) + projects.length) % projects.length) }
  return (
    <div className="bp" onWheel={onWheel}>
      <div className="bp-glow" />
      <div className="bp-border a" /><div className="bp-border b" />
      <header className="bp-head">
        <div><span className="kicker">SAT · PROJECTS</span><span className="ttl">Blueprints</span></div>
        <nav aria-label="Projects">
          {projects.map((x, i) => <button key={x.id} className={i === sel ? 'on' : ''} onClick={() => pick(i)}>{x.code} {x.title.toUpperCase()}</button>)}
        </nav>
      </header>
      <section className="bp-left" key={'l' + nonce}>
        <div className="bp-video">
          {p.video && videoOk
            ? <video key={p.video} src={p.video.replace(/^\//, '')} autoPlay muted loop playsInline onError={() => setVideoOk(false)} />
            : p.highlights ? (
              <div className="bp-spec">
                <span className="hd">KEY FIGURES</span>
                <ul>{p.highlights.map((h, i) => <li key={i} style={{ animationDelay: `${0.25 + i * 0.12}s` }}><b>{h.k}</b><span>{h.v}</span></li>)}</ul>
              </div>
            ) : <div className="ph"><svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#e8f4ff" strokeWidth="1.2" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="M10 8l6 4-6 4z" fill="#e8f4ff" /></svg><span>demo video goes in /public/{p.video}</span></div>}
          <div className="scan" />
          {p.video && videoOk && <span className="rec"><i />REC · {p.code}</span>}
          <span className="c tl" /><span className="c tr" /><span className="c bl" /><span className="c br" />
        </div>
        <div className="row"><h2>{p.title}</h2><span className="status">{p.status}</span></div>
        <p>{p.blurb}</p>
        <div className="stack">{p.stack.map((s) => <span key={s}>{s}</span>)}</div>
        <div className="actions">
          {p.links.code && <a className="solid" href={p.links.code} target="_blank" rel="noreferrer">VIEW CODE</a>}
          {p.links.live && <a href={p.links.live} target="_blank" rel="noreferrer">{p.liveLabel || 'LIVE DEMO'}</a>}
          <button onClick={() => setNonce((n) => n + 1)}>↻ REDRAW</button>
        </div>
      </section>
      <div className="bp-sheet" key={'d' + nonce}><Diagram p={p} /></div>
      <div className="bp-block">
        <div className="full"><span>PROJECT</span><b>{p.title.toUpperCase()}</b></div>
        <div className="half"><span>DRAWN BY</span><b>S. GANASAN</b></div>
        <div><span>SHEET</span><b>{p.code} / {String(projects.length).padStart(2, '0')}</b></div>
        <div><span>REV</span><b>2026</b></div>
      </div>
      <button className="bp-close" onClick={close}>← Back to the room</button>
    </div>
  )
}
