# Build from the repository root - the workspaces share one lockfile:
#   docker build -f server/Dockerfile -t assettrackr-server .

FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY server/package.json server/
COPY client/package.json client/
RUN npm ci --workspace server
COPY server server
RUN npm run build --workspace server

FROM node:22-slim
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json ./
COPY server/package.json server/
COPY client/package.json client/
RUN npm ci --workspace server --omit=dev && npm cache clean --force
COPY --from=build /app/server/dist server/dist

# Do not run as root
USER node
EXPOSE 3000
# Applies pending database migrations, then starts the API
CMD ["node", "server/dist/index.js"]
