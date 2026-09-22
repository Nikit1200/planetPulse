# PlanetPulse — Architecture & Technical Design (Phase 3)

## 1. Architectural Overview

PlanetPulse employs a decoupled, layered REST API architecture built on Express.js and Mongoose, backed by MongoDB. The backend serves as the single authoritative source of truth for carbon calculations, weekly cycles, target comparisons, and dashboard aggregation.

```text
               +----------------------------------+
               |          Dashboard UI            |
               |       (Vite + React 19)          |
               +-----------------+----------------+
                                 |
                        GET /api/dashboard
                                 |
               +-----------------v----------------+
               |     Express Server (server.js)   |
               |  - CORS & Security Middleware    |
               +-----------------+----------------+
                                 |
               +-----------------v----------------+
               |      dashboardController         |
               |   - Coordinate week range        |
               |   - Aggregate weekly metrics     |
               |   - Compute target comparisons   |
               +--------+----------------+--------+
                        |                |
         +--------------v----+    +------v--------------+
         |    dateService    |    |   targetController  |
         | - Mon-Sun UTC     |    | - Singleton Settings|
         +-------------------+    +---------------------+
                        |
               +--------v-------------------------+
               |       MongoDB Query / Aggregation |
               | - Filter date: [start, end]      |
               | - Sum weekly CO2                 |
               | - Category & Daily distribution  |
               +-----------------+----------------+
                                 |
               +-----------------v----------------+
               |     JSON Dashboard Response      |
               | { week, totalCO2, target, ... }  |
               +----------------------------------+
```

---

## 2. Dashboard Aggregation Architecture

### Data Flow Breakdown
1. **Client Request**: The frontend initiates a `GET /api/dashboard` request without passing user-calculated totals or dates.
2. **Controller Processing (`dashboardController.js`)**:
   - Invocates `dateService.getCurrentWeekRange()` to retrieve the authoritative Monday 00:00:00 UTC through Sunday 23:59:59 UTC boundary.
   - Retrieves the user's active weekly target from `Settings` via `getOrCreateSettings()` (singleton pattern).
3. **Database Query**:
   - Executes a single, indexed query against MongoDB (`date: { $gte: startOfWeek, $lte: endOfWeek }`), eliminating the need for 7 separate per-day database calls.
4. **Aggregation & Normalization**:
   - **Weekly Total**: Sum of `co2` across matching activities rounded to 2 decimal places.
   - **Category Distribution**: Maps across all 6 predefined categories (`travel`, `bus`, `flight`, `electricity`, `veg_meal`, `nonveg_meal`), populating zero for inactive categories.
   - **Daily Distribution**: Constructs an ordered 7-element array from Monday to Sunday, mapping activities into calendar day buckets.
   - **Target Calculations**:
     - `percentage`: `(totalCO2 / weeklyTarget) * 100` rounded to 2 decimal places.
     - `targetExceeded`: strictly `totalCO2 > weeklyTarget`.
     - `remaining`: `weeklyTarget - totalCO2` when on track; `0` when exceeded.
     - `exceededBy`: `totalCO2 - weeklyTarget` when exceeded; `0` when on track.
   - **Recent Activities**: Fetches up to 5 newest records across all time.
5. **Authoritative Principle**:
   - The backend never trusts client calculations. All totals, percentages, remaining budgets, and day bucketing are calculated authoritatively on the server.

---

## 3. Layer Responsibilities

### Routing Layer (`server/routes/`)
- Declares HTTP routes (`/api/activities`, `/api/target`, `/api/dashboard`).
- Mounts controller actions.

### Controller Layer (`server/controllers/`)
- `dashboardController.js`: Computes weekly summaries, categories, and calendar days.
- `activityController.js`: Manages activity CRUD with validation.
- `targetController.js`: Manages singleton weekly target.

### Validation Layer (`server/utils/validators.js`)
- Validates request payloads independently of the ORM/ODM.
- Rejects non-numeric, zero, negative, or infinite quantities.
- Validates MongoDB ObjectId format before database execution.
- Validates calendar dates and date ranges (`from` <= `to`).

### Services Layer (`server/services/`)
- `carbonService.js`: Single authoritative source for emission factors and mathematical calculations. Discards client-provided units and CO₂ values.
- `dateService.js`: Standardizes week calculations on Monday 00:00:00 UTC to Sunday 23:59:59 UTC, with calendar normalization.

### Middleware Layer (`server/middleware/`)
- `errorHandler.js`: Intercepts unhandled exceptions, Mongoose CastErrors, and validation errors; sanitizes error responses.
- `notFound.js`: Returns a structured 404 response for unregistered API paths.

### Persistence Layer (`server/models/`)
- `Activity.js`: Activity record schema with compound index on `{ date: -1, createdAt: -1 }`.
- `Settings.js`: Singleton user settings document with atomic `findOneAndUpdate(..., { upsert: true })`.

---

## 4. Decision Points Architecture (Phase 8)

### DP1: The Nudge Architecture
- **Status Authority**: Originates strictly from `dashboardController.js` via `targetExceeded` (`totalCO2 > weeklyTarget`) and `exceededBy` (`totalCO2 - weeklyTarget`).
- **UI Component**: `client/src/components/dashboard/TargetExceededNudge.jsx` rendered inside `Dashboard.jsx`.
- **Interactions**:
  - Non-blocking: Logging (`/log`) remains fully accessible.
  - History: Links directly to `/history` to review where emissions came from.
  - Target Adjustment: Directly triggers `TargetEditModal`. Saving a new target re-fetches the dashboard; if `totalCO2 <= newTarget`, the nudge automatically disappears.
  - Dismissal: Local in-component state hiding the card for that session without persisting side-effects.

### DP2: Absurd Input Architecture
- **Threshold Registry**: Centralized in `client/src/utils/unusualActivity.js` under `UNUSUAL_THRESHOLDS`:
  - `travel`: 10,000 km
  - `bus`: 10,000 km
  - `flight`: 50,000 km
  - `electricity`: 10,000 kWh
  - `veg_meal`: 1,000 meals
  - `nonveg_meal`: 1,000 meals
- **Trigger Timing**: Triggers only on form submit (`handleSubmit` in `LogActivity.jsx`) after standard validation passes, preventing modal flicker during typing.
- **Workflow & Preservation**:
  - `Go Back`: Dismisses dialog, preserves `{ type, quantity, date }` in the form, and issues 0 network calls.
  - `Record Anyway`: Issues single `POST /api/activities` with raw quantity. Backend calculates authoritative CO₂ (`carbonService.js`).
- **Dialog Safety**: `AbsurdInputDialog.jsx` disables both buttons while submitting, handles Escape key, and formats extreme numbers (e.g. 500,000 km -> 125,000.00 kg CO₂).

### DP3: Week and Date Handling Architecture
- **Week Boundaries**: `server/services/dateService.js` calculates strictly Monday 00:00:00.000 UTC to Sunday 23:59:59.999 UTC.
- **Date-Only Safety**: Activity dates (`YYYY-MM-DD`) are treated as calendar dates:
  - Backend parses with `Date.UTC(y, m - 1, d)` to prevent local offset shifts.
  - Frontend formats with `formatDateSafe` (`parts[0]`, `parts[1] - 1`, `parts[2]`) ensuring `2026-09-22` consistently renders as Sep 22 across all user timezones.
- **Spectrum Completeness**: Dashboard daily breakdown always contains 7 ordered objects (Monday through Sunday) regardless of activity presence.

