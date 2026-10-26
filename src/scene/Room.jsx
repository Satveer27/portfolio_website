import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useTexture, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '../store'
import { Hotspot, Model, useOptionalTexture } from './common'
import { decor } from '../data'
import { posterTex, windowTex, kitTex, printTex, mangaPosterTex, certTex } from './textures'

const W = 2.4 // half width
const BACK = -1.4

export function Room() {
  const [floor, plaster, rug] = useTexture(['textures/floor.jpg', 'textures/plaster.jpg', 'textures/rug.jpg'])
  useMemo(() => {
    // photo textures: mirrored repeats hide the tile seams
    floor.wrapS = floor.wrapT = THREE.MirroredRepeatWrapping; floor.repeat.set(3, 3)
    plaster.wrapS = plaster.wrapT = THREE.MirroredRepeatWrapping; plaster.repeat.set(2, 1.2)
    ;[floor, plaster, rug].forEach((t) => { t.anisotropy = 8; t.colorSpace = THREE.SRGBColorSpace })
  }, [floor, plaster, rug])
  const tex = useMemo(() => ({ poster: posterTex(), night: windowTex(false), day: windowTex(true), kit: kitTex(decor.kit), print: printTex(decor.print), manga: mangaPosterTex(), cert: certTex() }), [])
  const kitMap = useOptionalTexture(decor.kit.photo, tex.kit)
  const printMap = useOptionalTexture(decor.print.photo, tex.print)
  const night = useStore((s) => s.night)
  const say = useStore((s) => s.say)
  const open = useStore((s) => s.open)

  return (
    <group>
      {/* floor */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0.8]} receiveShadow>
        <planeGeometry args={[W * 2, 4.6]} />
        <meshStandardMaterial map={floor} roughness={0.7} color="#f2e8da" envMapIntensity={0.5} />
      </mesh>
      {/* rug */}
      <mesh rotation-x={-Math.PI / 2} position={[0.1, 0.004, 0.25]} receiveShadow>
        <planeGeometry args={[2.3, 1.7]} />
        <meshStandardMaterial map={rug} roughness={1} />
      </mesh>
      {/* walls + ceiling */}
      <mesh position={[0, 1.45, BACK]} receiveShadow><planeGeometry args={[W * 2, 2.9]} /><meshStandardMaterial map={plaster} roughness={0.92} color="#ddc9b2" /></mesh>
      <mesh position={[-W, 1.45, 0.8]} rotation-y={Math.PI / 2} receiveShadow><planeGeometry args={[4.6, 2.9]} /><meshStandardMaterial map={plaster} roughness={0.92} color="#d3bea8" /></mesh>
      <mesh position={[W, 1.45, 0.8]} rotation-y={-Math.PI / 2} receiveShadow><planeGeometry args={[4.6, 2.9]} /><meshStandardMaterial map={plaster} roughness={0.92} color="#d3bea8" /></mesh>
      <mesh position={[0, 1.45, 3.1]} rotation-y={Math.PI} receiveShadow><planeGeometry args={[W * 2, 2.9]} /><meshStandardMaterial map={plaster} roughness={0.92} color="#d3bea8" /></mesh>
      <mesh position={[0, 2.9, 0.8]} rotation-x={Math.PI / 2}><planeGeometry args={[W * 2, 4.6]} /><meshStandardMaterial color="#2a211b" roughness={1} /></mesh>
      {/* skirting */}
      <mesh position={[0, 0.05, BACK + 0.01]}><boxGeometry args={[W * 2, 0.1, 0.02]} /><meshStandardMaterial color="#efe8dc" roughness={0.5} /></mesh>
      <mesh position={[-W + 0.01, 0.05, 0.8]}><boxGeometry args={[0.02, 0.1, 4.6]} /><meshStandardMaterial color="#efe8dc" roughness={0.5} /></mesh>
      <mesh position={[W - 0.01, 0.05, 0.8]}><boxGeometry args={[0.02, 0.1, 4.6]} /><meshStandardMaterial color="#efe8dc" roughness={0.5} /></mesh>

      {/* welcome poster, straight ahead above the monitor */}
      <group position={[0, 1.93, BACK + 0.02]}>
        <RoundedBox args={[1.16, 0.84, 0.03]} radius={0.006} castShadow><meshStandardMaterial color="#17120e" roughness={0.35} /></RoundedBox>
        <mesh position={[0, 0, 0.017]}><planeGeometry args={[1.1, 0.77]} /><meshStandardMaterial map={tex.poster} roughness={0.55} envMapIntensity={0.3} /></mesh>
      </group>

      {/* window on the left wall */}
      <Hotspot label="Window · switch day / night" position={[-W + 0.02, 0, -0.55]} onActivate={() => { const n = !useStore.getState().night; useStore.setState({ night: n }); say(n ? 'Back to night in KL.' : 'Morning in KL. Click again for night.') }}>
        <mesh position={[0.01, 1.52, 0]} rotation-y={Math.PI / 2}><planeGeometry args={[1.12, 1.02]} /><meshBasicMaterial map={night ? tex.night : tex.day} toneMapped={false} /></mesh>
        {[[2.05, 0, 1.22, 0.06], [1.0, 0, 1.22, 0.06]].map(([y, , len, t], i) => <mesh key={i} position={[0.04, y, 0]}><boxGeometry args={[0.09, t, len]} /><meshStandardMaterial color="#ece6dc" roughness={0.45} /></mesh>)}
        {[0.6, -0.6].map((z, i) => <mesh key={i} position={[0.04, 1.52, z]}><boxGeometry args={[0.09, 1.1, 0.06]} /><meshStandardMaterial color="#ece6dc" roughness={0.45} /></mesh>)}
        <mesh position={[0.045, 1.52, 0]}><boxGeometry args={[0.07, 1.02, 0.03]} /><meshStandardMaterial color="#ece6dc" roughness={0.45} /></mesh>
        <mesh position={[0.045, 1.52, 0]}><boxGeometry args={[0.07, 0.03, 1.12]} /><meshStandardMaterial color="#ece6dc" roughness={0.45} /></mesh>
        <mesh position={[0.11, 0.985, 0]} castShadow><boxGeometry args={[0.22, 0.035, 1.34]} /><meshStandardMaterial color="#ece6dc" roughness={0.45} /></mesh>
        <Curtain z={0.76} /><Curtain z={-0.76} />
      </Hotspot>

      {/* posters on the left wall */}
      <Hotspot label="Manga poster · see the shelf" position={[-W + 0.015, 1.62, -1.15]} onActivate={() => say('The manga lives on the shelf by the desk.')}>
        <mesh rotation-y={Math.PI / 2}><planeGeometry args={[0.36, 0.52]} /><meshStandardMaterial map={tex.manga} roughness={0.85} /></mesh>
        <mesh position={[0.01, 0.24, 0]}><sphereGeometry args={[0.009, 12, 12]} /><meshStandardMaterial color="#c41a2b" metalness={0.4} roughness={0.3} /></mesh>
      </Hotspot>

      {/* framed shirt on the right wall: a deep shadow box with a glass front */}
      <Hotspot label="Framed shirt · about me" position={[W - 0.04, 1.55, -0.62]} onActivate={() => open('computer', { osScreen: 'whoami' })}>
        <RoundedBox args={[0.07, 0.98, 0.72]} radius={0.006} castShadow><meshStandardMaterial color="#141110" roughness={0.3} /></RoundedBox>
        <mesh position={[-0.0355, 0, 0]} rotation-y={-Math.PI / 2}><planeGeometry args={[0.64, 0.9]} /><meshStandardMaterial map={kitMap} roughness={0.8} /></mesh>
        <mesh position={[-0.038, 0, 0]} rotation-y={-Math.PI / 2}><planeGeometry args={[0.64, 0.9]} /><meshStandardMaterial color="#ffffff" transparent opacity={0.06} roughness={0.05} metalness={0.2} envMapIntensity={1.5} /></mesh>
      </Hotspot>
      {/* your poster, above the music corner */}
      <group position={[W - 0.02, 1.62, 1.55]}>
        <RoundedBox args={[0.025, 0.92, 0.66]} radius={0.004} castShadow><meshStandardMaterial color="#e9e3d8" roughness={0.4} /></RoundedBox>
        <mesh position={[-0.0135, 0, 0]} rotation-y={-Math.PI / 2}><planeGeometry args={[0.58, 0.84]} /><meshStandardMaterial map={printMap} roughness={0.7} /></mesh>
      </group>
      {/* certificate on the right wall */}
      <Hotspot label="Graduation certificate" position={[W - 0.02, 1.62, 0.35]} onActivate={() => open('cert')}>
        <RoundedBox args={[0.03, 0.56, 0.72]} radius={0.006} castShadow><meshStandardMaterial color="#1a140f" roughness={0.3} /></RoundedBox>
        <mesh position={[-0.012, 0, 0]}><boxGeometry args={[0.012, 0.5, 0.66]} /><meshStandardMaterial color="#c9a25a" metalness={0.7} roughness={0.35} /></mesh>
        <mesh position={[-0.02, 0, 0]} rotation-y={-Math.PI / 2}><planeGeometry args={[0.58, 0.43]} /><meshStandardMaterial map={tex.cert} roughness={0.75} /></mesh>
      </Hotspot>

      {/* decor models */}

      <StringLights />
    </group>
  )
}

function Curtain({ z }) {
  const linen = useTexture('textures/linen.jpg')
  useMemo(() => { linen.wrapS = linen.wrapT = THREE.RepeatWrapping; linen.repeat.set(1, 3); linen.colorSpace = THREE.SRGBColorSpace }, [linen])
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(0.34, 2.05, 24, 1)
    const p = g.attributes.position
    for (let i = 0; i < p.count; i++) { const x = p.getX(i); p.setZ(i, Math.sin(x * 46) * 0.018) }
    g.computeVertexNormals(); return g
  }, [])
  return <mesh geometry={geo} position={[0.12, 1.45, z]} rotation-y={Math.PI / 2} castShadow receiveShadow><meshStandardMaterial map={linen} color="#c9b8a2" roughness={1} side={THREE.DoubleSide} /></mesh>
}

function StringLights() {
  const bulbs = useMemo(() => Array.from({ length: 30 }, (_, i) => { const t = i / 29; return [-2.3 + t * 4.6, 2.8 - Math.abs(Math.sin(t * Math.PI * 3)) * 0.14, BACK + 0.06] }), [])
  const ref = useRef()
  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.children.forEach((m, i) => { const k = 0.75 + 0.25 * Math.sin(clock.elapsedTime * 1.7 + i * 1.3); m.material.color.setRGB(2.6 * k, 1.9 * k, 1.0 * k) })
  })
  return (
    <group>
      <group ref={ref}>{bulbs.map((p, i) => <mesh key={i} position={p}><sphereGeometry args={[0.016, 10, 10]} /><meshBasicMaterial toneMapped={false} color="#ffd38a" /></mesh>)}</group>
    </group>
  )
}
