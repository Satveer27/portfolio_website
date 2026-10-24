import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { RoundedBox, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '../store'
import { Hotspot, Model, flyStep } from './common'
import { FOCUS } from './CameraRig'
import { boardTex, spineHiTex, pagesTex, coverTex, bookCoverTex, recordTex } from './textures'
import { books, manga, tracks } from '../data'

// ---------- whiteboard (projects / blueprints) ----------
export function Whiteboard() {
  const tex = useMemo(() => boardTex(), [])
  const open = useStore((s) => s.open)
  return (
    <Hotspot label="Whiteboard · projects as blueprints" position={[1.5, 1.47, -1.385]} onActivate={() => open('board')}>
      <RoundedBox args={[1.2, 0.84, 0.03]} radius={0.01} castShadow><meshStandardMaterial color="#c8ccd2" metalness={0.75} roughness={0.3} /></RoundedBox>
      <mesh position={[0, 0, 0.0155]}><planeGeometry args={[1.16, 0.8]} /><meshStandardMaterial map={tex} roughness={0.35} envMapIntensity={0.5} /></mesh>
      <mesh position={[0, -0.44, 0.035]} castShadow><boxGeometry args={[0.7, 0.02, 0.06]} /><meshStandardMaterial color="#c8ccd2" metalness={0.75} roughness={0.3} /></mesh>
      {[['#1b2a8c', -0.12], ['#c41a2b', 0.02], ['#111', 0.14]].map(([c, x], i) => (
        <mesh key={i} position={[x, -0.425, 0.045]} rotation-z={Math.PI / 2} castShadow><cylinderGeometry args={[0.007, 0.007, 0.12, 12]} /><meshStandardMaterial color={c} roughness={0.4} /></mesh>
      ))}
    </Hotspot>
  )
}

// ---------- small floating shelf on the wall left of the desk, close to the chair ----------
// Books stand along x and face you (+z). wall is the front wall's surface.
const SHELF = { x: -1.5, y: 1.34, wall: -1.4, w: 0.9, d: 0.22 }
const ROT = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2) // box's -x face (the spine) turns to face +z

export function Bookshelf() {
  const [woodMap] = useTexture(['textures/wood_diffuse.jpg'])
  const wood = useMemo(() => { const m = woodMap.clone(); m.wrapS = m.wrapT = THREE.RepeatWrapping; m.repeat.set(1, 0.4); m.colorSpace = THREE.SRGBColorSpace; m.needsUpdate = true; return m }, [woodMap])
  const items = useMemo(() => {
    const out = []
    let x = SHELF.x - SHELF.w / 2 + 0.06
    books.forEach((bk, i) => { const t = 0.04 + ((i * 37) % 10) * 0.003, h = 0.22 + ((i * 53) % 7) * 0.01; out.push({ ...bk, idx: out.length, x, t, h }); x += t + 0.004 })
    x += 0.05
    const m = manga[0]
    for (let v = 1; v <= Math.min(4, m.vols); v++) { out.push({ title: m.title, by: `Vol. ${v}`, kind: 'manga', color: m.color, ink: m.ink, foot: String(v), why: '[WHAT GOT YOU INTO IT]', stuck: '[FAVOURITE ARC OR MOMENT]', status: '[VOLUMES READ]', idx: out.length, x, t: 0.03, h: 0.19 }); x += 0.033 }
    return out
  }, [])
  useMemo(() => { useStore.setState({ shelfItems: items }) }, [items])
  const open = useStore((s) => s.open)
  const z0 = SHELF.wall + SHELF.d / 2
  return (
    <group>
      {/* invisible hit area behind the books: tap the shelf from the chair to walk over */}
      <Hotspot label="Bookshelf · take a closer look" onActivate={() => open('shelf')}>
        <mesh position={[SHELF.x, SHELF.y + 0.15, SHELF.wall + 0.05]} visible={false}><boxGeometry args={[SHELF.w + 0.04, 0.36, 0.1]} /><meshBasicMaterial /></mesh>
      </Hotspot>
      <mesh position={[SHELF.x, SHELF.y, z0]} castShadow receiveShadow><boxGeometry args={[SHELF.w, 0.025, SHELF.d]} /><meshStandardMaterial map={wood} color="#6a4630" roughness={0.6} /></mesh>
      {[-0.32, 0.32].map((dx) => <mesh key={dx} position={[SHELF.x + dx, SHELF.y - 0.06, SHELF.wall + 0.06]}><boxGeometry args={[0.012, 0.1, 0.1]} /><meshStandardMaterial color="#1a1a1a" metalness={0.7} roughness={0.4} /></mesh>)}
      {/* book end */}
      <mesh position={[SHELF.x + SHELF.w / 2 - 0.04, SHELF.y + 0.075, z0 + 0.01]} castShadow><boxGeometry args={[0.012, 0.13, 0.12]} /><meshStandardMaterial color="#1a1a1a" metalness={0.7} roughness={0.4} /></mesh>
      {items.map((bk) => <Book key={bk.idx} b={bk} />)}
    </group>
  )
}

let PAGES = null
const pagesMat = () => PAGES || (PAGES = new THREE.MeshStandardMaterial({ map: pagesTex(), roughness: 0.9 }))
const COVERS = {}
const coverMat = (c) => COVERS[c] || (COVERS[c] = new THREE.MeshStandardMaterial({ color: c, roughness: 0.65 }))

function Book({ b }) {
  const ref = useRef()
  const { camera } = useThree()
  const depth = 0.17
  const mats = useMemo(() => {
    const cover = coverMat(b.color)
    const front = new THREE.MeshStandardMaterial({ color: b.color, roughness: 0.6 })
    const spine = new THREE.MeshStandardMaterial({ map: spineHiTex(b.title, b.color, b.ink, b.foot), roughness: 0.6 })
    const P = pagesMat()
    return [P, spine, P, P, front, cover]
  }, [b])
  const home = useMemo(() => ({
    position: new THREE.Vector3(b.x + b.t / 2, SHELF.y + 0.0125 + b.h / 2, SHELF.wall + 0.02 + depth / 2),
    quaternion: ROT.clone()
  }), [b])
  const pulled = useMemo(() => ({ position: new THREE.Vector3(), quaternion: new THREE.Quaternion() }), [])
  const st = useRef({ hover: 0, out: 0 })
  useFrame((_, dt) => {
    if (!ref.current) return
    const s = useStore.getState()
    const active = s.focus === 'book' && s.book === b.idx
    const r = st.current
    const hovered = s.hover && s.hover.label === label && (!s.focus || s.focus === 'shelf')
    r.hover += ((hovered ? 1 : 0) - r.hover) * (1 - Math.pow(0.0001, dt))
    r.out = active ? Math.min(1, r.out + dt * 2.2) : Math.max(0, r.out - dt * 3)
    if (active && !mats[4].map) { mats[4].map = bookCoverTex(b); mats[4].color.set('#ffffff'); mats[4].needsUpdate = true }
    if (active && r.out > 0.45) {
      // second half: fly to the camera, cover facing you
      flyStep(ref.current, home, true, camera, dt, { dist: 0.5, ry: 0, x: 0, speed: 0.003 })
    } else if (active) {
      // first half: slide out of the shelf
      ref.current.position.set(home.position.x, home.position.y + r.out * 0.05, home.position.z + r.out * 0.4)
    } else {
      pulled.position.set(home.position.x, home.position.y, home.position.z + r.hover * 0.06); pulled.quaternion.copy(home.quaternion)
      flyStep(ref.current, pulled, false, camera, dt, { speed: 0.003 })
    }
  })
  const label = b.kind === 'manga' ? `${b.title} · ${b.by}` : b.title
  return (
    <Hotspot label={label} allow="shelf" onActivate={() => { const s = useStore.getState(); if (s.focus === 'shelf') s.open('book', { book: b.idx, fromShelf: true }); else s.open('shelf') }}>
      <mesh ref={ref} position={home.position} quaternion={home.quaternion} material={mats} castShadow receiveShadow>
        <boxGeometry args={[depth, b.h, b.t]} />
      </mesh>
    </Hotspot>
  )
}

// ---------- music corner: boombox + crate of 3D album sleeves ----------
export function MusicCorner() {
  const [woodMap] = useTexture(['textures/wood_diffuse.jpg'])
  const wood = useMemo(() => { const m = woodMap.clone(); m.wrapS = m.wrapT = THREE.RepeatWrapping; m.repeat.set(0.5, 0.25); m.colorSpace = THREE.SRGBColorSpace; m.needsUpdate = true; return m }, [woodMap])
  const covers = useMemo(() => tracks.map((t, i) => coverTex(t, i)), [])
  const open = useStore((s) => s.open)
  const boom = useRef()
  useFrame(({ clock }) => {
    if (!boom.current) return
    const p = useStore.getState().playing
    const k = p ? 1 + Math.max(0, Math.sin(clock.elapsedTime * 9.5)) * 0.015 : 1
    boom.current.scale.setScalar(k)
  })
  return (
    <group>
      <RoundedBox args={[0.42, 0.55, 1.1]} radius={0.01} position={[2.17, 0.275, 1.25]} castShadow receiveShadow><meshStandardMaterial color="#2a1f18" roughness={0.55} /></RoundedBox>
      <mesh position={[1.955, 0.32, 1.25]}><boxGeometry args={[0.005, 0.004, 1.0]} /><meshStandardMaterial color="#b08a4a" metalness={0.9} roughness={0.3} /></mesh>
      <Hotspot label="Speaker · music" onActivate={() => open('music')}>
        <group ref={boom} position={[2.15, 0.55, 1.45]}>
          <Model url="models/boombox.glb" width={0.48} rotation={[0, -Math.PI / 2, 0]} />
        </group>
        {/* wooden crate of records: sleeves stand one behind the other facing you, the front one tipped forward */}
        <group position={[2.17, 0.55, 0.95]}>
          <mesh position={[0, 0.012, 0]} castShadow receiveShadow><boxGeometry args={[0.36, 0.024, 0.34]} /><meshStandardMaterial map={wood} color="#9a7350" roughness={0.75} /></mesh>
          {[-1, 1].map((s) => <mesh key={'s' + s} position={[0, 0.085, s * 0.162]} castShadow receiveShadow><boxGeometry args={[0.36, 0.17, 0.016]} /><meshStandardMaterial map={wood} color="#9a7350" roughness={0.75} /></mesh>)}
          <mesh position={[0.172, 0.085, 0]} castShadow><boxGeometry args={[0.016, 0.17, 0.308]} /><meshStandardMaterial map={wood} color="#9a7350" roughness={0.75} /></mesh>
          <mesh position={[-0.172, 0.05, 0]} castShadow><boxGeometry args={[0.016, 0.1, 0.308]} /><meshStandardMaterial map={wood} color="#9a7350" roughness={0.75} /></mesh>
          {covers.map((c, i) => {
            const front = i === 0
            const x = front ? -0.135 : -0.095 + (i - 1) * 0.04
            return (
              <group key={i} position={[x, 0.026, 0]} rotation-z={front ? 0.26 : -0.09 - i * 0.008}>
                <mesh position={[0, 0.15, 0]} castShadow>
                  <boxGeometry args={[0.005, 0.3, 0.3]} />
                  <meshStandardMaterial attach="material-0" color="#d9d2c4" roughness={0.8} />
                  <meshStandardMaterial attach="material-1" map={c} roughness={0.5} />
                  <meshStandardMaterial attach="material-2" color="#d9d2c4" /><meshStandardMaterial attach="material-3" color="#d9d2c4" />
                  <meshStandardMaterial attach="material-4" color="#d9d2c4" /><meshStandardMaterial attach="material-5" color="#d9d2c4" />
                </mesh>
              </group>
            )
          })}
        </group>
      </Hotspot>
    </group>
  )
}

// When the music view is open, the sleeves fan out in front of you as a 3D coverflow.
export function Coverflow() {
  const covers = useMemo(() => tracks.map((t, i) => coverTex(t, i)), [])
  const records = useMemo(() => tracks.map((t, i) => recordTex(t, i)), [])
  const discMats = useMemo(() => {
    const edge = new THREE.MeshStandardMaterial({ color: '#0b0b0c', roughness: 0.4 })
    const face = new THREE.MeshStandardMaterial({ map: records[0], roughness: 0.32, metalness: 0.15, envMapIntensity: 0.9 })
    const back = face.clone()
    return [edge, face, back]
  }, [records])
  const group = useRef()
  const items = useRef([])
  const disc = useRef()
  const { camera } = useThree()
  const pos = useRef(0)
  const anchor = useRef({ set: false, p: new THREE.Vector3(), q: new THREE.Quaternion() })
  useFrame((_, dt) => {
    const s = useStore.getState()
    const show = s.overlay === 'music'
    if (!group.current) return
    group.current.visible = show || group.current.scale.x > 0.02
    const k = 1 - Math.pow(0.004, dt)
    const sc = group.current.scale.x + ((show ? 1 : 0) - group.current.scale.x) * k
    group.current.scale.setScalar(sc)
    if (show && !anchor.current.set) {
      const m = new THREE.Matrix4().lookAt(new THREE.Vector3(...FOCUS.music.pos), new THREE.Vector3(...FOCUS.music.look), new THREE.Vector3(0, 1, 0))
      anchor.current.q.setFromRotationMatrix(m)
      anchor.current.p.set(0, 0.02, -0.95).applyQuaternion(anchor.current.q).add(new THREE.Vector3(...FOCUS.music.pos)); anchor.current.set = true
    }
    if (!show && sc < 0.02) anchor.current.set = false
    group.current.position.copy(anchor.current.p); group.current.quaternion.copy(anchor.current.q)
    pos.current += (s.album - pos.current) * (1 - Math.pow(0.002, dt))
    items.current.forEach((m, i) => {
      if (!m) return
      const d = i - pos.current, ad = Math.abs(d)
      // smooth spacing: the centre sleeve sits forward, neighbours step back and turn in
      const off = ad < 1 ? ad * 0.4 : 0.4 + (ad - 1) * 0.13
      const back = ad < 1 ? ad * 0.24 : 0.24 + (ad - 1) * 0.05
      m.position.set(Math.sign(d) * off, 0, -back + 0.06 * Math.max(0, 1 - ad))
      m.rotation.y = -THREE.MathUtils.clamp(d, -1, 1) * 1.0
      m.visible = ad < 3.5
    })
    if (disc.current) {
      const active = items.current[s.album]
      const slide = s.playing ? 0.16 : 0.09
      disc.current.userData.slide = (disc.current.userData.slide ?? 0) + (slide - (disc.current.userData.slide ?? 0)) * (1 - Math.pow(0.002, dt))
      if (active) disc.current.position.set(active.position.x + disc.current.userData.slide, 0, active.position.z - 0.02)
      disc.current.rotation.y -= s.playing ? dt * 3.5 : 0
      if (disc.current.userData.album !== s.album) { const tx = records[s.album]; discMats[1].map = tx; discMats[2].map = tx; discMats[1].needsUpdate = discMats[2].needsUpdate = true; disc.current.userData.album = s.album }
    }
  })
  return (
    <group ref={group} scale={0} visible={false}>
      <mesh ref={disc} rotation-x={Math.PI / 2} material={discMats} renderOrder={-1}>
        <cylinderGeometry args={[0.145, 0.145, 0.002, 96]} />
      </mesh>
      {covers.map((c, i) => (
        <mesh key={i} ref={(el) => (items.current[i] = el)} onClick={(e) => { e.stopPropagation(); const s = useStore.getState(); if (s.album === i) useStore.setState({ playing: !s.playing }); else useStore.setState({ album: i, playing: true }) }}>
          <boxGeometry args={[0.3, 0.3, 0.008]} />
          <meshStandardMaterial attach="material-0" color="#151515" /><meshStandardMaterial attach="material-1" color="#151515" />
          <meshStandardMaterial attach="material-2" color="#151515" /><meshStandardMaterial attach="material-3" color="#151515" />
          <meshStandardMaterial attach="material-4" map={c} roughness={0.45} envMapIntensity={0.6} /><meshStandardMaterial attach="material-5" color="#1a1a1a" />
        </mesh>
      ))}
    </group>
  )
}
