# VMS Analyzer UI

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.3-646CFF?logo=vite&logoColor=white)
![MUI](https://img.shields.io/badge/MUI-6.4-007FFF?logo=mui&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-Python-009688?logo=fastapi&logoColor=white)

A web app that scrapes a company's website and uses AI to generate a detailed market analysis report — including whether the company qualifies as a vertical market software (VMS) vendor.

---

## Features

- **Website Scraper** — Input any URL and scrape up to N pages of content
- **Report Generator** — AI-powered extraction of company snapshot, products, services, and market positioning
- **Report Display** — Clean, structured view with copy and download support
- **Vertical Market Check** — Final AI verdict on whether the company is a VMS target, with reasoning

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite |
| UI | Material-UI (MUI) v6 with custom Valsoft theme |
| HTTP | Axios with request logging and 3-min timeout |
| Backend | Python FastAPI (separate repo) |

---

## Project Structure

```
VMS_UI/
├── main.py               # FastAPI entry point with CORS config
└── vms-ui/
    └── src/
        ├── App.tsx                       # Main stepper UI
        ├── components/
        │   ├── WebsiteScraper.tsx        # Step 1 — URL input & scraping
        │   ├── ReportGenerator.tsx       # Step 2 — Report generation
        │   ├── ReportDisplay.tsx         # Step 3 — Report viewer
        │   └── VerticalMarketCheck.tsx   # Step 4 — VMS determination
        └── services/
            └── api.ts                    # Axios client
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- The backend API running on `http://localhost:8000` (see backend repo)

### Frontend

```bash
cd vms-ui
npm install
npm run dev
```

App runs at `http://localhost:5173`.

### Backend API Endpoints Expected

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/scrape/scrape` | Scrape website content |
| POST | `/api/report/generate-report` | Generate analysis report |
| POST | `/api/vertical-market-check/vertical-market-check` | VMS determination |

---

## How It Works

1. Enter a company URL and set an optional page limit
2. The scraper pulls page content from the site
3. The AI generates a structured report (company name, HQ, leadership, products, positioning)
4. A final AI check determines if the company is a vertical market software vendor

---

## Learnings & Process

This project was built to streamline the manual process of researching potential acquisition targets in the vertical market software space. Key challenges included handling long scrape times (solved with a 3-minute Axios timeout and rotating loading messages) and presenting dense AI output in a readable, actionable UI.

---

## Future Improvements

- Batch URL processing (analyze multiple companies at once)
- Export reports to PDF
- Persistent history of analyzed companies
- Configurable AI prompts for different market segments
