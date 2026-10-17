# Rounding Maze — installable iPad web game

## Publish using GitHub Pages

1. Create a **public** GitHub repository named `rounding-maze`.
2. Upload the **contents** of this folder to the repository root (not a nested folder).
3. In the repository open **Settings → Pages**.
4. Under Build and deployment choose **Deploy from a branch**, `main`, `/ (root)` and save.
5. Wait for deployment, then visit `https://YOUR-GITHUB-USERNAME.github.io/rounding-maze/`.
6. On the child's iPad open that link in Safari, tap Share → Add to Home Screen, enable Open as Web App if prompted, and tap Add.
7. Launch once while online. After the service worker installs and caches files, the app works offline. Verify by enabling Airplane Mode and relaunching.

## Features

- Practice (15×15), Grand (23×23), Expert (31×31)
- Perfect mazes: exactly one route between any two floor tiles, with a visible treasure
- Single forward corridor: correct answer required to move
- Intersection: each direction has an answer; any choice moves, without immediate right/wrong feedback
- Player-initiated turn-around: each backward step requires a newly generated correct answer
- Progressive (10s → 100s → mixed), random mix, 10s-only, 100s-only
- Local automatic saving of current maze, position, questions, progress, and achievements
- Offline installable PWA, no login, no analytics

## Notes

The web app stores data only in this browser's local storage. Clearing website data or deleting the app can erase progress. GitHub Pages is a public website; do not put children's personal information in the repository. PWA offline mode needs HTTPS or localhost and a successful first online load. Opening index.html directly works on desktop browsers, but does not install offline caching.
