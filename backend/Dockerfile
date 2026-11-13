# Use the official PHP-FPM image
FROM php:8.2-fpm-alpine

WORKDIR /var/www

# Install system dependencies and the web server/process manager.
RUN apk add --no-cache \
    git \
    curl \
    ca-certificates \
    libpng-dev \
    oniguruma-dev \
    libxml2-dev \
    zip \
    unzip \
    libzip-dev \
    freetype-dev \
    libjpeg-turbo-dev \
    jpeg-dev \
    postgresql-dev \
    icu-dev \
    nginx \
    supervisor

# Install the PHP extensions required by Laravel and the configured databases.
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
    gd \
    pdo_mysql \
    pdo_pgsql \
    mbstring \
    exif \
    pcntl \
    bcmath \
    zip \
    xml \
    ctype \
    intl \
    opcache

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
COPY docker/entrypoint.sh /usr/local/bin/openshop-entrypoint
RUN chmod +x /usr/local/bin/openshop-entrypoint

COPY --chown=www-data:www-data . /var/www

# Install dependencies before switching the application files to the runtime user.
RUN composer install --no-dev --optimize-autoloader --no-interaction \
    && chown -R www-data:www-data /var/www

USER root

# Alpine's nginx package loads virtual hosts from /etc/nginx/http.d.
# Create the supervisor include directory explicitly for a predictable image layout.
RUN mkdir -p /etc/nginx/http.d /etc/supervisor/conf.d

RUN cat > /etc/nginx/http.d/default.conf <<'NGINX'
server {
    listen 80;
    server_name _;
    root /var/www/public;
    index index.php index.html;
    client_max_body_size 20M;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        try_files $uri =404;
        fastcgi_split_path_info ^(.+\.php)(/.+)$;
        fastcgi_pass 127.0.0.1:9000;
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_param PATH_INFO $fastcgi_path_info;
        fastcgi_read_timeout 120;
    }

    location ~ /\. {
        deny all;
    }
}
NGINX

RUN cat > /etc/supervisor/conf.d/supervisord.conf <<'SUPERVISOR'
[supervisord]
nodaemon=true
user=root
logfile=/dev/null
pidfile=/run/supervisord.pid

[program:php-fpm]
command=/usr/local/sbin/php-fpm --nodaemonize
autostart=true
autorestart=true
stdout_logfile=/dev/fd/1
stdout_logfile_maxbytes=0
stderr_logfile=/dev/fd/2
stderr_logfile_maxbytes=0

[program:nginx]
command=/usr/sbin/nginx -g "daemon off;"
autostart=true
autorestart=true
stdout_logfile=/dev/fd/1
stdout_logfile_maxbytes=0
stderr_logfile=/dev/fd/2
stderr_logfile_maxbytes=0
SUPERVISOR

RUN mkdir -p \
    /var/www/storage/app/public \
    /var/www/storage/framework/cache \
    /var/www/storage/framework/sessions \
    /var/www/storage/framework/views \
    && chown -R www-data:www-data /var/www/storage \
    && chmod -R 775 /var/www/storage

EXPOSE 80

ENTRYPOINT ["/usr/local/bin/openshop-entrypoint"]
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
