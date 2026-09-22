# PlanetPulse API Reference

PlanetPulse provides a RESTful backend API built with Express.js and MongoDB. All responses follow a standardized JSON envelope structure.

---

## Base URL

In local development, the API operates at:
```text
http://localhost:5000
```
API endpoints are mounted under the `/api` prefix:
```text
http://localhost:5000/api
```

---

## Response Envelope Conventions

### Standard Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Standard Collection Success Response
```json
{
  "success": true,
  "count": 5,
  "data": [ ... ]
}
```

### Standard Error Response
```json
{
  "success": false,
  "message": "Human-readable explanation of error"
}
```

---

## Health

### `GET /api/health`
Verifies backend service uptime and system health.

- **Method**: `GET`
- **Endpoint**: `/api/health`
- **Authentication**: None
- **Request Parameters / Body**: None
- **Expected Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "PlanetPulse API is running"
  }
  ```

---

## Create Activity

### `POST /api/activities`
Creates and persists a new activity record in MongoDB.

- **Method**: `POST`
- **Endpoint**: `/api/activities`
- **Headers**: `Content-Type: application/json`
- **Request Body Example**:
  ```json
  {
    "type": "travel",
    "quantity": 10,
    "date": "2026-09-22"
  }
  ```

### Request Fields Explained:
- `type` *(string, required)*: The activity category. Must be one of the six supported types:
  - `travel` (Personal Vehicle / Car)
  - `bus` (Public Bus)
  - `flight` (Air Travel)
  - `electricity` (Grid Power)
  - `veg_meal` (Plant-Based Meal)
  - `nonveg_meal` (Meat / Dairy Meal)
- `quantity` *(number, required)*: The positive numeric volume of activity. Must be a finite number strictly greater than 0. Decimals are supported.
- `date` *(string, required)*: Calendar date in `YYYY-MM-DD` or ISO 8601 string format. Safely parsed to midnight UTC (`00:00:00.000 UTC`).

### Authoritative Backend Calculation:
- The backend **never** trusts client-supplied `co2` or `unit` values.
- Even if a client sends `{ "co2": 0, "unit": "miles" }`, the backend discards those fields.
- The backend calculates authoritative emissions using the formula:
  $$\text{CO₂} = \text{quantity} \times \text{emission factor}$$
  and determines the correct official unit (`km`, `kWh`, `meal`) server-side.

### Success Response (201 Created):
```json
{
  "success": true,
  "data": {
    "_id": "673f4b82d9a3b8112c3f81e1",
    "type": "travel",
    "quantity": 10,
    "unit": "km",
    "co2": 2,
    "date": "2026-09-22T00:00:00.000Z",
    "createdAt": "2026-09-22T10:15:30.959Z",
    "updatedAt": "2026-09-22T10:15:30.959Z"
  }
}
```

### Validation & Error Responses:
- `400 Bad Request`:
  - Missing or unsupported `type`.
  - Missing, non-numeric, zero, negative, or non-finite `quantity`.
  - Missing or invalid `date` (e.g. invalid calendar dates such as `2026-02-29`).

---

## List Activities

### `GET /api/activities`
Retrieves stored activity records, sorted by descending date (`date: -1, createdAt: -1`), with optional server-side filtering.

- **Method**: `GET`
- **Endpoint**: `/api/activities`
- **Query Parameters**:
  - `type` *(string, optional)*: Filter by activity type (`travel`, `bus`, `flight`, `electricity`, `veg_meal`, `nonveg_meal`). Pass `all` or omit to retrieve all types.
  - `from` *(string, optional)*: Lower date boundary in `YYYY-MM-DD` format. Inclusive from start of day (`00:00:00.000 UTC`).
  - `to` *(string, optional)*: Upper date boundary in `YYYY-MM-DD` format. Inclusive through end of day (`23:59:59.999 UTC`).

### Date Filtering Behavior:
- Date filtering is **strictly inclusive**:
  - `from=2026-09-21` includes all activities recorded from `2026-09-21T00:00:00.000Z`.
  - `to=2026-09-27` includes all activities recorded through `2026-09-27T23:59:59.999Z`.
- If `from` is chronologically after `to`, the API rejects the request with a `400 Bad Request`.

### Request Example:
```text
GET /api/activities?type=travel&from=2026-09-21&to=2026-09-27
```

### Success Response (200 OK):
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "673f4b82d9a3b8112c3f81e1",
      "type": "travel",
      "quantity": 10,
      "unit": "km",
      "co2": 2,
      "date": "2026-09-22T00:00:00.000Z",
      "createdAt": "2026-09-22T10:15:30.959Z"
    }
  ]
}
```

### Error Responses:
- `400 Bad Request`: Unsupported `type` filter, malformed date string, or `from > to`.

---

## Get Activity

### `GET /api/activities/:id`
Retrieves a single activity record by its MongoDB ObjectId.

- **Method**: `GET`
- **Endpoint**: `/api/activities/:id`
- **Parameters**: `id` *(string, required)* — 24-character hexadecimal MongoDB ObjectId.
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "_id": "673f4b82d9a3b8112c3f81e1",
      "type": "travel",
      "quantity": 10,
      "unit": "km",
      "co2": 2,
      "date": "2026-09-22T00:00:00.000Z",
      "createdAt": "2026-09-22T10:15:30.959Z"
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Malformed ObjectId format.
  - `404 Not Found`: No activity matches the given identifier.

---

## Delete Activity

### `DELETE /api/activities/:id`
Permanently deletes an activity record from MongoDB.

- **Method**: `DELETE`
- **Endpoint**: `/api/activities/:id`
- **Parameters**: `id` *(string, required)* — 24-character hexadecimal MongoDB ObjectId.
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Activity deleted successfully",
    "data": {
      "id": "673f4b82d9a3b8112c3f81e1"
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request`: Malformed ObjectId format.
  - `404 Not Found`: Activity record not found.

---

## Get Target

### `GET /api/target`
Fetches the active weekly carbon budget target from MongoDB Settings (defaults to `20` kg CO₂).

- **Method**: `GET`
- **Endpoint**: `/api/target`
- **Request Parameters / Body**: None
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "weeklyTarget": 20
    }
  }
  ```

---

## Update Target

### `PUT /api/target`
Updates the weekly carbon target budget.

- **Method**: `PUT`
- **Endpoint**: `/api/target`
- **Headers**: `Content-Type: application/json`
- **Request Body Example**:
  ```json
  {
    "weeklyTarget": 25.5
  }
  ```

### Validation:
- `weeklyTarget` must be present.
- Must be a valid, finite number strictly greater than zero (`> 0`).
- Rejects negative values, `0`, `NaN`, non-numeric strings, and booleans.

### Success Response (200 OK):
```json
{
  "success": true,
  "data": {
    "weeklyTarget": 25.5
  }
}
```

### Error Responses:
- `400 Bad Request`: Missing or invalid `weeklyTarget` parameter.

---

## Dashboard

### `GET /api/dashboard`
Returns real-time aggregated metrics for the authoritative **Monday–Sunday** calendar week.

- **Method**: `GET`
- **Endpoint**: `/api/dashboard`
- **Query Parameters / Body**: None
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "week": {
        "start": "2026-09-21",
        "end": "2026-09-27"
      },
      "totalCO2": 23.4,
      "weeklyTarget": 20,
      "percentage": 117,
      "remaining": 0,
      "exceededBy": 3.4,
      "targetExceeded": true,
      "activityCount": 8,
      "categoryBreakdown": {
        "travel": 8.4,
        "bus": 2.1,
        "flight": 5.0,
        "electricity": 6.0,
        "veg_meal": 1.0,
        "nonveg_meal": 0.9
      },
      "dailyBreakdown": [
        {
          "date": "2026-09-21",
          "day": "Monday",
          "co2": 4.0,
          "activityCount": 2
        },
        {
          "date": "2026-09-22",
          "day": "Tuesday",
          "co2": 19.4,
          "activityCount": 6
        },
        {
          "date": "2026-09-23",
          "day": "Wednesday",
          "co2": 0,
          "activityCount": 0
        },
        {
          "date": "2026-09-24",
          "day": "Thursday",
          "co2": 0,
          "activityCount": 0
        },
        {
          "date": "2026-09-25",
          "day": "Friday",
          "co2": 0,
          "activityCount": 0
        },
        {
          "date": "2026-09-26",
          "day": "Saturday",
          "co2": 0,
          "activityCount": 0
        },
        {
          "date": "2026-09-27",
          "day": "Sunday",
          "co2": 0,
          "activityCount": 0
        }
      ],
      "recentActivities": [
        {
          "id": "673f4b82d9a3b8112c3f81e1",
          "_id": "673f4b82d9a3b8112c3f81e1",
          "type": "travel",
          "quantity": 10,
          "unit": "km",
          "co2": 2,
          "date": "2026-09-22T00:00:00.000Z",
          "createdAt": "2026-09-22T10:15:30.959Z"
        }
      ]
    }
  }
  ```

### Dashboard Response Fields Explained:
- `week.start`: Start date of active cycle (`YYYY-MM-DD`, always Monday).
- `week.end`: End date of active cycle (`YYYY-MM-DD`, always Sunday).
- `totalCO2`: Authoritative cumulative CO₂ (kg) logged within the current Monday–Sunday window, rounded to 2 decimal places.
- `weeklyTarget`: Current target limit (kg CO₂) configured in Settings.
- `percentage`: Percentage of weekly target consumed: `round((totalCO2 / weeklyTarget) * 100, 2)`.
- `remaining`: Remaining carbon budget headroom before reaching target: `max(0, weeklyTarget - totalCO2)`.
- `exceededBy`: Emissions amount beyond target: `max(0, totalCO2 - weeklyTarget)`.
- `targetExceeded`: Boolean flag. Strictly `true` when `totalCO2 > weeklyTarget`; `false` when `totalCO2 <= weeklyTarget`.
- `activityCount`: Total number of activity entries logged during the active Monday–Sunday week.
- `categoryBreakdown`: Object containing emissions sums for all six supported categories (`travel`, `bus`, `flight`, `electricity`, `veg_meal`, `nonveg_meal`). Categories with no entries return `0`.
- `dailyBreakdown`: Chronological array of exactly seven day entries (Monday through Sunday). Days without logged activities return `co2: 0` and `activityCount: 0`.
- `recentActivities`: Up to 5 most recently created activities overall, sorted by date and creation time descending (`date: -1, createdAt: -1`).
