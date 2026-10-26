import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../store'

export const HEAD = new THREE.Vector3(0, 1.16, -0.18)
const P0 = new THREE.Vector3(0.02, 2.6, -0.6)
const P1 = new THREE.Vector3(0.45, 1.95, 0.75)
const L0 = new THREE.Vector3(0, 0.74, -0.98)

// Where the camera goes when you click something. Objects that come to you (frame, cartridge, book) keep the seated view.
export const FOCUS = {
  computer: { pos: [0, 1.105, -0.72], look: [0, 1.105, -1.2] },
  board: { pos: [1.5, 1.47, -0.2], look: [1.5, 1.47, -1.38] },
  music: { pos: [0.95, 1.25, 0.55], look: [2.2, 0.85, 1.25] },
  // side: on wide screens, slide the view so the object sits left of centre and an info card on the right wouldn't cover it
  cert: { pos: [1.2, 1.62, 0.35], look: [2.4, 1.62, 0.35] },
  // walk up to the bookshelf so the spines are readable; fitW keeps the whole shelf in view on narrow screens
  shelf: { pos: [-1.77, 1.43, -0.37], look: [-1.77, 1.4, -1.21], fitW: 0.5 }
}

// Arrow-pad presets (yaw, pitch) from the chair.
export const LOOKS = {
  front: [0, 0.05], left: [1.47, 0.02], right: [-1.33, 0.14], cert: [-1.84, 0.12], music: [-2.14, -0.15], up: [0, 1.05], down: [0, -0.72]
}

const lookState = { yawT: 0, pitchT: 0.05 }
// #look-right (or left, cert, music, up, down) opens already facing that way
if (typeof window !== 'undefined' && window.location.hash.startsWith('#look-') && LOOKS[window.location.hash.slice(6)]) [lookState.yawT, lookState.pitchT] = LOOKS[window.location.hash.slice(6)]
export function lookAt(name) {
  const s = useStore.getState()
  if (!s.seated) s.sit()
  const [y, p] = LOOKS[name]
  lookState.yawT = y; lookState.pitchT = p
}

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const tmp = new THREE.Vector3()
const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3()

export function CameraRig() {
  const { camera, gl } = useThree()
  const st = useRef({ p: 0, yaw: 0, pitch: 0.1, pos: P0.clone(), look: L0.clone(), drag: null })

  useEffect(() => {
    const el = gl.domElement
    const onWheel = (e) => {
      const s = useStore.getState()
      if (s.overlay || s.focus) return
      if (s.seated && e.deltaY > 0) return
      if (s.seated && e.deltaY < 0) { lookState.yawT = 0; lookState.pitchT = 0.05 }
      s.setProgress(s.progress + e.deltaY * 0.0009)
    }
    let ty = null
    const onTouchStart = (e) => { ty = e.touches[0]?.clientY ?? null }
    const onTouchMove = (e) => {
      const s = useStore.getState(); if (ty == null || s.seated || s.overlay) return
      const y = e.touches[0].clientY; s.setProgress(s.progress + (ty - y) * 0.003); ty = y
    }
    const down = (e) => { st.current.drag = { x: e.clientX, y: e.clientY, yaw: lookState.yawT, pitch: lookState.pitchT, moved: false } }
    const move = (e) => {
      const d = st.current.drag; if (!d) return
      const s = useStore.getState()
      const dx = e.clientX - d.x, dy = e.clientY - d.y
      if (!d.moved && Math.abs(dx) + Math.abs(dy) > 6) { d.moved = true; useStore.setState({ dragMoved: true, hover: null }) }
      if (d.moved && s.seated && !s.focus) {
        lookState.yawT = THREE.MathUtils.clamp(d.yaw + dx * 0.0042, -2.4, 2.4)
        lookState.pitchT = THREE.MathUtils.clamp(d.pitch + dy * 0.0032, -1.0, 1.15)
        el.style.cursor = 'grabbing'
      }
    }
    const up = () => { st.current.drag = null; el.style.cursor = ''; requestAnimationFrame(() => useStore.setState({ dragMoved: false })) }
    window.addEventListener('wheel', onWheel, { passive: true })
    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: true })
    el.addEventListener('pointerdown', down)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    return () => {
      window.removeEventListener('wheel', onWheel)
      el.removeEventListener('touchstart', onTouchStart); el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('pointerdown', down); window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up)
    }
  }, [gl])

  useFrame((_, dt) => {
    const s = useStore.getState()
    const r = st.current
    const k = 1 - Math.pow(0.0012, dt) // frame-rate independent smoothing
    r.p += (s.progress - r.p) * (1 - Math.pow(0.02, dt))
    r.yaw += (lookState.yawT - r.yaw) * k
    r.pitch += (lookState.pitchT - r.pitch) * k
    const e = ease(THREE.MathUtils.clamp(r.p, 0, 1))
    // a book pulled from the shelf keeps the camera at the shelf
    const f = s.focus && (FOCUS[s.focus] || (s.focus === 'book' && s.fromShelf ? FOCUS.shelf : null))
    let goalPos, goalLook
    if (f) {
      goalPos = a.set(...f.pos); goalLook = b.set(...f.look)
      if (f.side && camera.aspect > 1.1) {
        tmp.subVectors(goalLook, goalPos).cross(camera.up).normalize().multiplyScalar(f.side)
        goalPos.add(tmp); goalLook.add(tmp)
      }
      if (f.fitW) {
        // step back until fitW metres fit across the screen (phones in portrait)
        const hf = 2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect)
        const need = f.fitW / 2 / Math.tan(hf / 2), have = goalPos.distanceTo(goalLook)
        if (need > have) goalPos.sub(goalLook).multiplyScalar(Math.min(need, 1.9) / have).add(goalLook)
      }
    }
    else {
      // quadratic bezier from above the desk down into the chair
      goalPos = a.copy(P0).multiplyScalar((1 - e) * (1 - e)).add(tmp.copy(P1).multiplyScalar(2 * (1 - e) * e)).add(c.copy(HEAD).multiplyScalar(e * e))
      const cp = Math.cos(r.pitch)
      const seatedLook = tmp.set(-Math.sin(r.yaw) * cp, Math.sin(r.pitch), -Math.cos(r.yaw) * cp).add(HEAD)
      goalLook = b.copy(L0).lerp(seatedLook, e)
    }
    const kk = f ? 1 - Math.pow(0.03, dt) : 1 - Math.pow(0.000001, dt)
    r.pos.lerp(goalPos, kk); r.look.lerp(goalLook, kk)
    camera.position.copy(r.pos); camera.lookAt(r.look)
    // phones in portrait: widen the vertical fov so you see as much of the room sideways as on a laptop
    const base = f ? 42 : 48 + e * 14
    const asp = camera.aspect || 1.6
    const fovGoal = asp >= 1.6 ? base : Math.min(78, Math.max(base, THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(base / 2)) * 1.6 / asp))))
    if (Math.abs(camera.fov - fovGoal) > 0.01) { camera.fov += (fovGoal - camera.fov) * (1 - Math.pow(0.05, dt)); camera.updateProjectionMatrix() }
  })
  return null
}
