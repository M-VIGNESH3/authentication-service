# Authentication Service
JWT token generation, verification, and authentication middleware.

## Endpoints
- `POST /generate-token` — Generate JWT token
- `POST /verify-token` — Verify JWT token
- `POST /validate-login` — Validate login (proxies to user-service)
- `POST /authenticate` — Middleware authentication check
- `GET /health` — Health check

## Environment Variables
- `PORT` — Service port (default: 3002)
- `JWT_SECRET` — JWT signing secret
- `USER_SERVICE_URL` — User service URL
