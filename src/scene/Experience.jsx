import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { Environment, Preload, PerformanceMonitor } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '../store'
import { CameraRig } from './CameraRig'
import { Room } from './Room'
import { Desk } from './Desk'
import { Whiteboard, Bookshelf, MusicCorner, Coverflow } from './Corners'

// Phones and low-core machines start on the light setting.
const LOW_START = typeof window !== 'undefined' && (window.matchMedia('(pointer: coarse)').matches || (navigator.hardwareConcurrency || 8) <= 4)

function Spot({ target, ...props }) {
  const ref = useRef()
  const { scene } = useThree()
  useEffect(() => { const l = ref.current; if (!l) return; l.target.position.set(...target); scene.add(l.target); return () => scene.remove(l.target) }, [scene])
  return <spotLight ref={ref} {...props} />
}

function Lights() {
  const night = useStore((s) => s.night)
  const lampOn = useStore((s) => s.lampOn)
  return (
    <>
      <ambientLight intensity={night ? 0.1 : 0.35} color="#ffd9b8" />
      {/* barn lamp: the only shadow caster */}
      <Spot target={[-0.25, 0.75, -0.9]} position={[-0.55, 1.42, -1.14]} angle={0.95} penumbra={0.85} intensity={lampOn ? 10 : 0} distance={6} decay={2} color="#ffb36b" castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0004} shadow-radius={5} />
      {/* screen glow */}
      <pointLight position={[0, 1.1, -0.95]} intensity={night ? 0.9 : 0.4} distance={1.6} decay={2} color="#ff5a6a" />
      {/* poster */}
      <Spot target={[0, 1.9, -1.4]} position={[0, 2.85, -0.7]} angle={0.5} penumbra={0.7} intensity={night ? 5 : 2} distance={4} decay={2} color="#ffe0bd" />
      {/* moon / sun through the window */}
      <directionalLight position={[-6, night ? 3.2 : 4.5, -0.4]} intensity={night ? 0.55 : 3.2} color={night ? '#8fb0ff' : '#fff1d6'} />
      {/* warm fill, string lights, music corner */}
      <pointLight position={[0, 2.5, 1.6]} intensity={night ? 2.2 : 0.8} distance={7} decay={2} color="#ffb98a" />
      {/* shelf wash */}
      <Spot target={[-1.5, 1.3, -1.3]} position={[-0.9, 2.75, -0.35]} angle={0.75} penumbra={0.9} intensity={night ? 3.5 : 1.5} distance={4} decay={2} color="#ffd9a8" />
    </>
  )
}

// Renders on demand: full frame rate while something moves or you're interacting,
// about 20fps when idle (steam, lights), nothing while a full-screen view is open.
function Driver({ paused }) {
  const { invalidate, gl } = useThree()
  useEffect(() => {
    gl.shadowMap.autoUpdate = false
    gl.shadowMap.needsUpdate = true
    let last = performance.now(), shadowsUntil = performance.now() + 3000, raf, n = 0
    const poke = () => { last = performance.now() }
    const evs = ['pointermove', 'pointerdown', 'wheel', 'keydown', 'touchmove', 'resize']
    evs.forEach((e) => window.addEventListener(e, poke, { passive: true }))
    // shadows only need recomputing while something on the desk is moving (picked up, put back)
    const unsub = useStore.subscribe((s, prev) => {
      poke()
      if (s.focus !== prev.focus || s.cart !== prev.cart || s.book !== prev.book || s.inspectRot !== prev.inspectRot || s.lampOn !== prev.lampOn) shadowsUntil = performance.now() + 2200
    })
    const tick = () => {
      raf = requestAnimationFrame(tick)
      if (paused) return
      const active = performance.now() - last < 2500
      n++
      if (active || n % 3 === 0) {
        if (performance.now() < shadowsUntil) gl.shadowMap.needsUpdate = true
        invalidate()
      }
    }
    tick()
    return () => { cancelAnimationFrame(raf); evs.forEach((e) => window.removeEventListener(e, poke)); unsub() }
  }, [paused, invalidate, gl])
  return null
}

export function Experience() {
  const overlay = useStore((s) => s.overlay)
  const paused = overlay === 'computer' || overlay === 'board'
  // Phones have tiny, dense screens, so rendering at 1x looked blurry and jagged. Render sharp, step down only if it struggles.
  const [dpr, setDpr] = useState(() => Math.min(window.devicePixelRatio || 1, LOW_START ? 2 : 1.75))
  return (
    <Canvas frameloop="demand" shadows dpr={dpr} gl={{ antialias: true, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0 }} camera={{ fov: 48, near: 0.03, far: 40, position: [0, 2.6, -0.6] }} style={{ position: 'fixed', inset: 0 }}>
      <PerformanceMonitor onDecline={() => setDpr((d) => Math.max(1.25, d - 0.5))} flipflops={3} />
      <Driver paused={paused} />
      <color attach="background" args={['#0d0907']} />
      <Suspense fallback={null}>
        <Environment files="hdri/room.hdr" environmentIntensity={0.3} />
        <Lights />
        <Room />
        <Desk />
        <Whiteboard />
        <Bookshelf />
        <MusicCorner />
        <Coverflow />
        <Preload all />
      </Suspense>
      <CameraRig />
    </Canvas>
  )
}
