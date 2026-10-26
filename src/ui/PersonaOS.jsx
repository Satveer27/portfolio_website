import { useEffect, useMemo, useRef, useState } from 'react'
import { useStore } from '../store'
import { experience, education, profile, skills, journey, skillIcons } from '../data'
import './persona.css'

const FONTS = ["'Anton', sans-serif", "'Archivo Black', sans-serif", "'DM Serif Display', serif", "'JetBrains Mono', monospace"]
const SCHEMES = [['#0b0b0b', '#fff'], ['#fff', '#0b0b0b'], ['#fff', '#d4001a'], ['#0b0b0b', '#fff'], ['#d4001a', '#fff']]

export function Ransom({ word, seed = 3, size = 74 }) {
  const letters = useMemo(() => {
    let s = seed
    const r = () => { s = (s * 9301 + 49297) % 233280; return s / 233280 }
    return word.split('').map((ch, i) => {
      if (ch === ' ') return { ch: ' ', space: true }
      const sc = SCHEMES[Math.floor(r() * SCHEMES.length)]
      return { ch, font: FONTS[Math.floor(r() * FONTS.length)], size: Math.round(size * (i === 0 ? 1.25 : 0.82 + r() * 0.36)), bg: sc[0], fg: sc[1], pad: `${4 + Math.round(r() * 6)}px ${6 + Math.round(r() * 8)}px`, rot: Math.round((r() - 0.5) * 16), dy: Math.round((r() - 0.5) * 10) }
    })
  }, [word, seed, size])
  return (
    <span className="ransom" aria-label={word}>
      {letters.map((l, i) => l.space ? <span key={i} style={{ width: size * 0.3 }} /> : (
        <span key={i} aria-hidden="true" style={{ fontFamily: l.font, fontSize: l.size, background: l.bg, color: l.fg, padding: l.pad, transform: `rotate(${l.rot}deg) translateY(${l.dy}px)`, boxShadow: l.bg === '#fff' ? '4px 4px 0 #0b0b0b' : 'none' }}>{l.ch}</span>
      ))}
    </span>
  )
}

const MENU = [
  { key: 'experience', label: 'Experience', sub: 'WHERE I WORKED' },
  { key: 'education', label: 'Education', sub: 'YEAR BY YEAR' },
  { key: 'skills', label: 'Skills', sub: 'MY LOADOUT' },
  { key: 'whoami', label: 'Who am I', sub: 'THE PERSON BEHIND IT' },
  { key: 'contact', label: 'Contact', sub: 'GET IN TOUCH' },
  { key: 'leave', label: 'Leave', sub: 'BACK TO THE ROOM' }
]
const TITLES = { menu: ['SAT//OS', 'MAIN MENU'], experience: ['EXPERIENCE', 'TRACK RECORD'], education: ['EDUCATION', 'UNIVERSITY OF GLASGOW'], whoami: ['WHO AM I', 'STATUS'], contact: ['CONTACT', 'CALLING CARD'], skills: ['SKILLS', 'LOADOUT'] }

// Original line icons, a different one for every skill (drawn here, not brand logos).
const GLYPHS = {
  Python: 'M18 6a3 3 0 0 0-3-3h-1a3 3 0 0 0 0 6h2a3 3 0 0 1 0 6H8a3 3 0 0 0 0 6h9M15.5 5.5h.01',
  TypeScript: 'M7 8l-4 4 4 4M17 8l4 4-4 4M9 7h6M12 7v10',
  JavaScript: 'M8 4c-2 0-2 1-2 3v2c0 1-1 3-2 3 1 0 2 2 2 3v2c0 2 0 3 2 3M16 4c2 0 2 1 2 3v2c0 1 1 3 2 3-1 0-2 2-2 3v2c0 2 0 3-2 3',
  SQL: 'M3 5h18v14H3zM3 10h18M3 15h18M9 10v9M15 10v9',
  Swift: 'M3 12h12M5 7h9M5 17h9M15 7l6 5-6 5',
  PHP: 'M8 7l-5 5 5 5M14 9a2.5 2.5 0 1 1 3 2.5c-1 .4-1 1-1 2M16 17h.01',
  Java: 'M5 10h11v5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5zM16 12h2a2 2 0 0 1 0 4h-2M8 3c0 2 2 2 2 4M12 3c0 2 2 2 2 4',
  FastAPI: 'M13 2L5 14h6l-1 8 8-12h-6z',
  Django: 'M12 3l9 5-9 5-9-5zM3 12.5l9 5 9-5M3 16.5l9 5 9-5',
  'REST APIs': 'M4 8h15l-3-3M20 16H5l3 3',
  PostgreSQL: 'M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3zM4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3',
  Celery: 'M3 6h12M3 12h12M3 18h12M18 9l3 3-3 3',
  Redis: 'M12 3l9 4-9 4-9-4zM3 12l9 4 9-4M3 17l9 4 9-4',
  Airflow: 'M4 6h5v4H4zM15 4h5v4h-5zM15 16h5v4h-5zM9 8h3l3-2M12 8v8h3',
  pandas: 'M5 4v16M9 8v12M13 4v16M17 10v10M21 6v14',
  'scikit-learn': 'M4 20l5-9 4 5 7-12M4 20h16',
  'Hugging Face models': 'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18M8.5 10h.01M15.5 10h.01M8 14c1 2 7 2 8 0',
  SVM: 'M4 20L20 4M4 14l10-10M10 20L20 10',
  OpenCV: 'M3 12c3-5 15-5 18 0-3 5-15 5-18 0zM12 9.5a2.5 2.5 0 1 0 0 5a2.5 2.5 0 1 0 0-5',
  SwiftUI: 'M4 5h16v14H4zM4 10h16M9 10v9',
  'React Native': 'M8 3h8v18H8zM11 18h2',
  Redux: 'M12 3a9 9 0 1 0 9 9M21 3v6h-6',
  Scraping: 'M10 4a6 6 0 1 0 0 12a6 6 0 1 0 0-12zM14.5 14.5L20 20M7 10h6',
  XGBoost: 'M4 20v-6M10 20v-10M16 20V6M3 20h18M14 4l3-2 3 2',
  'Random Forest': 'M7 3l-4 8h8zM7 11v10M17 3l-4 8h8zM17 11v10',
  'Signal processing': 'M2 12h3l2-6 3 12 3-9 2 5 2-2h5',
  'Feature engineering': 'M4 6h16M4 12h16M4 18h16M9 4v4M15 10v4M7 16v4',
  EC2: 'M4 4h16v6H4zM4 14h16v6H4zM7.5 7h.01M7.5 17h.01M12 7h4M12 17h4',
  Azure: 'M7 18h10a4 4 0 0 0 0-8a6 6 0 0 0-11.5 1.5A3.5 3.5 0 0 0 7 18z',
  Docker: 'M2 9h20v10H2zM6 9v10M10 9v10M14 9v10M18 9v10M8 5h8v4',
  DigitalOcean: 'M2 8c2-2 4-2 6 0s4 2 6 0 4-2 6 0M2 13c2-2 4-2 6 0s4 2 6 0 4-2 6 0M2 18c2-2 4-2 6 0s4 2 6 0 4-2 6 0',
  'CI/CD': 'M4 12a8 8 0 0 1 14-5l2 2M20 12a8 8 0 0 1-14 5l-2-2M20 4v5h-5M4 20v-5h5',
  TestFlight: 'M22 2L11 13M22 2l-7 20-4-9-9-4z',
  React: 'M9 3h6v4H9zM3 17h6v4H3zM15 17h6v4h-6zM12 7v5M6 17v-5h12v5',
  'three.js': 'M12 2l9 5v10l-9 5-9-5V7zM12 12l9-5M12 12v10M12 12L3 7',
  _default: 'M5 6a2 2 0 1 0 .01 0M5 18a2 2 0 1 0 .01 0M19 12a2 2 0 1 0 .01 0M7 6l10 5M7 18l10-5'
}

function SkillIcon({ name }) {
  const [ok, setOk] = useState(true)
  if (skillIcons[name] && ok) return <span className="ic img"><img src={skillIcons[name]} alt="" onError={() => setOk(false)} /></span>
  return <span className="ic"><svg viewBox="0 0 24 24" aria-hidden="true"><path d={GLYPHS[name] || GLYPHS._default} /></svg></span>
}

function Skills() {
  // languages appear twice in the data (TypeScript under Frontend too); show each skill once
  const seen = new Set()
  const groups = skills.map((g) => ({ ...g, items: g.items.filter((x) => (seen.has(x) ? false : seen.add(x))) })).filter((g) => g.items.length)
  let n = 0
  return (
    <div className="p5-skills">
      {groups.map((g, gi) => (
        <section key={g.group} className="p5-sk slam" style={{ animationDelay: `${gi * 0.07}s` }}>
          <h3><span>{g.group}</span></h3>
          <ul>
            {g.items.map((it) => (
              <li key={it} className="rise" style={{ animationDelay: `${0.15 + n++ * 0.025}s` }}><SkillIcon name={it} /><b>{it}</b></li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

// Travel journey: the route draws itself, a plane flies it, and each stop pops in. Tap a stop to read about it.
function Journey({ mobile }) {
  const W = 1000, H = mobile ? 680 : 420
  const pts = journey.map((j) => [j.x * W, j.y * H])
  const d = pts.reduce((acc, [x, y], i) => {
    if (!i) return `M${x} ${y}`
    const [px, py] = pts[i - 1]
    const mx = (px + x) / 2, my = Math.min(py, y) - Math.abs(x - px) * 0.28 - 30
    return `${acc} Q${mx} ${my} ${x} ${y}`
  }, '')
  const [on, setOn] = useState(0)
  const [auto, setAuto] = useState(true)
  useEffect(() => { if (!auto) return; const t = setInterval(() => setOn((i) => (i + 1) % journey.length), 2600); return () => clearInterval(t) }, [auto])
  const j = journey[on]
  const dur = Math.max(6, journey.length * 2.2)
  return (
    <div className="p5-journey rise">
      <div className="jt"><span>MY JOURNEY</span><small>{journey.filter((x) => !x.next).length} places so far</small></div>
      <div className="jmap">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" role="img" aria-label={'My journey: ' + journey.map((x) => x.place).join(', then ')}>
          <defs>
            <pattern id="jdots" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.6" fill="rgba(11,11,11,.18)" /></pattern>
            <mask id="jdraw"><path d={d} pathLength="1" className="jdraw" fill="none" stroke="#fff" strokeWidth="12" /></mask>
          </defs>
          <rect width={W} height={H} fill="url(#jdots)" />
          {[0.25, 0.5, 0.75].map((k) => <line key={k} x1="0" x2={W} y1={H * k} y2={H * k} stroke="rgba(11,11,11,.08)" strokeWidth="2" />)}
          <path d={d} fill="none" stroke="#0b0b0b" strokeWidth="5" strokeDasharray="14 12" strokeLinecap="round" mask="url(#jdraw)" />
          <g className="jplane">
            <path d="M-16 -3 L6 -3 L18 0 L6 3 L-16 3 Z M-2 -3 L-10 -16 L-4 -16 L6 -3 Z M-2 3 L-10 16 L-4 16 L6 3 Z M-16 -3 L-20 -9 L-16 -9 L-11 -3 Z M-16 3 L-20 9 L-16 9 L-11 3 Z" fill="#d4001a" stroke="#0b0b0b" strokeWidth="2" strokeLinejoin="round" />
            <animateMotion dur={`${dur}s`} begin="1.2s" repeatCount="indefinite" rotate="auto" path={d} keyPoints="0;1;1" keyTimes="0;0.85;1" calcMode="linear" />
          </g>
          {journey.map((s, i) => {
            const [x, y] = pts[i]
            const act = i === on
            return (
              <g key={i} transform={`translate(${x} ${y})`}><g className={'jstop' + (act ? ' on' : '') + (s.next ? ' next' : '')} style={{ animationDelay: `${0.3 + i * 0.22}s` }} onClick={() => { setOn(i); setAuto(false) }} onMouseEnter={() => { setOn(i); setAuto(false) }}>
                <circle r="26" fill="transparent" />
                {act && <circle r="20" className="ring" />}
                <circle r={act ? 13 : 10} fill={s.next ? '#fff' : act ? '#d4001a' : '#0b0b0b'} stroke="#0b0b0b" strokeWidth="4" strokeDasharray={s.next ? '5 4' : undefined} />
                <text y={y > H * 0.6 ? 46 : -26} textAnchor="middle">{s.place}</text>
              </g></g>
            )
          })}
        </svg>
      </div>
      <div className="jcap" key={on}>
        <span className="when">{j.when}</span>
        <b>{j.place}{j.country ? `, ${j.country}` : ''}</b>
        <span className="note">{j.note}</span>
      </div>
    </div>
  )
}

export function PersonaOS({ mobile = false }) {
  const close = useStore((s) => s.close)
  const start = useStore((s) => s.osScreen) || 'menu'
  const [screen, setScreen] = useState(start)
  const [sel, setSel] = useState(Math.max(0, MENU.findIndex((m) => m.key === start)))
  const [job, setJob] = useState(0)
  const [wipe, setWipe] = useState(0)
  const [now, setNow] = useState(new Date())
  const lastWheel = useRef(0)
  const dossier = useRef(null)
  const root = useRef(null)
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 30000); return () => clearInterval(t) }, [])

  const go = (key) => {
    if (key === 'leave') return close()
    setScreen(key); setWipe((w) => w + 1); setJob(0)
    if (root.current) root.current.scrollTop = 0
  }
  const step = (d) => {
    if (screen === 'menu') setSel((s) => (s + d + MENU.length) % MENU.length)
    else if (screen === 'experience' || screen === 'education') setJob((j) => (j + d + items.length) % items.length)
  }
  const onWheel = (e) => { const t = Date.now(); if (Math.abs(e.deltaY) < 4 || t - lastWheel.current < 280) return; lastWheel.current = t; step(e.deltaY > 0 ? 1 : -1) }
  useEffect(() => {
    const k = (e) => {
      if (e.key === 'ArrowDown') step(1); else if (e.key === 'ArrowUp') step(-1)
      else if (e.key === 'Enter' && screen === 'menu') go(MENU[sel].key)
      else if (e.key === 'Escape' || e.key === 'Backspace') { screen === 'menu' ? close() : go('menu') }
    }
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k)
  })
  const [title, sub] = TITLES[screen]
  const dows = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
  const items = screen === 'education' ? education : experience
  const j = items[job] || items[0]

  return (
    <div ref={root} className={mobile ? 'p5 m' : 'p5'} onWheel={mobile ? undefined : onWheel}>
      <div className="p5-bg" aria-hidden="true">
      <div className="p5-rays" aria-hidden="true" />
      <div className="p5-dots" aria-hidden="true" />
      <div className="p5-band" aria-hidden="true" />
      <svg className="p5-city" viewBox="0 0 1440 260" preserveAspectRatio="none" aria-hidden="true"><path d="M0 260 V170 h40 v-30 h30 v40 h50 v-90 h18 v-20 h14 v20 h18 v90 h40 v-60 h60 v70 h30 v-120 l20 -20 l20 20 v120 h50 v-50 h40 v-40 h40 v90 h60 v-150 h12 v-30 h6 v30 h12 v150 h40 v-70 h70 v60 h30 v-110 h50 v110 h60 v-40 h40 v-80 h20 l10 -30 l10 30 h20 v120 h50 v-60 h60 v80 h40 v-130 h50 v130 h70 v-50 h40 v-30 h50 v100 h40 v-90 h30 v90 h40 V260 Z" /></svg>
      <span className="p5-star a" aria-hidden="true" /><span className="p5-star b" aria-hidden="true" /><span className="p5-star c" aria-hidden="true" />
      </div>

      <div className="p5-date">
        <span className="md">{now.getMonth() + 1}/{now.getDate()}</span>
        <span className="col"><span className="dow">{dows[now.getDay()]}</span><span className="time">{String(now.getHours()).padStart(2, '0')}:{String(now.getMinutes()).padStart(2, '0')}</span></span>
      </div>

      <div className="p5-title" key={'t' + wipe}><Ransom word={title} seed={title.length * 7 + 3} size={mobile ? 30 : 74} /></div>
      <div className="p5-sub" key={'s' + wipe}><span>{sub}</span></div>

      {screen === 'menu' && (
        <>
          <p className="p5-intro">{profile.name}. {profile.role}. Python, FastAPI, data pipelines and ML that actually ships.</p>
          <nav className="p5-menu" aria-label="Main menu">
            {MENU.map((m, i) => (
              <button key={m.key} className={'p5-mi' + (i === sel ? ' on' : '') + (m.key === 'leave' ? ' small' : '')} style={{ marginLeft: mobile ? 0 : [40, 0, 70, 20, 60, 120][i], animationDelay: `${i * 0.06}s` }} onMouseEnter={() => setSel(i)} onFocus={() => setSel(i)} onClick={() => go(m.key)}>
                <span className="shadow" /><span className="plate" /><span className="cursor" />
                <span className="label">{m.label}</span><span className="sub">{m.sub}</span>
              </button>
            ))}
          </nav>
        </>
      )}

      {(screen === 'experience' || screen === 'education') && (
        <>
          <div className="p5-timeline" aria-hidden="true" />
          <div className="p5-jobs">
            {items.map((x, i) => (
              <div key={x.org} className="slam" style={{ animationDelay: `${i * 0.07}s` }}>
                <button className={'p5-job' + (i === job ? ' on' : '')} style={{ transform: i === job ? (mobile ? 'translateX(6px) rotate(-1.5deg)' : 'translateX(24px) rotate(-2deg) scale(1.04)') : `rotate(${i % 2 ? 1 : -1}deg)` }} onMouseEnter={() => !mobile && setJob(i)} onClick={() => { setJob(i); if (mobile) setTimeout(() => dossier.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60) }}>
                  <span className="plate" /><span className="star" />
                  <span className="txt"><span className="org">{x.org}</span><span className="role">{x.role}</span></span>
                </button>
              </div>
            ))}
          </div>
          <article className={'p5-dossier' + (j.points ? ' dense' : '')} key={'j' + job} ref={dossier}>
            <div className="back" /><div className="front" />
            <div className="body">
              <span className="tag">{j.kind} · {j.when}{j.where ? ` · ${j.where.toUpperCase()}` : ''}</span>
              <h2>{j.org}</h2>
              <div className="role">{j.role}</div>
              {j.figs && <div className="figs">{j.figs.map((f) => <div key={f.v}><b>{f.k}</b><span>{f.v}</span></div>)}</div>}
              {j.points ? <ul className="points">{j.points.map((t, i) => <li key={i}>{t}</li>)}</ul> : <p>{j.blurb}</p>}
              <div className="stack">{j.stack.map((s) => <span key={s}>{s}</span>)}</div>
            </div>
          </article>
        </>
      )}

      {screen === 'skills' && <Skills />}

      {screen === 'whoami' && (
        <div className="p5-who">
          <div className="photo slamR">
            <div className="frame"><img src={profile.photo.replace(/^\//, '')} alt={profile.name} onError={(e) => { e.currentTarget.style.display = 'none' }} /><span className="ph">[YOUR PHOTO]</span></div>
            <div className="nameplate"><span>{profile.fullName}</span></div>
          </div>
          <div className="info">
            <p className="bio rise">{profile.bio} {profile.offClock}</p>
            <div className="facts rise">
              <div><span>ROLE</span><b>{profile.role}</b></div>
              <div><span>BASED IN</span><b>{profile.basedIn}</b></div>
              <div><span>EDUCATION</span><b>MSci CS · Glasgow '26</b></div>
            </div>
            <Journey mobile={mobile} />
          </div>
        </div>
      )}

      {screen === 'contact' && (
        <div className="p5-card drop">
          <div className="shadow" />
          <div className="paper"><div className="red">
            <div className="dots" />
            <Ransom word="LET'S TALK" seed={41} size={mobile ? 34 : 58} />
            <p>{profile.role}, MSci CS from the University of Glasgow. Got something to build? I'd love to hear about it.</p>
            <div className="links">
              <a href={profile.links.email}>Email</a>
              <a href={profile.links.github} target="_blank" rel="noreferrer">GitHub</a>
              <a href={profile.links.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
            </div>
            <span className="from">FROM: SAT</span>
          </div></div>
        </div>
      )}

      <div className="p5-bar">
        {(screen === 'experience' || screen === 'education') && !mobile && <button className="p5-pill light" onClick={() => step(1)}><b>NEXT</b><small>scroll ↓</small></button>}
        <button className="p5-pill" onClick={() => (screen === 'menu' ? close() : go('menu'))}><i>✕</i><b>{screen === 'menu' ? 'LEAVE' : 'BACK'}</b></button>
      </div>

      <div className="p5-wipe" key={'w' + wipe} aria-hidden="true"><span /><span /><span /></div>
    </div>
  )
}
