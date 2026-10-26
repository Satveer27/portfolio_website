# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Hiring managers and recruiters assessing Satveer Ganasan for backend and AI engineering roles. They arrive from a CV, LinkedIn or an application, often on a laptop between other tabs, and some on a phone. They skim first and decide within a minute or two whether to interview. A smaller group of engineers may read the projects and code.

## Product Purpose

A personal portfolio that makes a candidate memorable and then proves the depth behind the first impression. Success is a visitor who remembers it, finds the real evidence quickly (experience, projects with architecture, skills, education) and contacts Satveer or reads the CV.

## Positioning

A walkable 3D room whose objects are the portfolio, with real content behind every object: projects drawn as self-building architecture blueprints, experience and education on a computer, books and manga on a shelf, music, games, a certificate. A fast plain "Recruiter view" gives the same facts in one scroll for anyone in a hurry. Few developer portfolios pair a distinctive world with verifiable engineering numbers.

## Operating Context

- Visitors range from high-end desktops to integrated-GPU laptops and phones, so the 3D scene must stay fast on weak hardware (it measures its own frame rate and steps its effects down).
- The room is the default entry. The Recruiter view lives at `#recruiter` and links both ways.
- All editable content sits in `src/data.js` (profile, projects and blueprints, experience, education, skills, books, games, tracks). Photos, music, videos and the CV are dropped into `public/`.
- Deployment target is not decided yet (Vite static build in `dist/`).

## Capabilities and Constraints

- Stack in place: React 18, react-three-fiber and drei, three.js, postprocessing, zustand, Vite.
- Content shown today: 5 projects with blueprint diagrams (Anime Atlas, UFC Predictor, Fatigue Signals, Censis AR, WAD Car Market); experience at VSD Automation, Loopsio and GU Orbit; a year-by-year education timeline at the University of Glasgow (MSci Computer Science, 2026); a skills sphere; books and manga; five games; music tracks; a graduation certificate.
- Do not state or imply that Satveer is looking for work, available, or seeking a particular location. He will apply to many roles; visitors infer the rest.
- Never invent customers, metrics, testimonials, dates or licences. Open facts stay as clearly marked placeholders.
- Terminology: "the room" is the 3D experience; "Recruiter view" is the plain page; "blueprints" are the project diagrams on the whiteboard.
- Undecided: deploy host and domain; whether to add a demo video per project.

## Brand Commitments

Name: Satveer Ganasan (full name Satveer Sahaas Ganasan). Role line: Backend + AI engineer. Based in Glasgow, Scotland. Voice is plain, specific and first person, led by numbers rather than adjectives. The Persona 5 style computer menu and the golden-hour room are established parts of the experience.

## Evidence on Hand

- Real metrics: Anime Atlas (23k anime, 92k API calls at 100% first-attempt success, 247k rows), VSD Automation (97% LLM extraction accuracy, 100 customers), Loopsio (16-table schema, 20+ features), fatigue prediction (86.3% accuracy, F1 0.778), WAD Car Market (52 of 95 commits).
- Real repositories under github.com/Satveer27 (UFC_ML_model, mental-fatigue-prediction, Anime_App_Backend, WAD_Car_Market and more).
- Generated assets in `public/`: Salah shirt, JoJo-style poster, oak floor, plaster, rug and linen textures, 3D monitor, mug, frame and keyboard.
- Absences future work must not fabricate: no personal photo (`images/me.jpg`), no email, GitHub profile, LinkedIn or CV file yet, no real music files, no demo videos, no 4th-year smart-meter blueprint until the code is on GitHub, GU Orbit has no figures.

## Product Principles

1. Memorable first, credible second: the world earns a minute of attention, the evidence earns the interview.
2. Every object opens something real; decoration with no content behind it does not belong in the room.
3. Show proof as numbers and architecture, not adjectives.
4. Performance is part of the product: it must run on an integrated-GPU laptop in Chrome, and degrade gracefully.
5. Offer a fast path: anyone can skip the room and read the same facts in one scroll.

## Accessibility & Inclusion

No product-specific standard was established. The Recruiter view should stay fully readable without 3D, motion is paused for users who prefer reduced motion, and the skills are also exposed as plain text.
