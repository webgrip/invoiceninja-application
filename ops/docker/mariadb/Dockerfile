# Invoice Ninja MariaDB Service
# Minimal overlay on official MariaDB upstream

# Use latest stable minor version of MariaDB
FROM mariadb:11.8.7-noble@sha256:78185355dd49b54dd6909072531ce8d7e06aa0eccd7aa5b23c93ebb7e34c5aaa

# Skip timezone info initialization for faster startup
ENV MYSQL_INITDB_SKIP_TZINFO=1
