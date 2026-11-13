# Build from the repository root - the workspaces share one lockfile:
#   docker build -f client/Dockerfile -t assettrackr-client .

FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY server/package.json server/
COPY client/package.json client/
RUN npm ci --workspace client
COPY client client
# VITE_API_URL is left unset: nginx (below) proxies /api to the API container
RUN npm run build --workspace client

FROM nginx:1.27-alpine
COPY client/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/client/dist /usr/share/nginx/html
EXPOSE 80
