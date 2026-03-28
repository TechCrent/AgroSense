# AgroSense — Django API

- **Local setup, env vars, verification:** [../docs/DEVELOPMENT.md](../docs/DEVELOPMENT.md)
- **Render (production API):** [../docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md)

Install dependencies:

```bash
pip install -r requirements.txt
```

Run migrations and the dev server:

```bash
python manage.py migrate
python manage.py runserver 127.0.0.1:8000
```

Copy `.env.example` to `.env` and fill in keys before using routes that call external APIs.
