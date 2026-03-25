# Image Colors Extractor

A web application built with **Vue 3** + **TypeScript** + **Vite** that extracts every unique color from an image and lets you download the result as a `.txt` file.

🔗 **[Live demo](https://robinferrari.ch/image-colors-extractor/)**

## Features

- Upload any image directly in the browser (no server required)
- Scans every pixel and collects all unique hex color codes
- Displays a real-time progress bar during extraction
- Shows the total number of distinct colors found
- Detects dominant palette colors using [node-vibrant](https://github.com/Vibrant-Colors/node-vibrant) (Vibrant, Muted, Dark Vibrant, etc.)
- Downloads the full color list as a plain-text file (`imageData.txt`)

> ⚠️ **Performance note** — processing a large image (e.g. 1900×1258 px) can take around 10 minutes. You can stop the extraction at any time.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Vue 3 (Composition API, `<script setup>`) |
| Language | TypeScript |
| Build tool | Vite |
| Color palette | node-vibrant v4 |
| File download | file-saver |
| Unit tests | Vitest + Vue Test Utils |
| E2E tests | Playwright |
| Linting | ESLint + oxlint |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) ≥ 18
- [pnpm](https://pnpm.io/)

### Install dependencies

```sh
pnpm install
```

### Start the development server

```sh
pnpm dev
```

The app will be available at `http://localhost:5173`.

### Build for production

```sh
pnpm build
```

### Preview the production build

```sh
pnpm preview
```

## Testing

### Unit tests (Vitest)

```sh
pnpm test:unit
```

### End-to-end tests (Playwright)

```sh
pnpm test:e2e
```

### Lint

```sh
pnpm lint
```

## How It Works

1. Pick an image using the file input.
2. The image is drawn onto an off-screen `<canvas>` element.
3. The app reads pixel data line by line via `CanvasRenderingContext2D.getImageData()`, converting each pixel to a hex code and storing it in a `Set` (ensuring uniqueness).
4. node-vibrant independently analyses the image to extract a dominant color palette.
5. Once extraction is complete (or stopped manually), you can download all collected hex codes as a comma-separated `.txt` file.

## License

MIT

```sh
# Install browsers for the first run
npx playwright install

# When testing on CI, must build the project first
pnpm build

# Runs the end-to-end tests
pnpm test:e2e
# Runs the tests only on Chromium
pnpm test:e2e --project=chromium
# Runs the tests of a specific file
pnpm test:e2e tests/example.spec.ts
# Runs the tests in debug mode
pnpm test:e2e --debug
```

### Lint with [ESLint](https://eslint.org/)

```sh
pnpm lint
```
