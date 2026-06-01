# VASMA System

VASMA System - Vehicle Auto Service Management System is now structured as a production web app with:

- `frontend/`: static PWA interface for web, Android browser install, iOS home-screen install, Windows, and macOS.
- `backend/`: Node.js + Express API with JWT authentication.
- MySQL database storage for the application data snapshot per user.

## Folder Structure

```text
vasma-system/
├── frontend/
│   ├── index.html
│   ├── login.html
│   ├── styles.css
│   ├── app.js
│   ├── manifest.webmanifest
│   └── service-worker.js
├── backend/
│   ├── server.js
│   ├── .env.example
│   ├── package.json
│   ├── routes/
│   │   ├── auth.js
│   │   └── data.js
│   ├── middleware/
│   │   └── auth.js
│   └── db/
│       └── mysql.js
└── README.md
```

## Local Setup

1. Install Node.js LTS and MySQL Server.
2. Create the database:

```powershell
Get-Content ".\backend\schema.sql" | mysql -u root -p
```

If PowerShell blocks `<` redirection, use the command above.

3. Create backend environment file:

```powershell
Copy-Item ".\backend\.env.example" ".\backend\.env"
```

Then edit `backend/.env` with your MySQL password and a strong `JWT_SECRET`.

4. Install backend packages:

```powershell
cd backend
npm install
```

5. Run production-style app locally:

```powershell
npm start
```

Open:

```text
http://localhost:3000
```

Default login after importing `schema.sql`:

```text
demo username: demo
demo password: demo123

admin username: admin
admin password: Vasma@app123
```

Change this password before real production use.

## API

- `POST /api/auth/login`: login and return JWT.
- `GET /api/health`: database/API health check.
- `GET /api/data/load`: load current user VASMA data.
- `POST /api/data/save`: save current user VASMA data.
- `GET /api/data/records`: list saved data record metadata.

## Deployment

Backend:

1. Push project to a private GitHub repository.
2. Deploy `backend/` to Render, Railway, VPS, or similar Node.js hosting.
3. Add MySQL database.
4. Add environment variables from `backend/.env.example`.
5. Run `backend/schema.sql` on the production MySQL database.

Frontend:

1. Deploy `frontend/` to Netlify, Vercel, or the same backend server.
2. If frontend and backend are on different domains, set `vasma_api_url` in browser localStorage or add a small config script defining:

```html
<script>window.VASMA_API_URL = "https://your-api-domain.com";</script>
```

Security:

- Never upload `.env` to GitHub.
- Use HTTPS in production.
- Change default admin password.
- Use a long random `JWT_SECRET`.
- Keep GitHub repository private unless secrets and deployment settings are removed.

## PWA Install

Users can open the deployed URL and install:

- Android: Chrome > Install app / Add to Home screen.
- iOS: Safari > Share > Add to Home Screen.
- Windows/macOS: Chrome or Edge > Install app.
