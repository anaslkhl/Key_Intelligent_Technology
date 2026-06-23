FROM php:8.4-fpm

WORKDIR /var/www

RUN apt-get update && apt-get install -y \
    libpq-dev \
    zip unzip git curl \
    && docker-php-ext-install pdo pdo_pgsql

RUN printf '%s\n' \
    'file_uploads=On' \
    'upload_max_filesize=20M' \
    'post_max_size=25M' \
    'memory_limit=256M' \
    'max_execution_time=120' \
    'max_input_time=120' \
    > /usr/local/etc/php/conf.d/kit-uploads.ini

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

CMD ["php-fpm"]
