import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { RoundedBox, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '../store'
import { Hotspot, Model, flyStep, homeOf } from './common'
import { screenTex, cartLabelTex, photoFallbackTex, makeTex } from './textures'
import { games, profile } from '../data'

export const DESK_TOP = 0.75
const DZ = -0.98 // desk centre

export function Desk() {
  const [woodMap, woodRough] = useTexture(['textures/oak.jpg', 'textures/wood_rough.jpg'])
  const wood = useMemo(() => {
    const m = woodMap.clone(); m.wrapS = m.wrapT = THREE.RepeatWrapping; m.repeat.set(1, 0.5); m.anisotropy = 8; m.colorSpace = THREE.SRGBColorSpace; m.needsUpdate = true
    const r = woodRough.clone(); r.wrapS = r.wrapT = THREE.RepeatWrapping; r.repeat.copy(m.repeat); r.rotation = m.rotation; r.needsUpdate = true
    return { m, r }
  }, [woodMap, woodRough])
  const screen = useMemo(() => screenTex(), [])
  const open = useStore((s) => s.open)
  const progress = useStore((s) => s.progress)

  return (
    <group>
      {/* desk */}
      <RoundedBox args={[1.6, 0.04, 0.72]} radius={0.008} position={[0, DESK_TOP - 0.02, DZ]} castShadow receiveShadow>
        <meshStandardMaterial map={wood.m} roughnessMap={wood.r} color="#e8d6c0" roughness={0.6} envMapIntensity={0.7} />
      </RoundedBox>
      {[[-0.76, -0.31], [0.76, -0.31], [-0.76, 0.31], [0.76, 0.31]].map(([x, z], i) => (
        <mesh key={i} position={[x, (DESK_TOP - 0.04) / 2, DZ + z]} castShadow><boxGeometry args={[0.035, DESK_TOP - 0.04, 0.035]} /><meshStandardMaterial color="#141414" metalness={0.8} roughness={0.35} /></mesh>
      ))}
      <mesh position={[0, DESK_TOP - 0.07, DZ - 0.31]}><boxGeometry args={[1.5, 0.05, 0.02]} /><meshStandardMaterial color="#141414" metalness={0.8} roughness={0.35} /></mesh>

      {/* felt desk mat */}
      <RoundedBox args={[0.92, 0.004, 0.38]} radius={0.002} position={[0.02, DESK_TOP + 0.002, DZ + 0.12]} receiveShadow><meshStandardMaterial color="#3d3f44" roughness={1} /></RoundedBox>

      {/* monitor */}
      <Hotspot label="Computer · experience, about me, contact" onActivate={() => open('computer', { osScreen: 'menu' })}>
        <group position={[0, DESK_TOP, DZ - 0.2]}>
          <Model url="models/monitor.glb" width={0.66} rotation={[0, -Math.PI / 2, 0]} />
          <mesh position={[0, 0.36, 0.0672]}><planeGeometry args={[0.622, 0.35]} /><meshBasicMaterial map={screen} toneMapped={false} /></mesh>
          <mesh position={[0, 0.36, 0.0674]}><planeGeometry args={[0.622, 0.35]} /><meshPhysicalMaterial transparent opacity={0.06} roughness={0.02} clearcoat={1} /></mesh>
        </group>
      </Hotspot>

      <Keyboard />
      {/* mouse */}
      <mesh position={[0.33, DESK_TOP + 0.016, DZ + 0.16]} scale={[0.032, 0.018, 0.055]} castShadow><sphereGeometry args={[1, 32, 16]} /><meshStandardMaterial color="#1c1c1e" roughness={0.4} /></mesh>

      <Mug />
      <Model url="models/vase.glb" height={0.26} position={[0.66, DESK_TOP, DZ - 0.24]} rotation={[0, -0.5, 0]} />

      {/* barn lamp on the wall above the desk */}
      <Hotspot label="Wall lamp" onActivate={() => useStore.setState({ lampOn: !useStore.getState().lampOn })}>
        <Model url="models/lamp.glb" height={0.27} position={[-0.55, 1.4, -1.28]} />
      </Hotspot>

      <PictureFrame />
      <Cartridges />

      {/* office chair, only seen on the way in */}
      <group position={[0, 0, -0.18]} visible={progress < 0.92}>
        <mesh position={[0, 0.27, 0]} castShadow><cylinderGeometry args={[0.025, 0.025, 0.42, 16]} /><meshStandardMaterial color="#222" metalness={0.8} roughness={0.3} /></mesh>
        {Array.from({ length: 5 }).map((_, i) => (
          <mesh key={i} position={[Math.cos(i * 1.2566) * 0.15, 0.04, Math.sin(i * 1.2566) * 0.15]} rotation-y={-i * 1.2566} castShadow><boxGeometry args={[0.3, 0.025, 0.04]} /><meshStandardMaterial color="#222" metalness={0.8} roughness={0.3} /></mesh>
        ))}
        <RoundedBox args={[0.5, 0.08, 0.48]} radius={0.03} position={[0, 0.5, 0]} castShadow><meshStandardMaterial color="#1b1b1d" roughness={0.9} /></RoundedBox>
        <RoundedBox args={[0.48, 0.62, 0.06]} radius={0.03} position={[0, 0.9, 0.24]} rotation-x={-0.12} castShadow><meshStandardMaterial color="#1b1b1d" roughness={0.9} /></RoundedBox>
      </group>
    </group>
  )
}

// Generated keyboard model, long axis turned to x and flattened to a real keyboard's thickness.
function Keyboard() {
  return (
    <group position={[0, DESK_TOP, DZ + 0.116]} scale={[1, 0.42, 1]}>
      <Model url="models/keyboard.glb" width={0.44} rotation={[0, -Math.PI / 2, 0]} interactive={false} />
    </group>
  )
}

function Mug() {
  const steam = useRef()
  const wisp = useMemo(() => makeTex(64, 256, (g, w, h) => { const gr = g.createRadialGradient(w / 2, h / 2, 2, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(255,255,255,0.9)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.save(); g.scale(1, h / w); g.fillStyle = gr; g.fillRect(0, 0, w, w); g.restore() }), [])
  useFrame(({ clock, camera }) => {
    if (!steam.current) return
    steam.current.children.forEach((s, i) => {
      const k = (clock.elapsedTime * 0.28 + i / 3) % 1
      s.position.y = 0.11 + k * 0.18; s.position.x = Math.sin(clock.elapsedTime * 1.6 + i * 2) * 0.01
      s.material.opacity = Math.sin(k * Math.PI) * 0.22; s.lookAt(camera.position)
    })
  })
  const say = useStore((s) => s.say)
  return (
    <Hotspot label="Coffee · refill" position={[-0.5, DESK_TOP + 0.004, DZ + 0.12]} onActivate={() => { const n = useStore.getState().coffee + 1; useStore.setState({ coffee: n }); say(n === 1 ? 'Coffee #1. The backend runs on this.' : `Coffee #${n}. Shipping speed increased.`) }}>
      <Model url="models/mug.glb" height={0.1} interactive={false} />
      <mesh position={[0, 0.05, 0]} visible={false}><cylinderGeometry args={[0.055, 0.055, 0.1, 12]} /><meshBasicMaterial /></mesh>
      <mesh position={[0, 0.088, 0]} rotation-x={-Math.PI / 2}><circleGeometry args={[0.037, 48]} /><meshPhysicalMaterial color="#2a1608" roughness={0.08} clearcoat={1} /></mesh>
      {/* steam is decoration only: it must not catch the pointer, or the mug's hover reaches up over the cartridges */}
      <group ref={steam}>{[0, 1, 2].map((i) => <mesh key={i} raycast={() => null}><planeGeometry args={[0.03, 0.09]} /><meshBasicMaterial map={wisp} color="#ffffff" transparent opacity={0.1} depthWrite={false} /></mesh>)}</group>
    </Hotspot>
  )
}

// Your photo in a frame. Click to pick it up, drag to turn it over.
function PictureFrame() {
  const ref = useRef()
  const { camera } = useThree()
  const fallback = useMemo(() => photoFallbackTex(), [])
  const photo = usePhoto(profile.photo, fallback)
  const home = useMemo(() => homeOf([0.48, DESK_TOP + 0.105, DZ - 0.12], [-0.12, -0.42, 0]), [])
  const open = useStore((s) => s.open)
  useFrame((_, dt) => {
    if (!ref.current) return
    const s = useStore.getState()
    const active = s.focus === 'frame'
    flyStep(ref.current, home, active, camera, dt, { dist: 0.42, x: -0.07, ry: s.inspectRot.y, rx: s.inspectRot.x, speed: 0.002 })
  })
  return (
    <Hotspot label="Picture frame · pick it up" onActivate={() => open('frame')}>
      <group ref={ref} position={home.position} quaternion={home.quaternion}>
        <group position={[0, -0.105, 0]}><Model url="models/frame.glb" height={0.21} rotation={[0, -Math.PI / 2, 0]} /></group>
        {/* the photo sits in the model's mat, leaning back with the frame */}
        <group position={[0, 0.002, 0.046]} rotation={[-0.08, 0, 0]}>
          <mesh><planeGeometry args={[0.102, 0.132]} /><meshStandardMaterial map={photo} roughness={0.6} /></mesh>
          <mesh position={[0, 0, 0.0004]}><planeGeometry args={[0.102, 0.132]} /><meshPhysicalMaterial transparent opacity={0.08} roughness={0.03} clearcoat={1} /></mesh>
        </group>
      </group>
    </Hotspot>
  )
}

function usePhoto(url, fallback) {
  const ref = useRef(null)
  return useMemo(() => {
    const t = new THREE.TextureLoader().load(url.replace(/^\//, ''), (tx) => { tx.colorSpace = THREE.SRGBColorSpace; tx.needsUpdate = true }, undefined, () => { if (ref.current) { ref.current.image = fallback.image; ref.current.needsUpdate = true } })
    t.colorSpace = THREE.SRGBColorSpace
    t.image = fallback.image
    ref.current = t
    return t
  }, [url, fallback])
}

// Game cartridges in a little wooden stand. Click one to bring it over.
function Cartridges() {
  const labels = useMemo(() => games.map((g, i) => cartLabelTex(g, i)), [])
  const open = useStore((s) => s.open)
  return (
    <group>
      <RoundedBox args={[0.34, 0.03, 0.09]} radius={0.006} position={[-0.6, DESK_TOP + 0.015, DZ - 0.2]} castShadow receiveShadow><meshStandardMaterial color="#5a3a26" roughness={0.6} /></RoundedBox>
      {games.map((g, i) => <Cartridge key={i} i={i} label={labels[i]} onActivate={() => open('cart', { cart: i })} />)}
    </group>
  )
}

function Cartridge({ i, label, onActivate }) {
  const ref = useRef()
  const { camera } = useThree()
  const home = useMemo(() => homeOf([-0.74 + i * 0.07, DESK_TOP + 0.075, DZ - 0.2], [-0.15, 0.12 - i * 0.03, 0]), [i])
  const tip = `Cartridge · ${games[i].title}`
  const pulled = useMemo(() => ({ position: new THREE.Vector3(), quaternion: home.quaternion }), [home])
  const hover = useRef(0)
  useFrame(({ clock }, dt) => {
    if (!ref.current) return
    const s = useStore.getState()
    const active = s.focus === 'cart' && s.cart === i
    // hovered cartridge lifts out of the stand a little
    const hovered = !s.focus && s.hover && s.hover.label === tip
    hover.current += ((hovered ? 1 : 0) - hover.current) * (1 - Math.pow(0.0001, dt))
    if (active) flyStep(ref.current, home, true, camera, dt, { dist: 0.36, x: -0.09, ry: Math.sin(clock.elapsedTime * 0.8) * 0.5, rx: 0.05, speed: 0.002 })
    else {
      pulled.position.set(home.position.x, home.position.y + hover.current * 0.035, home.position.z + hover.current * 0.03)
      flyStep(ref.current, pulled, false, camera, dt, { speed: 0.002 })
    }
  })
  return (
    <Hotspot label={tip} onActivate={onActivate}>
      <group ref={ref} position={home.position} quaternion={home.quaternion}>
        <RoundedBox args={[0.056, 0.1, 0.012]} radius={0.004} castShadow><meshStandardMaterial color="#9e9b97" roughness={0.55} /></RoundedBox>
        <mesh position={[0, -0.006, 0.0062]}><planeGeometry args={[0.046, 0.06]} /><meshStandardMaterial map={label} roughness={0.5} /></mesh>
        {[0, 1, 2, 3].map((k) => <mesh key={k} position={[0, 0.036 + k * 0.0035, 0.0062]}><boxGeometry args={[0.04, 0.0012, 0.0008]} /><meshStandardMaterial color="#77736e" /></mesh>)}
      </group>
    </Hotspot>
  )
}
