import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { Environment, Preload } from '@react-three/drei'
import * as THREE from 'three'
import { EffectComposer, Bloom, N8AO, ToneMapping, Vignette } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'
import { useStore } from '../store'
import { CameraRig } from './CameraRig'
import { Room } from './Room'
import { Desk } from './Desk'
import { Extras } from './Extras'
import { leafShadowTex } from './textures'
import { Whiteboard, Bookshelf, MusicCorner, Coverflow } from './Corners'

// Phones and low-core machines start on the light setting.
const LOW_START = typeof window !== 'undefined' && (window.matchMedia('(pointer: coarse)').matches || (navigator.hardwareConcurrency || 8) <= 4)
// Integrated GPUs (most laptops) choke on the pixel count of hi-DPI screens: measured on an AMD Radeon iGPU, 1x held ~70fps with every effect on, 1.5x dropped well below that.
const GPU = (() => { try { const c = document.createElement('canvas'); const g = c.getContext('webgl'); const e = g && g.getExtension('WEBGL_debug_renderer_info'); return e ? String(g.getParameter(e.UNMASKED_RENDERER_WEBGL)) : '' } catch (e) { return '' } })()
const DISCRETE = /RTX|GTX|Radeon RX|Radeon Pro|Quadro|Arc Ad|Apple Md/i.test(GPU)
// Post effects tier: 2 = ambient occlusion + bloom, 1 = bloom only, 0 = none. Weak machines start lower, and the Driver steps down if frames stay slow.
const START_FX = LOW_START ? 0 : (navigator.hardwareConcurrency || 8) >= 8 ? 2 : 1
// ?fx=0|1|2 and ?dpr=1 pin the quality (for testing); without them the room adjusts itself
const QS = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
const PINNED = QS.has('fx') || QS.has('dpr')

function Spot({ target, ...props }) {
  const ref = useRef()
  const { scene } = useThree()
  useEffect(() => { const l = ref.current; if (!l) return; l.target.position.set(...target); scene.add(l.target); return () => scene.remove(l.target) }, [scene])
  return <spotLight ref={ref} {...props} />
}

function Lights() {
  const gobo = useMemo(() => leafShadowTex(), [])
  const night = useStore((s) => s.night)
  const lampOn = useStore((s) => s.lampOn)
  return (
    <>
      <ambientLight intensity={night ? 0.1 : 0.35} color="#ffd9b8" />
      {/* barn lamp: the only shadow caster */}
      <Spot target={[-0.25, 0.75, -0.9]} position={[-0.55, 1.42, -1.14]} angle={0.95} penumbra={0.85} intensity={lampOn ? (night ? 10 : 4.5) : 0} distance={6} decay={2} color="#ffb36b" castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0004} shadow-radius={5} />
      {/* screen glow */}
      <pointLight position={[0, 1.1, -0.95]} intensity={night ? 0.9 : 0.4} distance={1.6} decay={2} color="#ff5a6a" />
      {/* poster */}
      <Spot target={[0, 1.9, -1.4]} position={[0, 2.85, -0.7]} angle={0.5} penumbra={0.7} intensity={night ? 5 : 2} distance={4} decay={2} color="#ffe0bd" />
      {/* moon / sun through the window; by day a gobo spot throws dappled leaf shadows across the desk */}
      <directionalLight position={[-6, night ? 3.2 : 4.5, -0.4]} intensity={night ? 0.55 : 1.4} color={night ? '#8fb0ff' : '#ffe2b0'} />
      <Spot target={[0.1, 0.75, -0.95]} position={[-2.2, 2.1, -0.1]} angle={0.42} penumbra={0.35} intensity={night ? 0 : 16} distance={0} decay={0} color="#ffd9a0" map={gobo} castShadow shadow-mapSize={[512, 512]} shadow-bias={-0.0006} />
      {/* warm fill, string lights, music corner */}
      <pointLight position={[0, 2.5, 1.6]} intensity={night ? 2.2 : 0.8} distance={7} decay={2} color="#ffb98a" />
      {/* shelf wash */}
      <Spot target={[-1.5, 1.3, -1.3]} position={[-0.9, 2.75, -0.35]} angle={0.75} penumbra={0.9} intensity={night ? 3.5 : 1.5} distance={4} decay={2} color="#ffd9a8" />
    </>
  )
}

// Renders on demand: full frame rate while something moves or you're interacting,
// about 20fps when idle (steam, lights), nothing while a full-screen view is open.
function Driver({ paused, onSlow }) {
  const { invalidate, gl } = useThree()
  const slowRef = useRef(onSlow)
  slowRef.current = onSlow
  useEffect(() => {
    gl.shadowMap.autoUpdate = false
    gl.shadowMap.needsUpdate = true
    let last = performance.now(), shadowsUntil = performance.now() + 3000, raf, n = 0
    let prevT = performance.now(), acc = 0, cnt = 0, quietUntil = performance.now() + 6000
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
      const now = performance.now(), dt = now - prevT
      prevT = now
      if (paused) return
      const active = now - last < 2500
      // while you're interacting, 45 frames averaging over ~34ms (under 30fps) means the GPU is struggling: ask for a cheaper setup
      if (active && now > quietUntil && dt < 250) { acc += dt; if (++cnt >= 45) { if (acc / cnt > 34) { slowRef.current && slowRef.current(); quietUntil = now + 3000 } acc = 0; cnt = 0 } } else { acc = 0; cnt = 0 }
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
  const [q, setQ] = useState(() => ({ fx: QS.has('fx') ? Number(QS.get('fx')) : START_FX, dpr: QS.has('dpr') ? Number(QS.get('dpr')) : Math.min(window.devicePixelRatio || 1, LOW_START ? 2 : DISCRETE ? 1.75 : 1) }))
  // slow frames: drop ambient occlusion, then bloom, then render at a lower resolution
  const onSlow = () => !PINNED && setQ((s) => (s.fx > 0 ? { ...s, fx: s.fx - 1 } : { ...s, dpr: Math.max(1, s.dpr - 0.25) }))
  return (
    <Canvas frameloop="demand" shadows dpr={q.dpr} gl={{ antialias: true, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0 }} camera={{ fov: 48, near: 0.03, far: 40, position: [0, 2.6, -0.6] }} style={{ position: 'fixed', inset: 0 }}>
      <Driver paused={paused} onSlow={onSlow} />
      <color attach="background" args={['#0d0907']} />
      <Suspense fallback={null}>
        <Environment files="hdri/room.hdr" environmentIntensity={0.3} />
        <Lights />
        <Room />
        <Desk />
        <Extras />
        <Whiteboard />
        <Bookshelf />
        <MusicCorner />
        <Coverflow />
        <Preload all />
        {q.fx === 2 && (
          <EffectComposer key="fx2" multisampling={2} disableNormalPass>
            <N8AO aoRadius={0.4} distanceFalloff={1} intensity={2.4} quality="low" halfRes />
            <Bloom mipmapBlur luminanceThreshold={0.9} luminanceSmoothing={0.25} intensity={0.4} />
            <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
            <Vignette eskil={false} offset={0.25} darkness={0.55} />
          </EffectComposer>
        )}
        {q.fx === 1 && (
          <EffectComposer key="fx1" multisampling={2} disableNormalPass>
            <Bloom mipmapBlur luminanceThreshold={0.9} luminanceSmoothing={0.25} intensity={0.4} />
            <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
          </EffectComposer>
        )}
      </Suspense>
      <CameraRig />
    </Canvas>
  )
}
