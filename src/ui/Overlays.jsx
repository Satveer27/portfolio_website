import { useEffect, useRef, useState } from 'react'
import { useProgress } from '@react-three/drei'
import { useStore } from '../store'
import { games, tracks, profile } from '../data'
import { startJazz, stopJazz } from '../scene/jazz'
import { PersonaOS } from './PersonaOS'
import { BlueprintView } from './BlueprintView'

// Scales a 1440x900 design to fit any screen.
function Fit({ children }) {
  const [s, setS] = useState(1)
  useEffect(() => { const f = () => setS(Math.min(window.innerWidth / 1440, window.innerHeight / 900)); f(); window.addEventListener('resize', f); return () => window.removeEventListener('resize', f) }, [])
  return (
    <div className="fit">
      <div className="fit-inner" style={{ transform: `translate(-50%, -50%) scale(${s})` }}>{children}</div>
    </div>
  )
}

export function Loader() {
  const { progress, active } = useProgress()
  const [gone, setGone] = useState(false)
  useEffect(() => { if (!active && progress >= 100) { const t = setTimeout(() => setGone(true), 600); return () => clearTimeout(t) } }, [active, progress])
  if (gone) return null
  return (
    <div className={'loader' + (!active && progress >= 100 ? ' out' : '')}>
      <div className="loader-title">Sat's room</div>
      <div className="loader-bar"><span style={{ width: `${progress}%` }} /></div>
      <div className="loader-pct">{Math.round(progress)}%</div>
    </div>
  )
}

// phones (and any tall, narrow window) get layouts built for the screen instead of a shrunk desktop page
function useNarrow() {
  const q = () => typeof window !== 'undefined' && (window.innerWidth < 760 || window.innerWidth / window.innerHeight < 0.8)
  const [n, setN] = useState(q)
  useEffect(() => { const f = () => setN(q()); window.addEventListener('resize', f); return () => window.removeEventListener('resize', f) }, [])
  return n
}
const TOUCH = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
export function HUD() {
  const progress = useStore((s) => s.progress)
  const seated = useStore((s) => s.seated)
  const overlay = useStore((s) => s.overlay)
  const focus = useStore((s) => s.focus)
  const hover = useStore((s) => s.hover)
  const toast = useStore((s) => s.toast)
  const playing = useStore((s) => s.playing)
  const muted = useStore((s) => s.muted)
  const album = useStore((s) => s.album)
  const open = useStore((s) => s.open)
  const sit = useStore((s) => s.sit)
  const narrow = useNarrow()
  const introOp = Math.max(0, 1 - progress * 3)
  return (
    <>
      <div className="intro" style={{ opacity: introOp, transform: `translate(-50%, ${progress * 40}px)`, pointerEvents: introOp > 0.2 ? 'auto' : 'none' }}>
        <div className="intro-kicker">SATVEER GANASAN · PORTFOLIO</div>
        <h1>Come in, take a seat.</h1>
        <div className="intro-row"><button className="pill light" onClick={sit}>Sit down</button><span className="scroll-hint">or scroll<span className="mouse"><i /></span></span></div>
        <button className="linkish" onClick={() => useStore.getState().setView('recruiter')}>Prefer a quick read? Recruiter view →</button>
      </div>

      {seated && !focus && !overlay && (
        <div className="seated fade-in">
          <div className="hint">{TOUCH ? 'drag to look around · tap anything' : 'drag to look around · click anything · scroll up to stand'}</div>
          <nav className="quick" aria-label="Sections">
            <button onClick={() => open('board')}>Projects</button>
            <button onClick={() => open('computer', { osScreen: 'experience' })}>Experience</button>
            <button onClick={() => open('computer', { osScreen: 'education' })}>Education</button>
            <button onClick={() => open('computer', { osScreen: 'skills' })}>Skills</button>
            <button onClick={() => open('music')}>Music</button>
            <button onClick={() => open('shelf')}>Books</button>
            <button onClick={() => open('computer', { osScreen: 'whoami' })}>Who am I</button>
            <button className="light" onClick={() => open('computer', { osScreen: 'contact' })}>Contact</button>
            <button onClick={() => useStore.getState().setView('recruiter')}>Recruiter view</button>
          </nav>
        </div>
      )}

      {hover && <div className="tip" style={{ left: hover.x, top: hover.y }}>{hover.label}</div>}
      {toast && <div className="toast fade-in">{toast}</div>}
      {playing && (
        <div className="np-group">
          {overlay !== 'music' && <button className="nowplaying" onClick={() => open('music')}>♪ {tracks[album].title} · {tracks[album].artist}</button>}
          <button className="mutebtn" aria-pressed={muted} aria-label={muted ? 'Unmute music' : 'Mute music'} onClick={() => useStore.setState({ muted: !muted })}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor" />
              {muted ? <path d="M17 9l5 6M22 9l-5 6" /> : <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" />}
            </svg>
          </button>
        </div>
      )}

      {overlay === 'computer' && (narrow ? <PersonaOS mobile /> : <Fit><PersonaOS /></Fit>)}
      {overlay === 'board' && <Fit><BlueprintView /></Fit>}
      {overlay === 'music' && <MusicHUD />}
      {overlay === 'shelf' && <ShelfHUD />}
      {overlay === 'frame' && <FrameHUD />}
      {overlay === 'cart' && <CartHUD />}
      {overlay === 'book' && <BookReader />}
      {overlay === 'cert' && <CertHUD />}
    </>
  )
}

function CloseBtn({ label = '← Back to the room' }) {
  const close = useStore((s) => s.close)
  useEffect(() => { const k = (e) => e.key === 'Escape' && close(); window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k) }, [close])
  return <button className="pill light close" onClick={close}>{label}</button>
}

function ShelfHUD() {
  return (
    <div className="music fade-in">
      <CloseBtn label="← Back to your seat" />
      <div className="music-hint">{TOUCH ? 'tap a book to pull it out' : 'click a book to pull it out'}</div>
    </div>
  )
}

function MusicHUD() {
  const album = useStore((s) => s.album)
  const playing = useStore((s) => s.playing)
  const t = tracks[album]
  const last = useRef(0)
  const set = (i) => useStore.setState({ album: (i + tracks.length) % tracks.length })
  useEffect(() => {
    const w = (e) => { const n = Date.now(); if (Math.abs(e.deltaY) < 4 || n - last.current < 220) return; last.current = n; set(useStore.getState().album + (e.deltaY > 0 ? 1 : -1)) }
    const k = (e) => { if (e.key === 'ArrowRight') set(useStore.getState().album + 1); if (e.key === 'ArrowLeft') set(useStore.getState().album - 1); if (e.key === ' ') useStore.setState({ playing: !useStore.getState().playing }) }
    // swipe left / right on phones
    let sx = null
    const ts = (e) => { sx = e.touches[0]?.clientX ?? null }
    const te = (e) => { if (sx == null) return; const dx = (e.changedTouches[0]?.clientX ?? sx) - sx; sx = null; if (Math.abs(dx) > 40) set(useStore.getState().album + (dx < 0 ? 1 : -1)) }
    window.addEventListener('wheel', w, { passive: true }); window.addEventListener('keydown', k)
    window.addEventListener('touchstart', ts, { passive: true }); window.addEventListener('touchend', te, { passive: true })
    return () => { window.removeEventListener('wheel', w); window.removeEventListener('keydown', k); window.removeEventListener('touchstart', ts); window.removeEventListener('touchend', te) }
  }, [])
  return (
    <div className="music fade-in">
      <CloseBtn />
      <div className="music-info">
        <span className="kicker">NOW SPINNING · {String(album + 1).padStart(2, '0')} / {String(tracks.length).padStart(2, '0')}</span>
        <h2>{t.title}</h2>
        <span className="artist">{t.artist}</span>
      </div>
      <div className="playlist" aria-label="Playlist">
        <span className="kicker">PLAYLIST · {tracks.length} TRACKS</span>
        {tracks.map((x, i) => (
          <button key={i} className={i === album ? 'on' : ''} onClick={() => (i === album ? useStore.setState({ playing: !playing }) : useStore.setState({ album: i, playing: true }))}>
            <i style={{ background: `linear-gradient(135deg, ${x.colors[0]}, ${x.colors[1]})` }} />
            <span><b>{x.title}</b><em>{x.artist}</em></span>
            <u>{i === album && playing ? '❚❚' : '▶'}</u>
          </button>
        ))}
      </div>
      <div className="music-controls">
        <button aria-label="Previous album" onClick={() => set(album - 1)}>‹</button>
        <button className="play" onClick={() => useStore.setState({ playing: !playing })}>{playing ? 'Pause' : 'Play'}</button>
        <button aria-label="Next album" onClick={() => set(album + 1)}>›</button>
      </div>
      <div className="music-hint">{TOUCH ? 'swipe to flip through the sleeves · tap one to play' : 'scroll to flip through the sleeves · click one to play'}</div>
    </div>
  )
}

export function Audio() {
  const album = useStore((s) => s.album)
  const playing = useStore((s) => s.playing)
  const muted = useStore((s) => s.muted)
  // pressing play always brings the sound back
  useEffect(() => { if (playing) useStore.setState({ muted: false }) }, [playing])
  useEffect(() => {
    if (playing && !muted) startJazz(tracks[album].key); else stopJazz()
    return stopJazz
  }, [playing, muted, album])
  return null
}

function FrameHUD() {
  const drag = useRef(null)
  const onDown = (e) => { drag.current = { x: e.clientX, y: e.clientY, r: { ...useStore.getState().inspectRot } } }
  const onMove = (e) => { const d = drag.current; if (!d) return; useStore.setState({ inspectRot: { x: Math.max(-0.9, Math.min(0.9, d.r.x + (e.clientY - d.y) * 0.008)), y: d.r.y + (e.clientX - d.x) * 0.01 } }) }
  const onUp = () => { drag.current = null }
  return (
    <div className="inspect fade-in" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp}>
      <CloseBtn label="← Put it back" />
      <div className="music-hint">{TOUCH ? 'drag to turn the frame over' : 'drag to turn the frame over · esc to put it back'}</div>
    </div>
  )
}

function CartHUD() {
  const i = useStore((s) => s.cart)
  const g = games[i ?? 0]
  return (
    <div className="inspect fade-in">
      <CloseBtn label="← Put it back" />
      <div className="inspect-card cart">
        <span className="kicker">CARTRIDGE · SAT-0{(i ?? 0) + 1}</span>
        <h2>{g.title}</h2>
        <p>{g.note}</p>
        <div className="cart-nav">
          {games.map((x, k) => <button key={k} className={k === i ? 'on' : ''} onClick={() => useStore.setState({ cart: k })}>{k + 1}</button>)}
        </div>
      </div>
    </div>
  )
}

function BookReader() {
  const idx = useStore((s) => s.book)
  const items = useStore((s) => s.shelfItems) || []
  const b = items[idx]
  const [show, setShow] = useState(false)
  useEffect(() => { const t = setTimeout(() => setShow(true), 550); return () => clearTimeout(t) }, [idx])
  if (!b) return null
  // phones get a stacked, full-width card instead of a scaled-down desktop spread
  const narrow = window.innerWidth < 760
  const Wrap = narrow ? 'div' : Fit
  return (
    <div className="reader-wrap">
      <CloseBtn label="← Put it back" />
      {show && (
        <Wrap>
          <div className={narrow ? 'reader reader-m' : 'reader'}>
            <div className="page cover" style={{ background: b.color, color: b.ink }}>
              <span className="kicker">{b.kind === 'manga' ? 'MANGA' : 'BOOK'}</span>
              <h2>{b.title}</h2>
              <b>{b.by}</b>
            </div>
            <div className="page notes">
              <i className="ribbon" />
              <span className="kicker">MY NOTES</span>
              {b.notes.map(([lab, text]) => <span key={lab} style={{ display: 'contents' }}><span className="lab">{lab}</span><p>{text}</p></span>)}
            </div>
          </div>
        </Wrap>
      )}
    </div>
  )
}

function CertHUD() {
  return (
    <div className="inspect fade-in">
      <CloseBtn />
    </div>
  )
}
