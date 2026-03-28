"""Parse PostgreSQL DATABASE_URL (e.g. Render) without dj-database-url."""

from __future__ import annotations

from urllib.parse import parse_qs, unquote, urlparse


def parse_postgres_url(url: str, *, conn_max_age: int = 600) -> dict:
    if url.startswith('postgres://'):
        url = 'postgresql://' + url[len('postgres://') :]
    parsed = urlparse(url)
    if parsed.scheme not in ('postgresql', 'postgresql+psycopg2'):
        raise ValueError(
            f'DATABASE_URL must use postgres or postgresql scheme, got {parsed.scheme!r}'
        )
    path = (parsed.path or '').lstrip('/')
    database_name = path.split('/')[0] if path else ''
    if not database_name:
        raise ValueError('DATABASE_URL must include a database name')
    qs = parse_qs(parsed.query)
    options: dict[str, str] = {}
    for key in ('sslmode', 'connect_timeout'):
        if key in qs and qs[key]:
            options[key] = qs[key][0]
    cfg: dict = {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': unquote(database_name),
        'USER': unquote(parsed.username) if parsed.username else '',
        'PASSWORD': unquote(parsed.password) if parsed.password else '',
        'HOST': parsed.hostname or '',
        'PORT': str(parsed.port or 5432),
        'CONN_MAX_AGE': conn_max_age,
    }
    if options:
        cfg['OPTIONS'] = options
    return cfg
