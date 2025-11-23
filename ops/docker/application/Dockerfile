FROM invoiceninja/invoiceninja:5.12.33

USER root


RUN apk add --no-cache \
    rsync \
    autoconf \
    gcc \
    g++ \
    make \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && rm -rf /var/cache/apk/*

USER invoiceninja

COPY ops/docker/application/php.ini /usr/local/etc/php/conf.d/zz-custom.ini

EXPOSE 9000
