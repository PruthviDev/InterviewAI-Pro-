# AI InterviewPro

Two folders, two commands. No monorepo tooling, no separate services.

```
interviewpro/
├── server/    Express + TypeScript + Prisma  (the whole backend, one process)
│   ├── prisma/schema.prisma
│   └── src/   routes → controllers → services → repositories
└── client/    Next.js (the frontend)
```

Background jobs and AI agents (later phases) live inside `server/src/` and run in the same process.

## Run it

```bash
docker compose up -d                 # Postgres + Redis only

cd server
cp .env.example .env                 # then set JWT_SECRET
npm install
npx prisma migrate dev --name init   # creates the tables
npm run dev                          # http://localhost:4000/api/health

cd ../client
cp .env.example .env.local
npm install
npm run dev                          # http://localhost:3000
```

## Checks
`cd server && npm run typecheck && npm run lint && npm test`
`cd client && npm run typecheck && npm run lint && npm run build`

## Auth API (Phase 2)
`POST /api/auth/register` · `login` · `refresh` · `logout` · `GET /api/auth/me`
Access token (15 min) in the response body; refresh token in an httpOnly cookie, rotated on every use.
