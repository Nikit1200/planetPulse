# PlanetPulse — Architectural & Product Decisions

PlanetPulse adheres to three authoritative product decision points (DPs) designed to balance scientific rigor, constructive behavioral incentives, and seamless usability.

---

## DP1 — THE NUDGE

### Decision
When the user's weekly carbon emissions exceed their configured weekly target, PlanetPulse displays an informative, constructive, encouraging, and non-blocking nudge.

### Core Principles
- **No Shaming**: Language is neutral, objective, and supportive. It frames excess emissions as an actionable insight rather than a failure.
- **Non-Blocking Architecture**: Exceeding the target never locks navigation, prevents activity logging, or forces immediate target edits.
- **Continuous Logging**: Users are encouraged to continue tracking emissions accurately, regardless of whether their budget has been exceeded.
- **Condition for Triggering**: The nudge appears strictly when:
  $$\text{weeklyCO2} > \text{weeklyTarget}$$
- **Condition for Inactivity**: The nudge does **NOT** display when:
  $$\text{weeklyCO2} \le \text{weeklyTarget}$$
  *(Specifically, when emissions exactly equal the target, the budget is not considered exceeded).*

### Information Communicated
The nudge displays:
1. **Current Weekly Footprint**: Total emissions logged during the active Monday–Sunday week (in kg CO₂).
2. **Weekly Target**: The user's configured carbon limit (in kg CO₂).
3. **Amount Exceeded**: Exact variance ($\text{weeklyCO2} - \text{weeklyTarget}$) calculated authoritatively by the backend (`exceededBy`).
4. **Practical Next Actions**: High-leverage, direct shortcuts:
   - **Review History**: Inspect historical activities to understand high-emission drivers (`/history`).
   - **Log Activity**: Continue logging new daily activities (`/log`).
   - **Adjust Target**: Open the in-place target editor to recalibrate goals without navigating away.

### Dynamic Recalibration
Adjusting the weekly target via the modal immediately re-fetches the dashboard. If the updated target exceeds or equals current emissions, the nudge immediately disappears.

---

## DP2 — ABSURD / UNUSUAL INPUT

### Decision
Unusually large activity inputs trigger an accessible warning modal requiring explicit confirmation from the user before recording.
- They are **not** silently modified or rounded down.
- They are **not** automatically clamped to an arbitrary maximum.
- They are **not** automatically rejected solely because they are large.

### UX Warning Thresholds
The centralized warning thresholds (`client/src/utils/unusualActivity.js`) are:

| Activity Type | Warning Threshold | Unit |
| :--- | :--- | :--- |
| **Travel** | `10,000` | km |
| **Bus** | `10,000` | km |
| **Flight** | `50,000` | km |
| **Electricity** | `10,000` | kWh |
| **Veg Meal** | `1,000` | meals |
| **Non-Veg Meal** | `1,000` | meals |

> **IMPORTANT**: These thresholds are UX warning thresholds, **NOT** scientific hard limits or maximum constraints. Legitimate large values (e.g., corporate fleet mileage, annual building electric meter readings, long-haul multi-leg flights) are valid and can be recorded upon user confirmation.

### Workflow When Triggered
1. **Preserve Entered Form**: All form data (activity type, quantity, date) is preserved completely.
2. **Show Warning**: An accessible modal dialog (`AbsurdInputDialog`) is displayed upon submission.
3. **Show Quantity & Dynamic Unit**: Highlights the entered amount with its unit (e.g., `500,000 km`).
4. **Show Estimated CO₂**: Displays the preview of emissions (e.g., `125,000.00 kg CO₂`).
5. **Provide Explicit Choice**:
   - **Go Back**: Dismisses the modal, sends 0 network requests, and returns focus to the intact form so the user can correct a typo.
   - **Record Anyway**: Acknowledges the large quantity and submits the payload to the API.
6. **Explicit Submission**: Only submits to `POST /api/activities` after explicit user click on "Record Anyway".
7. **Normal Value Behavior**: Normal quantities below the threshold submit immediately without triggering the modal.

---

## DP3 — THE WEEK

### Decision
PlanetPulse defines the weekly tracking cycle strictly as:
$$\text{Monday} \longrightarrow \text{Sunday}$$

### Authoritative Backend Cadence
The backend (`server/services/dateService.js`) serves as the authoritative source of truth for all week calculations:
- The current week begins on **Monday at 00:00:00.000 UTC** and ends on **Sunday at 23:59:59.999 UTC**.
- Weekly aggregations, target comparisons, and daily breakdowns are computed server-side to guarantee consistency across diverse client timezones.

### Required Dashboard Weekly Display
The dashboard displays:
- **Week Start**: Formatted start date (Monday).
- **Week End**: Formatted end date (Sunday).
- **Weekly Total**: Sum of all emissions logged within the current Monday–Sunday window.
- **Weekly Target**: User's active carbon budget from Settings.
- **Progress**: Percentage of target utilized ($\frac{\text{weeklyCO2}}{\text{weeklyTarget}} \times 100\%$).
- **Remaining / Exceeded Amount**: Headroom remaining if $\le \text{target}$, or excess amount if $> \text{target}$.
- **Seven Daily Breakdown Values**: Chronological breakdown array containing all seven days:
  1. Monday
  2. Tuesday
  3. Wednesday
  4. Thursday
  5. Friday
  6. Saturday
  7. Sunday

### Boundary & Historical Behavior
- **Boundary Inclusion**: Activities logged on Monday and Sunday of the active week are fully included in weekly calculations.
- **Boundary Exclusion**: Activities logged on the previous Sunday or upcoming Monday are excluded from the current week's total.
- **Zero-Fill Consistency**: Days without logged activity return `0.00 kg CO₂` and `activityCount: 0`, maintaining a stable 7-day visualization.
- **Historical Integrity**: Shifting to a new week resets the dashboard weekly cycle without purging historical data; all past activities remain searchable in Activity History (`/history`).
