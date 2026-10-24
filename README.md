# Sat's Room

A 3D portfolio for Satveer Ganasan, built with React, three.js (react-three-fiber + drei) and postprocessing.

Scroll from above the desk down into the chair, look around the room, and click things:

| Object | Opens |
| --- | --- |
| Computer | Persona 5 style menu: Experience, Who am I, Contact |
| Whiteboard | Projects as self-drawing blueprints with a demo video slot |
| Speaker + record crate | 3D album sleeves you flip through, with real audio |
| Picture frame | Pick it up and turn it over (your photo) |
| Game cartridges | Games you've played, each with a note |
| Bookshelf | Books and manga slide out, fly to you and open your notes |
| Certificate | Your degree |
| Window | Day / night |
| Coffee mug, lamp | Little extras |

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # outputs dist/, deploy that folder anywhere static (Vercel, Netlify, GitHub Pages, Cloudflare Pages)
```

## Make it yours

Almost everything lives in `src/data.js`: profile, links, projects (and their blueprint diagrams), experience, social stats, tracks, games, books and manga. Replace every `[BRACKETED]` placeholder.

Drop files into `public/`:

- `public/images/me.jpg`: your photo (portrait, roughly 4:5). Shows in the picture frame and on Who am I.
- `public/music/track1.mp3` … `track6.mp3`: your songs. Set titles and artists in `tracks`.
- `public/videos/anime-atlas.mp4` etc.: short screen recordings of each project (muted loops work best, under 10MB each).
- `public/cv.pdf`: your CV.

## Swapping in your Higgsfield models

Put a `.glb` in `public/models/` and use it with the `Model` component, which scales it to a real-world size and sits it on the floor:

```jsx
<Model url="models/desk.glb" width={1.6} position={[0, 0, -0.98]} />
```

The desk, monitor, keyboard and mug are currently built in code with real wood textures, so the clickable screen and camera framing line up exactly. If you swap the monitor, keep the screen plane in `Desk.jsx` in front of it.

## Credits

- Fabric armchair, barn lamp, plant, boombox, antique camera and flower vase: Khronos glTF Sample Assets (CC0 / CC-BY 4.0, see each model's licence in the KhronosGroup/glTF-Sample-Assets repo).
- Wood floor textures: three.js examples.
- Interior HDRI: Poly Haven (CC0), via pmndrs/drei-assets.
