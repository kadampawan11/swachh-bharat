# Swachh Bharat — Geo-tagged Civic Complaint System (Bangalore)

Cross-platform (Web + iOS + Android) complaint management: citizens report sanitation issues with photos + GPS; ward admins manage on a map; super admin oversees everything.

## Stack
- **apps/mobile** — React Native + Expo (SDK 58) + Expo Router + Zustand + Axios (runs on web and native)
- **apps/api** — NestJS + Prisma + JWT + Multer
- **packages/shared** — shared types, constants, Zod schemas
- **PostgreSQL 16 + PostGIS** via Docker

## Quick start  

```bash
pnpm install
cp .env.example apps/api/.env
docker compose up -d postgres          # start DB
cd apps/api && npx prisma migrate dev && npx tsx prisma/seed.ts
pnpm --filter api dev                  # API on :3000 — run: npx nest start --watch
pnpm --filter mobile start             # Expo dev server
```

> Run the API with `npx nest start --watch` (NOT `tsx src/main.ts`) — NestJS needs decorator metadata emitted by tsc.

## Test accounts (from seed)
| Role | Login | Password |
|------|-------|----------|
| Super Admin | superadmin@swachhbharat.in | admin123 |
| Ward Admin (East Bangalore) | wardadmin@swachhbharat.in | admin123 |
| Citizen | citizen@example.com | user123 |
| Phone OTP | any phone | OTP: **123456** |

> The mock OTP and the reset token returned by `forgot-password` are disabled when `NODE_ENV=production`. Set `JWT_SECRET` there too; the API won't start without it.

## Key endpoints
- `POST /api/auth/{register,login,admin/login,otp/send,otp/verify,forgot-password,reset-password,refresh}`
- `GET/POST/PATCH/DELETE /api/complaints`, `GET /api/complaints/geo`, `PATCH /:id/status`, `POST /:id/reopen`, `/:id/comments`
- `POST /api/upload/images` (multipart `files`, ≤5MB each)
- `/api/wards`, `/api/admins` (Super Admin), `/api/analytics/*` + `/api/analytics/export` (CSV)

## Layout
- `src/app/(auth)` — user/admin login, register, forgot password
- `src/app/(user)` — home, submit, my-complaints, detail, profile
- `src/app/(admin)` — dashboard, map (Leaflet on web / react-native-maps on native), complaints, wards, admins, profile
