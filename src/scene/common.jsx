import { useEffect, useMemo, useState } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '../store'

// Clickable wrapper: hover label, ignores clicks that were really drags, sits you down if you're still standing.
export function Hotspot({ label, onActivate, children, allow, ...props }) {
  // allow: a focus view in which this stays clickable (books while you're at the shelf)
  const blocked = (s) => (s.focus && s.focus !== allow) || (s.overlay && s.overlay !== allow)
  const onOver = (e) => {
    e.stopPropagation()
    const s = useStore.getState()
    if (!s.seated || blocked(s) || s.dragMoved) return
    document.body.style.cursor = 'pointer'
    s.setHover({ label, x: e.nativeEvent.clientX, y: e.nativeEvent.clientY })
  }
  const onMove = (e) => {
    const s = useStore.getState()
    if (!s.hover || s.hover.label !== label) return
    const x = e.nativeEvent.clientX, y = e.nativeEvent.clientY
    if (Math.abs(x - s.hover.x) + Math.abs(y - s.hover.y) > 4) s.setHover({ label, x, y })
  }
  const onOut = () => { document.body.style.cursor = ''; const s = useStore.getState(); if (s.hover && s.hover.label === label) s.setHover(null) }
  const onClick = (e) => {
    e.stopPropagation()
    const s = useStore.getState()
    if (s.dragMoved) return
    if (!s.seated) { s.sit(); return }
    if (blocked(s)) return
    document.body.style.cursor = ''
    s.setHover(null)
    onActivate && onActivate()
  }
  return <group {...props} onPointerOver={onOver} onPointerMove={onMove} onPointerOut={onOut} onClick={onClick}>{children}</group>
}

// Loads a GLB, scales it so its height (or width) matches `height`/`width`, and sits it on the floor at its origin.
// interactive={false}: the model is look-only and its meshes ignore the pointer (give it your own hit area)
export function Model({ url, height, width, rotation = [0, 0, 0], envIntensity = 1, interactive = true, ...props }) {
  const { scene } = useGLTF(url)
  const obj = useMemo(() => {
    const root = scene.clone(true)
    root.traverse((m) => {
      if (m.isMesh) {
        m.castShadow = true; m.receiveShadow = true
        if (!interactive) m.raycast = () => null
        if (m.material) {
          m.material = m.material.clone(); m.material.envMapIntensity = envIntensity
          // transmission needs an extra full render pass; fake glass with plain transparency instead
          if (m.material.transmission > 0) { m.material.transmission = 0; m.material.transparent = true; m.material.opacity = 0.35; m.material.roughness = Math.min(m.material.roughness, 0.1) }
        }
      }
      if (m.isLight) m.visible = false
    })
    const holder = new THREE.Group()
    root.rotation.set(...rotation)
    holder.add(root)
    holder.updateMatrixWorld(true)
    const box = new THREE.Box3().setFromObject(holder)
    const size = box.getSize(new THREE.Vector3())
    const s = height ? height / size.y : width / Math.max(size.x, size.z)
    root.scale.multiplyScalar(s)
    holder.updateMatrixWorld(true)
    box.setFromObject(holder)
    const ctr = box.getCenter(new THREE.Vector3())
    root.position.x -= ctr.x; root.position.z -= ctr.z; root.position.y -= box.min.y
    return holder
  }, [scene, height, width, envIntensity, interactive, rotation[0], rotation[1], rotation[2]])
  return <primitive object={obj} {...props} />
}

// Moves an object between its home transform and a spot in front of the camera.
const _v = new THREE.Vector3(), _q = new THREE.Quaternion(), _e = new THREE.Euler()
export function flyStep(obj, home, active, camera, dt, opts = {}) {
  const k = 1 - Math.pow(opts.speed ?? 0.004, dt)
  if (active) {
    const dist = opts.dist ?? 0.55
    _v.set(opts.x ?? 0, opts.y ?? 0, -dist).applyQuaternion(camera.quaternion).add(camera.position)
    obj.position.lerp(_v, k)
    _e.set(opts.rx ?? 0, opts.ry ?? 0, opts.rz ?? 0)
    _q.setFromEuler(_e).premultiply(camera.quaternion)
    obj.quaternion.slerp(_q, k)
    const s = opts.scale ?? 1
    obj.scale.lerp(_v.set(s, s, s), k)
  } else {
    obj.position.lerp(home.position, k)
    obj.quaternion.slerp(home.quaternion, k)
    obj.scale.lerp(_v.set(1, 1, 1), k)
  }
}

export function homeOf(position, rotation = [0, 0, 0]) {
  return { position: new THREE.Vector3(...position), quaternion: new THREE.Quaternion().setFromEuler(new THREE.Euler(...rotation)) }
}

useGLTF.preload('models/lamp.glb')
useGLTF.preload('models/boombox.glb')
useGLTF.preload('models/vase.glb')
useGLTF.preload('models/mug.glb')
useGLTF.preload('models/frame.glb')
useGLTF.preload('models/monitor.glb')
useGLTF.preload('models/keyboard.glb')

// Loads an image from /public if it exists, otherwise keeps showing the canvas fallback.
export function useOptionalTexture(url, fallback) {
  const [tex, setTex] = useState(fallback)
  useEffect(() => {
    if (!url) return
    let alive = true
    // a real texture replaces the fallback; swapping the image inside the canvas texture breaks when the sizes differ
    new THREE.TextureLoader().load(url.replace(/^\//, ''), (t) => { if (!alive) return; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; setTex(t) }, undefined, () => {})
    return () => { alive = false }
  }, [url])
  return tex
}
