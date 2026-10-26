import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '../store'
import { Hotspot } from './common'
import { DESK_TOP } from './Desk'

const BACK = -1.4
const DZ = -0.98
const say = (t) => useStore.getState().say(t)

// Small extras that fill gaps in the room: notebook and phone on the desk, a wall clock.
export function Extras() {
  return (
    <group>
      <Notebook />
      <Phone />
      <Clock />
      <Coaster />
      {/* monitor power cable drops behind the desk; the keyboard cable runs to the monitor base */}
      <Cable points={[[0.04, DESK_TOP + 0.012, DZ - 0.1], [0.05, DESK_TOP + 0.004, DZ - 0.3], [0.07, DESK_TOP + 0.003, DZ - 0.365], [0.08, DESK_TOP - 0.1, DZ - 0.39], [0.08, 0.3, DZ - 0.405], [0.1, 0.012, DZ - 0.41]]} />
      <Cable points={[[0, DESK_TOP + 0.013, DZ + 0.036], [0.012, DESK_TOP + 0.004, DZ - 0.02], [0.035, DESK_TOP + 0.004, DZ - 0.08], [0.03, DESK_TOP + 0.008, DZ - 0.14]]} />
    </group>
  )
}

function Notebook() {
  return (
    <Hotspot label="Notebook · to-do list" position={[0.52, DESK_TOP, DZ + 0.3]} rotation={[0, -0.25, 0]} onActivate={() => say('To-do: ship it. Then fix it.')}>
      <RoundedBox args={[0.15, 0.014, 0.21]} radius={0.003} position={[0, 0.007, 0]} castShadow receiveShadow><meshStandardMaterial color="#1b2a5c" roughness={0.7} /></RoundedBox>
      <mesh position={[0.005, 0.0145, 0]}><boxGeometry args={[0.135, 0.002, 0.195]} /><meshStandardMaterial color="#f1eadb" roughness={0.9} /></mesh>
      <mesh position={[0.05, 0.02, 0.02]} rotation={[0, 0.5, Math.PI / 2]} castShadow><cylinderGeometry args={[0.003, 0.003, 0.14, 8]} /><meshStandardMaterial color="#c41a2b" roughness={0.4} /></mesh>
    </Hotspot>
  )
}

// Phone on the desk: the way to get in touch.
function Phone() {
  const open = useStore((s) => s.open)
  return (
    <Hotspot label="Phone · get in touch" position={[0.72, DESK_TOP, DZ + 0.3]} rotation={[0, 0.35, 0]} onActivate={() => open('computer', { osScreen: 'contact' })}>
      <RoundedBox args={[0.07, 0.008, 0.145]} radius={0.006} position={[0, 0.004, 0]} castShadow><meshStandardMaterial color="#17171a" metalness={0.7} roughness={0.3} /></RoundedBox>
      <mesh position={[0, 0.0084, 0]} rotation-x={-Math.PI / 2}><planeGeometry args={[0.064, 0.138]} /><meshBasicMaterial color="#e8f0ff" toneMapped={false} /></mesh>
      <mesh position={[0, 0.0087, 0.02]} rotation-x={-Math.PI / 2}><planeGeometry args={[0.05, 0.03]} /><meshBasicMaterial color="#c41a2b" toneMapped={false} /></mesh>
    </Hotspot>
  )
}

// Wall clock above the whiteboard gap, showing real time.
function Clock() {
  const hour = useRef(), minute = useRef()
  useFrame(() => {
    const d = new Date(), m = d.getMinutes() + d.getSeconds() / 60
    if (hour.current) hour.current.rotation.z = -((d.getHours() % 12) + m / 60) / 12 * Math.PI * 2
    if (minute.current) minute.current.rotation.z = -(m / 60) * Math.PI * 2
  })
  return (
    <Hotspot label="Clock" position={[0.95, 2.4, BACK + 0.02]} onActivate={() => say(`It's ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Plenty of time to ship.`)}>
      <mesh rotation-x={Math.PI / 2} castShadow><torusGeometry args={[0.13, 0.012, 12, 48]} /><meshStandardMaterial color="#141110" roughness={0.4} /></mesh>
      <mesh position={[0, 0, 0.004]}><circleGeometry args={[0.13, 48]} /><meshStandardMaterial color="#f1eadb" roughness={0.7} /></mesh>
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh key={i} position={[Math.sin((i / 12) * Math.PI * 2) * 0.108, Math.cos((i / 12) * Math.PI * 2) * 0.108, 0.006]}><boxGeometry args={[0.005, i % 3 === 0 ? 0.018 : 0.01, 0.002]} /><meshStandardMaterial color="#141110" /></mesh>
      ))}
      <group ref={hour} position={[0, 0, 0.008]}><mesh position={[0, 0.028, 0]}><boxGeometry args={[0.008, 0.056, 0.002]} /><meshStandardMaterial color="#141110" /></mesh></group>
      <group ref={minute} position={[0, 0, 0.01]}><mesh position={[0, 0.04, 0]}><boxGeometry args={[0.005, 0.08, 0.002]} /><meshStandardMaterial color="#c41a2b" /></mesh></group>
    </Hotspot>
  )
}

// Thin rubber cable along a smooth curve.
function Cable({ points, r = 0.0035, color = '#141414' }) {
  const geo = useMemo(() => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p))), 48, r, 8, false), [])
  return <mesh geometry={geo} castShadow><meshStandardMaterial color={color} roughness={0.6} /></mesh>
}

// Cork coaster under the mug.
function Coaster() {
  return (
    <mesh position={[-0.5, DESK_TOP + 0.002, DZ + 0.12]} castShadow receiveShadow>
      <cylinderGeometry args={[0.052, 0.052, 0.004, 40]} /><meshStandardMaterial color="#b08a5c" roughness={0.95} />
    </mesh>
  )
}
