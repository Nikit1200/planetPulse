# PlanetPulse Testing Documentation

This document outlines the testing strategy, test suites, automated assertions, and manual verification results for the PlanetPulse application.

---

## Test Strategy

PlanetPulse employs a multi-tiered testing strategy spanning unit, integration, validation, and manual verification:

1. **Backend Unit Tests**:
   - Centralized mathematical engine (`carbonService.js`) verified against exact IPCC/EPA conversion factors.
   - Centralized input validator (`validators.js`) tested against edge-case inputs (negative values, zeroes, non-finite values, invalid dates, malformed ObjectIds).
   - Date utility engine (`dateService.js`) tested for exact Monday–Sunday UTC boundaries and 7-day spectrum generation.
2. **Backend API Tests**:
   - Supertest integration tests against all Express endpoints (`api.test.js`, `dashboard.test.js`, `decisionPoints.test.js`, `comprehensiveRegression.test.js`).
   - In-memory MongoDB (`mongodb-memory-server`) used for isolated, reproducible test runs without mutating development data.
3. **Frontend Tests**:
   - Unit tests via Vitest for client carbon factor lookup, keystroke live calculations, dynamic units, and safe timezone formatting.
   - Comprehensive test suite for DP2 outlier detection logic and threshold enforcement (`unusualActivity.test.js`).
4. **Integration & End-to-End Tests**:
   - 20-step continuous integration test covering activity creation, backend authoritative calculation, dashboard aggregation updates, target modifications, nudge triggers, and historical filtering.
5. **Manual UI Verification**:
   - Comprehensive cross-viewport (desktop, tablet, mobile) manual testing with Chrome DevTools and keyboard navigation.

---

## Backend Tests

All 20 required backend test scenarios exist and have been executed with passing results across 7 test suites (119 test assertions):

| # | Test Scenario | Test Suite File | Status |
|---|---|---|---|
| 1 | **Exact emission factors** | `server/tests/carbonService.test.js` | PASS |
| 2 | **CO₂ calculation** | `server/tests/carbonService.test.js` | PASS |
| 3 | **Invalid activity type** | `server/tests/validators.test.js` | PASS |
| 4 | **Missing quantity** | `server/tests/validators.test.js` | PASS |
| 5 | **Zero quantity** | `server/tests/validators.test.js` | PASS |
| 6 | **Negative quantity** | `server/tests/validators.test.js` | PASS |
| 7 | **Non-finite quantity** (NaN, Infinity) | `server/tests/validators.test.js` | PASS |
| 8 | **Invalid date** (malformed strings, invalid calendar days like 2026-02-29) | `server/tests/validators.test.js` | PASS |
| 9 | **Monday–Sunday calculation** | `server/tests/dateService.test.js` | PASS |
| 10 | **Weekly dashboard aggregation** | `server/tests/dashboard.test.js` | PASS |
| 11 | **Empty dashboard** (zero total, default target, zeroed days/categories) | `server/tests/dashboard.test.js` | PASS |
| 12 | **Category breakdown** (all 6 categories always returned) | `server/tests/dashboard.test.js` | PASS |
| 13 | **Seven-day breakdown** (all 7 days Monday–Sunday populated) | `server/tests/dashboard.test.js` | PASS |
| 14 | **Target below** (`totalCO2 < weeklyTarget`, targetExceeded: false) | `server/tests/dashboard.test.js` | PASS |
| 15 | **Target equal** (`totalCO2 === weeklyTarget`, targetExceeded: false) | `server/tests/decisionPoints.test.js` | PASS |
| 16 | **Target exceeded** (`totalCO2 > weeklyTarget`, targetExceeded: true) | `server/tests/decisionPoints.test.js` | PASS |
| 17 | **Activity filters** (filter by type, from, to) | `server/tests/api.test.js` | PASS |
| 18 | **Inclusive date range** (from 00:00:00.000 to 23:59:59.999 UTC) | `server/tests/api.test.js` | PASS |
| 19 | **Backend-authoritative CO₂ calculation** (client co2/unit discarded) | `server/tests/api.test.js` | PASS |
| 20 | **Target persistence** (Settings model GET / PUT lifecycle) | `server/tests/api.test.js` | PASS |

---

## Frontend Tests

Vitest executes 3 test suites covering 35 test assertions:

1. **Carbon Factors & Live Estimate (`client/tests/carbonFactors.test.js`)**:
   - Verifies 6 category configurations, emission factors, and dynamic units (`km`, `kWh`, `meal`).
   - Verifies real-time estimated footprint preview calculation on user input.
   - Verifies graceful handling and `null` return on empty, zero, or invalid values.
2. **Formatters & Timezone Safety (`client/tests/formatters.test.js`)**:
   - `formatCO2`: Formats numbers to 2 decimal places with thousands separators (`125,000.00`).
   - `formatQuantity`: Dynamic unit formatting with thousands separators (`500,000 km`).
   - `formatDateSafe`: Ensures calendar date consistency (`YYYY-MM-DD` converted to readable format) across timezones.
   - `formatWeekRange`: Produces clear weekly range headers (e.g., `Mon, Sep 21 — Sun, Sep 27, 2026`).
3. **DP2 Outlier Logic (`client/tests/unusualActivity.test.js`)**:
   - Verifies centralized warning thresholds: Travel (10,000 km), Bus (10,000 km), Flight (50,000 km), Electricity (10,000 kWh), Veg Meal (1,000 meals), Non-Veg Meal (1,000 meals).
   - Verifies normal inputs do not trigger the warning.
   - Verifies unusual inputs trigger the confirmation dialog.

---

## Decision Point Tests

### DP1: The Nudge
- **Under target $\rightarrow$ No nudge**: When `totalCO2 < weeklyTarget`, `targetExceeded` is `false` and CarbonNudge does not render. (PASS)
- **Equal target $\rightarrow$ No nudge**: When `totalCO2 === weeklyTarget`, `targetExceeded` is `false` and budget is not considered exceeded. (PASS)
- **Over target $\rightarrow$ Nudge**: When `totalCO2 > weeklyTarget`, `targetExceeded` is `true` and the CarbonNudge banner renders with `exceededBy` emissions. (PASS)
- **Nudge does not block logging**: Navigating to `/log` and submitting activities remains fully functional while target is exceeded. (PASS)

### DP2: Absurd Input
- **Normal value $\rightarrow$ No warning**: Normal inputs (e.g. 10 km travel, 1,200 km flight) submit immediately without displaying a dialog. (PASS)
- **Unusual value $\rightarrow$ Warning**: Values exceeding threshold (e.g. 500,000 km flight) open `AbsurdInputDialog`. (PASS)
- **Cancel $\rightarrow$ No API request**: Clicking "Go Back" dismisses the dialog with 0 HTTP requests. (PASS)
- **Record anyway $\rightarrow$ Exactly one API request**: Clicking "Record Anyway" sends exactly one `POST /api/activities` request and disables buttons during submission. (PASS)
- **Form data preserved**: Clicking "Go Back" leaves all entered form fields (type, quantity, date) completely intact. (PASS)

### DP3: The Week
- **Monday start**: Weekly cycle begins on Monday at 00:00:00.000 UTC. (PASS)
- **Sunday end**: Weekly cycle concludes on Sunday at 23:59:59.999 UTC. (PASS)
- **Seven days**: Daily breakdown returns exactly 7 items (Monday through Sunday) with 0-value days included. (PASS)
- **Activities outside current week excluded**: Activities logged prior to Monday or after Sunday are excluded from weekly dashboard metrics. (PASS)

---

## Manual Testing

The following manual verification tests were executed against the live application:

| Check Item | Description | Status |
|---|---|---|
| **Dashboard loads** | Metrics, weekly target, progress bar, category chart, daily chart, and recent activities render correctly | PASS |
| **Log activity works** | Selection cards update units; live preview calculates correctly; submission persists to database | PASS |
| **History filters work** | Type filter, date filters (`from`/`to`), and Clear Filters update table/cards without page reload | PASS |
| **Target editing works** | Target modal opens, validates input (`> 0`), updates target via API, and updates dashboard metrics | PASS |
| **Warning dialog works** | 500,000 km flight triggers modal; "Go Back" preserves data; "Record Anyway" persists record | PASS |
| **Nudge works** | Banner displays when emissions exceed target; shows exact excess; provides actionable shortcuts | PASS |
| **Mobile layout works** | Viewports at 320px, 375px, 414px render without horizontal scrolling; hamburger menu operates smoothly | PASS |
| **Desktop layout works** | Grid layouts display cleanly at 1024px, 1280px, and 1440px with proper whitespace and alignment | PASS |
| **Keyboard navigation** | All interactive elements (buttons, inputs, modal dialogs) accessible via `Tab` and `Enter`; `Esc` dismisses modals | PASS |
| **Browser console checked** | Clean execution with zero unhandled exceptions or console errors | PASS |

---

## Test Commands

Run the test suites using the project's actual `package.json` scripts:

### Run All Tests (Backend + Frontend)
```bash
npm test
```
*Executes `npm --prefix server test` followed by `npm --prefix client test`.*

### Run Backend Tests Only
```bash
npm run test:server
```
*Or from the `server/` directory: `cd server && npm test`*

### Run Frontend Tests Only
```bash
npm run test:client
```
*Or from the `client/` directory: `cd client && npm test`*

### Run Linter
```bash
npm run lint
```
*Runs Oxlint across client source code.*

### Run Production Build
```bash
npm run build
```
*Compiles the frontend production bundle using Vite into `client/dist/`.*

---

## Test Execution Summary

| Suite | File | Tests Passed | Total Tests |
|---|---|---|---|
| Backend | `server/tests/comprehensiveRegression.test.js` | 20 | 20 |
| Backend | `server/tests/api.test.js` | 24 | 24 |
| Backend | `server/tests/dashboard.test.js` | 20 | 20 |
| Backend | `server/tests/decisionPoints.test.js` | 14 | 14 |
| Backend | `server/tests/validators.test.js` | 15 | 15 |
| Backend | `server/tests/carbonService.test.js` | 16 | 16 |
| Backend | `server/tests/dateService.test.js` | 10 | 10 |
| Frontend | `client/tests/unusualActivity.test.js` | 13 | 13 |
| Frontend | `client/tests/carbonFactors.test.js` | 12 | 12 |
| Frontend | `client/tests/formatters.test.js` | 10 | 10 |
| **Total** | **10 Test Files** | **154** | **154 (100%)** |
