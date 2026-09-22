# PlanetPulse — Project Specification (Phase 2)

> **Track**: Track 2 — Real-World AI Products  
> **Category**: Climate Tech  
> **Product**: Personal Carbon Footprint Tracker  

---

## 1. Objectives & Scope (Phase 2)

Phase 2 focuses on establishing a production-quality, fully testable backend foundation, authoritative mathematical calculations, schema validations, and MongoDB persistence.

### Core Objectives
1. **Authoritative CO₂ Calculation Engine**:
   - Travel (Personal Vehicle): `0.20` kg CO₂/km
   - Bus: `0.08` kg CO₂/km
   - Flight: `0.25` kg CO₂/km
   - Electricity: `0.80` kg CO₂/kWh
   - Vegetarian Meal: `0.50` kg CO₂/meal
   - Non-vegetarian Meal: `2.00` kg CO₂/meal
2. **Centralized Request Validation**:
   - Rigid boundary verification for activity types, numeric finite positive quantities, and valid calendar dates.
   - Rejection of untrusted client unit and CO₂ values.
3. **Database Architecture**:
   - Single-user MongoDB persistence via Mongoose schemas (`Activity` and `Settings`).
   - Atomic singleton pattern for weekly targets.
4. **Authoritative Calendar Week Logic**:
   - Monday 00:00:00 UTC to Sunday 23:59:59 UTC calendar cadence (DP3).
   - Timezone-safe parsing of `YYYY-MM-DD` date strings.
5. **REST API Endpoints**:
   - `GET /api/health`
   - `POST /api/activities`
   - `GET /api/activities`
   - `GET /api/activities/:id`
   - `DELETE /api/activities/:id`
   - `GET /api/target`
   - `PUT /api/target`

---

## 2. Decision Points Adherence

- **DP1 — The Nudge**: Data models and API responses provide target comparison values (`weeklyTarget`, variance) without restrictive locks or punitive constraints.
- **DP2 — Absurd Input**: Backend retains a soft-warning threshold matrix (`travel: 1000`, `bus: 1000`, `flight: 10000`, `electricity: 10000`, `veg_meal: 1000`, `nonveg_meal: 1000`). Unusual values exceeding thresholds are permitted without artificial clamping.
- **DP3 — The Week**: The calculation cycle is strictly Monday through Sunday, handled with UTC methods in `dateService.js`.
