# Build context is the repo root: npm workspaces share one lockfile.
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY api/package.json api/
COPY web/package.json web/
RUN npm ci -w api
COPY api api
RUN npm run build -w api

FROM node:22-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json ./
COPY api/package.json api/
COPY web/package.json web/
RUN npm ci -w api --omit=dev && npm cache clean --force
COPY --from=build /app/api/dist api/dist
USER node
EXPOSE 3000
# Migrations and the seed run on start (see src/database).
CMD ["node", "api/dist/main"]
