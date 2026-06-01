# VASMA System Backend

This backend provides a MySQL API for VASMA System.

## Setup

1. Install Node.js and MySQL.
2. Create the database using `schema.sql`.
3. Copy `.env.example` to `.env` and update MySQL credentials.
4. Install packages:

```powershell
npm install
```

5. Start backend:

```powershell
npm start
```

API runs on:

```text
http://127.0.0.1:8080
```

## Create Database

In MySQL:

```sql
CREATE DATABASE vasma_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Then import:

```powershell
mysql -u root -p vasma_system < schema.sql
```

## API Security

For write operations, send header:

```text
x-api-key: your API_KEY from .env
```

## Main Endpoints

- `GET /api/health`
- `GET /api/customers`
- `POST /api/customers`
- `PUT /api/customers/:id`
- `GET /api/job-cards`
- `POST /api/job-cards`
- `GET /api/payments`
- `POST /api/payments`
- `POST /api/sync/import-local-backup`
- `GET /api/sync/export`

