# Multi-stage build to create a production image serving static files via Nginx

FROM node:20-bookworm-slim AS build
WORKDIR /app

# Allow passing Vite env via build args
ARG VITE_API_KEY
ENV VITE_API_KEY=${VITE_API_KEY}

# Optional: allow overriding npm registry and tweak network settings
ARG NPM_REGISTRY
RUN set -eux; \
    apt-get update; \
    apt-get install -y --no-install-recommends ca-certificates; \
    rm -rf /var/lib/apt/lists/*; \
    npm config set prefer-online false; \
    npm config set fetch-retries 5; \
    npm config set fetch-retry-mintimeout 20000; \
    npm config set fetch-retry-maxtimeout 120000; \
    npm set fund false; \
    npm set audit false; \
    if [ -n "${NPM_REGISTRY:-}" ]; then npm config set registry "$NPM_REGISTRY"; fi

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# Copy source and build
COPY . .
RUN npm run build

FROM nginx:alpine AS runtime

# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

# Replace default server config with SPA-friendly config
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
