# PlanetPulse

PlanetPulse is a climate-tech web application for tracking personal carbon emissions from travel, transport, electricity, and meals.

---

## Features

- **Activity logging**: Intuitive logging form supporting six core daily activity types with dynamic unit binding and timezone-safe date picking.
- **Automatic CO₂ calculation**: Real-time live estimate in the UI, with authoritative, tamper-proof calculations enforced server-side.
- **Six supported activity types**: Comprehensive coverage of everyday emissions: Travel (car), Bus, Flight, Electricity, Vegetarian Meal, and Non-Vegetarian Meal.
- **Weekly dashboard**: Real-time overview of current emissions, budget status, and activity summaries.
- **Weekly target**: Configurable, persistent weekly carbon budget (defaults to 20 kg CO₂/week) stored in MongoDB Settings.
- **Target progress**: Visual progress bar tracking percentage of weekly budget utilized and remaining carbon headroom.
- **Target exceeded nudge**: Constructive, non-shaming, non-blocking alert surfacing actionable steps when weekly emissions exceed the target.
- **Category breakdown**: Visual distribution across all six emission categories, always displaying all categories even when emissions are zero.
- **Seven-day weekly chart**: Interactive bar chart plotting daily emissions across Monday through Sunday.
- **Activity history**: Searchable, paginated log of all past emissions records with details on date, category, volume, and calculated impact.
- **Activity filtering**: Real-time server-side filtering by activity type.
- **Date filtering**: Server-side filtering by custom date ranges with inclusive boundaries (`from` and `to`).
- **Unusual-input warning**: Soft confirmation modal for unusually large quantities preventing accidental typos without artificial clamping or data mutation.
- **Monday–Sunday week**: Strict, authoritative calendar week accounting running from Monday 00:00:00 UTC through Sunday 23:59:59 UTC.
- **Responsive interface**: Mobile-first design accommodating viewports from 320px mobile phones to widescreen 1440px desktops.
- **Accessible UI**: Semantic HTML5 elements, high-contrast focus rings, screen reader announcements (`aria-live`), and full keyboard navigation.

---

## Supported Activities

| Activity | Unit | CO₂ Factor | Description |
|---|---|---|---|
| **Travel** | km | `0.20 kg CO₂/km` | Personal car or vehicle commute |
| **Bus** | km | `0.08 kg CO₂/km` | Public bus transit |
| **Flight** | km | `0.25 kg CO₂/km` | Commercial passenger flights |
| **Electricity** | kWh | `0.80 kg CO₂/kWh` | Household/facility electrical grid consumption |
| **Veg Meal** | meal | `0.5 kg CO₂/meal` | Plant-based / vegetarian meal |
| **Non-Veg Meal** | meal | `2.0 kg CO₂/meal` | Meat or poultry meal |

### Calculation Formula
$$\text{CO₂ (kg)} = \text{quantity} \times \text{emission factor}$$

> **Backend Calculation is Authoritative**: The frontend calculates a live preview for instant user feedback, but the backend server independently computes and persists the official CO₂ emission value when storing the record. Any client-provided CO₂ or unit values in the request payload are discarded.

---

## Tech Stack

### Frontend
- **React** (v19.0.0) — Modern UI library using functional components and hooks
- **Vite** (v6.1.0) — Fast frontend development environment and production bundler
- **Tailwind CSS** (v3.4.17) — Utility-first CSS framework styled with custom climate-tech design tokens
- **React Router** (v7.1.5) — Client-side declarative routing
- **Axios** (v1.7.9) — Promise-based HTTP client for REST API communication
- **Recharts** (v2.15.1) — Composable SVG charting library for weekly and daily visualizations
- **Lucide React** (v0.475.0) — Clean, modern icon set

### Backend
- **Node.js** (v20+ / v22+) — Server-side JavaScript runtime
- **Express.js** (v4.21.2) — Fast, minimalist web framework for RESTful APIs
- **MongoDB** — Document-oriented NoSQL database
- **Mongoose** (v8.9.5) — Elegant MongoDB object modeling and schema validation

### Testing & Tooling
- **Jest** (v29.7.0) & **Supertest** (v7.0.0) — Backend unit and API integration testing
- **MongoDB Memory Server** (v10.1.3) — In-memory database for isolated automated testing
- **Vitest** (v5.0.1) — Blazing fast unit testing framework for frontend utilities and logic
- **Oxlint** (v1.85.0) — High-performance JavaScript/React linter

### Planned Deployment (Phase 12)
- **MongoDB Atlas** — Managed cloud database
- **Render** — Backend web service deployment
- **Vercel** — Static frontend deployment and CDN distribution

---

## Project Structure

```text
planetpulse/
├── client/                               # Frontend application (React + Vite)
│   ├── public/                           # Static assets
│   ├── src/
│   │   ├── assets/                       # Images and SVG assets
│   │   ├── components/                   # Reusable UI components
│   │   │   ├── activity/                 # Activity logging components
│   │   │   │   ├── ActivitySuccess.jsx
│   │   │   │   ├── ActivityTypeSelect.jsx
│   │   │   │   ├── Co2Preview.jsx
│   │   │   │   ├── DateInput.jsx
│   │   │   │   └── QuantityInput.jsx
│   │   │   ├── dashboard/                # Dashboard subcomponents
│   │   │   │   ├── CategoryBreakdown.jsx
│   │   │   │   ├── DailyBreakdown.jsx
│   │   │   │   ├── DashboardError.jsx
│   │   │   │   ├── DashboardHeader.jsx
│   │   │   │   ├── DashboardSkeleton.jsx
│   │   │   │   ├── ProgressCard.jsx
│   │   │   │   ├── RecentActivities.jsx
│   │   │   │   ├── SummaryCards.jsx
│   │   │   │   ├── TargetEditModal.jsx
│   │   │   │   └── TargetExceededNudge.jsx
│   │   │   ├── history/                  # History and filtering components
│   │   │   │   ├── HistoryEmptyState.jsx
│   │   │   │   ├── HistoryError.jsx
│   │   │   │   ├── HistoryFilters.jsx
│   │   │   │   ├── HistoryHeader.jsx
│   │   │   │   ├── HistoryList.jsx
│   │   │   │   └── HistorySkeleton.jsx
│   │   │   ├── AbsurdInputDialog.jsx     # DP2 warning dialog
│   │   │   ├── CarbonNudge.jsx           # DP1 nudge component
│   │   │   ├── CategoryChart.jsx         # Category breakdown chart
│   │   │   ├── ConfirmModal.jsx          # Accessible confirmation dialog
│   │   │   ├── DailyChart.jsx            # 7-day bar chart
│   │   │   ├── Navbar.jsx                # Responsive header and navigation
│   │   │   ├── RecentActivities.jsx      # Recent activities feed
│   │   │   ├── StatCard.jsx              # Reusable metric card
│   │   │   ├── Toast.jsx                 # Live notification toast
│   │   │   └── WeeklyProgressBar.jsx     # Weekly budget progress bar
│   │   ├── pages/                        # Page-level route views
│   │   │   ├── Dashboard.jsx
│   │   │   ├── History.jsx
│   │   │   └── LogActivity.jsx
│   │   ├── services/
│   │   │   └── api.js                    # Axios API client
│   │   ├── utils/
│   │   │   ├── carbonFactors.js          # Client-side factors & calculation
│   │   │   ├── formatters.js             # Number, date & unit formatters
│   │   │   └── unusualActivity.js        # DP2 threshold definitions
│   │   ├── App.css
│   │   ├── App.jsx                       # Root router configuration
│   │   ├── index.css                     # Tailwind & global CSS rules
│   │   └── main.jsx                      # Client application entry point
│   ├── tests/                            # Frontend Vitest test suites
│   │   ├── carbonFactors.test.js
│   │   ├── formatters.test.js
│   │   └── unusualActivity.test.js
│   ├── .env.example                      # Client environment template
│   ├── index.html                        # HTML entry point
│   ├── package.json                      # Client scripts and dependencies
│   ├── postcss.config.js
│   ├── tailwind.config.js                # Custom color palette and fonts
│   └── vite.config.js                    # Vite configuration
│
├── server/                               # Backend application (Express + Node.js)
│   ├── config/
│   │   └── db.js                         # MongoDB connection manager
│   ├── controllers/
│   │   ├── activityController.js         # Activity CRUD and filtering logic
│   │   ├── dashboardController.js        # Weekly aggregation engine
│   │   └── targetController.js           # Target retrieval and update logic
│   ├── middleware/
│   │   └── errorHandler.js               # Global error handling middleware
│   ├── models/
│   │   ├── Activity.js                   # Activity Mongoose schema
│   │   └── Settings.js                   # Settings singleton schema
│   ├── routes/
│   │   ├── activityRoutes.js             # /api/activities route definitions
│   │   ├── dashboardRoutes.js            # /api/dashboard route definitions
│   │   └── targetRoutes.js               # /api/target route definitions
│   ├── services/
│   │   ├── carbonService.js              # Authoritative emission factors & logic
│   │   └── dateService.js                # Monday–Sunday weekly cycle calculations
│   ├── tests/                            # Backend Jest test suites
│   │   ├── api.test.js
│   │   ├── carbonService.test.js
│   │   ├── comprehensiveRegression.test.js
│   │   ├── dashboard.test.js
│   │   ├── dateService.test.js
│   │   ├── decisionPoints.test.js
│   │   └── validators.test.js
│   ├── utils/
│   │   └── validators.js                 # Validation and sanitizer functions
│   ├── .env.example                      # Server environment template
│   ├── package.json                      # Server scripts and dependencies
│   └── server.js                         # Express server bootstrap
│
├── .env.example                          # Root environment configuration template
├── .gitignore                            # Git ignore rules
├── API.md                                # Comprehensive API reference
├── DECISIONS.md                          # Documented architectural decision points
├── DEMO_SCRIPT.md                        # 3–5 minute presentation demo script
├── README.md                             # Main project documentation
├── TESTING.md                            # Complete testing documentation & audit
└── package.json                          # Root repository orchestration scripts
```

---

## Getting Started

Follow these steps to run PlanetPulse locally:

### 1. Clone the Project
```bash
git clone <repository-url>
cd planetpulse
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` in both the `server/` and `client/` directories:
```bash
# Server configuration
cp server/.env.example server/.env

# Client configuration
cp client/.env.example client/.env
```

### 3. Install Backend Dependencies
```bash
cd server
npm install
```

### 4. Install Frontend Dependencies
```bash
cd ../client
npm install
```

### 5. Start MongoDB
Ensure MongoDB is running locally on `localhost:27017` (default port):
```bash
# Example if using mongod service:
mongod --dbpath /data/db
```
*(Note: If a local MongoDB instance is not detected, PlanetPulse automatically falls back to an in-memory database so development is never blocked).*

### 6. Start the Backend Server
In your first terminal:
```bash
cd server
npm run dev
# or: npm start
```
The server starts at `http://localhost:5000`.

### 7. Start the Frontend Client
In a second terminal:
```bash
cd client
npm run dev
```
The Vite development server runs at `http://localhost:5173`. Open your browser and navigate to `http://localhost:5173`.

#### Alternative (Root Scripts)
You can also run commands from the repository root:
```bash
npm run dev:server   # Starts backend server
npm run client       # Starts frontend client
```

---

## Environment Variables

PlanetPulse uses environment variables to configure ports, database connections, and API endpoints.

A template is provided at `.env.example`:

### Backend Variables (`server/.env`)
| Variable | Description | Default Example |
|---|---|---|
| `PORT` | Port for the Express backend server | `5000` |
| `MONGODB_URI` | MongoDB connection string (local or Atlas) | `mongodb://localhost:27017/planetpulse` |
| `CLIENT_URL` | Frontend origin for CORS whitelist | `http://localhost:5173` |

### Frontend Variables (`client/.env`)
| Variable | Description | Default Example |
|---|---|---|
| `VITE_API_URL` | Base URL of the backend API endpoints | `http://localhost:5000/api` |

> **Security Note**: Never commit `.env` files with production credentials or sensitive keys to version control. The repository `.gitignore` ensures that all `.env` files are ignored while keeping `.env.example` tracked.

---

## Application Routes

PlanetPulse provides the following frontend application routes:

- `/` → **Dashboard**: Executive weekly footprint overview, target progress, charts, and recent activity.
- `/dashboard` → **Dashboard**: Alias route to the main dashboard.
- `/log` → **Activity Logging**: Interactive form to record activities with live CO₂ calculation previews.
- `/history` → **Activity History**: Searchable list of all logged activities with type and date filters.
- `*` → **Fallback Route**: Any unknown route gracefully redirects to the Dashboard (`/`).

---

## API Overview

The backend exposes the following RESTful endpoints under `/api`:

| Method | Endpoint | Purpose | Request Body / Query Params | Important Response Fields | Validation Behavior |
|---|---|---|---|---|---|
| `GET` | `/api/health` | Service uptime & status | None | `success`, `message` | None |
| `POST` | `/api/activities` | Create activity | `{ type, quantity, date }` | `success`, `data` (`_id`, `unit`, `co2`, `date`) | Strict validation: type in 6 supported, quantity > 0, valid date. Discards client `co2`/`unit`. |
| `GET` | `/api/activities` | List & filter activities | Query: `type`, `from`, `to` | `success`, `count`, `data` (sorted newest first) | Validates type filter and checks `from <= to`. Inclusive date range. |
| `GET` | `/api/activities/:id` | Fetch single activity | Param: `id` | `success`, `data` | Validates 24-char ObjectId format. Returns 404 if not found. |
| `DELETE` | `/api/activities/:id` | Delete an activity | Param: `id` | `success`, `message`, `data.id` | Validates ObjectId format. Returns 404 if not found. |
| `GET` | `/api/target` | Fetch weekly target | None | `success`, `data.weeklyTarget` | Returns active target from Settings (default 20). |
| `PUT` | `/api/target` | Update weekly target | `{ weeklyTarget }` | `success`, `data.weeklyTarget` | Validates positive, finite number > 0. Rejects 0, negatives, strings. |
| `GET` | `/api/dashboard` | Weekly aggregation | None | `success`, `data` (`week`, `totalCO2`, `weeklyTarget`, `percentage`, `remaining`, `exceededBy`, `targetExceeded`, `categoryBreakdown`, `dailyBreakdown`, `recentActivities`) | Computes authoritative Monday–Sunday metrics for current week. |

*For complete schema specifications, sample payloads, and error codes, refer to [API.md](API.md).*

---

## Carbon Calculation

All greenhouse gas calculations adhere strictly to the formula:

$$\text{CO₂ (kg)} = \text{quantity} \times \text{emission factor}$$

The six authoritative conversion factors are:
1. **Travel**: `0.20 kg CO₂ / km`
2. **Bus**: `0.08 kg CO₂ / km`
3. **Flight**: `0.25 kg CO₂ / km`
4. **Electricity**: `0.80 kg CO₂ / kWh`
5. **Veg Meal**: `0.50 kg CO₂ / meal`
6. **Non-Veg Meal**: `2.00 kg CO₂ / meal`

**Source of Truth**: The backend (`server/services/carbonService.js`) is the authoritative source for carbon emissions calculations. The frontend calculates an estimated preview for immediate feedback, but the backend recalculates and stores the authoritative value in MongoDB upon activity creation.

---

## Weekly Progress

PlanetPulse organizes emission tracking on a weekly basis:
- **Weekly Definition**: The calendar week starts on **Monday at 00:00:00.000 UTC** and ends on **Sunday at 23:59:59.999 UTC**.
- **Dashboard Scope**: The dashboard counts only activities recorded within the current Monday–Sunday weekly window.
- **History Scope**: Activity History (`/history`) displays all recorded activities across all weeks.
- **Target Progress**: Calculated as:
  $$\text{Target Percentage} = \frac{\text{weeklyCO2}}{\text{weeklyTarget}} \times 100\%$$
- **Target Boundary**: Exactly reaching the weekly target (`weeklyCO2 === weeklyTarget`) is **NOT** considered exceeded.
- **Target Exceeded**: A target is exceeded strictly when:
  $$\text{weeklyCO2} > \text{weeklyTarget}$$

---

## Decision Points

PlanetPulse implements three core architectural and product decisions:

- **DP1 — The Nudge**: When weekly emissions exceed the target, the application displays an informative, constructive, and non-blocking nudge. It never shames the user, locks navigation, or blocks further activity logging.
- **DP2 — Absurd Input Handling**: Unusually large inputs (e.g. flights > 50,000 km) trigger an accessible confirmation dialog requiring explicit confirmation. Input is never silently modified or automatically clamped; legitimate large values can be recorded upon user confirmation.
- **DP3 — Authoritative Week**: Carbon cycles strictly adhere to Monday through Sunday. The backend is the authoritative source for week calculation and provides all seven daily values (with zero-filled days).

*For full details on thresholds, UX flows, and rationale, refer to [DECISIONS.md](DECISIONS.md).*

---

## Testing

PlanetPulse includes automated test suites across both backend and frontend layers:

- **119 Backend Tests** (Jest + Supertest): Unit tests for carbon calculations, input validation, and date calculations; integration tests for all REST endpoints and dashboard aggregations.
- **35 Frontend Tests** (Vitest): Unit tests for carbon preview calculations, dynamic formatters, timezone safety, and DP2 outlier detection.
- **Total: 154 Passing Automated Test Assertions**.

### Running Tests
Execute tests via root npm scripts:
```bash
# Run both backend and frontend tests
npm test

# Run backend tests only
npm run test:server

# Run frontend tests only
npm run test:client

# Run code linter
npm run lint
```

*For complete test breakdowns and manual verification logs, refer to [TESTING.md](TESTING.md).*

---

## Build

To compile the frontend application for production:
```bash
# From project root:
npm run build

# Or directly from client directory:
cd client
npm run build
```
Vite optimizes assets and outputs the production bundle to `client/dist/`.

---

## Deployment

> **Note**: Deployment will be executed in **Phase 12**.

The application is structured for easy cloud deployment:
- **Database**: MongoDB Atlas cloud cluster.
- **Backend**: Express API ready for deployment on **Render** (or Railway / Fly.io) via `npm start`.
- **Frontend**: Vite SPA ready for deployment on **Vercel** (or Netlify / Cloudflare Pages) using `npm run build` and output directory `dist`.

---

## Troubleshooting

### 1. MongoDB Connection Failure
- **Symptom**: Console logs `[MongoDB] Connection error: ...`.
- **Solution**: Ensure your MongoDB service is running locally (`mongod`), or check that `MONGODB_URI` in `server/.env` points to an active local or Atlas database. PlanetPulse will automatically fallback to an in-memory database if MongoDB is unavailable.

### 2. Port Already in Use (Port 5000 or 5173)
- **Symptom**: Error `EADDRINUSE: address already in use :::5000`.
- **Solution**: Another process is occupying port 5000. Stop the existing process, or change `PORT=5001` in `server/.env` and update `VITE_API_URL=http://localhost:5001/api` in `client/.env`.

### 3. Frontend Cannot Reach Backend
- **Symptom**: Dashboard shows network error; API calls fail in browser console.
- **Solution**: Verify the backend is running at `http://localhost:5000`. Check that `client/.env` has `VITE_API_URL=http://localhost:5000/api` without trailing slashes. Restart the Vite dev server after modifying `.env`.

### 4. Missing Environment Variables
- **Symptom**: Undefined configuration values on startup.
- **Solution**: Confirm that `server/.env` and `client/.env` exist. If missing, copy them from `server/.env.example` and `client/.env.example`.

### 5. CORS Issues
- **Symptom**: Browser reports `Cross-Origin Request Blocked`.
- **Solution**: Ensure `CLIENT_URL` in `server/.env` matches your frontend origin (e.g. `http://localhost:5173`).

### 6. npm Install Problems
- **Symptom**: Dependency resolution errors during `npm install`.
- **Solution**: Verify Node.js is v18 or higher (`node -v`). Clear npm cache with `npm cache clean --force` and re-run `npm install` in `server` and `client`.
