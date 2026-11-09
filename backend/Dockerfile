# Use the official PHP image
FROM php:8.2-fpm-alpine

# Set working directory
WORKDIR /var/www

# Install system dependencies
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
    libpng-dev \
    nginx \
    supervisor

# Install PHP extensions
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

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy existing application directory permissions
COPY --chown=www-data:www-data . /var/www

# Install PHP dependencies as root, then grant runtime ownership to PHP-FPM
RUN composer install --no-dev --optimize-autoloader --no-interaction \
    && chown -R www-data:www-data /var/www

# Copy and set up nginx configuration
USER root
RUN cat > /etc/nginx/conf.d/default.conf <<'NGINX'
server {
    listen 80;
    server_name _;
    root /var/www/public;
    index index.php index.html;
    client_max_body_size 20M;
    location / { try_files $uri $uri/ /index.php?$query_string; }
    location ~ \\.php$ {
        try_files $uri =404;
        fastcgi_split_path_info ^(.+\\.php)(/.+)$;
        fastcgi_pass 127.0.0.1:9000;
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_param PATH_INFO $fastcgi_path_info;
        fastcgi_read_timeout 120;
    }
    location ~ /\\. { deny all; }
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

# Create storage directories and set permissions
RUN mkdir -p /var/www/storage/app/public /var/www/storage/framework/cache /var/www/storage/framework/sessions /var/www/storage/framework/views \
    && chown -R www-data:www-data /var/www/storage \
    && chmod -R 775 /var/www/storage

# Expose port 80
EXPOSE 80

# Start supervisord
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
