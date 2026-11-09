#!/bin/sh
set -eu

cd /var/www

# Wait briefly for the managed database to accept connections before migrating.
attempt=0
until php artisan db:show --no-interaction >/dev/null 2>&1; do
    attempt=$((attempt + 1))
    if [ "$attempt" -ge 30 ]; then
        echo "Database is unavailable after 60 seconds; refusing to start the API."
        exit 1
    fi
    echo "Waiting for the configured database ($attempt/30)..."
    sleep 2
done

# Migrations are additive and tracked by Laravel; the RBAC seeder is idempotent.
php artisan migrate --force --no-interaction
php artisan db:seed --class=RoleSeeder --force --no-interaction
php artisan config:cache

exec "$@"
