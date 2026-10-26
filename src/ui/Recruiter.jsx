import { useEffect, useMemo, useRef, useState } from 'react'
import { profile, projects, experience, skills, games, shelf, decor } from '../data'
import './recruiter.css'

// The quick, plain version of the portfolio: no 3D scene, loads instantly, reads top to bottom.
// One signature moment (the name arriving). Everything else stays still until you act on it.

const GROUP_COLORS = { Languages: '#ff6b4a', Backend: '#4ade80', 'Data and ML': '#a78bfa', 'Cloud and delivery': '#38bdf8', Frontend: '#fbbf24' }
const FINE_POINTER = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches
const REDUCED = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

// A ring and dot that replace the system pointer. They trail the mouse, grow over anything clickable and can carry a label
// (data-cursor="ANIME"). Listening on the window means they come back after alt-tab, a tab switch or leaving the window.
function Cursor({ root }) {
  const ring = useRef(null)
  const [label, setLabel] = useState('')
  useEffect(() => {
    if (!FINE_POINTER || REDUCED) return
    const el = root.current, r = ring.current
    let x = -100, y = -100, cx = -100, cy = -100, raf, on = false
    const show = (v) => { if (v === on) return; on = v; r.classList.toggle('show', v); el.classList.toggle('nocursor', v) }
    const move = (e) => { x = e.clientX; y = e.clientY; if (!on) { cx = x; cy = y; show(true) } }
    const over = (e) => {
      const t = e.target.closest && e.target.closest('a,button,[data-cursor],canvas,.rv-proj,.rv-job')
      r.classList.toggle('big', !!t)
      setLabel((t && t.dataset && t.dataset.cursor) || '')
    }
    const hide = () => show(false)
    const hidden = () => { if (document.hidden) hide() }
    const tick = () => { raf = requestAnimationFrame(tick); cx += (x - cx) * 0.22; cy += (y - cy) * 0.22; r.style.transform = `translate3d(${cx}px,${cy}px,0)` }
    tick()
    window.addEventListener('pointermove', move, { passive: true }); window.addEventListener('blur', hide)
    document.documentElement.addEventListener('mouseleave', hide); document.addEventListener('visibilitychange', hidden)
    el.addEventListener('pointerover', over)
    return () => {
      cancelAnimationFrame(raf); el.classList.remove('nocursor')
      window.removeEventListener('pointermove', move); window.removeEventListener('blur', hide)
      document.documentElement.removeEventListener('mouseleave', hide); document.removeEventListener('visibilitychange', hidden)
      el.removeEventListener('pointerover', over)
    }
  }, [root])
  if (!FINE_POINTER) return null
  return <div className="rv-cursor" ref={ring} aria-hidden="true"><span>{label}</span></div>
}

// Scroll effects, only where they carry meaning: the hero eases away as you leave it, the interests images drift at
// different speeds, and the lit word on the interests wall follows the category of the image nearest the middle.
function useScrollFx(root) {
  useEffect(() => {
    const el = root.current
    if (!el) return
    let raf = 0
    const pars = Array.from(el.querySelectorAll('[data-par]'))
    const wall = el.querySelector('.rv-wall')
    const tiles = wall ? Array.from(wall.querySelectorAll('.rv-tile')) : []
    const run = () => {
      raf = 0
      const st = el.scrollTop, vh = el.clientHeight
      const reads = []
      if (!REDUCED) {
        el.style.setProperty('--hs', Math.min(1, st / (vh * 0.9)).toFixed(4))
        pars.forEach((p) => reads.push([p, p.getBoundingClientRect()]))
      }
      let wr = null
      const tileRects = []
      if (wall) {
        wr = wall.getBoundingClientRect()
        if (wr.top < vh && wr.bottom > 0) tiles.forEach((t) => tileRects.push([t, t.getBoundingClientRect()]))
      }
      // all layout reads happen above; the writes below do not force a second layout
      reads.forEach(([p, b]) => p.style.setProperty('--py', (-(b.top + b.height / 2 - vh / 2) * parseFloat(p.dataset.par)).toFixed(1) + 'px'))
      let best = null, bd = 1e9
      tileRects.forEach(([t, b]) => { const d = Math.abs(b.top + b.height / 2 - vh * 0.55); if (d < bd) { bd = d; best = t } })
      if (best && wall.dataset.cat !== best.dataset.cat) wall.dataset.cat = best.dataset.cat
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(run) }
    run()
    el.addEventListener('scroll', onScroll, { passive: true }); window.addEventListener('resize', onScroll)
    return () => { if (raf) cancelAnimationFrame(raf); el.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll) }
  }, [root])
}

function Section({ id, title, children }) {
  return (
    <section id={id} className="rv-sec">
      {title && <h2 className="rv-h2">{title}</h2>}
      {children}
    </section>
  )
}

function Experience() {
  return (
    <div className="rv-exp">
      {experience.map((x) => (
        <article key={x.org} className="rv-job">
          <header>
            <h3>{x.org}</h3>
            <p className="rv-role">{x.role}</p>
            <p className="rv-meta">{x.when}</p>
            {x.where && <p className="rv-meta">{x.where}</p>}
          </header>
          <div className="rv-job-body">
            {x.figs && <dl className="rv-figs">{x.figs.map((f) => <div key={f.v}><dt>{f.k}</dt><dd>{f.v}</dd></div>)}</dl>}
            {(x.points || [x.blurb]).map((t, k) => <p key={k}>{t}</p>)}
            <p className="rv-stack">{x.stack.join(', ')}</p>
          </div>
        </article>
      ))}
    </div>
  )
}

// The top of a project: a video if the file exists, otherwise a screenshot, otherwise (for projects that declare an
// image) a quiet holder waiting for one. Projects with nothing declared get no media area at all.
function Media({ p, onImage }) {
  const [vOk, setVOk] = useState(true)
  const [iOk, setIOk] = useState(true)
  if (p.video && vOk) return <div className="rv-media"><video src={p.video} muted loop playsInline autoPlay preload="metadata" onError={() => setVOk(false)} /></div>
  if (!p.image) return null
  return (
    <div className="rv-media">
      {iOk
        ? <img src={p.image} alt={p.title + ' screenshot'} loading="lazy" onLoad={() => onImage(true)} onError={() => { setIOk(false); onImage(false) }} />
        : <div className="rv-holder" aria-hidden="true">Screenshot coming soon</div>}
    </div>
  )
}

function ProjectCard({ p, onPop }) {
  const [hasImg, setHasImg] = useState(false)
  const code = p.links.code && !p.links.code.startsWith('['), live = p.links.live && !p.links.live.startsWith('[')
  return (
    <article className="rv-proj" onPointerEnter={() => hasImg && onPop(p.image)} onPointerLeave={() => onPop(null)}>
      <Media p={p} onImage={setHasImg} />
      <div className="rv-proj-in">
        <h3>{p.title}<span>{p.status.toLowerCase()}</span></h3>
        <p>{p.summary || p.blurb}</p>
        <p className="rv-stack">{p.stack.slice(0, 8).join(', ')}</p>
        {(code || live) && (
          <p className="rv-links">
            {code && <a href={p.links.code} target="_blank" rel="noreferrer">Code</a>}
            {live && <a href={p.links.live} target="_blank" rel="noreferrer">{p.liveLabel ? 'Read the paper' : 'Live site'}</a>}
          </p>
        )}
      </div>
    </article>
  )
}

// Hovering a project that has a screenshot pops a larger copy out beside the pointer.
function Projects() {
  const pop = useRef(null)
  const pos = useRef({ x: 0, y: 0 })
  const [src, setSrc] = useState(null)
  useEffect(() => {
    if (!FINE_POINTER || REDUCED) return
    let raf, cx = 0, cy = 0
    const tick = () => {
      raf = requestAnimationFrame(tick)
      cx += (pos.current.x - cx) * 0.16; cy += (pos.current.y - cy) * 0.16
      if (pop.current) pop.current.style.transform = `translate3d(${cx + 30}px,${cy - 150}px,0) rotate(-3deg)`
    }
    tick()
    return () => cancelAnimationFrame(raf)
  }, [])
  return (
    <div className="rv-projects" onPointerMove={(e) => { pos.current.x = e.clientX; pos.current.y = e.clientY }}>
      {projects.map((p) => <ProjectCard key={p.id} p={p} onPop={setSrc} />)}
      {FINE_POINTER && <div className={'rv-pop' + (src ? ' show' : '')} ref={pop} aria-hidden="true">{src && <img src={src} alt="" />}</div>}
    </div>
  )
}

// Fibonacci sphere: n points spread evenly over a unit sphere.
function spherePoints(n) {
  const out = []
  for (let i = 0; i < n; i++) {
    const y = n === 1 ? 0 : 1 - ((i + 0.5) * 2) / n
    const r = Math.sqrt(Math.max(0, 1 - y * y)), a = i * 2.399963
    out.push([Math.cos(a) * r, y, Math.sin(a) * r])
  }
  return out
}

// Skills as a sphere of labels you can drag to spin. Filter tabs reshuffle it to one group.
function SkillSphere() {
  const groups = skills.map((g) => g.group)
  const items = useMemo(() => {
    const seen = new Set(), out = []
    skills.forEach((g) => g.items.forEach((name) => { if (!seen.has(name)) { seen.add(name); out.push({ name, group: g.group }) } }))
    return out
  }, [])
  const [filter, setFilter] = useState('All')
  const canvas = useRef(null)
  const st = useRef({ items: [], ax: 0.4, ay: 0.2, vx: 0.0035, vy: 0, drag: null, pointer: null, size: [600, 460] })

  // (re)lay out the sphere whenever the filter changes; hidden skills fade out where they are
  useEffect(() => {
    const s = st.current
    if (!s.items.length) { const start = spherePoints(items.length); s.items = items.map((it, i) => ({ ...it, p: start[i].slice(), t: start[i].slice(), a: 0, show: true })) }
    const vis = s.items.filter((it) => filter === 'All' || it.group === filter)
    const pts = spherePoints(vis.length)
    s.items.forEach((it) => { it.show = vis.includes(it) })
    vis.forEach((it, i) => { it.t = pts[i] })
  }, [filter, items])

  useEffect(() => {
    const cv = canvas.current, s = st.current
    const ctx = cv.getContext('2d')
    const spin = REDUCED ? 0 : 0.0035
    s.vx = spin
    let raf, visible = true
    const resize = () => {
      const w = cv.parentElement.clientWidth, h = Math.min(w, 460), dpr = Math.min(window.devicePixelRatio || 1, 2)
      cv.width = w * dpr; cv.height = h * dpr; cv.style.height = h + 'px'; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); s.size = [w, h]
    }
    resize()
    const ro = new ResizeObserver(resize); ro.observe(cv.parentElement)
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting }, { threshold: 0 }); io.observe(cv)
    const proj = []
    const frame = () => {
      raf = requestAnimationFrame(frame)
      if (!visible || document.hidden) return
      const [W, H] = s.size, R = Math.min(W, H) * 0.36
      if (!s.drag) { s.ax += s.vx; s.ay += s.vy; s.vy *= 0.95; s.vx += (spin - s.vx) * 0.02 }
      const ca = Math.cos(s.ax), sa = Math.sin(s.ax), cb = Math.cos(s.ay), sb = Math.sin(s.ay)
      ctx.clearRect(0, 0, W, H)
      proj.length = 0
      s.items.forEach((it, i) => {
        for (let k = 0; k < 3; k++) it.p[k] += (it.t[k] - it.p[k]) * 0.08
        it.a += ((it.show ? 1 : 0) - it.a) * 0.12
        if (it.a < 0.02) return
        const [x0, y0, z0] = it.p
        // rotate around y (ax), then around x (ay)
        const x1 = x0 * ca + z0 * sa, z1 = -x0 * sa + z0 * ca
        const y2 = y0 * cb - z1 * sb, z2 = y0 * sb + z1 * cb
        const persp = 1 / (1 - z2 * 0.3)
        proj.push({ i, it, x: W / 2 + x1 * R * persp * 1.25, y: H / 2 + y2 * R * persp, z: z2 })
      })
      proj.sort((a, b) => a.z - b.z)
      let nearest = -1, best = 1e9
      if (s.pointer) proj.forEach((q) => { const d = Math.hypot(q.x - s.pointer[0], q.y - s.pointer[1]); if (d < 26 && d < best && q.it.a > 0.6) { best = d; nearest = q.i } })
      cv.style.cursor = s.drag ? 'grabbing' : nearest >= 0 ? 'pointer' : 'grab'
      proj.forEach((q) => {
        const depth = (q.z + 1) / 2, hot = q.i === nearest
        const size = (hot ? 19 : 14) * (0.72 + depth * 0.6)
        ctx.globalAlpha = (0.28 + depth * 0.72) * q.it.a * (nearest >= 0 && !hot ? 0.55 : 1)
        ctx.font = `600 ${size}px "Hanken Grotesk", sans-serif`
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
        const c = GROUP_COLORS[q.it.group] || '#fff'
        ctx.fillStyle = hot ? '#fff' : c
        ctx.fillText(q.it.name, q.x, q.y)
        if (hot) { ctx.globalAlpha = 0.9; ctx.fillStyle = c; ctx.font = '500 12px "Hanken Grotesk", sans-serif'; ctx.fillText(q.it.group, q.x, q.y + size * 0.95) }
      })
      ctx.globalAlpha = 1
    }
    frame()
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect() }
  }, [])

  const down = (e) => { const s = st.current; s.drag = { x: e.clientX, y: e.clientY }; s.vx = 0; s.vy = 0; e.currentTarget.setPointerCapture(e.pointerId) }
  const move = (e) => {
    const s = st.current, r = e.currentTarget.getBoundingClientRect()
    s.pointer = [e.clientX - r.left, e.clientY - r.top]
    if (!s.drag) return
    const dx = e.clientX - s.drag.x, dy = e.clientY - s.drag.y
    s.ax += dx * 0.006; s.ay += dy * 0.006; s.vx = dx * 0.0016; s.vy = dy * 0.0016
    s.drag = { x: e.clientX, y: e.clientY }
  }
  const up = () => { st.current.drag = null }
  const leave = () => { st.current.pointer = null; st.current.drag = null }

  return (
    <div className="rv-skills">
      <div className="rv-tabs" role="tablist" aria-label="Skill groups">
        {['All', ...groups].map((g) => <button key={g} role="tab" aria-selected={filter === g} className={filter === g ? 'on' : ''} onClick={() => setFilter(g)}>{g}</button>)}
      </div>
      <div className="rv-sphere">
        <canvas ref={canvas} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onPointerLeave={leave} aria-hidden="true" />
      </div>
      {/* the same skills as plain text, for screen readers and search engines */}
      <ul className="rv-sr">{items.map((it) => <li key={it.name}>{it.group}: {it.name}</li>)}</ul>
    </div>
  )
}

// Interests: the words stay put in the middle of the screen while images rise past them, as you scroll.
// Each entry: [id, left %, top (in screen heights), width %, parallax speed]. The centre stays clear for the words.
const WALL = [
  ['Vinland Saga', 71, 55, 15, -0.05], ["JoJo's Bizarre Adventure", 8, 84, 14, 0.09], ['Hunter x Hunter', 76, 119, 14, 0.04], ['Berserk', 20, 150, 14, -0.06],
  ['kit', 66, 184, 17, 0.07], ['lfc', 9, 220, 15, -0.04],
  ['League of Legends', 72, 254, 15, 0.05], ['Elden Ring', 8, 285, 15, -0.05], ['God of War Ragnarök', 66, 317, 15, 0.08]
]
// Pictures are optional files you drop in as a tile's face: public/images/anime/<name>.jpg, public/images/games/<name>.jpg, public/images/football/liverpool.png.
const PICS = {
  'Vinland Saga': 'images/anime/vinland-saga.jpg', "JoJo's Bizarre Adventure": 'images/anime/jojos-bizarre-adventure.png', 'Hunter x Hunter': 'images/anime/hunter-x-hunter.jpg', Berserk: 'images/anime/berserk.jpg',
  'League of Legends': 'images/games/league-of-legends.jpeg', 'Elden Ring': 'images/games/elden-ring.jpeg', 'God of War Ragnarök': 'images/games/god-of-war-ragnarok.jpeg', lfc: 'images/football/lfc.jpg'
}
function buildTiles() {
  const manga = shelf.filter((b) => b.kind === 'manga')
  const anime = (b) => ({ id: b.title, cat: 'anime', ar: '2 / 3', bg: b.color, ink: b.ink, name: b.title, letter: b.title.replace(/^the /i, '')[0], image: PICS[b.title] })
  const game = (x) => ({ id: x.title, cat: 'gaming', ar: '4 / 5', bg: `linear-gradient(145deg, ${x.colors[0]}, ${x.colors[1]})`, ink: '#fff', name: x.title, letter: x.title[0], image: PICS[x.title] })
  const t = {
    kit: { id: 'kit', cat: 'football', ar: '3 / 4', name: 'Liverpool', image: decor.kit.photo },
    lfc: { id: 'lfc', cat: 'football', ar: '4 / 5', bg: '#c8102e', ink: '#fff', name: 'Liverpool FC', badge: true, image: PICS.lfc }
  }
  return WALL.map(([id, left, top, w, sp]) => {
    const b = manga.find((m) => m.title === id), g = games.find((x) => x.title === id)
    const x = t[id] || (b ? anime(b) : g ? game(g) : null)
    return x && { ...x, left, top, w, sp }
  }).filter(Boolean)
}

// A tile's picture, falling back to its drawn face when the file isn't there yet.
function TileFace({ x }) {
  const [ok, setOk] = useState(!!x.image)
  if (ok) return <img src={x.image} alt={x.name} loading="lazy" draggable="false" className={x.contain ? 'contain' : ''} style={x.bg ? { background: x.bg } : undefined} onError={() => setOk(false)} />
  if (x.badge) return <div className="rv-cover badge" style={{ background: x.bg, color: x.ink }}><i>LFC</i></div>
  return <div className="rv-cover" style={{ background: x.bg, color: x.ink }}>{x.letter ? <span>{x.letter}</span> : <b>{x.name}</b>}</div>
}

function Interests() {
  const tiles = useMemo(buildTiles, [])
  return (
    <div className="rv-wall" data-cat="anime">
      <h2 className="rv-sr">Interests: anime, football and gaming</h2>
      <div className="rv-wall-stage" aria-hidden="true">
        <div className="rv-wall-text">
          <p>I like</p>
          <b className="w w-anime">Anime</b>
          <b className="w w-football">Football</b>
          <b className="w w-gaming">Gaming</b>
        </div>
      </div>
      <div className="rv-wall-tiles">
        {tiles.map((x) => (
          <figure key={x.id} className="rv-tile" data-cat={x.cat} data-par={x.sp} data-cursor={x.cat.toUpperCase()} tabIndex={0} style={{ '--l': x.left + '%', '--t': x.top, '--w': x.w + '%', aspectRatio: x.ar }}>
            <TileFace x={x} />
            <figcaption><b>{x.name}</b></figcaption>
          </figure>
        ))}
      </div>
    </div>
  )
}

export function Recruiter({ onEnterRoom }) {
  const root = useRef(null)
  const [photoOk, setPhotoOk] = useState(true)
  const [photoSrc, setPhotoSrc] = useState(profile.photo)
  const [copied, setCopied] = useState(false)
  useScrollFx(root)
  const copy = async () => {
    try { await navigator.clipboard.writeText(profile.email); setCopied(true); setTimeout(() => setCopied(false), 1800) } catch (e) {}
  }
  const first = profile.name.split(' ')[0]
  const city = profile.basedIn.split(',')[0]
  const go = (id) => (e) => { e.preventDefault(); const t = root.current.querySelector('#' + id); t && t.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth' }) }
  const top = () => root.current && root.current.scrollTo({ top: 0, behavior: REDUCED ? 'auto' : 'smooth' })
  return (
    <div className="rv" ref={root}>
      <Cursor root={root} />
      <header className="rv-top">
        <span className="rv-name">{profile.name}</span>
        <nav aria-label="Sections">
          {[['experience', 'Experience'], ['projects', 'Projects'], ['skills', 'Skills'], ['interests', 'Interests'], ['contact', 'Contact']].map(([id, l]) => <a key={id} href={'#' + id} onClick={go(id)}>{l}</a>)}
        </nav>
        <button className="rv-enter" onClick={onEnterRoom}>Enter the 3D room</button>
      </header>

      <main>
        <section className="rv-hero">
          <h1 aria-label={profile.name}>{first.split('').map((c, i) => <span key={i} aria-hidden="true" style={{ '--i': i }}>{c}</span>)}</h1>
          <p className="rv-lead">{profile.role} based in {city}. MSci Computer Science, {profile.uni}, {profile.year}.</p>
          {photoOk
            ? <figure className="rv-photo"><img src={photoSrc} alt={profile.fullName} onError={() => (photoSrc === profile.photo ? setPhotoSrc(decor.print.photo) : setPhotoOk(false))} /></figure>
            : import.meta.env.DEV && <figure className="rv-photo empty"><span>Add your photo at public/{profile.photo}</span></figure>}
          <p className="rv-bio">{profile.bio}</p>
        </section>

        <Section id="experience" title="Experience"><Experience /></Section>
        <Section id="projects" title="Projects"><Projects /></Section>
        <Section id="skills" title="Toolkit"><SkillSphere /></Section>
        <Section id="interests"><Interests /></Section>

        <Section id="contact" title="Let's talk">
          <p className="rv-links big">
            <a href={profile.links.email} onClick={copy}>Email</a>
            <a href={profile.links.github} target="_blank" rel="noreferrer">GitHub</a>
            <a href={profile.links.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
            <button onClick={copy}>{copied ? 'Copied' : 'Copy email address'}</button>
          </p>
        </Section>
      </main>

      <footer className="rv-foot">
        <span>© {profile.year} {profile.fullName}</span>
        <button onClick={onEnterRoom}>Enter the 3D room</button>
        <button onClick={top}>Back to top</button>
      </footer>
    </div>
  )
}
