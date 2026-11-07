# Database decision — English Zero2Hero

**Choice: MySQL 8 (MariaDB on Laragon)**

## Rationale

- Native Laragon stack: zero extra install for local dev.
- Sufficient for MVP through Phase 2 (exams, attempts, JSON via `JSON` columns in MySQL 8).
- PostgreSQL remains an optional migration path if full-text / JSONB complexity grows (Phase 3+).

## Connection (Laragon defaults)

| Key | Value |
|-----|--------|
| Host | `127.0.0.1` |
| Port | `3306` |
| Database | `english_zero2hero` |
| Username | `root` |
| Password | *(empty by default)* |

Create DB:

```sql
CREATE DATABASE english_zero2hero CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## Redis (optional, recommended for queues)

- Host: `127.0.0.1:6379`
- Use `database` queue driver when Redis is not installed.
