// Everything you'll want to edit lives in this file.
// Swap [BRACKETED] placeholders for your real info, drop files into /public and point to them here.

export const profile = {
  name: 'Satveer Ganasan',
  fullName: 'Satveer Sahaas Ganasan',
  short: 'Sat',
  role: 'Backend + AI engineer',
  stack: 'Python · FastAPI',
  degree: 'Integrated Masters (MSci) in Computer Science',
  uni: 'University of Glasgow',
  year: '2026',
  basedIn: 'Edinburgh, Scotland',
  lookingFor: 'Backend and AI roles in Malaysia',
  photo: 'images/me.jpg', // put a photo of yourself here (portrait, roughly 4:5)
  bio: "I build APIs in Python and FastAPI, wire up data pipelines and ship ML models that actually get deployed. I like systems that keep working when things go wrong: retries, queues, sensible schemas. Off the clock it's anime, football, League and a lot of coffee.",
  email: '[YOUR EMAIL]',
  links: {
    email: 'mailto:[YOUR EMAIL]',
    github: 'https://github.com/[YOUR GITHUB]',
    linkedin: 'https://www.linkedin.com/in/[YOUR LINKEDIN]',
    cv: 'cv.pdf'
  }
}

// Shown on the whiteboard as self-drawing blueprints. Nodes are boxes on an 800x560 sheet.
// video: a clip in /public/videos. Leave it null and the panel shows the highlights (real numbers) instead.
export const projects = [
  {
    id: 'anime', code: '01', title: 'Anime Atlas', status: 'IN PROGRESS',
    video: null,
    blurb: 'Anime analysis platform. An ELT pipeline for 23k anime runs as separate Airflow stages (discovery, fetch, clean), pulling from the Tensei and AniList APIs plus IMDb data, archiving raw JSON to S3 and loading cleaned data into PostgreSQL on RDS. FastAPI serves the analysis, and MAL user lists power profile analysis and recommendations.',
    stack: ['Python', 'FastAPI', 'PostgreSQL', 'AWS RDS', 'S3', 'EC2', 'Airflow', 'Celery', 'Docker', 'HTTPX'],
    links: { code: '[REPO URL]', live: '' },
    caption: 'SYSTEM OVERVIEW',
    flow: 'Tensei + AniList + IMDb → Airflow (discovery, fetch, clean) → raw JSON to S3, cleaned data to PostgreSQL on RDS → FastAPI. MAL user lists → Celery → profile analysis and recommendations',
    highlights: [
      { k: '92k', v: 'API calls over 15.4 h, 100% first-attempt success' },
      { k: '99.8', v: 'requests a minute with zero rate-limit errors' },
      { k: '6.9 min', v: 'catalogue write time, down from an estimated 2.9 h' },
      { k: '247k', v: 'rows from 92k raw payloads, 500 rows per transaction' },
      { k: '4.01', v: 'calls per anime, against ~4 projected from a 3k-request probe' },
      { k: '23k', v: 'anime in the catalogue' }
    ],
    nodes: [
      { id: 'tensei', x: 30, y: 30, w: 200, label: 'Tensei API', sub: 'anime catalogue' },
      { id: 'ani', x: 30, y: 120, w: 200, label: 'AniList API', sub: 'GraphQL' },
      { id: 'imdb', x: 30, y: 210, w: 200, label: 'IMDb datasets', sub: 'episode ratings' },
      { id: 'air', x: 300, y: 120, w: 190, label: 'Airflow DAGs', sub: 'discovery · fetch · clean' },
      { id: 's3', x: 570, y: 30, w: 200, label: 'S3', sub: 'raw JSON archive' },
      { id: 'pg', x: 570, y: 210, w: 200, label: 'PostgreSQL · RDS', sub: 'cleaned · 247k rows' },
      { id: 'api', x: 570, y: 390, w: 200, label: 'FastAPI', sub: 'analysis + recs' },
      { id: 'cel', x: 300, y: 390, w: 190, label: 'Celery workers', sub: 'profile imports' },
      { id: 'mal', x: 30, y: 390, w: 200, label: 'MAL API', sub: 'user anime lists' }
    ],
    edges: ['M230 60 H265 V150 H300', 'M230 150 H300', 'M230 240 H265 V150', 'M490 135 H530 V60 H570', 'M490 165 H530 V240 H570', 'M670 270 V390', 'M230 420 H300', 'M490 420 H570'],
    notes: [{ x: 395, y: 222, anchor: 'middle', text: 'rate limited · backoff · circuit breaker' }, { x: 770, y: 485, anchor: 'end', text: 'profile analysis + recommendations' }]
  },
  {
    id: 'ufc', code: '02', title: 'UFC Predictor', status: 'ML PIPELINE',
    video: null,
    blurb: 'An ML pipeline on scraped UFC data. An ETL loads fighters, fights and events into a SQL database, pandas cleans them into fighter-vs-fighter matchups, and a multi-output Random Forest predicts the winner, method, round and finish time. Served from a Dockerised FastAPI endpoint.',
    stack: ['Python', 'pandas', 'scikit-learn', 'Random Forest', 'FastAPI', 'Docker', 'Azure SQL'],
    links: { code: 'https://github.com/Satveer27/UFC_ML_model', live: '' },
    caption: 'ML PIPELINE',
    highlights: [
      { k: '4', v: 'predictions per fight: winner, method, round and finish time' },
      { k: '4', v: 'source tables: fighters, fights, events and fight details' },
      { k: '100', v: 'trees in the multi-output Random Forest' },
      { k: '1', v: 'endpoint: post a matchup, get the full breakdown' }
    ],
    nodes: [
      { id: 'site', x: 30, y: 60, w: 200, label: 'ufc.com', sub: 'scraped stats' },
      { id: 'etl', x: 300, y: 60, w: 190, label: 'ETL', sub: 'extract · load' },
      { id: 'db', x: 570, y: 60, w: 200, label: 'SQL database', sub: 'fighters · fights · events' },
      { id: 'clean', x: 570, y: 230, w: 200, label: 'pandas cleaning', sub: 'reach · stance · time' },
      { id: 'feat', x: 300, y: 230, w: 190, label: 'Matchups', sub: 'fighter A vs B' },
      { id: 'rf', x: 30, y: 230, w: 200, label: 'Random Forest', sub: 'multi-output' },
      { id: 'api', x: 30, y: 400, w: 200, label: 'FastAPI', sub: 'POST /predict · Docker' },
      { id: 'out', x: 300, y: 400, w: 190, label: 'Prediction', sub: 'winner · method · round' }
    ],
    edges: ['M230 90 H300', 'M490 90 H570', 'M670 120 V230', 'M570 260 H490', 'M300 260 H230', 'M130 290 V400', 'M230 430 H300'],
    notes: [{ x: 150, y: 352, text: '80 / 20 train-test split' }]
  },
  {
    id: 'fatigue', code: '03', title: 'Fatigue Signals', status: 'MSCI',
    video: null,
    blurb: 'Masters dissertation: predicting mental fatigue from wearable heart rate variability and wrist skin temperature (FatigueSet, 12 participants, 36 sessions). An SVM on 13 selected features reached 86.3% accuracy under leave-one-subject-out validation, beating CNN, LSTM and CNN-LSTM models on the same data.',
    stack: ['Python', 'scikit-learn', 'SVM', 'Signal processing', 'Feature engineering'],
    links: { code: '', live: '[PAPER URL]' },
    liveLabel: 'READ THE PAPER',
    caption: 'DISSERTATION · METHOD',
    wave: true,
    highlights: [
      { k: '86.3%', v: 'accuracy, leave-one-subject-out' },
      { k: '0.778', v: 'F1 score' },
      { k: '13 / 28', v: 'features kept after ablation' },
      { k: '12 · 36', v: 'participants · sessions' },
      { k: 'SVM', v: 'beat CNN, LSTM and CNN-LSTM' }
    ],
    nodes: [
      { id: 'wear', x: 30, y: 60, w: 200, label: 'FatigueSet', sub: 'HRV · wrist skin temp' },
      { id: 'pre', x: 300, y: 60, w: 190, label: 'Windowing', sub: '180 s sliding windows' },
      { id: 'feat', x: 570, y: 60, w: 200, label: 'Features', sub: '22 HRV + 6 temperature' },
      { id: 'abl', x: 570, y: 230, w: 200, label: 'Feature ablation', sub: '28 → 13 predictors' },
      { id: 'svm', x: 300, y: 230, w: 190, label: 'SVM (RBF)', sub: 'leave-one-subject-out' },
      { id: 'out', x: 30, y: 230, w: 200, label: 'Result', sub: '86.3% acc · F1 0.778' }
    ],
    edges: ['M230 90 H300', 'M490 90 H570', 'M670 120 V230', 'M570 260 H490', 'M300 260 H230'],
    notes: [{ x: 770, y: 340, anchor: 'end', text: 'beat CNN, LSTM and CNN-LSTM' }]
  },
  {
    id: 'censis', code: '04', title: 'Censis AR', status: 'TEAM LEAD',
    video: 'videos/censis.mp4',
    blurb: 'Led a team of six to design and ship an augmented reality app to TestFlight for a nonprofit client, gathering requirements across 12 stakeholder sessions. 20+ features over 5 sprints with feature branching, unit tests and agile ceremonies, on a SwiftUI, Django and Docker stack with GitLab CI/CD.',
    stack: ['SwiftUI', 'Django', 'Docker', 'GitLab CI/CD', 'TestFlight', 'Scrum'],
    links: { code: '', live: '' },
    caption: 'APP + DELIVERY',
    highlights: [
      { k: '6', v: 'people on the team I led' },
      { k: '12', v: 'stakeholder sessions with the client' },
      { k: '20+', v: 'features over 5 sprints' },
      { k: '80%', v: 'test coverage in GitLab CI/CD' }
    ],
    nodes: [
      { id: 'client', x: 30, y: 40, w: 200, label: 'Client', sub: '12 stakeholder sessions' },
      { id: 'team', x: 300, y: 40, w: 190, label: 'Team of 6', sub: '5 sprints · I led it' },
      { id: 'br', x: 570, y: 40, w: 200, label: 'Feature branches', sub: 'unit tests per feature' },
      { id: 'ci', x: 570, y: 210, w: 200, label: 'GitLab CI/CD', sub: 'automated tests · 80%' },
      { id: 'dj', x: 300, y: 210, w: 190, label: 'Django API', sub: 'in Docker' },
      { id: 'app', x: 30, y: 210, w: 200, label: 'SwiftUI AR app', sub: 'iOS' },
      { id: 'tf', x: 30, y: 380, w: 200, label: 'TestFlight', sub: 'builds for client demos' }
    ],
    edges: ['M230 70 H300', 'M490 70 H570', 'M670 100 V210', 'M570 240 H490', 'M300 240 H230', 'M130 270 V380'],
    notes: [{ x: 250, y: 415, text: 'every sprint ends in a client demo' }]
  }
]

// Room decor. Drop real photos into /public/images and they replace the drawn versions automatically.
export const decor = {
  // the framed shirt on the left wall
  kit: { name: 'SAT', number: '11', caption: '[CLUB] · HOME · [SEASON]', color: '#c8102e', shade: '#8e0b20', trim: '#f4efe6', photo: 'images/kit.jpg' },
  // the print next to it: put your own poster at public/images/poster-left.jpg
  print: { title: 'VOL. 01', sub: 'YOUR POSTER HERE', accent: '#7a2ea0', photo: 'images/poster-left.jpg' }
}

// Recruiter view: skills grouped the way a hiring manager scans them.
export const skills = [
  { group: 'Languages', items: ['Python', 'TypeScript', 'JavaScript', 'SQL', 'Swift', 'PHP', 'Java'] },
  { group: 'Backend', items: ['FastAPI', 'Django', 'REST APIs', 'PostgreSQL', 'Queues and retries', 'Scraping'] },
  { group: 'Data and ML', items: ['XGBoost', 'Random Forest', 'Signal processing', 'Feature engineering'] },
  { group: 'Cloud and delivery', items: ['AWS (EC2)', 'Azure', 'Docker', 'DigitalOcean', 'CI/CD', 'TestFlight'] },
  { group: 'Frontend', items: ['React', 'TypeScript', 'three.js'] }
]

// Inside the computer (Persona 5 UI).
export const experience = [
  { org: 'Loopsio', role: 'Frontend / full-stack developer', kind: 'INDUSTRY', when: '[DATES]', blurb: 'Built across a React and TypeScript client and a FastAPI backend on PostgreSQL, containerised with Docker and deployed to DigitalOcean.', stack: ['React', 'TypeScript', 'FastAPI', 'PostgreSQL', 'Docker', 'DigitalOcean'] },
  { org: 'VSD Automation', role: 'Web Developer Intern', kind: 'INDUSTRY', when: '[DATES]', blurb: 'Worked on cloud-based ETL pipelines in PHP and Python running across AWS and Azure, shipped through CI/CD.', stack: ['Python', 'PHP', 'AWS', 'Azure', 'CI/CD'] },
  { org: 'Censis AR', role: 'Team lead · university project', kind: 'TEAM OF 6', when: '3rd year', blurb: 'Led a team of six to design and ship an AR mobile app to TestFlight, gathering requirements across 12 client stakeholder sessions. Delivered 20+ features over 5 sprints with feature branching, unit testing and agile ceremonies, on SwiftUI, Django and Docker with GitLab CI/CD (80% test coverage).', stack: ['SwiftUI', 'Django', 'Docker', 'GitLab CI/CD', 'TestFlight', 'Scrum'] },
  { org: 'Univ. of Glasgow', role: 'MSci Computer Science', kind: 'EDUCATION', when: '2026', blurb: 'Integrated Masters in Computer Science. Dissertation on predicting mental fatigue from wearable HRV and skin temperature signals.', stack: ['ML', 'Systems', 'Software engineering'] }
]

// Travel journey on the Who am I screen. x / y place each stop on the map (0 to 1, left to right, top to bottom).
// It's a stylised map, not to scale: put stops where they read nicely. Add trips anywhere in the list.
export const journey = [
  { place: 'Kuala Lumpur', country: 'Malaysia', when: 'Home', note: 'Where it all started.', x: 0.8, y: 0.72 },
  { place: 'Glasgow', country: 'Scotland', when: '[YEAR] – 2026', note: 'Integrated Masters in Computer Science.', x: 0.14, y: 0.3 },
  { place: 'Edinburgh', country: 'Scotland', when: '2026 · now', note: 'Building things and job hunting.', x: 0.3, y: 0.2 },
  { place: '[A TRIP]', country: '[COUNTRY]', when: '[YEAR]', note: '[WHAT YOU GOT UP TO]', x: 0.5, y: 0.42 },
  { place: 'Next stop', country: 'Malaysia', when: 'next', note: 'Backend and AI roles back home.', x: 0.86, y: 0.58, next: true }
]

// Skills page icons. By default each skill gets a drawn icon; to use your own, map the name to an image in /public,
// e.g. { Python: 'images/icons/python.svg' }.
export const skillIcons = {}

// 3D album covers by the speaker. Drop mp3s into /public/music and covers into /public/images.
export const tracks = [
  { title: '[SONG ONE]', artist: '[ARTIST]', src: 'music/track1.mp3', cover: 'images/cover1.jpg', colors: ['#c41a2b', '#1a0507'] },
  { title: '[SONG TWO]', artist: '[ARTIST]', src: 'music/track2.mp3', cover: 'images/cover2.jpg', colors: ['#1f5bff', '#06103a'] },
  { title: '[SONG THREE]', artist: '[ARTIST]', src: 'music/track3.mp3', cover: 'images/cover3.jpg', colors: ['#e8b94a', '#3a2408'] },
  { title: '[SONG FOUR]', artist: '[ARTIST]', src: 'music/track4.mp3', cover: 'images/cover4.jpg', colors: ['#2c8f7a', '#05201b'] },
  { title: '[SONG FIVE]', artist: '[ARTIST]', src: 'music/track5.mp3', cover: 'images/cover5.jpg', colors: ['#ff7ab6', '#2a0a1c'] },
  { title: '[SONG SIX]', artist: '[ARTIST]', src: 'music/track6.mp3', cover: 'images/cover6.jpg', colors: ['#d9d2c4', '#2a241c'] }
]

// Cartridges on the desk: games you've played.
export const games = [
  { title: 'League of Legends', short: 'LEAGUE', colors: ['#0a5c7a', '#071a2a'], hours: '[HOURS]', note: 'Where the match analysis project started. [MAIN ROLE / CHAMPION]' },
  { title: '[GAME TWO]', short: '[GAME 2]', colors: ['#c41a2b', '#2a0507'], hours: '[HOURS]', note: '[WHY YOU LOVED IT]' },
  { title: '[GAME THREE]', short: '[GAME 3]', colors: ['#1f5bff', '#081640'], hours: '[HOURS]', note: '[WHY YOU LOVED IT]' },
  { title: '[GAME FOUR]', short: '[GAME 4]', colors: ['#e8b94a', '#3a2408'], hours: '[HOURS]', note: '[WHY YOU LOVED IT]' },
  { title: '[GAME FIVE]', short: '[GAME 5]', colors: ['#5b3fa8', '#140a2a'], hours: '[HOURS]', note: '[WHY YOU LOVED IT]' }
]

// Bookshelf. Hover pulls a book out, click brings it to you and opens your notes.
export const books = [
  { title: 'Designing Data-Intensive Applications', by: 'Martin Kleppmann', kind: 'book', color: '#1e2c52', ink: '#f2ece2', why: 'Building the anime app pushed me into retries, queues and task tables. This is the book everyone points to for that stuff.', stuck: '[YOUR TAKEAWAY ONCE YOU READ IT]', status: 'Up next' },
  { title: '[BOOK TITLE]', by: '[AUTHOR]', kind: 'book', color: '#5c1a22', ink: '#f3e9d6', why: '[WHY YOU PICKED IT UP]', stuck: '[ONE IDEA THAT STUCK]', status: 'Read' },
  { title: '[BOOK TITLE]', by: '[AUTHOR]', kind: 'book', color: '#d6c9b2', ink: '#2a1f18', why: '[WHY YOU PICKED IT UP]', stuck: '[ONE IDEA THAT STUCK]', status: 'Read' },
  { title: '[BOOK TITLE]', by: '[AUTHOR]', kind: 'book', color: '#2c4f45', ink: '#f3e9d6', why: '[WHY YOU PICKED IT UP]', stuck: '[ONE IDEA THAT STUCK]', status: 'Read' },
  { title: '[BOOK TITLE]', by: '[AUTHOR]', kind: 'book', color: '#7a5020', ink: '#f8f1e3', why: '[WHY YOU PICKED IT UP]', stuck: '[ONE IDEA THAT STUCK]', status: 'Reading' },
  { title: '[BOOK TITLE]', by: '[AUTHOR]', kind: 'book', color: '#151515', ink: '#d9b26b', why: '[WHY YOU PICKED IT UP]', stuck: '[ONE IDEA THAT STUCK]', status: 'Read' }
]
export const manga = [
  { title: '[MANGA A]', color: '#c41a2b', ink: '#ffffff', vols: 12 },
  { title: '[MANGA B]', color: '#1b2a5c', ink: '#ffe066', vols: 10 },
  { title: '[MANGA C]', color: '#e8b94a', ink: '#141414', vols: 14 },
  { title: '[MANGA D]', color: '#2c4f45', ink: '#ffffff', vols: 9 }
]
