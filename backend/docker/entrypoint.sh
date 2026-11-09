#!/bin/sh
set -eu

cd /var/www

# Only run schema changes when a database connection has been configured.
# This keeps the health endpoint bootable while environment setup is completed.
if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
    if [ -n "${DB_URL:-}" ] || [ -n "${DATABASE_URL:-}" ] || [ -n "${DB_HOST:-}" ]; then
        attempt=0
        until php artisan db:show --no-interaction >/dev/null 2>&1; do
            attempt=$((attempt + 1))
            if [ "$attempt" -ge 30 ]; then
                echo "Configured database is unavailable after 60 seconds; refusing to start the API."
                exit 1
            fi
            echo "Waiting for the configured database ($attempt/30)..."
            sleep 2
        done

        php artisan migrate --force --no-interaction
        php artisan db:seed --class=RoleSeeder --force --no-interaction
        php artisan config:cache
    else
        echo "Database URL/host is not configured; skipping migrations and RBAC seeding."
    fi
fi

exec "$@"
