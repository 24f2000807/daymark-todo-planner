# Daymark To-Do Planner

A single-user task planner built with MongoDB, Express, React, and Node.js. Tasks stay in MongoDB when you refresh the page. In production, one Express web service serves both the built React app and the API; database credentials remain on the server.

This version has no login and uses one shared task list. Anyone who can reach the deployed app can see and change the same tasks. Do not deploy it for private or multi-user use; add authentication and per-user task ownership first.

## What it does

- Create and edit tasks with a title, description, category, priority, estimated minutes, and optional due date.
- Mark tasks pending or completed, and confirm before deleting.
- Search titles and combine status, category, and priority filters.
- Show total, pending, and completed counts for all tasks, even while filtering.
- Mark past-due pending tasks using your computer's local calendar day.
- Validate task data in the browser and again in the API.

## Requirements

- Node.js 20.19+ or 22.12+ (includes npm).
- MongoDB 7.0+ running locally, or a MongoDB Atlas connection string you provide.

## Install

Open a terminal in the project folder and install the two parts:

```powershell
cd server
npm install
cd ..\client
npm install
cd ..
```

## Start MongoDB

For a local MongoDB Community Server installation, start its Windows service from PowerShell:

```powershell
Get-Service MongoDB
Start-Service MongoDB
```

If MongoDB was installed without a service, start it using the `mongod` command and the data directory you configured. Keep that terminal open. Alternatively, use a MongoDB Atlas database and its connection string. Do not share or commit the connection string.

## Configure and run

Create the server environment file from the example:

```powershell
Copy-Item server\.env.example server\.env
```

The example uses `mongodb://127.0.0.1:27017/todo_planner`. If you use Atlas, replace `MONGODB_URI` in `server/.env` with your own connection string. Never put it in the client folder or a `VITE_` variable.

If your network's default DNS resolver cannot resolve your MongoDB Atlas hostname, set the optional `DNS_SERVERS` value in `server/.env` to comma-separated DNS server addresses, for example `DNS_SERVERS=8.8.8.8` or `DNS_SERVERS=8.8.8.8,1.1.1.1`. The server loads this setting before connecting to MongoDB and applies it to Node's DNS resolver. If the setting is absent or blank, Node keeps using the system DNS configuration.

Open two terminals in the project folder. In the first, start the API:

```powershell
cd server
npm run dev
```

In the second, start Vite:

```powershell
cd client
npm run dev
```

Open the local URL printed by Vite, normally `http://localhost:5173`. Vite forwards `/api` requests to the API at `http://localhost:5000`. The API health check is `http://localhost:5000/api/health`; it reports `ok` only when MongoDB is connected.

## Tests and production build

Run the frontend filtering and date tests:

```powershell
cd client
npm test
npm run build
```

Run the API integration tests:

```powershell
cd server
npm test
```

The server tests start a disposable MongoDB using `mongodb-memory-server`, use it only for tests, and stop it afterward. The first run may download a MongoDB test binary. Tests do not use the development database.

## Deploy to Render

Create one **Web Service** from this repository. Leave the Root Directory blank so Render runs commands from the repository root. Do not create a separate Static Site: Express serves the Vite build from `client/dist` when `NODE_ENV=production`.

Use these exact commands:

- **Build Command:** `npm ci --prefix server && npm ci --prefix client && npm run build --prefix client`
- **Start Command:** `npm start --prefix server`
- **Health Check Path:** `/api/health`

Set these environment variables in the Render service settings:

- `NODE_ENV` = `production`
- `MONGODB_URI` = your MongoDB connection string. Keep it in Render's server environment settings; never put it in the client or commit it.
- `DNS_SERVERS` = optional comma-separated DNS server addresses, such as `8.8.8.8`. Leave it unset to use the platform's system DNS.
- `PORT` is supplied by Render automatically. Do not set a fixed port.

The health endpoint returns HTTP 200 with `{"status":"ok"}` when MongoDB is connected and HTTP 503 with `{"status":"unavailable"}` otherwise. Configure Render's health check path as `/api/health` so it only marks the service healthy when the database is ready. Since this version has no login, all visitors share the same task list.

## Troubleshooting

- **Cannot reach the server:** Start both the API and Vite terminals. Check that port 5000 is free.
- **MongoDB connection error:** Ensure the MongoDB service is running and `MONGODB_URI` in `server/.env` is correct.
- **Health check returns 503:** The API is running but MongoDB is not connected yet.
- **Atlas connection fails:** Check the connection string, network access allowlist, and database user permissions in Atlas.
- **Port conflict:** Change `PORT` in `server/.env`; update the `/api` target in `client/vite.config.js` to the same port, then restart both processes.
- **Integration test binary download fails:** Check internet access and retry `npm test`; this test binary is separate from your development MongoDB.

## Project layout

```text
client/  Vite, React components, CSS, API helper, and UI logic tests
server/  Express API, Mongoose model, validation, and disposable-database tests
```
