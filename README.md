# API Tester

A self-hosted HTTP API testing tool, similar in spirit to Postman/Insomnia. It lets you send HTTP requests, organize them into workspaces and collections, save environments and variables, and review request history — all backed by your own database.

**Live app:** frontend deployed on Vercel · backend containerized with Docker · data stored in Postgres (Neon)

---

## Features

- **User accounts** — sign up and log in to keep your work private
- **Workspaces** — group related collections and requests together
- **Collections** — organize saved requests by project or feature
- **Saved requests** — store and re-run HTTP requests without retyping them
- **Environments & variables** — swap base URLs, tokens, and other values between environments (e.g. dev vs. prod)
- **Request history** — look back at previously sent requests

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | _fill in framework, e.g. React/Vite_ — deployed on [Vercel](https://vercel.com) |
| Backend | _fill in framework, e.g. Node/Express_ — containerized with Docker |
| Database | PostgreSQL, hosted on [Neon](https://neon.tech) |

> Update this table with your actual stack details.

---

## Project Structure

```
API_Tester/
├── frontend/          # Frontend application (deployed to Vercel)
├── backend/           # Backend API (Dockerized)
│   └── Dockerfile
└── README.md
```

> Adjust this to match your actual folder layout.

---

## Database Schema

The app uses the following tables (Postgres):

| Table | Purpose |
|---|---|
| `app_users` | User accounts (id, name, email, password hash, created_at) |
| `workspaces` | Top-level containers for a user's work |
| `workspace_collections` | Collections belonging to a workspace |
| `workspace_saved_requests` | Requests saved directly under a workspace |
| `saved_collection_requests` | Requests saved under a specific collection |
| `app_collections` | Collection metadata |
| `environments` | Named environments (e.g. "Development", "Production") |
| `environment_variables` | Key-value variables scoped to an environment |
| `api_request_history` | Log of previously sent requests |

---

## Getting Started

### Prerequisites

- Node.js (version ___)
- Docker (for running the backend locally)
- A PostgreSQL database (e.g. a free [Neon](https://neon.tech) project)

### 1. Clone the repo

```bash
git clone https://github.com/ARAVINTH-M123/API_Tester.git
cd API_Tester
```

### 2. Backend setup

```bash
cd backend
cp .env.example .env   # fill in your DATABASE_URL and other secrets
docker build -t api-tester-backend .
docker run -p 5000:5000 --env-file .env api-tester-backend
```

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

### 4. Environment variables

| Variable | Description | Used in |
|---|---|---|
| `DATABASE_URL` | Neon Postgres connection string | Backend |
| `JWT_SECRET` / `SESSION_SECRET` | Secret for auth tokens | Backend |
| `VITE_API_BASE_URL` (or similar) | URL the frontend calls for the API | Frontend |

> Fill in the actual variable names your app uses.

---

## Deployment

- **Frontend:** connected to Vercel via GitHub. Every push to `main` triggers a production deployment; pushes to other branches or open PRs get a preview deployment.
- **Backend:** built from the Dockerfile and deployed to your backend host. Set environment variables there to match your production database and secrets.
- **Database:** hosted on Neon. Point `DATABASE_URL` at your Neon connection string in both local and deployed environments.

---

## Roadmap / Known Gaps

- [ ] Request history, collections, and environments are implemented in the schema but not yet wired up end-to-end
- [ ] Password reset flow
- [ ] Tests

---

## License

_Add your license here (e.g. MIT)._
