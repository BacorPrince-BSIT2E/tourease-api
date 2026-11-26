# TourEase API

TourEase is a REST API for a tourism system. It supports account registration and JWT authentication, destination discovery, tour guides, accommodations, and user-owned travel itineraries with ordered destination stops.

## Tech stack

- NestJS and TypeScript
- TypeORM with MySQL (`mysql2`)
- JWT Bearer authentication and role-based access
- `class-validator` and `class-transformer` for request validation
- `bcrypt` for password hashing

## Features

- Tourist, Staff, Guide, and Admin user roles
- Public destination, tour guide, and accommodation browsing
- Staff/Admin catalog management and Admin-only deletion
- Paginated and filtered catalog endpoints
- User-owned itineraries and nested stops with visit-order uniqueness
- Consistent JSON errors and a Postman collection for API testing

## Setup

1. Install Node.js and XAMPP, then start MySQL from the XAMPP Control Panel.
2. In phpMyAdmin, create the project database, or run:

   ```sql
   CREATE DATABASE tourease_db
     CHARACTER SET utf8mb4
     COLLATE utf8mb4_unicode_ci;
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Create `.env` from `.env.example` (`Copy-Item .env.example .env` in PowerShell) and set values for your local MySQL setup. `.env` is ignored by Git; do not commit real credentials.

### Environment variables

| Variable | Purpose | Example placeholder |
| --- | --- | --- |
| `DB_HOST` | MySQL host | `localhost` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_USERNAME` | MySQL user | `root` |
| `DB_PASSWORD` | MySQL password | Empty for a default local XAMPP install |
| `DB_NAME` | Database name | `tourease_db` |
| `JWT_SECRET` | Secret used to sign access tokens | Replace the example value with a long random secret |
| `JWT_EXPIRES_IN` | Access-token lifetime | `1d` |

## Run and seed

Start the API in development mode:

```bash
npm run start:dev
```

TypeORM synchronizes the entities when the app starts. Once the database connection succeeds, seed the demo data in another terminal:

```bash
npm run seed
```

The seed command is safe to repeat: it skips matching users/guides by email and destinations, accommodations, and itinerary records by name. It prints counts of newly created rows.

### Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@tourease.test` | `Admin123!` |
| Staff | `staff@tourease.test` | `Staff123!` |
| Tourist | `tourist@tourease.test` | `Tourist123!` |

These are local demo credentials only. Do not use them in a deployed environment.

## API endpoints

All routes below are prefixed with `/api/v1`. Protected routes require `Authorization: Bearer <token>`. The login endpoint returns an access token; role and ownership requirements are included in the access column.

| Method | Path | Access | Success |
| --- | --- | --- | --- |
| POST | `/auth/login` | Public | 200 |
| POST | `/users` | Public | 201 |
| GET | `/users/:id` | Owner or Admin | 200 |
| PATCH | `/users/:id` | Owner or Admin | 200 |
| DELETE | `/users/:id` | Admin | 204 |
| GET | `/destinations` | Public | 200 |
| GET | `/destinations/:id` | Public | 200 |
| POST | `/destinations` | Staff or Admin | 201 |
| PUT | `/destinations/:id` | Staff or Admin | 200 |
| PATCH | `/destinations/:id` | Staff or Admin | 200 |
| DELETE | `/destinations/:id` | Admin | 204 |
| GET | `/tour-guides` | Public | 200 |
| GET | `/tour-guides/:id` | Public | 200 |
| POST | `/tour-guides` | Staff or Admin | 201 |
| PATCH | `/tour-guides/:id` | Staff or Admin | 200 |
| DELETE | `/tour-guides/:id` | Admin | 204 |
| GET | `/accommodations` | Public | 200 |
| GET | `/accommodations/:id` | Public | 200 |
| POST | `/accommodations` | Staff or Admin | 201 |
| PATCH | `/accommodations/:id` | Staff or Admin | 200 |
| DELETE | `/accommodations/:id` | Admin | 204 |
| GET | `/itineraries` | Authenticated user; own itineraries | 200 |
| GET | `/itineraries/:id` | Owner or Admin | 200 |
| POST | `/itineraries` | Authenticated user; creates own itinerary | 201 |
| PATCH | `/itineraries/:id` | Owner | 200 |
| DELETE | `/itineraries/:id` | Owner or Admin | 204 |
| GET | `/itineraries/:id/destinations` | Itinerary owner or Admin | 200 |
| POST | `/itineraries/:id/destinations` | Itinerary owner | 201 |
| PATCH | `/itineraries/:id/destinations/:entryId` | Itinerary owner | 200 |
| DELETE | `/itineraries/:id/destinations/:entryId` | Itinerary owner | 204 |

### Error response

Errors use this JSON shape. `statusCode` reflects the HTTP response status, `message` is a short description, `errors` contains one or more details, and `timestamp` is an ISO 8601 date-time.

```json
{
  "success": false,
  "statusCode": 404,
  "message": "Destination not found.",
  "errors": ["Destination not found."],
  "timestamp": "2026-01-15T12:00:00.000Z"
}
```

## Postman

Import [`postman/TourEase.postman_collection.json`](postman/TourEase.postman_collection.json) into Postman. The collection includes public and protected requests, example bodies, status checks, and a login test that stores the access token in the `token` collection variable.

## Tests and build

```bash
npm run build
npm test
npm run test:e2e
```
