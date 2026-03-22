# Dublin Cameras

Interactive map of Dublin's live traffic cameras. Click any camera marker to watch the live HLS stream directly in the browser.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-blue?logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38bdf8?logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-yellow)

## Features

- **Live map** with camera markers across Dublin (Leaflet + React Leaflet)
- **HLS video streams** played directly in the browser (hls.js)
- **Real-time data** fetched from Dublin's traffic camera API (React Query)
- **Fast state management** with Zustand
- **Responsive UI** built with Tailwind CSS

## Stack

| Component | Library |
|-----------|---------|
| Framework | Next.js 14 |
| Language | TypeScript |
| Map | Leaflet + React Leaflet |
| Video | hls.js |
| Data fetching | @tanstack/react-query |
| State | Zustand |
| Styling | Tailwind CSS |

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
