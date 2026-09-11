# syntax = docker/dockerfile:1

ARG NODE_VERSION=22.21.1
FROM node:${NODE_VERSION}-slim AS base

WORKDIR /app
ENV NODE_ENV="production"

# --- Etapa 1: Dependencias de desarrollo y Build ---
FROM base AS build

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3

COPY package-lock.json package.json ./
RUN npm ci --include=dev

COPY . .
RUN npm run build

# Prune: Limpia las devDependencies para dejar solo lo necesario para producción
RUN npm prune --omit=dev

# --- Etapa 2: Imagen final liviana ---
FROM base AS runner

# Copia solo los node_modules de producción y el código compilado (dist)
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json

EXPOSE 3000

# Ejecuta directamente el JavaScript compilado
CMD [ "node", "dist/main.js" ]