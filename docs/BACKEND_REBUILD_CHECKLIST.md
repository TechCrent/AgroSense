# Backend Rebuild Checklist

## Phased rollout and verification gates

1. Foundation
   - `api` app created under `backend/api`.
   - `config/settings.py` uses only local app imports.
   - Gate: `python -m compileall api config`.

2. Provider adapters
   - `api/clients/plant_id_client.py` and `api/clients/claude_client.py` added.
   - Unified upstream error contract via `UpstreamServiceError`.
   - Gate: invalid key/network paths return `detail` with 5xx/4xx mapping.

3. Endpoint orchestration
   - `api/services/orchestrator.py` drives `/api/scan/` and `/api/confirm/`.
   - Response payload includes `version`.
   - Gate: unit tests for scan/confirm path pass.

4. HTTP endpoints and schema
   - `api/views/scan.py`, `api/views/confirm.py`, `api/views/health.py`.
   - Multipart request validation in serializers.
   - Gate: docs available at `/api/docs/`.

5. Deployment hardening
   - Root `vercel.json` is authoritative.
   - Render deploy remains `rootDir: backend`.
   - Gate: deployed Vercel UI reaches Render through `/api` rewrite.

## Cutover cleanup

- Django runtime routes now point to `api.urls`.
- Legacy `core` tests are marked deprecated and no longer govern runtime.
- The old `integration/` package was removed; logic lives in `backend/api/` and `frontend/scripts/` (locale tooling).

## Final acceptance criteria

- No runtime imports outside `backend/` for active endpoints.
- `/health/`, `/api/scan/`, `/api/confirm/` respond in local and deployed environments.
- Frontend upload -> select -> confirm flow succeeds end-to-end.
