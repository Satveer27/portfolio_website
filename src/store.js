import { create } from 'zustand'

// focus: which object the camera is looking at (null = free look)
// overlay: which UI is open on top of the scene
// the plain Recruiter page is the default entrance; #room (and the debug shortcuts below) open the 3D room
const ROOM_HASH = /^#(room|seated|os-|open-|look-)/
const startView = () => (typeof window !== 'undefined' && ROOM_HASH.test(window.location.hash) ? 'room' : 'recruiter')

const startSeated = typeof window !== 'undefined' && (window.location.hash === '#seated' || window.location.hash.startsWith('#os-') || window.location.hash.startsWith('#open-') || window.location.hash.startsWith('#look-'))

export const useStore = create((set, get) => ({
  view: startView(), // 'room' (3D) or 'recruiter' (plain page)
  setView: (view) => { set({ view, overlay: null, focus: null, hover: null }); try { history.replaceState(null, '', '#' + view) } catch (e) {} },
  progress: startSeated ? 1 : 0, // 0 = standing above the desk, 1 = sitting in the chair
  seated: startSeated, // #seated in the URL opens already in the chair
  focus: null,
  overlay: null,
  hover: null, // { label, x, y }
  dragMoved: false,
  night: false, // golden-hour daylight by default; the window toggles night
  lampOn: true,
  coffee: 0,
  toast: null,

  // music
  album: 0,
  playing: false,
  muted: false,

  // inspectables
  fromShelf: false,
  book: null, // index into the combined shelf list
  cart: null,
  inspectRot: { x: 0, y: 0 },

  setProgress: (p) => {
    const v = Math.max(0, Math.min(1, p))
    set({ progress: v, seated: v >= 0.999 })
  },
  sit: () => get().setProgress(1),
  setHover: (hover) => set({ hover }),

  open: (key, extra = {}) => {
    const s = get()
    if (!s.seated) s.setProgress(1)
    clearTimeout(s._t)
    const delay = { computer: 850, board: 850, music: 700, cert: 700, shelf: 600 }[key] ?? 650
    set({ focus: key, hover: null, ...extra })
    const t = setTimeout(() => set({ overlay: key }), delay)
    set({ _t: t })
  },
  close: () => {
    clearTimeout(get()._t)
    // putting a book back returns you to the shelf, not the chair
    if (get().focus === 'book' && get().fromShelf) { set({ overlay: 'shelf', focus: 'shelf', book: null, fromShelf: false }); return }
    set({ overlay: null, focus: null, book: null, cart: null, fromShelf: false, inspectRot: { x: 0, y: 0 } })
  },
  say: (text) => {
    clearTimeout(get()._toastT)
    set({ toast: text, _toastT: setTimeout(() => set({ toast: null }), 2600) })
  }
}))

// #os-contact (or os-experience, os-education ...) opens the computer on that screen straight away; #open-frame, #open-board ... open that object
if (typeof window !== 'undefined') {
  const h = window.location.hash
  if (h.startsWith('#os-')) setTimeout(() => useStore.getState().open('computer', { osScreen: h.slice(4) }), 600)
  else if (h.startsWith('#open-')) setTimeout(() => useStore.getState().open(h.slice(6)), 600)
}
