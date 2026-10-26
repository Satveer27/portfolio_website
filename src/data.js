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
  basedIn: 'Glasgow, Scotland',
  photo: 'images/me.jpg', // put a photo of yourself here (portrait, roughly 4:5)
  bio: "I build APIs in Python and FastAPI, wire up data pipelines and ship ML models that actually get deployed. I build scalable systems that work in real-world environments, and I know how to develop with AI there, where I vouch for continuous improvement.",
  offClock: "Off the clock it's anime, football, League and a lot of coffee.",
  email: 'dabisama27@gmail.com',
  links: {
    email: 'mailto:dabisama27@gmail.com',
    github: 'https://github.com/Satveer27',
    linkedin: 'https://www.linkedin.com/in/satveer-ganasan-192096290/'
  }
}

// Shown on the whiteboard as self-drawing blueprints. Nodes are boxes on an 800x560 sheet.
// video: a clip in /public/videos. Leave it null and the panel shows the highlights (real numbers) instead.
export const projects = [
  {
    id: 'anime', code: '01', title: 'Anime Atlas', status: 'IN PROGRESS',
    summary: "A data platform for anime. Airflow pipelines collect data from several public sources and store the raw data in S3, then clean it and load it into a PostgreSQL database. A FastAPI service turns that data into analysis and recommendations from a user's own anime list.",
    video: null,
    blurb: 'Anime analysis platform. An ELT pipeline for 23k anime runs as separate Airflow stages (discovery, fetch, clean), pulling from the Tensei and AniList APIs plus IMDb data, archiving raw JSON to S3 and loading cleaned data into PostgreSQL on RDS. FastAPI serves the analysis, and MAL user lists power profile analysis and recommendations.',
    stack: ['Python', 'FastAPI', 'PostgreSQL', 'AWS RDS', 'S3', 'EC2', 'Airflow', 'Celery', 'Docker', 'HTTPX'],
    links: { code: 'https://github.com/Satveer27/Anime_App_Backend', live: '' },
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
    id: 'fatigue', code: '02', title: 'Fatigue Signals', status: 'MSCI DISSERTATION',
    summary: "My MSci dissertation: detecting mental fatigue from a wearable's heart-rate variability and skin temperature. I built the features, compared classical machine learning with deep learning, and showed that a carefully chosen feature set beat the deep-learning models.",
    video: null,
    blurb: 'MSci dissertation: can heart rate variability and wrist skin temperature from a wearable detect mental fatigue? On FatigueSet (12 participants, 36 sessions) a Support Vector Machine on 13 selected features reached 86.3% accuracy and F1 0.778 under leave-one-subject-out validation, well ahead of CNN, LSTM and CNN-LSTM models trained on the raw heart signal.',
    stack: ['Python', 'scikit-learn', 'SVM', 'Signal processing', 'Feature engineering'],
    links: { code: 'https://github.com/Satveer27/mental-fatigue-prediction', live: 'https://github.com/Satveer27/mental-fatigue-prediction/blob/main/paper/Predicting_mental_fatigue_research_paper.pdf' },
    liveLabel: 'READ THE PAPER',
    caption: 'DISSERTATION · METHOD',
    wave: true,
    highlights: [
      { k: '86.3%', v: 'accuracy, leave-one-subject-out (SVM, 13 features)' },
      { k: '0.778', v: 'F1 score, best configuration' },
      { k: '13 / 28', v: 'features kept after ablation: they beat the full set' },
      { k: '0.502', v: 'best F1 for CNN, LSTM and CNN-LSTM on raw RR intervals' },
      { k: '0.754', v: 'F1 for an MLP on the same features, over 5 seeds' },
      { k: '26 / 28', v: 'features differed significantly between rested and fatigued' }
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
    id: 'meter', code: '03', title: 'Smart Meter Analysis', status: 'YEAR 4 DISSERTATION',
    summary: "My fourth-year dissertation on measuring energy use. I tested software power meters against smart and traditional meters across different workloads and devices, then cleaned and analysed the data and surveyed users on usability.",
    video: null,
    blurb: 'Fourth-year dissertation on how accurately power can be measured. I logged CPU and GPU power on AMD and Intel laptops with five software meters, then compared a smart meter with a traditional one on household appliances. Analysed in pandas, plus a usability survey.',
    stack: ['Python', 'pandas', 'SciPy', 'Matplotlib', 'OpenCV', 'OpenAI'],
    links: { code: 'https://github.com/Satveer27/smart_meter_analysis', live: 'https://github.com/Satveer27/smart_meter_analysis/blob/main/dissertation.pdf' },
    liveLabel: 'READ THE DISSERTATION',
    caption: 'DISSERTATION · METHOD',
    highlights: [
      { k: '5', v: 'software power meters, on AMD and Intel machines' },
      { k: '5 min × 3', v: 'logging per load, repeated three times' },
      { k: '< 0.2 W', v: 'spread between the three AMD CPU meters' },
      { k: '7', v: 'real devices measured, from kettle to server' },
      { k: '1', v: 'usability survey of two of the meters' }
    ],
    nodes: [
      { id: 'load', x: 30, y: 40, w: 200, label: 'Test loads', sub: 'idle · stress · game · server' },
      { id: 'sw', x: 300, y: 40, w: 190, label: 'Software meters', sub: 'HWiNFO · OHM · uProf · SMI' },
      { id: 'hw', x: 570, y: 40, w: 200, label: 'Smart meter', sub: 'Kasa meter, exported' },
      { id: 'trad', x: 570, y: 210, w: 200, label: 'Traditional meter', sub: 'video → OpenAI OCR' },
      { id: 'csv', x: 300, y: 210, w: 190, label: 'Raw CSV logs', sub: '5 min per run · 3 runs' },
      { id: 'clean', x: 30, y: 210, w: 200, label: 'pandas cleaning', sub: 'aggregate per load' },
      { id: 'viz', x: 30, y: 380, w: 200, label: 'Analysis notebooks', sub: 'time series · Gaussian' },
      { id: 'use', x: 300, y: 380, w: 190, label: 'Usability survey', sub: 'Likert · HWiNFO vs OHM' }
    ],
    edges: ['M230 70 H300', 'M490 70 H570', 'M670 100 V210', 'M570 240 H490', 'M300 240 H230', 'M130 270 V380', 'M230 410 H300'],
    notes: [{ x: 770, y: 340, anchor: 'end', text: 'software vs smart vs traditional' }]
  },
  {
    id: 'ufc', code: '04', title: 'UFC Predictor', status: 'ML PIPELINE',
    summary: "A machine learning pipeline on scraped UFC data. It turns fights into fighter-versus-fighter matchups and predicts the winner, method, round and finish time, served from a Dockerised FastAPI endpoint.",
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
    id: 'censis', code: '05', title: 'Censis AR', status: 'TEAM LEAD',
    summary: "I led the team that built an augmented reality iOS app for a nonprofit client and delivered it to TestFlight. I gathered requirements with the client, ran the sprints and kept the work tested and automated with CI/CD.",
    video: 'videos/censis.mp4',
    image: 'images/projects/censis.jpg', // a screenshot for the Recruiter view: shows in the card and pops out on hover
    blurb: 'Led a team of six to design and ship an augmented reality app to TestFlight for a nonprofit client, gathering requirements across 12 stakeholder sessions. 20+ features over 5 sprints with feature branching, unit tests and agile ceremonies, on a SwiftUI, Django and Docker stack with GitLab CI/CD.',
    stack: ['SwiftUI', 'Django', 'Docker', 'GitLab CI/CD', 'TestFlight', 'Scrum'],
    links: { code: '', live: 'papers/censis-team-project.pdf' },
    liveLabel: 'READ THE REPORT',
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
  },
  {
    id: 'wad', code: '06', title: 'WAD Car Market', status: 'YEAR 2 · TEAM',
    summary: "A second-year web development team project: an online car marketplace in Django where people list cars, browse by brand, save favourites and message sellers. I was the lead contributor.",
    video: null,
    image: 'images/projects/wad-car-market.png',
    blurb: 'Second-year Web App Development team project: an online car marketplace in Django. Users register, list cars to sell, browse new and used cars by brand, save favourites to a wishlist and message sellers. Four Django apps (core, cars, accounts, messaging) on SQLite. I wrote 52 of the repo\'s 95 commits.',
    stack: ['Python', 'Django', 'SQLite', 'HTML/CSS', 'JavaScript', 'Pillow'],
    links: { code: 'https://github.com/Satveer27/WAD_Car_Market', live: '' },
    caption: 'WEB APP · ARCHITECTURE',
    highlights: [
      { k: '4', v: 'Django apps: core, cars, accounts and messaging' },
      { k: '10', v: 'car brands, each with its own model list' },
      { k: '52 / 95', v: 'commits in the repo are mine' },
      { k: '1', v: 'lab-group team project for Web App Development' }
    ],
    nodes: [
      { id: 'user', x: 30, y: 40, w: 200, label: 'Buyer / seller', sub: 'browser' },
      { id: 'url', x: 300, y: 40, w: 190, label: 'URL routing', sub: 'one urls.py per app' },
      { id: 'acc', x: 570, y: 40, w: 200, label: 'accounts app', sub: 'register · login · wishlist' },
      { id: 'cars', x: 570, y: 210, w: 200, label: 'cars app', sub: 'browse · sell · details' },
      { id: 'msg', x: 570, y: 380, w: 200, label: 'messaging app', sub: 'message the seller' },
      { id: 'orm', x: 300, y: 210, w: 190, label: 'Django ORM', sub: 'User · UserProfile · Car' },
      { id: 'db', x: 30, y: 210, w: 200, label: 'SQLite', sub: 'users · cars · wishlists' },
      { id: 'media', x: 300, y: 380, w: 190, label: 'Media files', sub: 'car photos · profile pics' }
    ],
    edges: ['M230 70 H300', 'M490 70 H570', 'M670 100 V210', 'M670 270 V380', 'M570 240 H490', 'M300 240 H230', 'M395 270 V380'],
    notes: [{ x: 395, y: 180, anchor: 'middle', text: 'templates render every page' }]
  }
]

// Room decor. Drop real photos into /public/images and they replace the drawn versions automatically.
export const decor = {
  // the framed shirt on the left wall
  kit: { name: 'SALAH', number: '11', caption: 'LIVERPOOL · HOME', color: '#c8102e', shade: '#8e0b20', trim: '#f4efe6', photo: 'images/kit.jpg' },
  // the print on the right wall: a JoJo-style poster at public/images/poster-left.jpg (swap in your own)
  print: { title: 'VOL. 01', sub: 'YOUR POSTER HERE', accent: '#7a2ea0', photo: 'images/poster-left.jpg' }
}

// Recruiter view: skills grouped the way a hiring manager scans them.
export const skills = [
  { group: 'Languages', items: ['Python', 'JavaScript', 'SQL', 'Swift', 'PHP', 'Java'] },
  { group: 'Backend', items: ['FastAPI', 'Django', 'REST APIs', 'JWT auth', 'PostgreSQL', 'Celery', 'Redis', 'Airflow', 'Scraping'] },
  { group: 'Data and ML', items: ['pandas', 'scikit-learn', 'Hugging Face models', 'XGBoost', 'Random Forest', 'SVM', 'LLM fine-tuning', 'CNNs', 'OpenCV', 'Signal processing', 'Feature engineering'] },
  { group: 'Cloud and delivery', items: ['EC2', 'Azure', 'Docker', 'DigitalOcean', 'CI/CD', 'TestFlight'] },
  { group: 'Frontend', items: ['SwiftUI', 'React Native', 'React', 'Redux'] }
]

// Inside the computer (Persona 5 UI).
export const experience = [
  {
    org: 'VSD Automation', role: 'Software engineer intern', kind: 'INDUSTRY', when: 'June – Sept 2024', where: 'Selangor, Malaysia',
    blurb: 'Owned the full backend for a website that scans product images and returns statistical ROI analysis, plus the ETL pipeline and a fine-tuned LLM behind it.',
    figs: [{ k: '97%', v: 'LLM extraction accuracy' }, { k: '100', v: 'customers at launch' }, { k: '100%', v: 'of the backend owned' }],
    points: [
      'Owned the full backend for a website that scans product images and returns statistical ROI analysis: PHP for the backend and Python for the ETL pipeline, both deployed on an Azure VM.',
      'Built the ETL pipeline that cleans, aggregates and preprocesses image data before an Azure AI model extracts the information, supporting an initial user base of 100 customers.',
      'Fine-tuned an LLM to extract product information from user-submitted images, reaching 97% extraction accuracy.'
    ],
    stack: ['PHP', 'Python', 'ETL', 'Azure VM', 'Azure AI', 'LLM fine-tuning']
  },
  {
    org: 'Loopsio', role: 'Backend developer', kind: 'INDUSTRY · TEAM OF 2', when: 'Jan – July 2025',
    blurb: 'Led backend development for a full-stack client web application: API design, database schema and deployment.',
    figs: [{ k: '16', v: 'table schema designed' }, { k: '20+', v: 'features shipped' }, { k: '2', v: 'person team' }],
    points: [
      'Led backend development for a full-stack client web application in a two-person team, owning API design and the database schema: FastAPI, JWT auth, PostgreSQL and Docker.',
      'Defined API contracts with the frontend developer before implementation, cutting integration rework and letting 20+ features ship without breaking production.',
      'Designed a 16-table schema balancing normalisation with query performance, and set up GitHub Actions deployments to DigitalOcean plus structured logging for observability.'
    ],
    stack: ['FastAPI', 'JWT', 'PostgreSQL', 'Docker', 'GitHub Actions', 'DigitalOcean']
  },
  {
    org: 'GU Orbit', role: 'Software engineer · deep learning', kind: 'TEAM PROJECT', when: 'Sept 2023 – Aug 2025',
    blurb: 'Designed and implemented a CNN-based image compression model as part of a software engineering team.',
    points: [
      'Worked in a software engineering team to design and implement a deep learning image compression model built on convolutional neural networks (CNNs).',
      'Researched state-of-the-art compression techniques to improve compression efficiency and image recovery accuracy.',
      'Developed and trained custom CNN architectures for compression and reconstruction, minimising data loss while preserving image quality.',
      'Explored new CNN-based feature extraction and encoding approaches to beat traditional compression in real-world scenarios.'
    ],
    stack: ['Deep learning', 'CNNs', 'Image compression', 'Research']
  }
]

// The MSci at the University of Glasgow, year by year (its own section, separate from experience).
// Same shape as experience so the Persona screen can reuse the list + dossier layout: org = the heading, role = the one-liner.
export const education = [
  { org: 'Second year', role: 'Java, OOP and a team web app', kind: 'UNIVERSITY OF GLASGOW', when: 'Year 2', blurb: 'At the University of Glasgow I built a lot in Java and learned object-oriented programming properly. In the Web App Development course I worked with a few teammates on WAD Car Market, a Django car marketplace you can browse the blueprint of on the whiteboard.', stack: ['Java', 'OOP', 'Python', 'Django', 'HTML/CSS', 'Git'] },
  { org: 'Third year', role: 'Censis client project and data fundamentals', kind: 'UNIVERSITY OF GLASGOW', when: 'Year 3', blurb: 'Worked with a real client to build the Censis AR app, learning a lot of Swift building it in SwiftUI. Alongside it I learned the fundamentals of data: vectorisation, matrix decomposition, optimisation and objective functions.', stack: ['Swift', 'SwiftUI', 'Django', 'Vectorisation', 'Matrix decomposition', 'Optimisation'] },
  { org: 'Fourth year', role: 'Dissertation on smart meters', kind: 'UNIVERSITY OF GLASGOW', when: 'Year 4', blurb: 'Dissertation on smart meters, covering both the physical meters and the software that measures power. I ran the experiments, gathered the data and did the analysis. The code and data are on GitHub and the project is on the whiteboard.', stack: ['Data analysis', 'Python', 'Smart meters'] },
  { org: 'Fifth year', role: 'Data science and mental fatigue', kind: 'UNIVERSITY OF GLASGOW', when: 'Year 5', blurb: 'More focused on data science: cleaning the data, identifying the features that matter and taking a careful, honest approach to predicting mental fatigue from wearable signals. The dissertation and code are on GitHub.', stack: ['Python', 'scikit-learn', 'Feature engineering', 'Data cleaning'] }
]

// Journey on the Who am I screen. x / y place each stop on the map (0 to 1, left to right, top to bottom).
// It's a stylised map, not to scale: put stops where they read nicely.
export const journey = [
  { place: 'Kuala Lumpur', country: 'Malaysia', when: 'Home', note: 'Where it all started.', x: 0.8, y: 0.72 },
  { place: 'Glasgow', country: 'Scotland', when: 'Studying', note: 'Integrated Masters in Computer Science at the University of Glasgow.', x: 0.14, y: 0.3 },
  { place: 'Asia', country: '', when: 'next', note: 'Heading back.', x: 0.88, y: 0.5, next: true }
]

// Skills page icons. By default each skill gets a drawn icon; to use your own, map the name to an image in /public,
// e.g. { Python: 'images/icons/python.svg' }.
export const skillIcons = {
  Python: 'images/icons/python.svg', TypeScript: 'images/icons/typescript.svg', JavaScript: 'images/icons/javascript.svg', Swift: 'images/icons/swift.svg',
  PHP: 'images/icons/php.svg', Java: 'images/icons/java.svg', FastAPI: 'images/icons/fastapi.svg', Django: 'images/icons/django.svg',
  PostgreSQL: 'images/icons/postgresql.svg', EC2: 'images/icons/awsec2.svg', Docker: 'images/icons/docker.svg',
  DigitalOcean: 'images/icons/digitalocean.svg', 'CI/CD': 'images/icons/cicd.svg', React: 'images/icons/react.svg', 'three.js': 'images/icons/threejs.svg'
}

// The record player plays three original jazz trios generated live in the browser (see scene/jazz.js), so there are no audio files.
export const tracks = [
  { title: 'Lamp Light', artist: "Sat's Room Trio", key: 'lamp', colors: ['#c41a2b', '#1a0507'] },
  { title: 'Glasgow Rain', artist: "Sat's Room Trio", key: 'rain', colors: ['#1f5bff', '#06103a'] },
  { title: 'Sunday Walk', artist: "Sat's Room Trio", key: 'walk', colors: ['#e8b94a', '#3a2408'] }
]

// Cartridges on the desk: games you've played.
export const games = [
  { title: 'League of Legends', short: 'LEAGUE', colors: ['#0a5c7a', '#071a2a'], note: "Jungle main, and Jarvan IV is my pick. League taught me to think while the game is still moving: tracking the whole map, weighing a risk, committing to a plan and adjusting when it falls apart. I love that it makes you think under pressure." },
  { title: 'Elden Ring', short: 'ELDEN RING', colors: ['#c9a25a', '#1a1408'], note: "I loved it for the big world. An enormous open map where every ridge, ruin and cave could hide a boss or a secret, and getting lost was half the fun. It made exploring feel like an adventure." },
  { title: 'God of War Ragnarök', short: 'GOD OF WAR', colors: ['#9aa3ad', '#14181d'], note: "The UI. It's clean and readable, stays out of the way in big fights and still tells you everything you need. A game that looks this good with an interface this good is rare." },
]

// Bookshelf. Hover pulls a book out, click brings it to you and opens your notes.
// Each item is one spine. notes = the [label, text] rows shown on the open page. Add more as you read more.
export const shelf = [
  { title: 'Designing Data-Intensive Applications', by: 'Martin Kleppmann', kind: 'book', color: '#1e2c52', ink: '#f2ece2', notes: [['WHY I PICKED IT UP', 'Building the anime app pushed me into retries, queues and task tables. This is the book everyone points to for that stuff.'], ['STATUS', 'Currently reading']] },
  { title: 'Vinland Saga', by: 'Makoto Yukimura', kind: 'manga', color: '#2a3f55', ink: '#e8dcc0', notes: [['WHAT GOT ME INTO IT', "The character writing. Nobody here is just a hero or a villain: Askeladd is a cunning, charming mercenary you can't stop watching, and Thorfinn grows from a kid obsessed with revenge into someone you genuinely root for. Every character has a reason, and that's what pulled me in."], ['BEST ARC', "The Prelude arc. It's where all of that is set up: Thorfinn's father, Askeladd's band, the revenge that drives Thorfinn, and the relationships that make everything after it hit so hard."], ['VOLUMES READ', 'Complete']] },
  { title: "JoJo's Bizarre Adventure", by: 'Hirohiko Araki', kind: 'manga', color: '#7a2ea0', ink: '#ffe066', notes: [['WHAT GOT ME INTO IT', "The art style. Araki's bold, fashion-magazine linework, the impossible poses and the colour make every panel look like a poster. I picked it up for the art and stayed for everything else."], ['BEST PART', "Part 7, Steel Ball Run. A cross-America horse race with Johnny and Gyro, a tighter story than the earlier parts, and the art at its sharpest."], ['VOLUMES READ', 'All 7 parts']] },
  { title: 'Hunter x Hunter', by: 'Yoshihiro Togashi', kind: 'manga', color: '#2c6b3a', ink: '#ffffff', notes: [['WHAT GOT ME INTO IT', "The power system. Nen is built on rules, limits and conditions, so fights are won by being smarter about how you use your ability, not just by being stronger. It's the best-designed power system I've read."], ['FAVOURITE ARC', "Yorknew. The Phantom Troupe, Kurapika's revenge and the auction, with everyone out-thinking everyone else. It's where the power system gets used best."], ['VOLUMES READ', 'All of them']] },
  { title: 'Berserk', by: 'Kentaro Miura', kind: 'manga', color: '#0f0f0f', ink: '#c9a25a', notes: [['WHAT GOT ME INTO IT', "Guts' greatsword and armour. The Dragonslayer is an absurd slab of iron that no normal person could swing, and the armour makes him look like a walking war crime. One look at that design and I had to read it."], ['STATUS', 'Currently reading']] }
]
