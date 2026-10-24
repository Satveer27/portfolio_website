import { useState } from 'react'
import { profile, projects, experience, skills } from '../data'
import './recruiter.css'

// The fast, plain version of the portfolio. No 3D, loads instantly, works on any phone.
function flow(p) {
  return p.nodes.map((n) => n.label).join('  →  ')
}

function Media({ p }) {
  const [ok, setOk] = useState(true)
  if (p.video && ok) return <video className="r-media" src={p.video} muted loop playsInline autoPlay preload="metadata" onError={() => setOk(false)} />
  return (
    <div className="r-media r-media-empty" aria-hidden="true">
      <span>FIG. {p.code}</span>
      <svg viewBox="0 0 320 120" preserveAspectRatio="xMidYMid meet">
        {p.nodes.slice(0, 4).map((n, i) => <rect key={n.id} x={10 + i * 78} y={i % 2 ? 66 : 20} width="64" height="34" />)}
        {p.nodes.slice(0, 3).map((n, i) => <path key={n.id} d={`M${74 + i * 78} ${i % 2 ? 83 : 37} H${88 + i * 78} V${i % 2 ? 37 : 83}`} />)}
      </svg>
    </div>
  )
}

export function Recruiter({ onEnterRoom }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try { await navigator.clipboard.writeText(profile.email); setCopied(true); setTimeout(() => setCopied(false), 1800) }
    catch { const el = document.getElementById('r-email'); if (el) { const r = document.createRange(); r.selectNodeContents(el); const s = window.getSelection(); s.removeAllRanges(); s.addRange(r) } }
  }
  const initials = profile.name.split(' ').map((w) => w[0]).join('')
  return (
    <div className="r-page">
      <header className="r-top">
        <div className="r-wrap r-top-in">
          <a className="r-brand" href="#top">{profile.name}</a>
          <nav aria-label="Sections">
            <a href="#projects">Projects</a><a href="#experience">Experience</a><a href="#skills">Skills</a><a href="#contact">Contact</a>
          </nav>
          <button className="r-room" onClick={onEnterRoom}>Enter the 3D room</button>
        </div>
      </header>

      <main id="top">
        <section className="r-wrap r-hero">
          <div className="r-hero-text">
            <p className="r-eyebrow">{profile.role} · {profile.basedIn}</p>
            <h1>I build backends that keep working when things go wrong.</h1>
            <p className="r-lede">I'm Satveer, a backend and AI engineer with an Integrated Masters in Computer Science from the University of Glasgow. I work mostly in Python and FastAPI: APIs, data pipelines and ML models that get deployed, not just trained. I'm looking for backend and AI roles in Malaysia.</p>
            <div className="r-cta">
              <a className="r-btn solid" href={profile.links.cv} target="_blank" rel="noreferrer">View CV</a>
              <a className="r-btn" href={profile.links.github} target="_blank" rel="noreferrer">GitHub</a>
              <a className="r-btn" href={profile.links.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
              <button className="r-btn ghost" onClick={copy}>{copied ? 'Email copied' : 'Copy email'}</button>
            </div>
          </div>
          <aside className="r-card">
            <div className="r-photo">
              <img src={profile.photo} alt={profile.fullName} onError={(e) => { e.currentTarget.style.display = 'none' }} />
              <span aria-hidden="true">{initials}</span>
            </div>
            <dl>
              <div><dt>Focus</dt><dd>Backend + AI engineering</dd></div>
              <div><dt>Main stack</dt><dd>Python · FastAPI · PostgreSQL</dd></div>
              <div><dt>Education</dt><dd>MSci Computer Science, Glasgow, 2026</dd></div>
              <div><dt>Open to</dt><dd>{profile.lookingFor}</dd></div>
            </dl>
          </aside>
        </section>

        <section id="projects" className="r-wrap r-section">
          <div className="r-head"><h2>Projects</h2><p>Each one shows how data moves through it, from source to screen.</p></div>
          <div className="r-projects">
            {projects.map((p) => (
              <article key={p.id} className="r-project">
                <Media p={p} />
                <div className="r-project-body">
                  <div className="r-row"><h3>{p.title}</h3><span className="r-chip">{p.status}</span></div>
                  <p>{p.blurb}</p>
                  <div className="r-flow"><span>How it works</span><code>{p.flow || flow(p)}</code></div>
                  {p.highlights && <dl className="r-figs">{p.highlights.slice(0, 4).map((h, i) => <div key={i}><dt>{h.k}</dt><dd>{h.v}</dd></div>)}</dl>}
                  <ul className="r-tags">{p.stack.map((s) => <li key={s}>{s}</li>)}</ul>
                  <div className="r-links">
                    {p.links.code && <a href={p.links.code} target="_blank" rel="noreferrer">Code ↗</a>}
                    {p.links.live && <a href={p.links.live} target="_blank" rel="noreferrer">{p.liveLabel ? 'Paper ↗' : 'Live ↗'}</a>}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="experience" className="r-wrap r-section">
          <div className="r-head"><h2>Experience</h2></div>
          <ol className="r-timeline">
            {experience.map((x) => (
              <li key={x.org}>
                <div className="r-when"><span>{x.when}</span><small>{x.kind}</small></div>
                <div className="r-what">
                  <h3>{x.role}</h3>
                  <p className="r-org">{x.org}</p>
                  <p>{x.blurb}</p>
                  <ul className="r-tags">{x.stack.map((s) => <li key={s}>{s}</li>)}</ul>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section id="skills" className="r-wrap r-section">
          <div className="r-head"><h2>Skills</h2></div>
          <div className="r-skills">
            {skills.map((g) => (
              <div key={g.group}><h3>{g.group}</h3><ul className="r-tags">{g.items.map((s) => <li key={s}>{s}</li>)}</ul></div>
            ))}
          </div>
        </section>

        <section id="contact" className="r-wrap r-section r-contact">
          <h2>Let's talk.</h2>
          <p>The quickest way to reach me is email.</p>
          <div className="r-email"><span id="r-email">{profile.email}</span><button className="r-btn ghost" onClick={copy}>{copied ? 'Copied' : 'Copy'}</button></div>
          <div className="r-cta">
            <a className="r-btn" href={profile.links.github} target="_blank" rel="noreferrer">GitHub</a>
            <a className="r-btn" href={profile.links.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
            <a className="r-btn" href={profile.links.cv} target="_blank" rel="noreferrer">CV</a>
          </div>
        </section>
      </main>

      <footer className="r-wrap r-foot">
        <span>{profile.fullName} · {profile.year}</span>
        <button className="r-linkish" onClick={onEnterRoom}>Prefer the fun version? Enter the 3D room →</button>
      </footer>
    </div>
  )
}
