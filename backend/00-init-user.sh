#!/bin/bash
set -e

# "psql" is pre-configured to connect as the superuser via env vars
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    DO
    \$\$
    BEGIN
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'triage_backend') THEN
            CREATE USER triage_backend WITH PASSWORD '$APP_DB_PASSWORD';
        ELSE
            -- Optional: Update password if the user already exists
            ALTER USER triage_backend WITH PASSWORD '$APP_DB_PASSWORD';
        END IF;
    END
    \$\$;
EOSQL
