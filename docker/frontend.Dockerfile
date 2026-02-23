FROM node:22-alpine as build

WORKDIR /app

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ .

COPY LICENSE /app/LICENSE

# Set environment variable for build
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN npm run build

# Production stage with nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/selfsigned.crt /etc/nginx/certs/fullchain.pem
COPY docker/selfsigned.key /etc/nginx/certs/privkey.pem
COPY LICENSE /usr/share/nginx/html/LICENSE
EXPOSE 80
EXPOSE 443
CMD ["nginx", "-g", "daemon off;"]
