import { useStore } from './store'
import { Experience } from './scene/Experience'
import { HUD, Loader, Audio } from './ui/Overlays'
import { Recruiter } from './ui/Recruiter'

export default function App() {
  const view = useStore((s) => s.view)
  const setView = useStore((s) => s.setView)
  if (view === 'recruiter') return <Recruiter onEnterRoom={() => setView('room')} />
  return (
    <>
      <Experience />
      <div className="vignette" aria-hidden="true" />
      <HUD />
      <Audio />
      <Loader />
    </>
  )
}
