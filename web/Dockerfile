# Build context is the repo root: npm workspaces share one lockfile.
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY api/package.json api/
COPY web/package.json web/
RUN npm ci -w web
COPY web web
# Baked in at build time; the browser calls the API through the host's port 3000.
ARG VITE_GRAPHQL_URL=http://localhost:3000/graphql
ENV VITE_GRAPHQL_URL=$VITE_GRAPHQL_URL
RUN npm run build -w web

FROM nginx:1.27-alpine
COPY web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/web/dist /usr/share/nginx/html
EXPOSE 80
