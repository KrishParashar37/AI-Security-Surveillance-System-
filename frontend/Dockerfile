# Frontend Dockerfile - Multi-stage build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first
COPY package*.json ./
RUN npm ci --silent

# Copy source and build
COPY . .
ENV REACT_APP_API_URL=http://localhost:8000
ENV CI=false
RUN npm run build

# ─── Production stage (nginx) ─────────────────────────────────────────────
FROM nginx:alpine AS production

# Copy built app
COPY --from=builder /app/build /usr/share/nginx/html

# Custom nginx config for React SPA routing
RUN echo 'server { \
    listen 80; \
    location / { \
    root /usr/share/nginx/html; \
    index index.html; \
    try_files $uri $uri/ /index.html; \
    } \
    location /api { \
    proxy_pass http://backend:8000; \
    proxy_http_version 1.1; \
    proxy_set_header Host $host; \
    } \
    }' > /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s \
    CMD wget -qO- http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
