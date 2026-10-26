import { Suspense, lazy } from 'react'
import { useStore } from './store'
import { Recruiter } from './ui/Recruiter'

// The 3D room is its own chunk. It is fetched only when someone clicks to enter the room (or opens #room), never for the Recruiter page.
const Room = lazy(() => import('./RoomApp'))

export default function App() {
  const view = useStore((s) => s.view)
  const setView = useStore((s) => s.setView)
  if (view === 'recruiter') return <Recruiter onEnterRoom={() => setView('room')} />
  return (
    <Suspense fallback={<div className="loader"><div className="loader-title">Sat's room</div></div>}>
      <Room />
    </Suspense>
  )
}
