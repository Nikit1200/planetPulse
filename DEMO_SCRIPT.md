# PlanetPulse — Hackathon Demo Script (3–5 Minutes)

**Presenter Note**: This walkthrough demonstrates the core functionality, scientific calculation accuracy, responsive interface, and three authoritative decision points of PlanetPulse.

---

## 1. Introduction

*(Estimated time: 20–30 seconds)*

> "Hello everyone! Welcome to **PlanetPulse** — a climate-tech web application designed to track personal carbon emissions from daily travel, transport, electricity, and meals.
>
> In many climate tools, emissions tracking is either overly complex or silently modifies user data. PlanetPulse was engineered to make carbon accounting transparent, authoritative, and actionable — giving users an immediate, factual understanding of their weekly carbon impact."

---

## 2. Dashboard

*(Estimated time: 30–45 seconds)*

**Actions:**
1. Navigate to the Home / Dashboard route (`/`).
2. Point out the key elements on screen:
   - **Current Weekly Footprint**: Total emissions accumulated during the active weekly cycle.
   - **Weekly Target**: User's active carbon budget limit (default: 20.00 kg CO₂).
   - **Target Progress**: Visual progress bar indicating percentage utilized and remaining budget headroom.
   - **Category Breakdown**: Grid displaying emissions across all 6 monitored activity categories.
   - **Seven-Day Chart**: Recharts bar chart showing daily emissions across all seven days.
   - **Recent Activity**: Stream of the latest recorded activities.
3. **Explain the Monday–Sunday Weekly Cadence (DP3)**:
   > "Notice the weekly banner: PlanetPulse organizes carbon accounting strictly from **Monday through Sunday**. Our backend calculates this authoritatively, ensuring every day from Monday to Sunday is represented and boundary days are strictly observed."

---

## 3. Log Activity

*(Estimated time: 45–60 seconds)*

**Actions:**
1. Click **+ Log Activity** in the navigation header (or navigate to `/log`).
2. Point out the input fields:
   - **Activity Type**: Select **Travel** (Personal Vehicle).
   - **Unit**: Highlight that the unit automatically updates to `km`.
   - **Quantity**: Enter `10`.
   - **Date**: Select today's date (defaults safely to local calendar date).
   - **CO₂ Preview**: Highlight the live calculation preview (`10 km × 0.20 kg CO₂/km = 2.00 kg CO₂`).
3. Click **Add Activity**.
4. Observe the immediate success confirmation card showing the recorded activity and backend-calculated emissions.
5. Click **View Dashboard** (or navigate to `/`).
6. Show that the dashboard total has immediately increased by `2.00 kg CO₂`.

---

## 4. Weekly Target

*(Estimated time: 30–45 seconds)*

**Actions:**
1. Locate the **Weekly Target** stat card on the dashboard.
2. Click **Change Target** (or the target edit button on the Progress card).
3. The `TargetEditModal` opens, focusing the target input field.
4. Change the weekly target from `20` to `25`.
5. Click **Save Target**.
6. Observe the success toast notification.
7. Point out the updated dashboard metrics:
   - Target now displays `25.00 kg CO₂`.
   - Progress bar and percentage immediately recalculate based on the new target.
   - Remaining headroom expands accordingly.

---

## 5. DP1

*(Estimated time: 30–45 seconds)*

**Actions:**
1. Demonstrate what happens when weekly emissions exceed the weekly target limit.
2. *(If needed for demonstration, adjust target below the current total, e.g., set target to 1 kg CO₂, or demonstrate with existing exceeded state)*.
3. Point out the **CarbonNudge** banner that appears:
   > "Notice what happens when the weekly target is exceeded: PlanetPulse displays an informative, encouraging, non-blocking nudge (**DP1**).
   >
   > The application does **not** shame the user with punitive alerts. It does **not** block the interface or prevent further logging. Instead, it clearly shows:
   > - Current weekly footprint
   > - Weekly target
   > - Amount exceeded
   >
   > And it gives practical next actions:
   > - **Review History** to see high-impact activities
   > - **Log Activity** to continue tracking honestly
   > - **Adjust Target** to recalibrate realistic goals."

---

## 6. DP2

*(Estimated time: 45–60 seconds)*

**Actions:**
1. Navigate back to **Log Activity** (`/log`).
2. Select **Flight** (warning threshold: 50,000 km).
3. Enter an intentionally unusual value: `500000` km.
4. Notice the live preview calculates `125,000.00 kg CO₂`.
5. Click **Add Activity**.
6. An accessible warning dialog (`AbsurdInputDialog`) appears on screen.
7. Explain:
   > "This value is unusual, so PlanetPulse asks for explicit confirmation rather than silently changing or clamping the user's input (**DP2**).
   >
   > Many apps might silently clamp 500,000 km to a lower number or reject it outright. PlanetPulse respects genuine user intent while protecting against typos."
8. Demonstrate the two choices:
   - **Go Back**: Click **Go Back**. The modal closes, 0 network requests are sent, and the form fields remain completely intact.
   - **Record Anyway**: Re-open the dialog and click **Record Anyway** to demonstrate that legitimate large values are accepted and saved if confirmed by the user.

---

## 7. History

*(Estimated time: 30–45 seconds)*

**Actions:**
1. Navigate to **Activity History** (`/history`).
2. Point out the comprehensive activity list:
   - Displays all historical activities with date, category icon, quantity, dynamic unit, and authoritative CO₂ emissions.
3. Demonstrate **Activity Type Filtering**:
   - In the filter dropdown, select **Travel**.
   - Click **Apply**.
   - The list instantly updates to show only travel activities.
4. Demonstrate **Date Filtering**:
   - Set a date range (e.g., this week's start and end dates).
   - Click **Apply**.
   - Explain that date filtering is strictly inclusive from start of day to end of day.
5. Click **Clear Filters** to restore the full historical activity log.

---

## 8. Closing

*(Estimated time: 20–30 seconds)*

> "To summarize, PlanetPulse provides:
> 1. **Correct Calculations**: Authoritative, scientific CO₂ emission factors calculated backend-first.
> 2. **Weekly Tracking**: A rigorous Monday–Sunday weekly cycle with full 7-day visibility.
> 3. **Target Management**: Persistent, editable weekly targets with real-time synchronization.
> 4. **Explainable Decisions**: Factual, non-blocking nudges when targets are exceeded (DP1).
> 5. **Unusual-Input Handling**: Transparent soft warnings without artificial clamping or data mutation (DP2).
> 6. **Responsive UX**: A polished, accessible, mobile-ready climate tech interface.
>
> Thank you for exploring PlanetPulse!"
