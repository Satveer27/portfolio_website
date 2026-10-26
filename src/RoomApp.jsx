import { Experience } from './scene/Experience'
import { HUD, Loader, Audio } from './ui/Overlays'

// Everything that needs three.js lives behind this one file, so the Recruiter page never downloads any of it
// unless the visitor chooses to enter the room.
export default function RoomApp() {
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
