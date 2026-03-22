# Dublin Cameras

Interactive map of Dublin's live traffic cameras. Click any camera to watch the live feed directly in the browser.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-blue?logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-yellow)

## Features

- **Live map** with camera markers across Dublin (Leaflet + React Leaflet)
- **Multiple feed types** — HLS streams, YouTube embeds, image snapshots, iframe links
- **Auto-refresh** snapshots every 10 seconds
- **Search and filter** cameras by name or road
- **Favorites** saved locally (Zustand + localStorage)
- **Dark mode** with toggle, persisted across sessions
- **Shareable URLs** — `?cam=ID` opens a specific camera
- **Online/offline status** checking for each camera
- **Collapsible sidebar** with camera list and count
- **Data source** — Transport Infrastructure Ireland (TII) GraphQL API with local fallback

## Stack

| Component | Library |
|-----------|---------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Map | Leaflet + React Leaflet |
| Video | hls.js |
| Data fetching | TanStack React Query |
| State | Zustand (with persist) |
| Styling | Tailwind CSS 4 |
| Icons | Lucide React |

## Getting Started

```bash
git clone https://github.com/gabrielcnb/dublin-cameras
cd dublin-cameras
npm install
npm run dev
```

Open **http://localhost:3000**.

## License

MIT
