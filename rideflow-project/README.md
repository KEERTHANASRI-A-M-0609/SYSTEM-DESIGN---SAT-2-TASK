# RideFlow — Ride-Hailing System Design Demo

A polished, formal ride-hailing dashboard demonstrating a working REST API with a React UI and Express backend.

## Features
- Create a ride request from pickup and destination.
- View rides and current ride status.
- Cancel a ride.
- View driver availability.
- Backend REST endpoints with validation and meaningful HTTP status codes.
- Responsive UI with a calm navy, ivory, and muted teal palette (no neon colors).
- API reference panel for viva/demo explanations.
- In-memory demo data; restarting the backend resets rides to the seed data.

## Requirements
- Node.js 20 or newer (Node.js 18+ should also work)
- npm
- Visual Studio Code

## Run in VS Code
1. Extract `RideFlow-Project.zip`.
2. Open the extracted `rideflow-project` folder in VS Code.
3. Open **Terminal → New Terminal**.
4. Run:
   ```bash
   npm install
   ```
5. Start frontend and backend together:
   ```bash
   npm run dev
   ```
6. Open the Vite URL shown in the terminal, usually `http://localhost:5173`.

The API server runs at `http://localhost:4000`.

## If the app does not start
- Check Node.js: `node -v`
- Check npm: `npm -v`
- Make sure port 4000 and 5173 are not already in use.
- Run `npm install` from the root folder, not inside `client` or `server`.

## REST API endpoints
Base URL: `http://localhost:4000/api`

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | Check API server |
| GET | `/drivers` | List drivers |
| GET | `/rides` | List rides |
| GET | `/rides/:id` | Get one ride |
| POST | `/rides` | Create a ride |
| PATCH | `/rides/:id/cancel` | Cancel a ride |

### Example: create a ride
Request:
```http
POST /api/rides
Content-Type: application/json
```
```json
{
  "passengerName": "Keerthana",
  "pickup": "Sri Eshwar College of Engineering",
  "destination": "Coimbatore Railway Station"
}
```

Success response (`201 Created`):
```json
{
  "message": "Ride request created",
  "ride": {
    "id": "R-1004",
    "passengerName": "Keerthana",
    "pickup": "Sri Eshwar College of Engineering",
    "destination": "Coimbatore Railway Station",
    "status": "Searching for driver"
  }
}
```

## Viva points
- **API:** a defined interface that lets software components communicate.
- **REST API:** a web API that uses HTTP methods and resource-based URLs.
- **Endpoint:** a URL path for an API operation, such as `/api/rides`.
- **POST:** creates a ride request.
- **GET:** retrieves rides or driver data.
- **PATCH:** partially updates a ride, used here to cancel it.
- **201 Created:** returned when a ride is created successfully.
- **400 Bad Request:** returned when required fields are missing.
- **404 Not Found:** returned when a ride ID does not exist.
- **CORS:** lets the local frontend call the backend from a different development port.

## Notes
This is an educational demo, not a production ride-hailing service. It does not process real payments, use real GPS, or persist data in a database. A production version would add authentication, a database, atomic driver reservation, payment provider integration, rate limiting, logging, and real-time tracking.
