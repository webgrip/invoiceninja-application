FROM invoiceninja/invoiceninja:5.13.22@sha256:219b0f2092aa4df1d2c6d428aa9c6ed1d772165ee604b5c6e4735fb9e59f805c

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
