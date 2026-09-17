# syntax=docker/dockerfile:1.7

ARG NODE_VERSION=20-alpine
ARG NGINX_VERSION=1.27-alpine

FROM node:${NODE_VERSION} AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm config set fetch-retries 5 \
  && npm config set fetch-retry-factor 2 \
  && npm config set fetch-timeout 600000 \
  && npm ci --no-audit --no-fund

FROM deps AS build
WORKDIR /app
ENV CI=false
ARG REACT_APP_ENV=production
ARG PUBLIC_URL
ARG REACT_APP_PUBLIC_KEY
ARG REACT_APP_S3_PREFIX
ARG REACT_APP_REST_API_URL
ARG REACT_APP_API_URL
ARG REACT_APP_URL_PREFIX
ARG REACT_APP_PREVIEW_URL
ARG REACT_APP_KNOWLEDGE_CENTER_URL
ARG REACT_APP_GIPHY_API_URL
ARG REACT_APP_GIPHY_API_KEY
ARG REACT_APP_GOOGLE_MAPS_EMBED_API_KEY
ARG REACT_APP_TINY_API_KEY
ENV REACT_APP_TINY_API_KEY=${REACT_APP_TINY_API_KEY}
ENV REACT_APP_ENV=${REACT_APP_ENV}
ENV PUBLIC_URL=${PUBLIC_URL}
ENV REACT_APP_PUBLIC_KEY=${REACT_APP_PUBLIC_KEY}
ENV REACT_APP_S3_PREFIX=${REACT_APP_S3_PREFIX}
ENV REACT_APP_REST_API_URL=${REACT_APP_REST_API_URL}
ENV REACT_APP_API_URL=${REACT_APP_API_URL}
ENV REACT_APP_URL_PREFIX=${REACT_APP_URL_PREFIX}
ENV REACT_APP_PREVIEW_URL=${REACT_APP_PREVIEW_URL}
ENV REACT_APP_KNOWLEDGE_CENTER_URL=${REACT_APP_KNOWLEDGE_CENTER_URL}
ENV REACT_APP_GIPHY_API_URL=${REACT_APP_GIPHY_API_URL}
ENV REACT_APP_GIPHY_API_KEY=${REACT_APP_GIPHY_API_KEY}
ENV REACT_APP_GOOGLE_MAPS_EMBED_API_KEY=${REACT_APP_GOOGLE_MAPS_EMBED_API_KEY}
COPY . .
RUN npm run build

FROM nginx:${NGINX_VERSION} AS runtime
RUN apk add --no-cache wget
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
COPY --from=build /app/build /usr/share/nginx/html
RUN sed -i 's/\r$//' /usr/local/bin/docker-entrypoint.sh \
  && chmod +x /usr/local/bin/docker-entrypoint.sh \
  && chown -R nginx:nginx /usr/share/nginx/html /var/cache/nginx /var/run /var/log/nginx /etc/nginx/conf.d
USER root
EXPOSE 3002
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 CMD wget -q -O /dev/null http://127.0.0.1:3002/healthz || exit 1
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
