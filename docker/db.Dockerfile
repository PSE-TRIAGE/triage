FROM postgres:15-alpine

COPY backend/00-init-user.sh /docker-entrypoint-initdb.d/00-init-user.sh
COPY backend/init.sql /docker-entrypoint-initdb.d/01-init.sql

RUN chmod +x /docker-entrypoint-initdb.d/00-init-user.sh
